import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import sql from "../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get user session (admin only for completing classes)
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if user is admin
    const adminCheck = await sql`
      SELECT is_admin FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (adminCheck.length === 0 || !adminCheck[0].is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { class_id, attendee_booking_ids } = req.body;

    if (
      !class_id ||
      !attendee_booking_ids ||
      !Array.isArray(attendee_booking_ids)
    ) {
      return res.status(400).json({
        error: "class_id and attendee_booking_ids (array) are required",
      });
    }

    // Get class details
    const classDetails = await sql`
      SELECT id, title FROM classes WHERE id = ${class_id}
    `;

    if (classDetails.length === 0) {
      return res.status(404).json({ error: "Class not found" });
    }

    const classData = classDetails[0];

    // Start transaction
    await sql`BEGIN`;

    try {
      let completedCount = 0;
      const results = [];

      // Process each attendee
      for (const booking_id of attendee_booking_ids) {
        // Get booking details
        const booking = await sql`
          SELECT 
            b.id,
            b.user_id,
            b.status,
            b.completed_at,
            u.email,
            u.name,
            u.weightlifting_classes_booked,
            u.weightlifting_classes_remaining,
            u.classes_attended
          FROM bookings b
          JOIN users u ON b.user_id = u.id
          WHERE b.id = ${booking_id} AND b.class_id = ${class_id}
        `;

        if (booking.length === 0) {
          results.push({
            booking_id,
            success: false,
            error: "Booking not found",
          });
          continue;
        }

        const bookingData = booking[0];

        if (bookingData.status === "completed") {
          results.push({
            booking_id,
            success: false,
            error: "Already completed",
            user: bookingData.name || bookingData.email,
          });
          continue;
        }

        if (bookingData.status === "cancelled") {
          results.push({
            booking_id,
            success: false,
            error: "Cannot complete cancelled booking",
            user: bookingData.name || bookingData.email,
          });
          continue;
        }

        // Mark booking as completed
        await sql`
          UPDATE bookings 
          SET 
            status = 'completed',
            completed_at = NOW()
          WHERE id = ${booking_id}
        `;

        // Update user counters:
        // - Decrease booked sessions count
        // - Decrease remaining sessions count
        // - Increase attended classes count
        await sql`
          UPDATE users 
          SET 
            weightlifting_classes_booked = GREATEST(weightlifting_classes_booked - 1, 0),
            weightlifting_classes_remaining = GREATEST(weightlifting_classes_remaining - 1, 0),
            classes_attended = classes_attended + 1,
            updated_at = NOW()
          WHERE id = ${bookingData.user_id}
        `;

        completedCount++;
        results.push({
          booking_id,
          success: true,
          user: bookingData.name || bookingData.email,
        });
      }

      await sql`COMMIT`;

      res.status(200).json({
        success: true,
        message: `Completed class "${classData.title}" for ${completedCount} attendees`,
        class_id,
        class_title: classData.title,
        completed_count: completedCount,
        results,
      });
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error("Error completing class:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
