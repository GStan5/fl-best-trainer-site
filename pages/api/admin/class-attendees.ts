import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import sql from "../../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get user session (admin only)
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if user is admin
    const adminCheck = await sql`
      SELECT is_admin FROM users WHERE email = ${session.user.email} LIMIT 1
    `;

    if (adminCheck.length === 0 || !adminCheck[0].is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { class_id } = req.query;

    if (!class_id) {
      return res.status(400).json({ error: "class_id is required" });
    }

    // Get class details and all bookings
    const classData = await sql`
      SELECT 
        c.id,
        c.title,
        c.date,
        c.start_time,
        c.end_time,
        c.current_participants,
        c.max_participants
      FROM classes c
      WHERE c.id = ${class_id}
    `;

    if (classData.length === 0) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Get all bookings for this class
    const bookings = await sql`
      SELECT 
        b.id as booking_id,
        b.status,
        b.completed_at,
        b.created_at as booking_date,
        u.id as user_id,
        u.name,
        u.email,
        u.weightlifting_classes_remaining,
        u.weightlifting_classes_booked,
        u.classes_attended,
        COUNT(*) OVER (PARTITION BY u.id) as user_booking_count
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.class_id = ${class_id} 
      AND b.status != 'cancelled'
      ORDER BY b.created_at ASC
    `;

    res.status(200).json({
      success: true,
      class: classData[0],
      attendees: bookings,
      total_attendees: bookings.length,
    });
  } catch (error) {
    console.error("Error fetching class attendees:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
