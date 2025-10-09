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
      // Get all users (for admin purposes)
      const users = await sql`
        SELECT id, name, email, created_at 
        FROM users 
        ORDER BY name ASC
      `;

      res.status(200).json({
        success: true,
        users: users,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch users",
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
