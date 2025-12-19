import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import sql from "../../lib/database";
import { CANCELLATION_POLICY } from "../../config/cancellation";

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

    const { booking_id } = req.body;

    console.warn("🚨 API CANCEL: Received cancel request", {
      bookingId: booking_id,
      userEmail: session.user.email,
    });

    if (!booking_id) {
      return res.status(400).json({
        success: false,
        error: "booking_id is required",
      });
    }

    // Get user data
    const userResult = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const user = userResult[0];

    // Get booking details and verify ownership (include both confirmed and waitlist)
    const bookingResult = await sql`
      SELECT 
        b.*,
        c.title as class_title,
        c.date,
        c.start_time,
        c.current_participants
      FROM bookings b
      JOIN classes c ON b.class_id = c.id
      WHERE b.id = ${booking_id} AND b.user_id = ${user.id} AND b.status IN ('confirmed', 'waitlist')
    `;

    console.warn("🚨 API CANCEL: Database query results", {
      bookingId: booking_id,
      userId: user.id,
      resultsCount: bookingResult.length,
    });

    if (bookingResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Booking not found or already cancelled",
      });
    }

    const booking = bookingResult[0];

    console.warn("🚨 API CANCEL: Retrieved booking from database", {
      bookingId: booking.id,
      classTitle: booking.class_title,
      date: booking.date,
      startTime: booking.start_time,
    });

    // Parse date exactly like the frontend calendar components do
    const dateStr =
      typeof booking.date === "string"
        ? booking.date.split("T")[0] // Get "2025-10-09" from "2025-10-09T04:00:00.000Z"
        : new Date(booking.date).toISOString().split("T")[0]; // Convert Date object to string

    const [year, month, day] = dateStr.split("-").map(Number);
    const timeComponents = booking.start_time.split(":");
    
    // Backend must explicitly handle Eastern timezone since Vercel runs in UTC
    // Create date string in Eastern timezone format for consistent parsing
    const easternTimeString = `${dateStr}T${booking.start_time}-05:00`; // EST offset
    const classDateTime = new Date(easternTimeString);
    
    console.warn("🚨 API CANCEL: Server-safe Eastern timezone", {
      originalDate: booking.date,
      dateStr,
      startTime: booking.start_time,
      easternTimeString,
      classDateTime: classDateTime.toISOString(),
      classDateTimeLocal: classDateTime.toString(),
      serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    console.warn("🚨 API CANCEL: Using calendar component logic", {
      originalDate: booking.date,
      dateStr,
      startTime: booking.start_time,
      parsedComponents: {
        year,
        month: month - 1,
        day,
        hour: parseInt(timeComponents[0]),
        minute: parseInt(timeComponents[1]),
      },
      classDateTime: classDateTime.toISOString(),
      classDateTimeLocal: classDateTime.toString(),
    });

    const now = new Date();

    console.log("🔍 DEBUG: Time comparison (frontend-matched)", {
      classDateTime: classDateTime.toISOString(),
      classDateTimeLocal: classDateTime.toString(),
      now: now.toISOString(),
      nowLocal: now.toString(),
      serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      serverOffset: new Date().getTimezoneOffset(),
    });

    // Validate the date is valid
    if (isNaN(classDateTime.getTime())) {
      console.error("Invalid class date/time in booking:", {
        bookingId: booking_id,
        date: booking.date,
        time: booking.start_time,
        dateStr: dateStr,
        parsedDateTime: classDateTime.toString(),
      });
      return res.status(400).json({
        success: false,
        error: "Invalid class date/time",
      });
    }

    // Check if class is in the past (prevent cancellation of past classes)
    if (classDateTime < now) {
      return res.status(400).json({
        success: false,
        error: "Cannot cancel past classes",
      });
    }

    // Check if cancellation is more than the cancellation policy hours before class
    const hoursUntilClass =
      (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isRefundable = CANCELLATION_POLICY.isRefundable(classDateTime);

    console.log("🔍 DEBUG: Timing calculation", {
      classDateTimeMs: classDateTime.getTime(),
      nowMs: now.getTime(),
      timeDifferenceMs: classDateTime.getTime() - now.getTime(),
      hoursUntilClass,
      cancellationPolicyHours: CANCELLATION_POLICY.HOURS,
      isRefundable,
      shouldPenalize: !isRefundable,
    });

    console.log("Backend cancellation timing check:", {
      bookingId: booking_id,
      classDate: booking.date,
      classTime: booking.start_time,
      dateStr: dateStr,
      classDateTime: classDateTime.toISOString(),
      classDateTimeLocal: classDateTime.toString(),
      now: now.toISOString(),
      nowLocal: now.toString(),
      serverTimezoneOffset: new Date().getTimezoneOffset(),
      hoursUntilClass,
      isRefundable,
      cancellationPolicyHours: CANCELLATION_POLICY.HOURS,
      userEmail: session.user.email,
    });

    // Cancel the booking
    await sql`
      UPDATE bookings 
      SET 
        status = 'cancelled',
        updated_at = NOW()
      WHERE id = ${booking_id}
    `;

    let penalized = false;
    const isWaitlistCancellation = booking.status === "waitlist";

    // Only apply booking logic and penalties to confirmed bookings
    if (!isWaitlistCancellation) {
      // Decrease booked sessions count (since booking was made)
      await sql`
        UPDATE users 
        SET 
          weightlifting_classes_booked = GREATEST(weightlifting_classes_booked - 1, 0),
          updated_at = NOW()
        WHERE id = ${user.id}
      `;

      // Apply penalty (remove a session) if cancelled less than the policy hours in advance
      if (!isRefundable) {
        // Penalize by removing one available session for late cancellation
        await sql`
          UPDATE users 
          SET 
            weightlifting_classes_remaining = GREATEST(weightlifting_classes_remaining - 1, 0),
            updated_at = NOW()
          WHERE id = ${user.id}
        `;
        penalized = true;
      }

      // Update class participant count (only for confirmed bookings)
      // Ensure participant count never goes below 0
      await sql`
        UPDATE classes 
        SET 
          current_participants = GREATEST(current_participants - 1, 0),
          updated_at = NOW()
        WHERE id = ${booking.class_id}
      `;
    }

    // Check for waitlist and promote first person in line (only for confirmed booking cancellations)
    let promotedFromWaitlist = null;
    if (!isWaitlistCancellation) {
      try {
        // Get the first person on the waitlist (ordered by booking_date for FIFO)
        const waitlistResult = await sql`
          SELECT 
            b.id as booking_id,
            b.user_id,
            u.email,
            u.first_name,
            u.last_name
          FROM bookings b
          JOIN users u ON b.user_id = u.id
          WHERE b.class_id = ${booking.class_id} 
            AND b.status = 'waitlist'
          ORDER BY b.booking_date ASC
          LIMIT 1
        `;

        if (waitlistResult.length > 0) {
          const waitlistBooking = waitlistResult[0];

          // Promote from waitlist to confirmed
          await sql`
          UPDATE bookings 
          SET 
            status = 'confirmed',
            updated_at = NOW()
          WHERE id = ${waitlistBooking.booking_id}
        `;

          // Increment their booked sessions counter
          await sql`
          UPDATE users 
          SET 
            weightlifting_classes_booked = COALESCE(weightlifting_classes_booked, 0) + 1,
            updated_at = NOW()
          WHERE id = ${waitlistBooking.user_id}
        `;

          // Update class participant count back up by 1
          await sql`
          UPDATE classes 
          SET 
            current_participants = current_participants + 1,
            updated_at = NOW()
          WHERE id = ${booking.class_id}
        `;

          promotedFromWaitlist = {
            user_email: waitlistBooking.email,
            user_name: `${waitlistBooking.first_name || ""} ${
              waitlistBooking.last_name || ""
            }`.trim(),
          };

          console.log("Promoted user from waitlist:", promotedFromWaitlist);

          // TODO: Send notification email to promoted user
          // This would be a good place to integrate with an email service
        }
      } catch (waitlistError) {
        console.error("Error processing waitlist promotion:", waitlistError);
        // Don't fail the cancellation if waitlist promotion fails
      }
    }

    res.status(200).json({
      success: true,
      message: isWaitlistCancellation
        ? "Removed from waitlist successfully"
        : penalized
        ? CANCELLATION_POLICY.getAPIMessage()
        : "Booking cancelled successfully",
      penalized: penalized,
      promoted_from_waitlist: promotedFromWaitlist,
      data: {
        booking_id: booking_id,
        class_title: booking.class_title,
      },
    });
  } catch (error) {
    console.error("🚨 API CANCEL ERROR:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    res.status(500).json({
      success: false,
      error: "Failed to cancel booking",
    });
  }
}
