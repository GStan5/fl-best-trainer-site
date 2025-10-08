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

    const { booking_id } = req.body;

    if (!booking_id) {
      return res.status(400).json({ error: "booking_id is required" });
    }

    // Get the user's access token
    const accessToken = await getUserAccessToken(req);
    if (!accessToken) {
      return res.status(400).json({
        error:
          "No calendar access token found. Please re-authenticate with calendar permissions.",
      });
    }

    // Get booking and class details
    const bookingData = await sql`
      SELECT 
        b.id,
        b.user_id,
        b.google_calendar_event_id,
        c.title,
        c.description,
        c.instructor,
        c.date,
        c.start_time,
        c.end_time,
        c.location,
        c.class_type,
        c.difficulty_level
      FROM bookings b
      JOIN classes c ON b.class_id = c.id
      WHERE b.id = ${booking_id} AND b.user_id = (
        SELECT id FROM users WHERE email = ${session.user.email}
      )
    `;

    if (bookingData.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = bookingData[0];

    // Check if calendar event already exists
    if (booking.google_calendar_event_id) {
      return res.status(200).json({
        success: true,
        message: "Calendar event already exists",
        event_id: booking.google_calendar_event_id,
      });
    }

    // Create calendar event
    const eventId = await createCalendarEvent(accessToken, {
      id: booking.id,
      title: booking.title,
      description: booking.description,
      instructor: booking.instructor,
      date: booking.date,
      start_time: booking.start_time,
      end_time: booking.end_time,
      location: booking.location,
      class_type: booking.class_type,
      difficulty_level: booking.difficulty_level,
    });

    if (!eventId) {
      return res.status(500).json({ error: "Failed to create calendar event" });
    }

    // Update booking with calendar event ID
    await sql`
      UPDATE bookings 
      SET google_calendar_event_id = ${eventId}
      WHERE id = ${booking_id}
    `;

    res.status(200).json({
      success: true,
      message: "Calendar event created successfully",
      event_id: eventId,
    });
  } catch (error: any) {
    console.error("Error creating calendar event:", error);

    // Handle specific calendar API errors
    if (error.message.includes("Calendar access")) {
      return res.status(403).json({
        error: error.message,
        needs_reauth: true,
      });
    }

    res.status(500).json({
      error: error.message || "Failed to create calendar event",
    });
  }
}
