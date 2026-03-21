// Enroll a client in classes by schedule pattern
//
// Usage:
//   node enroll-client.js --client "name" --start YYYY-MM-DD --end YYYY-MM-DD --schedule "Tue:06:30,Thu:06:30,Sat:07:00"
//   node enroll-client.js --client "name" --start YYYY-MM-DD --end YYYY-MM-DD --schedule "Tue:06:30,Thu:06:30,Sat:07:00" --exclude "2026-03-12,2026-03-14"
//   node enroll-client.js ... --commit   (add --commit to actually save, default is dry run)
//
// Day names: Mon Tue Wed Thu Fri Sat Sun
//
// Examples:
//   node enroll-client.js --client "esther" --start 2026-11-04 --end 2027-03-28 --schedule "Tue:06:30,Thu:06:30,Sat:07:00"
//   node enroll-client.js --client "marilyn" --start 2026-04-01 --end 2026-06-30 --schedule "Thu:06:30,Sat:07:00" --exclude "2026-03-12,2026-03-14"

require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

// --- Parse CLI args ---
const args = process.argv.slice(2);
const get = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};

const clientSearch = get("--client");
const startDate = get("--start");
const endDate = get("--end");
const scheduleStr = get("--schedule");
const excludeStr = get("--exclude");
const DRY_RUN = !args.includes("--commit");

const DAY_MAP = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

if (!clientSearch || !startDate || !endDate || !scheduleStr) {
  console.log("❌ Missing required arguments.\n");
  console.log(
    'Usage: node enroll-client.js --client "name" --start YYYY-MM-DD --end YYYY-MM-DD --schedule "Tue:06:30,Thu:06:30,Sat:07:00" [--exclude "date1,date2"] [--commit]',
  );
  process.exit(1);
}

// Parse schedule into array of { dow, time }
const schedule = scheduleStr.split(",").map((entry) => {
  const [day, time] = entry.trim().split(":");
  const [h, m] = time ? [day, time] : [null, null];
  // Handle "Thu:06:30" format
  const parts = entry.trim().split(":");
  const dayName = parts[0];
  const timePart = parts[1] + ":" + parts[2];
  return { dow: DAY_MAP[dayName], time: timePart + ":00" };
});

const excludeDates = excludeStr
  ? new Set(excludeStr.split(",").map((d) => d.trim()))
  : new Set();

