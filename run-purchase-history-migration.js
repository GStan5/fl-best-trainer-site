const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function runPurchaseHistoryMigration() {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting purchase history migration...");

    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, "database", "add-purchase-history-table.sql"),
      "utf8"
    );

    // Execute the migration
    await client.query("BEGIN");
    await client.query(migrationSQL);
    await client.query("COMMIT");

    console.log("✅ Purchase history migration completed successfully!");

    // Verify the new table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'purchases'
    `);

    if (tableCheck.rows.length > 0) {
      console.log("✅ Purchases table created successfully");

      // Check if sample data was inserted
      const sampleDataCheck = await client.query(
        "SELECT COUNT(*) FROM purchases"
      );
      console.log(
        `📊 Sample purchases in database: ${sampleDataCheck.rows[0].count}`
      );
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
if (require.main === module) {
  runPurchaseHistoryMigration()
    .then(() => {
      console.log("🎉 Migration completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Migration failed:", error);
      process.exit(1);
    });
}

module.exports = { runPurchaseHistoryMigration };
