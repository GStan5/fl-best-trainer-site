import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

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

    // Read the migration file
    const migrationPath = path.join(
      process.cwd(),
      "database",
      "add-waiver-pdf-column.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    // Execute the migration
    await pool.query(migrationSQL);
    await pool.end();

    console.log("✅ Waiver PDF column migration completed successfully");

    res.status(200).json({
      success: true,
      message: "Waiver PDF column migration completed successfully",
    });
  } catch (error) {
    console.error("❌ Migration error:", error);
    res.status(500).json({
      success: false,
      error: "Migration failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
