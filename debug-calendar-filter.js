const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function debugCalendarFilter() {
  try {
    // Get all classes and their dates
    const result = await pool.query(`
      SELECT date, title, start_time 
      FROM classes 
      WHERE is_active = true
      ORDER BY date, start_time
    `);

    console.log("All active classes:");
    result.rows.forEach((row) => {
      const jsDate = new Date(row.date);
      const estDate = new Date(
        jsDate.getFullYear(),
        jsDate.getMonth(),
        jsDate.getDate()
      );

      console.log(`- ${row.title} on ${row.date}`);
      console.log(`  JS Date: ${jsDate} (Month: ${jsDate.getMonth()})`);
      console.log(`  EST Date: ${estDate} (Month: ${estDate.getMonth()})`);
      console.log("");
    });

    // Check current month (September = 8)
    const currentMonth = 8;
    const currentYear = 2025;

    console.log(
      `Filtering for month ${currentMonth} (${new Date(
        currentYear,
        currentMonth
      ).toLocaleString("default", { month: "long" })}) and year ${currentYear}`
    );

    const filtered = result.rows.filter((row) => {
      const [year, month, day] = row.date.split("-").map(Number);
      const estDate = new Date(year, month - 1, day);

      const matches =
        estDate.getMonth() === currentMonth &&
        estDate.getFullYear() === currentYear;
      console.log(
        `${row.date}: EST month ${estDate.getMonth()}, matches: ${matches}`
      );
      return matches;
    });

    console.log(`Found ${filtered.length} classes for current month`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}

debugCalendarFilter();
