import type { NextApiRequest, NextApiResponse } from "next";
import sql from "../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check if database connection is available
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      success: false,
      error:
        "Database connection not configured. Please set DATABASE_URL in .env.local",
    });
  }

  if (req.method === "GET") {
    try {
      const packages = await sql`
        SELECT 
          id,
          name,
          description,
          sessions_included,
          price,
          duration_days,
          is_active
        FROM packages 
        WHERE is_active = true
        ORDER BY price ASC
      `;

      res.status(200).json({
        success: true,
        data: packages,
      });
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch packages",
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }
}
