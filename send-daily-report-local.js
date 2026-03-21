// Local script to send daily class summary report
// Bypasses Vercel cron and runs directly against the database

require("dotenv").config({ path: ".env.local" });
const nodemailer = require("nodemailer");
const { neon } = require("@neondatabase/serverless");

async function sendDailyReport() {
  try {
    const sql = neon(process.env.DATABASE_URL);

    // Get today's date in EST
    const now = new Date();
    const estFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const todayEST = estFormatter.format(now); // YYYY-MM-DD format

    // Get today's day name for display
    const dayFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const todayDisplay = dayFormatter.format(now);

    console.log(`📅 Generating report for: ${todayDisplay} (${todayEST})\n`);

    // Query all classes for today
    const classes = await sql`
      SELECT 
        c.id,
        c.title,
        c.date,
        c.start_time,
        c.end_time,
        c.current_participants,
        c.max_participants,
        c.location
      FROM classes c
      WHERE c.date = ${todayEST}::date
        AND c.is_active = true
      ORDER BY c.start_time ASC
    `;

    if (classes.length === 0) {
      console.log(`❌ No classes found for ${todayEST}`);
      console.log("No report to send.");
      return;
    }

    console.log(`✅ Found ${classes.length} classes\n`);

    // For each class, get the enrolled participants
    const classDetails = [];
    for (const cls of classes) {
      const participants = await sql`
        SELECT 
          u.name,
          u.email,
          b.status
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        WHERE b.class_id = ${cls.id}
          AND b.status IN ('confirmed', 'waitlist')
        ORDER BY 
          CASE WHEN b.status = 'confirmed' THEN 1 ELSE 2 END,
          u.name ASC
      `;

      classDetails.push({
        ...cls,
        participants,
      });

      const confirmed = participants.filter(
        (p) => p.status === "confirmed",
      ).length;
      console.log(
        `  ${cls.title} (${cls.start_time}): ${confirmed}/${cls.max_participants} participants`,
      );
    }

    console.log("\n📧 Building email...\n");

    // Format the time for display (convert 24h to 12h)
    const formatTime = (time) => {
      const [hours, minutes] = time.split(":");
      const h = parseInt(hours);
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${h12}:${minutes} ${ampm}`;
    };

    // Build email HTML
    let emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0f3460 0%, #16213e 100%); padding: 24px; text-align: center; border-bottom: 3px solid #e94560;">
          <h1 style="margin: 0; font-size: 24px; color: #ffffff;">📋 Daily Class Summary</h1>
          <p style="margin: 8px 0 0; font-size: 16px; color: #a8b2d1;">${todayDisplay}</p>
        </div>

        <!-- Summary Bar -->
        <div style="background: #16213e; padding: 16px 24px; display: flex; border-bottom: 1px solid #2a2a4a;">
          <div style="text-align: center; flex: 1;">
            <div style="font-size: 28px; font-weight: bold; color: #e94560;">${classes.length}</div>
            <div style="font-size: 12px; color: #a8b2d1; text-transform: uppercase;">Classes Today</div>
          </div>
          <div style="text-align: center; flex: 1;">
            <div style="font-size: 28px; font-weight: bold; color: #4ecca3;">${classDetails.reduce((sum, c) => sum + c.participants.filter((p) => p.status === "confirmed").length, 0)}</div>
            <div style="font-size: 12px; color: #a8b2d1; text-transform: uppercase;">Total Participants</div>
          </div>
        </div>

        <!-- Classes -->
        <div style="padding: 24px;">
    `;

    for (const cls of classDetails) {
      const confirmed = cls.participants.filter(
        (p) => p.status === "confirmed",
      );
      const waitlisted = cls.participants.filter(
        (p) => p.status === "waitlist",
      );
      const spotsLeft = cls.max_participants - confirmed.length;
      const isFull = spotsLeft <= 0;

      emailHtml += `
          <div style="background: #16213e; border-radius: 8px; padding: 16px; margin-bottom: 16px; border-left: 4px solid ${isFull ? "#e94560" : "#4ecca3"};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div>
                <h3 style="margin: 0; font-size: 16px; color: #ffffff;">${cls.title}</h3>
                <p style="margin: 4px 0 0; font-size: 14px; color: #a8b2d1;">
                  🕐 ${formatTime(cls.start_time)} - ${formatTime(cls.end_time)} &nbsp;|&nbsp; 📍 ${cls.location || "TBD"}
                </p>
              </div>
              <div style="text-align: center; background: ${isFull ? "#e94560" : "#4ecca3"}22; padding: 8px 12px; border-radius: 8px;">
                <div style="font-size: 20px; font-weight: bold; color: ${isFull ? "#e94560" : "#4ecca3"};">${confirmed.length}/${cls.max_participants}</div>
                <div style="font-size: 10px; color: #a8b2d1;">${isFull ? "FULL" : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}</div>
              </div>
            </div>
      `;

      if (confirmed.length > 0) {
        emailHtml += `
            <div style="margin-top: 8px;">
              <div style="font-size: 12px; color: #4ecca3; text-transform: uppercase; margin-bottom: 6px; font-weight: bold;">✅ Confirmed (${confirmed.length})</div>
        `;
        for (const p of confirmed) {
          emailHtml += `
              <div style="padding: 6px 12px; background: #1a1a2e; border-radius: 4px; margin-bottom: 4px; display: flex; justify-content: space-between;">
                <span style="color: #ffffff; font-size: 14px;">${p.name || "Unknown"}</span>
                <span style="color: #a8b2d1; font-size: 12px;">${p.email}</span>
              </div>
          `;
        }
        emailHtml += `</div>`;
      }

      if (waitlisted.length > 0) {
        emailHtml += `
            <div style="margin-top: 8px;">
              <div style="font-size: 12px; color: #f39c12; text-transform: uppercase; margin-bottom: 6px; font-weight: bold;">⏳ Waitlist (${waitlisted.length})</div>
        `;
        for (const p of waitlisted) {
          emailHtml += `
              <div style="padding: 6px 12px; background: #1a1a2e; border-radius: 4px; margin-bottom: 4px; display: flex; justify-content: space-between;">
                <span style="color: #ffffff; font-size: 14px;">${p.name || "Unknown"}</span>
                <span style="color: #a8b2d1; font-size: 12px;">${p.email}</span>
              </div>
          `;
        }
        emailHtml += `</div>`;
      }

      if (confirmed.length === 0 && waitlisted.length === 0) {
        emailHtml += `
            <div style="padding: 12px; background: #1a1a2e; border-radius: 4px; text-align: center; color: #a8b2d1; font-style: italic;">
              No participants enrolled yet
            </div>
        `;
      }

      emailHtml += `</div>`;
    }

    emailHtml += `
        </div>

        <!-- Footer -->
        <div style="background: #0f3460; padding: 16px 24px; text-align: center; border-top: 1px solid #2a2a4a;">
          <p style="margin: 0; font-size: 12px; color: #a8b2d1;">
            FL Best Trainer • Automated Daily Summary • ${todayDisplay}
          </p>
        </div>
      </div>
    `;

    // Build plain text version
    let plainText = `Daily Class Summary - ${todayDisplay}\n`;
    plainText += "=".repeat(50) + "\n\n";
    plainText += `Classes Today: ${classes.length}\n\n`;

    for (const cls of classDetails) {
      const confirmed = cls.participants.filter(
        (p) => p.status === "confirmed",
      );
      const waitlisted = cls.participants.filter(
        (p) => p.status === "waitlist",
      );

      plainText += `${cls.title}\n`;
      plainText += `Time: ${formatTime(cls.start_time)} - ${formatTime(cls.end_time)}\n`;
      plainText += `Participants: ${confirmed.length}/${cls.max_participants}\n`;

      if (confirmed.length > 0) {
        plainText += `Confirmed:\n`;
        for (const p of confirmed) {
          plainText += `  • ${p.name || "Unknown"} (${p.email})\n`;
        }
      }
      if (waitlisted.length > 0) {
        plainText += `Waitlist:\n`;
        for (const p of waitlisted) {
          plainText += `  • ${p.name || "Unknown"} (${p.email})\n`;
        }
      }
      if (confirmed.length === 0 && waitlisted.length === 0) {
        plainText += `  No participants enrolled\n`;
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
      subject: `FL Best Trainer - Daily Class Summary - ${todayDisplay}`,
      html: emailHtml,
      text: plainText,
    });

    console.log("✅ Daily class summary sent successfully!");
    console.log("📊 Summary:");
    console.log(`   Classes: ${classes.length}`);
    console.log(
      `   Total Participants: ${classDetails.reduce((sum, c) => sum + c.participants.filter((p) => p.status === "confirmed").length, 0)}`,
    );
    console.log(`   Email sent to: FLBestTrainer@gmail.com`);
  } catch (error) {
    console.error("❌ Error sending daily class summary:", error);
    throw error;
  }
}

sendDailyReport();
