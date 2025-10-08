import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import sql from "../../../lib/database";
import {
  createCalendarEvent,
  getUserAccessToken,
} from "../../../lib/googleCalendar";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      class_id,
      join_waitlist = false,
      enable_calendar_sync = false,
    } = req.body;

    if (!class_id) {
      return res.status(400).json({ error: "class_id is required" });
    }

    // Get user info
    const userData = await sql`
      SELECT id, weightlifting_classes_remaining, weightlifting_classes_booked
      FROM users 
      WHERE email = ${session.user.email}
    `;

    if (userData.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userData[0];

    // Check if user has sessions remaining (unless joining waitlist)
    if (!join_waitlist && user.weightlifting_classes_remaining <= 0) {
      return res.status(400).json({ error: "No sessions remaining" });
    }

    // Get class details
    const classData = await sql`
      SELECT * FROM classes WHERE id = ${class_id}
    `;

    if (classData.length === 0) {
      return res.status(404).json({ error: "Class not found" });
    }

    const classInfo = classData[0];

    // Check if class is full (unless joining waitlist)
    if (
      !join_waitlist &&
      classInfo.current_participants >= classInfo.max_participants
    ) {
      return res.status(400).json({ error: "Class is full" });
    }

    // Create booking
    const bookingResult = await sql`
      INSERT INTO bookings (user_id, class_id, status)
      VALUES (${user.id}, ${class_id}, ${
      join_waitlist ? "waitlist" : "confirmed"
    })
      RETURNING id
    `;

    const bookingId = bookingResult[0].id;
    let calendarEventId = null;

    // Create calendar event if enabled and not joining waitlist
    if (enable_calendar_sync && !join_waitlist) {
      try {
        const accessToken = await getUserAccessToken(req);
        if (accessToken) {
          calendarEventId = await createCalendarEvent(accessToken, {
            id: classInfo.id,
            title: classInfo.title,
            description: classInfo.description,
            instructor: classInfo.instructor,
            date: classInfo.date,
            start_time: classInfo.start_time,
            end_time: classInfo.end_time,
            location: classInfo.location,
            class_type: classInfo.class_type,
            difficulty_level: classInfo.difficulty_level,
          });

          if (calendarEventId) {
            // Update booking with calendar event ID
            await sql`
              UPDATE bookings 
              SET google_calendar_event_id = ${calendarEventId}
              WHERE id = ${bookingId}
            `;
          }
        }
      } catch (calendarError) {
        console.log(
          "⚠️ Calendar sync failed, but booking was successful:",
          calendarError
        );
        // Don't fail the booking if calendar sync fails
      }
    }

    // Update user counters (only for confirmed bookings)
    if (!join_waitlist) {
      await sql`
        UPDATE users 
        SET 
          weightlifting_classes_remaining = weightlifting_classes_remaining - 1,
          weightlifting_classes_booked = weightlifting_classes_booked + 1
        WHERE id = ${user.id}
      `;
    }

    res.status(200).json({
      success: true,
      message: join_waitlist
        ? "Added to waitlist successfully"
        : "Class booked successfully",
      booking_id: bookingId,
      calendar_event_id: calendarEventId,
      calendar_synced: !!calendarEventId,
    });
  } catch (error: any) {
    console.error("Error booking class:", error);
    res.status(500).json({
      error: error.message || "Failed to book class",
    });
  }
}
