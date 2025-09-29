const sql = require("./lib/database.ts").default;

(async () => {
  try {
    const classes = await sql`
      SELECT date, start_time, title, EXTRACT(DOW FROM date) as day_of_week
      FROM classes 
      WHERE is_active = true 
      AND date >= CURRENT_DATE 
      ORDER BY date, start_time
      LIMIT 20
    `;

    console.log("=== CURRENT SCHEDULED CLASSES ===");
    classes.forEach((c) => {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      console.log(
        `${c.date} (${dayNames[c.day_of_week]}) ${c.start_time} - ${c.title}`
      );
    });

    // Count by day of week
    const dayCount = {};
    classes.forEach((c) => {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayName = dayNames[c.day_of_week];
      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
    });

    console.log("\n=== CLASSES BY DAY OF WEEK ===");
    Object.entries(dayCount).forEach(([day, count]) => {
      console.log(`${day}: ${count} classes`);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
  process.exit(0);
})();
