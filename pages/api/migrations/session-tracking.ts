import { NextApiRequest, NextApiResponse } from "next";
import sql from "../../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Starting session tracking migration...");

    // Add weightlifting_classes_booked field
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS weightlifting_classes_booked INTEGER DEFAULT 0
    `;

    // Update existing users to have 0 booked sessions
    await sql`
      UPDATE users 
      SET weightlifting_classes_booked = 0 
      WHERE weightlifting_classes_booked IS NULL
    `;

    // Add completed_at field to bookings
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL
    `;

    // Add classes_attended field to track completed classes
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS classes_attended INTEGER DEFAULT 0
    `;

    // Update existing users to have 0 attended classes
    await sql`
      UPDATE users 
      SET classes_attended = 0 
      WHERE classes_attended IS NULL
    `;

    console.log("✅ Session tracking migration completed successfully!");

    // Show updated schema
    const userSchema = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name LIKE '%classes%'
      ORDER BY column_name
    `;

    res.status(200).json({
      success: true,
      message: "Session tracking migration completed successfully!",
      userColumns: userSchema,
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Migration failed",
    });
  }
}
