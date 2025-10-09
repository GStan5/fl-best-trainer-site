import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import sql from "../../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Check if user is admin (customize this logic as needed)
    const isAdmin =
      session.user.email === "gavinstanifer@live.com" ||
      session.user.email === "gavinstaniferengineering@gmail.com";

    if (!isAdmin) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    if (req.method === "GET") {
      // Fetch all clients with booking counts
      const clients = await sql`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.first_name,
          u.last_name,
          u.phone,
          u.address,
          u.emergency_contact_name,
          u.emergency_contact_phone,
          u.waiver_signed,
          u.waiver_signed_date,
          u.onboarding_completed,
          u.created_at,
          u.weightlifting_classes_remaining,
          u.personal_training_sessions_remaining,
          COALESCE(booking_stats.total_bookings, 0) as total_bookings,
          COALESCE(booking_stats.confirmed_bookings, 0) as confirmed_bookings,
          COALESCE(booking_stats.cancelled_bookings, 0) as cancelled_bookings,
          COALESCE(booking_stats.waitlist_bookings, 0) as waitlist_bookings
        FROM users u
        LEFT JOIN (
          SELECT 
            user_id,
            COUNT(*) as total_bookings,
            COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
            COUNT(CASE WHEN status = 'waitlist' THEN 1 END) as waitlist_bookings
          FROM bookings 
          GROUP BY user_id
        ) booking_stats ON u.id = booking_stats.user_id
        ORDER BY u.created_at DESC
      `;

      return res.status(200).json({
        success: true,
        clients: clients,
      });
    }

    if (req.method === "POST") {
      // Add new client
      const {
        email,
        first_name,
        last_name,
        phone,
        address,
        emergency_contact_name,
        emergency_contact_phone,
      } = req.body;

      if (!email || !first_name || !last_name) {
        return res.status(400).json({
          success: false,
          error: "Email, first name, and last name are required",
        });
      }

      // Check if user already exists
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${email}
      `;

      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          error: "A client with this email already exists",
        });
      }

      // Create new client
      const newClient = await sql`
        INSERT INTO users (
          email,
          name,
          first_name,
          last_name,
          phone,
          address,
          emergency_contact_name,
          emergency_contact_phone,
          onboarding_completed,
          waiver_signed,
          created_at
        ) VALUES (
          ${email},
          ${first_name + " " + last_name},
          ${first_name},
          ${last_name},
          ${phone || null},
          ${address || null},
          ${emergency_contact_name || null},
          ${emergency_contact_phone || null},
          ${emergency_contact_name && emergency_contact_phone ? true : false},
          false,
          NOW()
        )
        RETURNING *
      `;

      return res.status(201).json({
        success: true,
        client: newClient[0],
      });
    }

    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  } catch (error) {
    console.error("❌ Error in clients API:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
