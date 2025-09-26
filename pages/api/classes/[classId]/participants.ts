import type { NextApiRequest, NextApiResponse } from "next";
import sql from "../../../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { classId } = req.query;

  if (!classId || typeof classId !== "string") {
    return res.status(400).json({
      success: false,
      error: "Class ID is required",
    });
  }

  // Check if database connection is available
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      success: false,
      error:
        "Database connection not configured. Please set DATABASE_URL in .env.local",
    });
  }

  if (req.method === "GET") {
    try {
      // Get all participants for this class (both confirmed and waitlisted)
      const participants = await sql`
        SELECT 
          b.id as booking_id,
          b.status,
          b.booking_date,
          u.id as user_id,
          u.name,
          u.email
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.class_id = ${classId}
        AND b.status IN ('confirmed', 'waitlist')
        ORDER BY 
          CASE WHEN b.status = 'confirmed' THEN 1 ELSE 2 END,
          u.name ASC
      `;

      res.status(200).json({
        success: true,
        data: participants,
      });
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch participants",
      });
    }
  } else if (req.method === "POST") {
    try {
      const { userId, isAdminOverride } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      // Check if user is already booked for this class
      const existingBooking = await sql`
        SELECT id, status FROM bookings 
        WHERE user_id = ${userId} AND class_id = ${classId}
      `;

      if (existingBooking.length > 0) {
        return res.status(409).json({
          success: false,
          error: `User is already ${existingBooking[0].status} for this class`,
        });
      }

      // Check if class is full (only if not admin override)
      const classInfo = await sql`
        SELECT max_participants, current_participants 
        FROM classes 
        WHERE id = ${classId}
      `;

      if (classInfo.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Class not found",
        });
      }

      // Determine booking status
      let bookingStatus = "confirmed";
      if (
        !isAdminOverride &&
        classInfo[0].current_participants >= classInfo[0].max_participants
      ) {
        bookingStatus = "waitlist";
      }

      // Add the participant
      const newBooking = await sql`
        INSERT INTO bookings (user_id, class_id, status)
        VALUES (${userId}, ${classId}, ${bookingStatus})
        RETURNING id, booking_date, status
      `;

      // Update participant count (only count confirmed participants)
      await sql`
        UPDATE classes 
        SET current_participants = (
          SELECT COUNT(*) 
          FROM bookings 
          WHERE class_id = ${classId} AND status = 'confirmed'
        )
        WHERE id = ${classId}
      `;

      // Get the user info for the response
      const userInfo = await sql`
        SELECT id, name, email FROM users WHERE id = ${userId}
      `;

      res.status(201).json({
        success: true,
        data: {
          booking_id: newBooking[0].id,
          booking_date: newBooking[0].booking_date,
          user_id: userInfo[0].id,
          name: userInfo[0].name,
          email: userInfo[0].email,
          status: newBooking[0].status,
        },
        message:
          bookingStatus === "waitlist"
            ? "Participant added to waitlist"
            : "Participant confirmed",
      });
    } catch (error: any) {
      console.error("Error adding participant:", error);
      res.status(500).json({
        success: false,
        error: "Failed to add participant",
      });
    }
  } else if (req.method === "DELETE") {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      // Remove the participant
      const result = await sql`
        DELETE FROM bookings 
        WHERE user_id = ${userId} AND class_id = ${classId}
        RETURNING id, status
      `;

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Booking not found",
        });
      }

      // If we removed a confirmed participant, promote someone from waitlist
      if (result[0].status === "confirmed") {
        // Get the first person on the waitlist
        const waitlistParticipant = await sql`
          SELECT id, user_id 
          FROM bookings 
          WHERE class_id = ${classId} AND status = 'waitlist'
          ORDER BY booking_date ASC
          LIMIT 1
        `;

        if (waitlistParticipant.length > 0) {
          // Promote them to confirmed
          await sql`
            UPDATE bookings 
            SET status = 'confirmed' 
            WHERE id = ${waitlistParticipant[0].id}
          `;
        }
      }

      // Update participant count (only count confirmed participants)
      await sql`
        UPDATE classes 
        SET current_participants = (
          SELECT COUNT(*) 
          FROM bookings 
          WHERE class_id = ${classId} AND status = 'confirmed'
        )
        WHERE id = ${classId}
      `;

      res.status(200).json({
        success: true,
        message: "Participant removed successfully",
      });
    } catch (error: any) {
      console.error("Error removing participant:", error);
      res.status(500).json({
        success: false,
        error: "Failed to remove participant",
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "DELETE"]);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }
}