async function enrollClient() {
  try {
    const sql = neon(process.env.DATABASE_URL);

    console.log(
      DRY_RUN
        ? "🔍 DRY RUN - No changes will be made\n"
        : "🚀 COMMIT MODE - Changes will be saved\n",
    );
    console.log(`🔎 Client search: "${clientSearch}"`);
    console.log(`📅 Date range:    ${startDate} → ${endDate}`);
    console.log(`📋 Schedule:      ${scheduleStr}`);
    if (excludeDates.size > 0)
      console.log(`🚫 Excluding:     ${[...excludeDates].join(", ")}`);
    console.log("");

    // Find the client
    const allUsers =
      await sql`SELECT id, name, email FROM users ORDER BY name ASC`;
    const matches = allUsers.filter((u) => {
      const term = clientSearch.toLowerCase();
      return (
        (u.name || "").toLowerCase().includes(term) ||
        (u.email || "").toLowerCase().includes(term)
      );
    });

    if (matches.length === 0) {
      console.log(`❌ No user found matching "${clientSearch}"`);
      return;
    }
    if (matches.length > 1) {
      console.log(
        `⚠️  Multiple users matched "${clientSearch}" — please be more specific:`,
      );
      matches.forEach((u, i) =>
        console.log(`  ${i + 1}. ${u.name} (${u.email})`),
      );
      return;
    }

    const client = matches[0];
    console.log(`✅ Found: ${client.name} (${client.email})`);
    console.log(`   User ID: ${client.id}\n`);

    // Build SQL conditions for schedule
    const scheduleConditions = schedule.map(
      ({ dow, time }) =>
        `(EXTRACT(DOW FROM date) = ${dow} AND start_time = '${time}')`,
    );
    const whereSchedule = scheduleConditions.join(" OR ");

    // Fetch matching classes
    const classes = await sql`
      SELECT id, title, date, start_time, end_time,
             current_participants, max_participants
      FROM classes
      WHERE date >= ${startDate}::date
        AND date <= ${endDate}::date
        AND is_active = true
        AND (${sql.unsafe(whereSchedule)})
      ORDER BY date ASC, start_time ASC
    `;

    // Filter out excluded dates
    const eligible = classes.filter((c) => {
      const d = new Date(c.date).toISOString().split("T")[0];
      return !excludeDates.has(d);
    });

    console.log(
      `🔍 Found ${eligible.length} eligible classes (${classes.length} total, ${classes.length - eligible.length} excluded)\n`,
    );

    if (eligible.length === 0) {
      console.log("No classes to enroll in.");
      return;
    }

    // Check existing bookings in range
    const existingBookings = await sql`
      SELECT b.class_id, b.status
      FROM bookings b
      JOIN classes c ON b.class_id = c.id
      WHERE b.user_id = ${client.id}
        AND b.status IN ('confirmed', 'waitlist')
        AND c.date >= ${startDate}::date
        AND c.date <= ${endDate}::date
    `;
    const bookedIds = new Set(existingBookings.map((b) => b.class_id));
    console.log(`📌 Already booked in range: ${existingBookings.length}\n`);

    let wouldEnroll = 0;
    let wouldWaitlist = 0;
    let alreadyBooked = 0;
    const toEnroll = [];

    for (const cls of eligible) {
      const dateObj = new Date(cls.date);
      const dayName = dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "UTC",
      });
      const dateStr = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
      const timeStr = formatTime(cls.start_time);

      if (bookedIds.has(cls.id)) {
        console.log(`⏭️  Already booked: ${dayName} ${dateStr} at ${timeStr}`);
        alreadyBooked++;
        continue;
      }

      const isFull = cls.current_participants >= cls.max_participants;
      const status = isFull ? "waitlist" : "confirmed";
      const icon = isFull ? "⏳" : "✅";
      console.log(
        `${icon} Would ${isFull ? "waitlist" : "enroll"}: ${dayName} ${dateStr} at ${timeStr} (${cls.current_participants}/${cls.max_participants})`,
      );

      toEnroll.push({ cls, status });
      if (status === "confirmed") wouldEnroll++;
      else wouldWaitlist++;
    }

    console.log("\n" + "=".repeat(60));
    console.log(DRY_RUN ? "📊 DRY RUN SUMMARY:" : "📊 ENROLLMENT SUMMARY:");
    console.log("=".repeat(60));
    console.log(`✅ Would enroll (confirmed): ${wouldEnroll}`);
    console.log(`⏳ Would waitlist:           ${wouldWaitlist}`);
    console.log(`⏭️  Already booked (skip):   ${alreadyBooked}`);
    console.log(`📋 Total eligible classes:  ${eligible.length}`);
    console.log(`🆕 Net new enrollments:     ${wouldEnroll + wouldWaitlist}`);

    if (DRY_RUN) {
      console.log("\n👆 This was a DRY RUN. To actually enroll, add --commit:");
      console.log(
        `   node enroll-client.js --client "${clientSearch}" --start ${startDate} --end ${endDate} --schedule "${scheduleStr}"${excludeStr ? ` --exclude "${excludeStr}"` : ""} --commit\n`,
      );
      return;
    }

    // --- COMMIT ---
    console.log("\n⏳ Enrolling...\n");
    let enrolled = 0;
    let waitlisted = 0;
    let errors = 0;

    for (const { cls, status } of toEnroll) {
      try {
        await sql`
          INSERT INTO bookings (user_id, class_id, status, created_at)
          VALUES (${client.id}, ${cls.id}, ${status}, NOW())
        `;
        if (status === "confirmed") {
          await sql`
            UPDATE classes SET current_participants = current_participants + 1 WHERE id = ${cls.id}
          `;
          enrolled++;
        } else {
          waitlisted++;
        }
      } catch (err) {
        const dateStr = new Date(cls.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        });
        console.log(`❌ Error on ${dateStr}: ${err.message}`);
        errors++;
      }
    }

    console.log("=".repeat(60));
    console.log("🎉 DONE:");
    console.log(`✅ Enrolled:   ${enrolled}`);
    console.log(`⏳ Waitlisted: ${waitlisted}`);
    console.log(`❌ Errors:     ${errors}`);
  } catch (error) {
    console.error("❌ Fatal error:", error);
    throw error;
  }
}

function formatTime(time) {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${minutes} ${ampm}`;
}

enrollClient();
