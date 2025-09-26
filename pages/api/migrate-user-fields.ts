import type { NextApiRequest, NextApiResponse } from "next";
import sql from "../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    console.log("🔄 Running user fields migration...");

    // Add new columns to users table
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS waiver_signed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS waiver_signed_date TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS waiver_ip_address INET,
      ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20)
    `;

    // Update existing users to split name into first_name and last_name
    await sql`
      UPDATE users 
      SET 
          first_name = CASE 
              WHEN first_name IS NULL AND name IS NOT NULL THEN 
                  SPLIT_PART(name, ' ', 1)
              ELSE first_name 
          END,
          last_name = CASE 
              WHEN last_name IS NULL AND name IS NOT NULL AND POSITION(' ' IN name) > 0 THEN 
                  SUBSTRING(name FROM POSITION(' ' IN name) + 1)
              ELSE last_name 
          END
      WHERE first_name IS NULL OR last_name IS NULL
    `;

    // Check the updated schema
    const result = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;

    console.log("✅ Migration completed successfully!");
    console.log("📋 Updated users table schema:");
    result.forEach((col: any) =>
      console.log(`  - ${col.column_name}: ${col.data_type}`)
    );

    res.status(200).json({
      success: true,
      message: "Migration completed successfully",
      schema: result,
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    res.status(500).json({
      success: false,
      error: "Migration failed",
      details: error,
    });
  }
}
