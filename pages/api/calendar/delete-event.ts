import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import sql from "../../../lib/database";
import {
  deleteCalendarEvent,
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

    // Get booking details
    const bookingData = await sql`
      SELECT 
        b.id,
        b.user_id,
        b.google_calendar_event_id
      FROM bookings b
      WHERE b.id = ${booking_id} AND b.user_id = (
        SELECT id FROM users WHERE email = ${session.user.email}
      )
    `;

    if (bookingData.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = bookingData[0];

    // Check if calendar event exists
    if (!booking.google_calendar_event_id) {
      return res.status(200).json({
        success: true,
        message: "No calendar event to delete",
      });
    }

    // Delete calendar event
    const deleted = await deleteCalendarEvent(
      accessToken,
      booking.google_calendar_event_id
    );

    if (!deleted) {
      return res.status(500).json({ error: "Failed to delete calendar event" });
    }

    // Remove calendar event ID from booking
    await sql`
      UPDATE bookings 
      SET google_calendar_event_id = NULL
      WHERE id = ${booking_id}
    `;

    res.status(200).json({
      success: true,
      message: "Calendar event deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting calendar event:", error);

    // Handle specific calendar API errors
    if (error.message.includes("Calendar access")) {
      return res.status(403).json({
        error: error.message,
        needs_reauth: true,
      });
    }

    res.status(500).json({
      error: error.message || "Failed to delete calendar event",
    });
  }
}
