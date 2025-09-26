import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    });

    // Reset all user data to clean state
    const resetQuery = `
      UPDATE users SET 
        first_name = NULL,
        last_name = NULL,
        phone = NULL,
        address = NULL,
        waiver_signed = FALSE,
        waiver_signed_date = NULL,
        waiver_ip_address = NULL,
        onboarding_completed = FALSE,
        emergency_contact_name = NULL,
        emergency_contact_phone = NULL
    `;

    const result = await pool.query(resetQuery);
    await pool.end();

    console.log(`✅ Reset ${result.rowCount} user records for testing`);

    res.status(200).json({
      success: true,
      message: `Successfully reset ${result.rowCount} user records`,
      usersReset: result.rowCount,
    });
  } catch (error) {
    console.error("❌ Error resetting user data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset user data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
