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
      // Get all clients (users who are not admins)
      const clients = await sql`
        SELECT 
          id,
          name,
          email,
          created_at
        FROM users 
        WHERE is_admin = false
        ORDER BY name ASC
      `;

      res.status(200).json({
        success: true,
        data: clients,
      });
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch clients",
      });
    }
  } else if (req.method === "POST") {
    try {
      const { name, email } = req.body;

      // Validate required fields
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          error: "Name and email are required",
        });
      }

      const newClient = await sql`
        INSERT INTO users (name, email, is_admin)
        VALUES (${name}, ${email}, false)
        RETURNING id, name, email, created_at
      `;

      res.status(201).json({
        success: true,
        data: newClient[0],
      });
    } catch (error: any) {
      console.error("Error creating client:", error);
      if (error.code === "23505") {
        // Unique constraint violation
        res.status(409).json({
          success: false,
          error: "A client with this email already exists",
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Failed to create client",
        });
      }
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }
}
