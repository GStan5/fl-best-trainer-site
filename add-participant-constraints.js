require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function addParticipantConstraints() {
  try {
    console.log(
      "🔧 Adding database constraints to prevent negative participants..."
    );

    // Add check constraint to ensure current_participants is never negative
    await sql`
      ALTER TABLE classes 
      ADD CONSTRAINT check_current_participants_non_negative 
      CHECK (current_participants >= 0)
    `;

    console.log("✅ Added constraint: current_participants >= 0");

    // Add check constraint to ensure current_participants doesn't exceed max_participants
    await sql`
      ALTER TABLE classes 
      ADD CONSTRAINT check_current_participants_not_exceed_max 
      CHECK (current_participants <= max_participants)
    `;

    console.log(
      "✅ Added constraint: current_participants <= max_participants"
    );

    console.log("\n🎉 Database constraints added successfully!");
    console.log("   - Classes can't have negative participants");
    console.log("   - Classes can't exceed maximum capacity");

    process.exit(0);
  } catch (error) {
    if (error.message.includes("already exists")) {
      console.log("ℹ️ Constraints already exist - that's good!");
      process.exit(0);
    } else {
      console.error("❌ Error adding constraints:", error);
      process.exit(1);
    }
  }
}

addParticipantConstraints();
