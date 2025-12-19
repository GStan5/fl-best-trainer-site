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

    if (bookingResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Booking not found or already cancelled",
      });
    }

    const booking = bookingResult[0];

    // Setup date/time calculations with explicit timezone handling for EST/EDT
    // Format the date properly - booking.date is already a Date object
    const dateString =
      booking.date instanceof Date
        ? booking.date.toISOString().split("T")[0]
        : booking.date.toString().split("T")[0];
    
    // Parse class time and create date object
    const [hours, minutes] = booking.start_time.split(":").map(Number);
    const [year, month, day] = dateString.split("-").map(Number);
    
    // Create date in Eastern Time Zone (EST/EDT) since that's where the business operates
    // This avoids timezone discrepancies between local development and Vercel production
    const classDateTimeString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    
    // Parse as local time and then adjust for Eastern timezone
    // This ensures consistent behavior regardless of server timezone
    const classDateTime = new Date(classDateTimeString);
    
    // If the server is in UTC (like Vercel), we need to account for EST offset
    // EST is UTC-5, EDT is UTC-4. For safety, we'll use a more direct approach:
    // Check if we're likely on a UTC server and adjust accordingly
    const serverOffset = new Date().getTimezoneOffset();
    const easternOffset = 5 * 60; // EST is UTC-5 (300 minutes)
    
    // If server is UTC (offset 0) and class times are in Eastern, adjust
    if (Math.abs(serverOffset) < 60) { // Server is likely UTC
      classDateTime.setMinutes(classDateTime.getMinutes() - easternOffset);
    }
    
    const now = new Date();

    // Validate the date is valid
    if (isNaN(classDateTime.getTime())) {
      console.error("Invalid class date/time in booking:", {
        bookingId: booking_id,
        date: booking.date,
        time: booking.start_time,
        dateString: dateString,
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

    console.log("Backend cancellation timing check:", {
      bookingId: booking_id,
      classDate: booking.date,
      classTime: booking.start_time,
      dateString: dateString,
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
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel booking",
    });
  }
}
