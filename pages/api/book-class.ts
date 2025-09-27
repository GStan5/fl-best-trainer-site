import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import sql from "../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }

  try {
    // Get session to verify user is authenticated
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const { class_id } = req.body;

    if (!class_id) {
      return res.status(400).json({
        success: false,
        error: "class_id is required",
      });
    }

    // Get user data and session counts
    const userResult = await sql`
      SELECT 
        id,
        email,
        weightlifting_classes_remaining
      FROM users 
      WHERE email = ${session.user.email}
    `;

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const user = userResult[0];
    const totalSessions = user.weightlifting_classes_remaining || 0;

    // Check if user has any sessions remaining
    if (totalSessions === 0) {
      return res.status(400).json({
        success: false,
        error: "No sessions remaining. Please purchase a package.",
      });
    }

    // Check if class exists and has capacity
    const classResult = await sql`
      SELECT 
        id,
        title,
        max_participants,
        current_participants,
        date,
        start_time
      FROM classes 
      WHERE id = ${class_id} AND is_active = true
    `;

    if (classResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Class not found or inactive",
      });
    }

    const classData = classResult[0];

    // Check if class is full - if so, offer waitlist
    const isClassFull =
      classData.current_participants >= classData.max_participants;

    // Check if user wants to join waitlist (new parameter)
    const { join_waitlist } = req.body;

    // Check if class is in the past
    const classDateTime = new Date(`${classData.date}T${classData.start_time}`);
    if (classDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        error: "Cannot book past classes",
      });
    }

    // Check if user is already booked for this class (for warning purposes)
    const existingBookings = await sql`
      SELECT id, status FROM bookings 
      WHERE user_id = ${user.id} AND class_id = ${class_id} AND status != 'cancelled'
    `;

    const isMultipleBooking = existingBookings.length > 0;

    // Determine booking status based on class capacity
    let bookingStatus = "confirmed";
    let shouldUpdateClassCount = true;

    if (isClassFull) {
      if (!join_waitlist) {
        // Return class full error with waitlist option
        return res.status(409).json({
          success: false,
          error: "Class is full",
          waitlist_available: true,
          message: "This class is full. Would you like to join the waitlist?",
        });
      } else {
        bookingStatus = "waitlist";
        shouldUpdateClassCount = false; // Don't count waitlist towards current participants
      }
    }

    // Create booking - allow multiple bookings for the same class
    const booking = await sql`
      INSERT INTO bookings (user_id, class_id, status)
      VALUES (${user.id}, ${class_id}, ${bookingStatus})
      RETURNING *
    `;

    // Only increment booked sessions counter if confirmed (not waitlist)
    if (bookingStatus === "confirmed") {
      await sql`
        UPDATE users 
        SET 
          weightlifting_classes_booked = COALESCE(weightlifting_classes_booked, 0) + 1,
          updated_at = NOW()
        WHERE id = ${user.id}
      `;
    }

    // Update class participant count only if confirmed booking
    if (shouldUpdateClassCount) {
      await sql`
        UPDATE classes 
        SET 
          current_participants = current_participants + 1,
          updated_at = NOW()
        WHERE id = ${class_id}
      `;
    }

    let message;
    if (bookingStatus === "waitlist") {
      message = isMultipleBooking
        ? "Added to waitlist successfully! Note: You now have multiple waitlist entries for this class."
        : "Added to waitlist successfully! You'll be notified if a spot opens up.";
    } else {
      message = isMultipleBooking
        ? "Class booked successfully! Note: You are now booked multiple times for this class (for family/friends)."
        : "Class booked successfully!";
    }

    res.status(201).json({
      success: true,
      data: {
        ...booking[0],
        class_title: classData.title,
      },
      message: message,
      isMultipleBooking: isMultipleBooking,
      totalBookingsForClass: existingBookings.length + 1,
    });
  } catch (error) {
    console.error("Error booking class:", error);
    res.status(500).json({
      success: false,
      error: "Failed to book class",
    });
  }
}
