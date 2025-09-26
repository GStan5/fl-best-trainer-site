import type { NextApiRequest, NextApiResponse } from "next";
import sql from "../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      // Get class info with current counts
      const classes = await sql`
        SELECT 
          c.id,
          c.title,
          c.current_participants,
          c.max_participants,
          COUNT(b.id) as actual_booking_count
        FROM classes c
        LEFT JOIN bookings b ON c.id = b.class_id AND b.status = 'confirmed'
        GROUP BY c.id, c.title, c.current_participants, c.max_participants
        ORDER BY c.title
      `;

      // Get detailed booking info
      const bookings = await sql`
        SELECT 
          b.id,
          b.class_id,
          b.status,
          u.name as user_name,
          c.title as class_title
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN classes c ON b.class_id = c.id
        ORDER BY c.title, u.name
      `;

      res.status(200).json({
        success: true,
        data: {
          classes,
          bookings,
        },
      });
    } catch (error) {
      console.error("Error debugging database:", error);
      res.status(500).json({
        success: false,
        error: "Failed to query database",
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
