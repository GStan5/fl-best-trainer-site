import type { NextApiRequest, NextApiResponse } from "next";
import sql from "../../../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
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
          b.booking_date ASC
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
      const { userId, userEmail, isAdminOverride, action, bookingStatus } =
        req.body;

      // Handle admin actions (add/remove without specific user)
      if (action === "add") {
        // Admin add: Increment participant count directly
        await sql`
          UPDATE fitness_classes 
          SET current_participants = GREATEST(0, COALESCE(current_participants, 0) + 1)
          WHERE id = ${classId}
        `;

        return res.status(200).json({
          success: true,
          message: "Participant count increased",
        });
      }

      if (action === "remove") {
        // Admin remove: Decrement participant count directly
        await sql`
          UPDATE fitness_classes 
          SET current_participants = GREATEST(0, COALESCE(current_participants, 0) - 1)
          WHERE id = ${classId}
        `;

        return res.status(200).json({
          success: true,
          message: "Participant count decreased",
        });
      }

      let finalUserId = userId;

      // If email is provided instead of userId, look up the user
      if (!userId && userEmail) {
        const userLookup = await sql`
          SELECT id FROM users WHERE email = ${userEmail.toLowerCase()}
        `;

        if (userLookup.length === 0) {
          return res.status(404).json({
            success: false,
            error: "User not found with that email address",
          });
        }

        finalUserId = userLookup[0].id;
      }

      if (!finalUserId) {
        return res.status(400).json({
          success: false,
          error: "User ID or email is required",
        });
      }

      // Check if user is already booked for this class
      const existingBooking = await sql`
        SELECT id, status FROM bookings 
        WHERE user_id = ${finalUserId} AND class_id = ${classId}
      `;

      if (existingBooking.length > 0) {
        // If admin override and status is cancelled, allow re-booking by updating existing record
        if (isAdminOverride && existingBooking[0].status === "cancelled") {
          // Update the cancelled booking to confirmed
          await sql`
            UPDATE bookings 
            SET status = 'confirmed', booking_date = NOW()
            WHERE id = ${existingBooking[0].id}
          `;

          // Update participant count in classes table
          await sql`
            UPDATE classes 
            SET current_participants = COALESCE(current_participants, 0) + 1
            WHERE id = ${classId}
          `;

          // Update user's booking count
          await sql`
            UPDATE users 
            SET weightlifting_classes_booked = COALESCE(weightlifting_classes_booked, 0) + 1
            WHERE id = ${finalUserId}
          `;

          // Get the user info for the response
          const userInfo = await sql`
            SELECT id, name, email FROM users WHERE id = ${finalUserId}
          `;

          return res.status(200).json({
            success: true,
            data: {
              booking_id: existingBooking[0].id,
              booking_date: new Date().toISOString(),
              user_id: userInfo[0].id,
              name: userInfo[0].name,
              email: userInfo[0].email,
              status: "confirmed",
            },
            message: "Participant re-added successfully",
          });
        }

        // If admin override and user is already confirmed/waitlist, allow duplicate booking
        if (isAdminOverride) {
          // Admin can add user multiple times - continue to create new booking below
          // This allows fixing classes where people need to be manually added
        } else {
          // For non-admin, block duplicate bookings
          return res.status(409).json({
            success: false,
            error: `User is already ${existingBooking[0].status} for this class`,
          });
        }
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
      let finalBookingStatus = bookingStatus || "confirmed"; // Use provided status or default to confirmed

      // If not admin override and not explicitly set to waitlist, check if class is full
      if (
        !isAdminOverride &&
        !bookingStatus && // Only auto-assign to waitlist if status wasn't explicitly provided
        classInfo[0].current_participants >= classInfo[0].max_participants
      ) {
        finalBookingStatus = "waitlist";
      }

      // Add the participant
      const newBooking = await sql`
        INSERT INTO bookings (user_id, class_id, status)
        VALUES (${finalUserId}, ${classId}, ${finalBookingStatus})
        RETURNING id, booking_date, status
      `;

      // Update participant count in classes table (only for confirmed bookings)
      if (finalBookingStatus === "confirmed") {
        await sql`
          UPDATE classes 
          SET current_participants = COALESCE(current_participants, 0) + 1
          WHERE id = ${classId}
        `;
      }

      // Update user's booking count if it's a confirmed booking
      if (finalBookingStatus === "confirmed") {
        await sql`
          UPDATE users 
          SET weightlifting_classes_booked = COALESCE(weightlifting_classes_booked, 0) + 1
          WHERE id = ${finalUserId}
        `;
      }

      // Get the user info for the response
      const userInfo = await sql`
        SELECT id, name, email FROM users WHERE id = ${finalUserId}
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
          finalBookingStatus === "waitlist"
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
        RETURNING id, status, user_id
      `;

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Booking not found",
        });
      }

      // Update user's booking count if it was a confirmed booking
      if (result[0].status === "confirmed") {
        await sql`
          UPDATE users 
          SET weightlifting_classes_booked = GREATEST(0, COALESCE(weightlifting_classes_booked, 0) - 1)
          WHERE id = ${result[0].user_id}
        `;
      }

      // Update participant count in classes table
      if (result[0].status === "confirmed") {
        await sql`
          UPDATE classes 
          SET current_participants = GREATEST(0, COALESCE(current_participants, 0) - 1)
          WHERE id = ${classId}
        `;

        // Get the first person on the waitlist
        const waitlistParticipant = await sql`
          SELECT id, user_id 
          FROM bookings 
          WHERE class_id = ${classId} AND status = 'waitlist'
          ORDER BY booking_date ASC
          LIMIT 1
        `;

        if (waitlistParticipant.length > 0) {
          // Promote them to confirmed (count stays the same since we're replacing one confirmed with another)
          await sql`
            UPDATE bookings 
            SET status = 'confirmed' 
            WHERE id = ${waitlistParticipant[0].id}
          `;
        }
      }

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
