/**
 * Bulk Enroll Script
 *
 * Enrolls a user into classes matching specific criteria (days, times, date range).
 *
 * Usage:
 *   node bulk-enroll.js --email "oberling590@gmail.com" --days "tuesday,thursday" --time "07:30" --from "2026-03-13" --to "2026-12-31"
 *
 * Options:
 *   --email     User's email address (required)
 *   --days      Comma-separated days of the week, e.g. "tuesday,thursday" (required)
 *   --time      Class start time in HH:MM format, e.g. "07:30" (required)
 *   --from      Start date YYYY-MM-DD (default: today)
 *   --to        End date YYYY-MM-DD (required)
 *   --title     Optional: filter by class title (partial match, case-insensitive)
 *   --dry-run   Preview what would be enrolled without making changes
 */

require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

// Parse command line arguments
function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].replace("--", "");
      if (key === "dry-run") {
        args["dryRun"] = true;
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
        args[key] = argv[i + 1];
        i++;
      }
    }
  }
  return args;
}

async function main() {
  const args = parseArgs();

  // Validate required args
  if (!args.email) {
    console.error("❌ --email is required");
    console.log(
      '\nUsage: node bulk-enroll.js --email "user@example.com" --days "tuesday,thursday" --time "07:30" --from "2026-03-13" --to "2026-12-31"',
    );
    console.log("\nOptions:");
    console.log("  --email     User email (required)");
    console.log(
      "  --days      Comma-separated days: monday,tuesday,wednesday,thursday,friday,saturday,sunday (required)",
    );
    console.log('  --time      Start time HH:MM, e.g. "07:30" (required)');
    console.log("  --from      Start date YYYY-MM-DD (default: today)");
    console.log("  --to        End date YYYY-MM-DD (required)");
    console.log(
      "  --title     Filter by class title (optional, partial match)",
    );
    console.log("  --dry-run   Preview only, no changes made");
    process.exit(1);
  }
  if (!args.days) {
    console.error("❌ --days is required");
    process.exit(1);
  }
  if (!args.time) {
    console.error("❌ --time is required");
    process.exit(1);
  }
  if (!args.to) {
    console.error("❌ --to is required");
    process.exit(1);
  }

  const email = args.email.toLowerCase();
  const days = args.days
    .toLowerCase()
    .split(",")
    .map((d) => d.trim());
  const time = args.time.length === 5 ? args.time + ":00" : args.time; // Ensure HH:MM:SS
  const fromDate = args.from || new Date().toISOString().split("T")[0];
  const toDate = args.to;
  const titleFilter = args.title || null;
  const dryRun = args.dryRun || false;

  // Map day names to day-of-week numbers (0=Sunday, 1=Monday, ... 6=Saturday)
  const dayMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  const dayNumbers = days.map((d) => {
    if (dayMap[d] === undefined) {
      console.error(
        `❌ Invalid day: "${d}". Use: monday,tuesday,wednesday,thursday,friday,saturday,sunday`,
      );
      process.exit(1);
    }
    return dayMap[d];
  });

  console.log("\n📋 Bulk Enrollment Configuration:");
  console.log(`   User:       ${email}`);
  console.log(`   Days:       ${days.join(", ")}`);
  console.log(`   Time:       ${time}`);
  console.log(`   From:       ${fromDate}`);
  console.log(`   To:         ${toDate}`);
  if (titleFilter) console.log(`   Title:      ${titleFilter}`);
  if (dryRun) console.log(`   🔍 DRY RUN - no changes will be made`);
  console.log("");

  // Step 1: Find the user
  const users =
    await sql`SELECT id, name, email FROM users WHERE LOWER(email) = ${email}`;
  if (users.length === 0) {
    console.error(`❌ No user found with email: ${email}`);
    process.exit(1);
  }
  const user = users[0];
  console.log(`✅ Found user: ${user.name} (${user.email})`);

  // Step 2: Find matching classes
  let classes;
  if (titleFilter) {
    classes = await sql`
      SELECT id, title, date, start_time, end_time, current_participants, max_participants
      FROM classes
      WHERE date >= ${fromDate}::date
        AND date <= ${toDate}::date
        AND start_time = ${time}::time
        AND is_active = true
        AND LOWER(title) LIKE ${"%" + titleFilter.toLowerCase() + "%"}
      ORDER BY date ASC
    `;
  } else {
    classes = await sql`
      SELECT id, title, date, start_time, end_time, current_participants, max_participants
      FROM classes
      WHERE date >= ${fromDate}::date
        AND date <= ${toDate}::date
        AND start_time = ${time}::time
        AND is_active = true
      ORDER BY date ASC
    `;
  }

  // Filter by day of week
  const matchingClasses = classes.filter((c) => {
    const classDate = new Date(c.date);
    return dayNumbers.includes(classDate.getUTCDay());
  });

  console.log(`\n📅 Found ${matchingClasses.length} matching classes:\n`);

  if (matchingClasses.length === 0) {
    console.log("No classes match the criteria. Check your filters.");
    process.exit(0);
  }

  // Step 3: Check existing bookings for this user
  const existingBookings = await sql`
    SELECT class_id, status FROM bookings 
    WHERE user_id = ${user.id} AND status != 'cancelled'
  `;
  const existingClassIds = new Set(existingBookings.map((b) => b.class_id));

  // Step 4: Enroll in each matching class
  let enrolled = 0;
  let skipped = 0;
  let full = 0;

  for (const cls of matchingClasses) {
    const classDate = new Date(cls.date);
    const dayName = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][classDate.getUTCDay()];
    const dateStr = classDate.toISOString().split("T")[0];

    if (existingClassIds.has(cls.id)) {
      console.log(
        `  ⏭️  ${dayName} ${dateStr} ${cls.start_time} - ${cls.title} (already booked)`,
      );
      skipped++;
      continue;
    }

    const isFull = cls.current_participants >= cls.max_participants;
    if (isFull) {
      console.log(
        `  ⚠️  ${dayName} ${dateStr} ${cls.start_time} - ${cls.title} (FULL: ${cls.current_participants}/${cls.max_participants})`,
      );
      full++;
      continue;
    }

    if (dryRun) {
      console.log(
        `  📝 ${dayName} ${dateStr} ${cls.start_time} - ${cls.title} (${cls.current_participants}/${cls.max_participants}) [would enroll]`,
      );
      enrolled++;
      continue;
    }

    // Create the booking
    await sql`
      INSERT INTO bookings (user_id, class_id, status)
      VALUES (${user.id}, ${cls.id}, 'confirmed')
    `;

    // Update participant count
    await sql`
      UPDATE classes 
      SET current_participants = COALESCE(current_participants, 0) + 1
      WHERE id = ${cls.id}
    `;

    // Update user's booking count
    await sql`
      UPDATE users 
      SET weightlifting_classes_booked = COALESCE(weightlifting_classes_booked, 0) + 1
      WHERE id = ${user.id}
    `;

    console.log(
      `  ✅ ${dayName} ${dateStr} ${cls.start_time} - ${cls.title} (${cls.current_participants + 1}/${cls.max_participants})`,
    );
    enrolled++;
  }

  console.log("\n📊 Summary:");
  console.log(`   ${dryRun ? "Would enroll" : "Enrolled"}:  ${enrolled}`);
  console.log(`   Skipped (already booked): ${skipped}`);
  console.log(`   Skipped (class full):     ${full}`);
  console.log(`   Total classes checked:    ${matchingClasses.length}`);
  if (dryRun) {
    console.log(
      "\n🔍 This was a dry run. Run without --dry-run to make actual changes.",
    );
  } else {
    console.log("\n✅ Done!");
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
