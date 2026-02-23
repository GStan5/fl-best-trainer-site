import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import sql from "../../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify cron secret
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get this week's Monday in EST (allow testDate for testing)
    const testDate = req.query.testDate as string | undefined;
    const now = testDate ? new Date(testDate + "T12:00:00-05:00") : new Date();

    const estFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    // Calculate Monday through Saturday of this week
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1); // Go to Monday
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5); // Saturday

    const mondayStr = estFormatter.format(monday);
    const saturdayStr = estFormatter.format(saturday);

    // Display formatters
    const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    const weekRangeDisplay = `${shortDateFormatter.format(monday)} - ${shortDateFormatter.format(saturday)}`;

    const longDateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Query all classes for the week
    const classes = await sql`
      SELECT 
        c.id, c.title, c.date, c.start_time, c.end_time,
        c.current_participants, c.max_participants, c.location
      FROM classes c
      WHERE c.date >= ${mondayStr}::date
        AND c.date <= ${saturdayStr}::date
        AND c.is_active = true
      ORDER BY c.date ASC, c.start_time ASC
    `;

    if (classes.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No classes scheduled for week of ${mondayStr}`,
        emailSent: false,
      });
    }

    // Get participants for each class
    const classDetails = [];
    for (const cls of classes) {
      const participants = await sql`
        SELECT u.name, u.email, b.status
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.class_id = ${cls.id}
          AND b.status IN ('confirmed', 'waitlist')
        ORDER BY 
          CASE WHEN b.status = 'confirmed' THEN 1 ELSE 2 END,
          u.name ASC
      `;
      classDetails.push({ ...cls, participants });
    }

    // Group classes by day
    const classesByDay: Record<string, typeof classDetails> = {};
    for (const cls of classDetails) {
      const dateKey = new Date(cls.date).toISOString().split("T")[0];
      if (!classesByDay[dateKey]) classesByDay[dateKey] = [];
      classesByDay[dateKey].push(cls);
    }

    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(":");
      const h = parseInt(hours);
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${h12}:${minutes} ${ampm}`;
    };

    // Weekly stats
    const totalClasses = classes.length;
    const totalConfirmed = classDetails.reduce(
      (sum, c) =>
        sum +
        c.participants.filter((p: any) => p.status === "confirmed").length,
      0,
    );
    const totalSpots = classes.reduce((sum, c) => sum + c.max_participants, 0);
    const uniqueParticipants = new Set(
      classDetails.flatMap((c) =>
        c.participants
          .filter((p: any) => p.status === "confirmed")
          .map((p: any) => p.email),
      ),
    ).size;

    // Build HTML email
    let emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #1a1a2e; color: #ffffff; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0f3460 0%, #16213e 100%); padding: 24px; text-align: center; border-bottom: 3px solid #e94560;">
          <h1 style="margin: 0; font-size: 24px; color: #ffffff;">📊 Weekly Class Report</h1>
          <p style="margin: 8px 0 0; font-size: 16px; color: #a8b2d1;">${weekRangeDisplay}</p>
        </div>

        <!-- Stats Bar -->
        <div style="background: #16213e; padding: 20px 24px; border-bottom: 1px solid #2a2a4a;">
          <table width="100%" cellpadding="0" cellspacing="0" style="text-align: center;">
            <tr>
              <td style="padding: 0 8px;">
                <div style="font-size: 32px; font-weight: bold; color: #e94560;">${totalClasses}</div>
                <div style="font-size: 11px; color: #a8b2d1; text-transform: uppercase;">Classes</div>
              </td>
              <td style="padding: 0 8px;">
                <div style="font-size: 32px; font-weight: bold; color: #4ecca3;">${totalConfirmed}</div>
                <div style="font-size: 11px; color: #a8b2d1; text-transform: uppercase;">Total Bookings</div>
              </td>
              <td style="padding: 0 8px;">
                <div style="font-size: 32px; font-weight: bold; color: #f39c12;">${uniqueParticipants}</div>
                <div style="font-size: 11px; color: #a8b2d1; text-transform: uppercase;">Unique Clients</div>
              </td>
              <td style="padding: 0 8px;">
                <div style="font-size: 32px; font-weight: bold; color: #a8b2d1;">${Math.round((totalConfirmed / totalSpots) * 100)}%</div>
                <div style="font-size: 11px; color: #a8b2d1; text-transform: uppercase;">Capacity</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Classes by Day -->
        <div style="padding: 24px;">
    `;

    const sortedDays = Object.keys(classesByDay).sort();
    for (const dateKey of sortedDays) {
      const dayClasses = classesByDay[dateKey];
      const dayDate = new Date(dateKey + "T12:00:00");
      const dayDisplay = longDateFormatter.format(dayDate);

      emailHtml += `
          <div style="margin-bottom: 20px;">
            <div style="background: #0f3460; padding: 10px 16px; border-radius: 8px 8px 0 0; border-left: 4px solid #e94560;">
              <h2 style="margin: 0; font-size: 16px; color: #ffffff;">📅 ${dayDisplay}</h2>
            </div>
      `;

      for (const cls of dayClasses) {
        const confirmed = cls.participants.filter(
          (p: any) => p.status === "confirmed",
        );
        const waitlisted = cls.participants.filter(
          (p: any) => p.status === "waitlist",
        );
        const spotsLeft = cls.max_participants - confirmed.length;
        const isFull = spotsLeft <= 0;

        emailHtml += `
            <div style="background: #16213e; padding: 14px 16px; border-bottom: 1px solid #2a2a4a; border-left: 4px solid ${isFull ? "#e94560" : "#4ecca3"};">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 14px; font-weight: bold; color: #ffffff;">🕐 ${formatTime(cls.start_time)} - ${formatTime(cls.end_time)}</div>
                  <div style="font-size: 12px; color: #a8b2d1; margin-top: 2px;">${cls.title}</div>
                </div>
                <div style="text-align: center; background: ${isFull ? "#e94560" : "#4ecca3"}22; padding: 6px 10px; border-radius: 6px; min-width: 50px;">
                  <div style="font-size: 18px; font-weight: bold; color: ${isFull ? "#e94560" : "#4ecca3"};">${confirmed.length}/${cls.max_participants}</div>
                </div>
              </div>
        `;

        if (confirmed.length > 0) {
          emailHtml += `<div style="margin-top: 8px;">`;
          for (const p of confirmed) {
            emailHtml += `
                <div style="padding: 4px 10px; background: #1a1a2e; border-radius: 4px; margin-bottom: 3px; font-size: 13px;">
                  <span style="color: #4ecca3;">✓</span> <span style="color: #ffffff;">${p.name || "Unknown"}</span>
                  <span style="color: #666; font-size: 11px; margin-left: 8px;">${p.email}</span>
                </div>
            `;
          }
          emailHtml += `</div>`;
        }

        if (waitlisted.length > 0) {
          emailHtml += `<div style="margin-top: 4px;">`;
          for (const p of waitlisted) {
            emailHtml += `
                <div style="padding: 4px 10px; background: #1a1a2e; border-radius: 4px; margin-bottom: 3px; font-size: 13px;">
                  <span style="color: #f39c12;">⏳</span> <span style="color: #ffffff;">${p.name || "Unknown"}</span>
                  <span style="color: #666; font-size: 11px; margin-left: 8px;">(waitlist)</span>
                </div>
            `;
          }
          emailHtml += `</div>`;
        }

        if (confirmed.length === 0 && waitlisted.length === 0) {
          emailHtml += `
              <div style="padding: 8px 10px; color: #666; font-style: italic; font-size: 13px;">No participants enrolled</div>
          `;
        }

        emailHtml += `</div>`;
      }

      emailHtml += `</div>`;
    }

    emailHtml += `
        </div>

        <!-- Footer -->
        <div style="background: #0f3460; padding: 16px 24px; text-align: center; border-top: 1px solid #2a2a4a;">
          <p style="margin: 0; font-size: 12px; color: #a8b2d1;">
            FL Best Trainer • Weekly Class Report • ${weekRangeDisplay}
          </p>
        </div>
      </div>
    `;

    // Plain text version
    let plainText = `Weekly Class Report - ${weekRangeDisplay}\n`;
    plainText += "=".repeat(55) + "\n\n";
    plainText += `Classes: ${totalClasses} | Bookings: ${totalConfirmed} | Unique Clients: ${uniqueParticipants} | Capacity: ${Math.round((totalConfirmed / totalSpots) * 100)}%\n\n`;

    for (const dateKey of sortedDays) {
      const dayClasses = classesByDay[dateKey];
      const dayDate = new Date(dateKey + "T12:00:00");
      const dayDisplay = longDateFormatter.format(dayDate);

      plainText += `${dayDisplay}\n`;
      plainText += "-".repeat(40) + "\n";

      for (const cls of dayClasses) {
        const confirmed = cls.participants.filter(
          (p: any) => p.status === "confirmed",
        );
        const waitlisted = cls.participants.filter(
          (p: any) => p.status === "waitlist",
        );

        plainText += `  ${formatTime(cls.start_time)} - ${formatTime(cls.end_time)} (${confirmed.length}/${cls.max_participants})\n`;
        for (const p of confirmed) {
          plainText += `    ✓ ${p.name || "Unknown"} (${p.email})\n`;
        }
        for (const p of waitlisted) {
          plainText += `    ⏳ ${p.name || "Unknown"} (waitlist)\n`;
        }
        if (confirmed.length === 0 && waitlisted.length === 0) {
          plainText += `    No participants enrolled\n`;
        }
      }
      plainText += "\n";
    }

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"FL Best Trainer" <${process.env.GMAIL_USER}>`,
      to: "FLBestTrainer@gmail.com",
      subject: `FL Best Trainer - Weekly Class Report - ${weekRangeDisplay}`,
      html: emailHtml,
      text: plainText,
    });

    console.log(
      `✅ Weekly class report sent for ${mondayStr} to ${saturdayStr} (${totalClasses} classes)`,
    );

    return res.status(200).json({
      success: true,
      message: `Weekly report sent for ${mondayStr} to ${saturdayStr}`,
      classCount: totalClasses,
      totalParticipants: totalConfirmed,
      uniqueParticipants,
      emailSent: true,
    });
  } catch (error) {
    console.error("Error sending weekly class report:", error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send weekly report",
    });
  }
}
