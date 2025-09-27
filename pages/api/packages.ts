import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
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
  } else if (req.method === "PUT") {
    // Admin authentication check
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - Please sign in",
      });
    }

    // Check if user is admin in database
    const adminCheck = await sql`
      SELECT is_admin FROM users 
      WHERE email = ${session.user.email}
    `;

    if (adminCheck.length === 0 || !adminCheck[0].is_admin) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - Admin access required",
      });
    }

    try {
      const { id, name, description, sessions_included, price, duration_days } =
        req.body;

      if (!id || !name || !price || !sessions_included) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: id, name, price, sessions_included",
        });
      }

      const result = await sql`
        UPDATE packages 
        SET 
          name = ${name},
          description = ${description || ""},
          sessions_included = ${sessions_included},
          price = ${price},
          duration_days = ${duration_days || 30},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Package not found",
        });
      }

      res.status(200).json({
        success: true,
        data: result[0],
        message: "Package updated successfully",
      });
    } catch (error) {
      console.error("Error updating package:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update package",
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT"]);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }
}
