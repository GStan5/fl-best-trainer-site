import type { NextApiRequest, NextApiResponse } from "next";
import sql from "../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      // Update all class participant counts based on actual bookings
      const result = await sql`
        UPDATE classes 
        SET current_participants = (
          SELECT COUNT(*) 
          FROM bookings 
          WHERE bookings.class_id = classes.id 
          AND bookings.status = 'confirmed'
        )
      `;

      // Get updated counts to verify
      const updatedClasses = await sql`
        SELECT 
          id,
          title,
          current_participants,
          max_participants,
          (SELECT COUNT(*) FROM bookings WHERE class_id = classes.id AND status = 'confirmed') as actual_count
        FROM classes
        ORDER BY title
      `;

      res.status(200).json({
        success: true,
        message: "Participant counts updated successfully",
        data: updatedClasses,
      });
    } catch (error) {
      console.error("Error fixing participant counts:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fix participant counts",
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }
}
