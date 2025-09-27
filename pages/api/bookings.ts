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

  if (req.method === "POST") {
    try {
      const { user_id, class_id, user_package_id } = req.body;

      // Validate required fields
      if (!user_id || !class_id || !user_package_id) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: user_id, class_id, user_package_id",
        });
      }

      // Check if class exists and has capacity
      const classCheck = await sql`
        SELECT id, max_participants, current_participants, date, start_time 
        FROM classes 
        WHERE id = ${class_id} AND is_active = true
      `;

      if (classCheck.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Class not found or inactive",
        });
      }

      const classData = classCheck[0];

      // Check if class is full
      if (classData.current_participants >= classData.max_participants) {
        return res.status(400).json({
          success: false,
          error: "Class is full",
        });
      }

      // Check if class is in the past
      const classDateTime = new Date(
        `${classData.date}T${classData.start_time}`
      );
      if (classDateTime < new Date()) {
        return res.status(400).json({
          success: false,
          error: "Cannot book past classes",
        });
      }

      // Check if user has sessions remaining in their package
      const packageCheck = await sql`
        SELECT sessions_remaining, expiry_date, is_active
        FROM user_packages 
        WHERE id = ${user_package_id} AND user_id = ${user_id} AND is_active = true
      `;

      if (packageCheck.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Package not found or inactive",
        });
      }

      const userPackage = packageCheck[0];

      if (userPackage.sessions_remaining <= 0) {
        return res.status(400).json({
          success: false,
          error: "No sessions remaining in package",
        });
      }

      if (new Date(userPackage.expiry_date) < new Date()) {
        return res.status(400).json({
          success: false,
          error: "Package has expired",
        });
      }

      // Check if user is already booked for this class (for warning purposes)
      const existingBookings = await sql`
        SELECT id FROM bookings 
        WHERE user_id = ${user_id} AND class_id = ${class_id} AND status != 'cancelled'
      `;

      const isMultipleBooking = existingBookings.length > 0;

      // Create the booking and update package sessions
      const booking = await sql`
        INSERT INTO bookings (user_id, class_id, user_package_id, status)
        VALUES (${user_id}, ${class_id}, ${user_package_id}, 'confirmed')
        RETURNING *
      `;

      // Update package sessions remaining
      await sql`
        UPDATE user_packages 
        SET sessions_remaining = sessions_remaining - 1,
            updated_at = NOW()
        WHERE id = ${user_package_id}
      `;

      // Update user's booking count
      await sql`
        UPDATE users 
        SET 
          weightlifting_classes_booked = COALESCE(weightlifting_classes_booked, 0) + 1,
          updated_at = NOW()
        WHERE id = ${user_id}
      `;

      // The trigger will automatically update the class current_participants count

      const responseMessage = isMultipleBooking
        ? "Class booked successfully! Note: You are now booked multiple times for this class (for family/friends)."
        : "Class booked successfully!";

      res.status(201).json({
        success: true,
        data: booking[0],
        message: responseMessage,
        isMultipleBooking: isMultipleBooking,
        totalBookingsForClass: existingBookings.length + 1,
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create booking",
      });
    }
  } else if (req.method === "GET") {
    try {
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: "user_id is required",
        });
      }

      // First, check if user_id is an email and get the actual user ID
      let actualUserId = user_id;
      if (typeof user_id === "string" && user_id.includes("@")) {
        const userResult = await sql`
          SELECT id FROM users WHERE email = ${user_id}
        `;
        if (userResult.length === 0) {
          return res.status(404).json({
            success: false,
            error: "User not found",
          });
        }
        actualUserId = userResult[0].id;
      }

      const bookings = await sql`
        SELECT 
          b.*,
          c.title as class_title,
          c.date,
          c.start_time,
          c.end_time,
          c.location,
          c.class_type,
          c.instructor
        FROM bookings b
        JOIN classes c ON b.class_id = c.id
        WHERE b.user_id = ${actualUserId}
        ORDER BY c.date DESC, c.start_time DESC
      `;

      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch bookings",
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }
}
