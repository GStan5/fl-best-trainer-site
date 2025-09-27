const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log(
      "🔄 Running migration to remove unique constraint on bookings..."
    );

    // Check if the constraint exists
    const constraintCheck = await client.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'bookings' 
      AND constraint_type = 'UNIQUE' 
      AND constraint_name LIKE '%user_id%class_id%'
    `);

    if (constraintCheck.rowCount > 0) {
      console.log(
        `Found unique constraint: ${constraintCheck.rows[0].constraint_name}`
      );

      // Drop the constraint
      await client.query(`
        ALTER TABLE bookings DROP CONSTRAINT ${constraintCheck.rows[0].constraint_name}
      `);

      console.log("✅ Successfully removed unique constraint");
    } else {
      console.log(
        "ℹ️  No unique constraint found (may have been removed already)"
      );
    }

    // Verify the constraint is gone
    const verifyCheck = await client.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'bookings' 
      AND constraint_type = 'UNIQUE' 
      AND constraint_name LIKE '%user_id%class_id%'
    `);

    if (verifyCheck.rowCount === 0) {
      console.log(
        "✅ Verification complete: Users can now book the same class multiple times"
      );
    } else {
      console.log("⚠️  Warning: Constraint may still exist");
    }

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Error running migration:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
