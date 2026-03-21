import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import sql from "../../../lib/database";

const CLASS_RATE = 40;
const GYM_PCT = 0.25;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Determine "report month" — the month that just ended.
    // We allow a ?month=YYYY-MM query param for testing.
    const testMonth = req.query.month as string | undefined;

    const now = new Date();
    const estNow = new Date(
      now.toLocaleString("en-US", { timeZone: "America/New_York" }),
    );

    // Default: the previous calendar month (this job fires at end-of-month,
    // but we target last month's data so a slight drift doesn't matter).
    let reportYear: number;
    let reportMonth: number; // 1-based

    if (testMonth) {
      const [y, m] = testMonth.split("-").map(Number);
      reportYear = y;
      reportMonth = m;
    } else {
      // Use the month we're currently in (fires on last day of month)
      reportYear = estNow.getFullYear();
      reportMonth = estNow.getMonth() + 1; // getMonth() is 0-based
    }

    // Check if today is actually the last day of the month (skip otherwise,
    // unless a testMonth override was provided).
    if (!testMonth) {
      const lastDay = new Date(reportYear, reportMonth, 0).getDate(); // day 0 of next month = last day of this month
      if (estNow.getDate() !== lastDay) {
        console.log(
          `Monthly report: today (${estNow.getDate()}) is not the last day (${lastDay}) — skipping.`,
        );
        return res.status(200).json({
          success: true,
          message: "Not the last day of the month — skipped.",
          emailSent: false,
        });
      }
    }

    const monthStart = `${reportYear}-${String(reportMonth).padStart(2, "0")}-01`;
    const nextMonthStart =
      reportMonth === 12
        ? `${reportYear + 1}-01-01`
        : `${reportYear}-${String(reportMonth + 1).padStart(2, "0")}-01`;

    const monthName = new Date(reportYear, reportMonth - 1, 1).toLocaleString(
      "en-US",
      { month: "long", year: "numeric" },
    );

    // ── Queries ──────────────────────────────────────────────────────────────

    const [
      classStatsRows,
      topClassRows,
      newClientsRows,
      topClientsRows,
      packageRevenueRows,
      prevMonthBookingsRows,
    ] = await Promise.all([
      // 1. Classes held + total confirmed bookings this month
      sql`
        SELECT
          COUNT(DISTINCT c.id)                                          AS classes_held,
          COUNT(b.id) FILTER (WHERE b.status = 'confirmed')            AS total_bookings,
          ROUND(AVG(c.current_participants * 100.0 / NULLIF(c.max_participants,0)),1) AS avg_fill_pct
        FROM classes c
        LEFT JOIN bookings b ON b.class_id = c.id
        WHERE c.date >= ${monthStart}::date
          AND c.date <  ${nextMonthStart}::date
          AND c.is_active = true
      `,
      // 2. Best-attended class this month
      sql`
        SELECT c.title, c.date, c.start_time,
               COUNT(b.id) FILTER (WHERE b.status = 'confirmed') AS attendees,
               c.max_participants
        FROM classes c
        LEFT JOIN bookings b ON b.class_id = c.id
        WHERE c.date >= ${monthStart}::date
          AND c.date <  ${nextMonthStart}::date
          AND c.is_active = true
        GROUP BY c.id, c.title, c.date, c.start_time, c.max_participants
        ORDER BY attendees DESC
        LIMIT 1
      `,
      // 3. New clients this month
      sql`
        SELECT COUNT(*) AS new_clients
        FROM users
        WHERE created_at >= ${monthStart}::date
          AND created_at <  ${nextMonthStart}::date
      `,
      // 4. Top 5 clients by confirmed bookings this month
      sql`
        SELECT u.name, u.email, COUNT(b.id) AS bookings
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN classes c ON b.class_id = c.id
        WHERE b.status = 'confirmed'
          AND c.date >= ${monthStart}::date
          AND c.date <  ${nextMonthStart}::date
        GROUP BY u.id, u.name, u.email
        ORDER BY bookings DESC
        LIMIT 5
      `,
      // 5. Package revenue this month
      sql`
        SELECT COALESCE(SUM(amount),0) AS package_revenue
        FROM purchases
        WHERE created_at >= ${monthStart}::date
          AND created_at <  ${nextMonthStart}::date
          AND status = 'completed'
      `,
      // 6. Previous month confirmed bookings (for MoM comparison)
      sql`
        SELECT COUNT(b.id) AS prev_bookings
        FROM bookings b
        JOIN classes c ON b.class_id = c.id
        WHERE b.status = 'confirmed'
          AND c.date >= (${monthStart}::date - interval '1 month')
          AND c.date <  ${monthStart}::date
      `,
    ]);

    const classesHeld = parseInt(classStatsRows[0]?.classes_held ?? "0");
    const totalBookings = parseInt(classStatsRows[0]?.total_bookings ?? "0");
    const avgFillPct = parseFloat(classStatsRows[0]?.avg_fill_pct ?? "0");
    const newClients = parseInt(newClientsRows[0]?.new_clients ?? "0");
    const prevBookings = parseInt(prevMonthBookingsRows[0]?.prev_bookings ?? "0");

    // Class revenue
    const gross = totalBookings * CLASS_RATE;
    const gymCost = Math.round(gross * GYM_PCT * 100) / 100;
    const net = Math.round(gross * (1 - GYM_PCT) * 100) / 100;

    // MoM change
    const momChange =
      prevBookings > 0
        ? Math.round(((totalBookings - prevBookings) / prevBookings) * 1000) / 10
        : null;

    const fmt$ = (n: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(n);

    const formatTime = (time: string) => {
      const [h, m] = time.split(":");
      const hr = parseInt(h);
      const ampm = hr >= 12 ? "PM" : "AM";
      const hr12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
      return `${hr12}:${m} ${ampm}`;
    };

    const formatDate = (dateStr: string) =>
      new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

    const topClass = topClassRows[0] ?? null;
    const momArrow = momChange === null ? "" : momChange >= 0 ? "▲" : "▼";
    const momColor = momChange === null ? "#a8b2d1" : momChange >= 0 ? "#4ecca3" : "#e94560";

    // ── HTML email ───────────────────────────────────────────────────────────
    const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #1a1a2e; color: #ffffff; border-radius: 12px; overflow: hidden;">

  <!-- Header -->
  <div style="background: linear-gradient(135deg, #0f3460 0%, #16213e 100%); padding: 28px 24px; text-align: center; border-bottom: 3px solid #e94560;">
    <h1 style="margin: 0; font-size: 26px; color: #ffffff;">📆 Monthly Business Report</h1>
    <p style="margin: 8px 0 0; font-size: 16px; color: #a8b2d1;">${monthName}</p>
  </div>

  <!-- Revenue highlight -->
  <div style="background: linear-gradient(135deg, #0d4f3c 0%, #16213e 100%); padding: 24px; border-bottom: 1px solid #2a2a4a;">
    <div style="text-align: center; margin-bottom: 16px;">
      <div style="font-size: 12px; color: #a8b2d1; text-transform: uppercase; letter-spacing: 1px;">Net Revenue (after 25% gym cost)</div>
      <div style="font-size: 42px; font-weight: bold; color: #4ecca3; margin: 6px 0;">${fmt$(net)}</div>
      ${momChange !== null ? `<div style="font-size: 13px; color: ${momColor};">${momArrow} ${Math.abs(momChange)}% vs last month</div>` : ""}
    </div>
    <div style="display: flex; gap: 0; border-radius: 8px; overflow: hidden; margin-top: 16px;">
      <div style="flex: 3; background: #4ecca322; padding: 14px; text-align: center;">
        <div style="font-size: 20px; font-weight: bold; color: #4ecca3;">${fmt$(net)}</div>
        <div style="font-size: 11px; color: #a8b2d1;">Your Net (75%)</div>
      </div>
      <div style="flex: 1; background: #e9456022; padding: 14px; text-align: center;">
        <div style="font-size: 20px; font-weight: bold; color: #e94560;">${fmt$(gymCost)}</div>
        <div style="font-size: 11px; color: #a8b2d1;">Gym Cost (25%)</div>
      </div>
    </div>
    <div style="text-align: center; margin-top: 10px; font-size: 12px; color: #a8b2d1;">
      Gross: ${fmt$(gross)} &nbsp;·&nbsp; ${totalBookings} confirmed class bookings × $${CLASS_RATE}
    </div>
  </div>

  <!-- Stats row -->
  <div style="background: #16213e; padding: 0; border-bottom: 1px solid #2a2a4a; display: flex;">
    <div style="flex: 1; padding: 20px; text-align: center; border-right: 1px solid #2a2a4a;">
      <div style="font-size: 30px; font-weight: bold; color: #e94560;">${classesHeld}</div>
      <div style="font-size: 11px; color: #a8b2d1; text-transform: uppercase;">Classes Held</div>
    </div>
    <div style="flex: 1; padding: 20px; text-align: center; border-right: 1px solid #2a2a4a;">
      <div style="font-size: 30px; font-weight: bold; color: #4ecca3;">${totalBookings}</div>
      <div style="font-size: 11px; color: #a8b2d1; text-transform: uppercase;">Total Bookings</div>
    </div>
    <div style="flex: 1; padding: 20px; text-align: center; border-right: 1px solid #2a2a4a;">
      <div style="font-size: 30px; font-weight: bold; color: #f39c12;">${avgFillPct}%</div>
      <div style="font-size: 11px; color: #a8b2d1; text-transform: uppercase;">Avg Fill Rate</div>
    </div>
    <div style="flex: 1; padding: 20px; text-align: center;">
      <div style="font-size: 30px; font-weight: bold; color: #a29bfe;">${newClients}</div>
      <div style="font-size: 11px; color: #a8b2d1; text-transform: uppercase;">New Clients</div>
    </div>
  </div>

  <div style="padding: 24px;">

    ${topClass ? `
    <!-- Best class -->
    <div style="background: #16213e; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #f39c12;">
      <div style="font-size: 12px; color: #f39c12; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">🏆 Best Attended Class</div>
      <div style="font-size: 17px; color: #ffffff; font-weight: bold;">${topClass.title}</div>
      <div style="font-size: 13px; color: #a8b2d1; margin-top: 4px;">
        ${formatDate(topClass.date)} · ${formatTime(topClass.start_time)}
        &nbsp;·&nbsp;
        <span style="color: #4ecca3; font-weight: bold;">${topClass.attendees}/${topClass.max_participants} filled</span>
      </div>
    </div>
    ` : ""}

    ${topClientsRows.length > 0 ? `
    <!-- Top clients -->
    <div style="background: #16213e; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <div style="font-size: 12px; color: #4ecca3; text-transform: uppercase; font-weight: bold; margin-bottom: 12px;">⭐ Top Clients This Month</div>
      ${topClientsRows
        .map(
          (c: any, i: number) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: #1a1a2e; border-radius: 4px; margin-bottom: 6px;">
          <div>
            <span style="color: #a8b2d1; font-size: 11px; margin-right: 8px;">${i + 1}.</span>
            <span style="color: #ffffff; font-size: 14px;">${c.name || "Unknown"}</span>
            <span style="color: #a8b2d1; font-size: 11px; margin-left: 8px;">${c.email}</span>
          </div>
          <span style="background: #e9456022; color: #e94560; font-size: 13px; font-weight: bold; padding: 3px 10px; border-radius: 12px;">${c.bookings} classes</span>
        </div>
      `,
        )
        .join("")}
    </div>
    ` : ""}

    ${packageRevenueRows[0]?.package_revenue > 0 ? `
    <!-- Package revenue -->
    <div style="background: #16213e; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #a29bfe;">
      <div style="font-size: 12px; color: #a29bfe; text-transform: uppercase; font-weight: bold; margin-bottom: 6px;">📦 Package Sales This Month</div>
      <div style="font-size: 24px; font-weight: bold; color: #ffffff;">${fmt$(parseFloat(packageRevenueRows[0].package_revenue))}</div>
    </div>
    ` : ""}

  </div>

  <!-- Footer -->
  <div style="background: #0f3460; padding: 16px 24px; text-align: center; border-top: 1px solid #2a2a4a;">
    <p style="margin: 0; font-size: 12px; color: #a8b2d1;">
      FL Best Trainer · Monthly Report · ${monthName}
    </p>
  </div>

</div>
    `.trim();

    // ── Plain text ────────────────────────────────────────────────────────────
    let plainText = `FL Best Trainer — Monthly Report: ${monthName}\n`;
    plainText += "=".repeat(50) + "\n\n";
    plainText += `REVENUE\n`;
    plainText += `  Gross:      ${fmt$(gross)}  (${totalBookings} bookings × $${CLASS_RATE})\n`;
    plainText += `  Gym cost:   ${fmt$(gymCost)}  (25%)\n`;
    plainText += `  Net:        ${fmt$(net)}  (75%)\n`;
    if (momChange !== null) plainText += `  MoM change: ${momChange >= 0 ? "+" : ""}${momChange}%\n`;
    plainText += `\nCLASSES\n`;
    plainText += `  Classes held:  ${classesHeld}\n`;
    plainText += `  Total bookings: ${totalBookings}\n`;
    plainText += `  Avg fill rate: ${avgFillPct}%\n`;
    plainText += `  New clients:   ${newClients}\n`;
    if (topClass) {
      plainText += `\nBEST CLASS: ${topClass.title} on ${formatDate(topClass.date)} — ${topClass.attendees}/${topClass.max_participants} filled\n`;
    }
    if (topClientsRows.length > 0) {
      plainText += `\nTOP CLIENTS\n`;
      topClientsRows.forEach((c: any, i: number) => {
        plainText += `  ${i + 1}. ${c.name || "Unknown"} (${c.email}) — ${c.bookings} classes\n`;
      });
    }

    // ── Send ──────────────────────────────────────────────────────────────────
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
      subject: `FL Best Trainer — Monthly Report: ${monthName}`,
      html: emailHtml,
      text: plainText,
    });

    return res.status(200).json({
      success: true,
      message: `Monthly report sent for ${monthName}`,
      emailSent: true,
      data: { classesHeld, totalBookings, gross, gymCost, net, newClients },
    });
  } catch (err) {
    console.error("Monthly report error:", err);
    return res.status(500).json({
      error: "Failed to send monthly report",
      details: err instanceof Error ? err.message : String(err),
    });
  }
}
