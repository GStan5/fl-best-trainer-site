import type { NextApiRequest, NextApiResponse } from "next";
import sql from "../../../lib/database";

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
    // Create new class
    try {
      const {
        title,
        description,
        instructor,
        date,
        start_time,
        end_time,
        max_participants,
        location,
        class_type,
        difficulty_level,
        equipment_needed,
        price_per_session,
        credits_required,
        duration_minutes,
        prerequisites,
        class_goals,
        intensity_level,
        waitlist_enabled,
        waitlist_capacity,
        auto_confirm_booking,
        cancellation_deadline_hours,
        safety_requirements,
        age_restrictions,
        modifications_available,
        is_active,
      } = req.body;

      // Validate required fields
      if (
        !title ||
        !instructor ||
        !date ||
        !start_time ||
        !end_time ||
        !max_participants ||
        !location ||
        !class_type
      ) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      const newClass = await sql`
        INSERT INTO classes (
          title,
          description,
          instructor,
          date,
          start_time,
          end_time,
          max_participants,
          current_participants,
          location,
          class_type,
          difficulty_level,
          equipment_needed,
          price_per_session,
          credits_required,
          duration_minutes,
          prerequisites,
          class_goals,
          intensity_level,
          waitlist_enabled,
          waitlist_capacity,
          auto_confirm_booking,
          cancellation_deadline_hours,
          safety_requirements,
          age_restrictions,
          modifications_available,
          is_active
        ) VALUES (
          ${title},
          ${description || ""},
          ${instructor},
          ${date},
          ${start_time},
          ${end_time},
          ${max_participants},
          0,
          ${location},
          ${class_type},
          ${difficulty_level || "Intermediate"},
          ${equipment_needed || ""},
          ${price_per_session || 0},
          ${credits_required || 1},
          ${duration_minutes || 60},
          ${prerequisites || ""},
          ${class_goals || ""},
          ${intensity_level || 5},
          ${waitlist_enabled || false},
          ${waitlist_capacity || 0},
          ${auto_confirm_booking || true},
          ${cancellation_deadline_hours || 24},
          ${safety_requirements || ""},
          ${age_restrictions || ""},
          ${modifications_available || ""},
          ${is_active !== false}
        )
        RETURNING *
      `;

      res.status(201).json({
        success: true,
        data: newClass[0],
      });
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create class",
      });
    }
  } else if (req.method === "PUT") {
    // Update existing class
    try {
      const { id } = req.query;
      const {
        title,
        description,
        instructor,
        date,
        start_time,
        end_time,
        max_participants,
        location,
        class_type,
        difficulty_level,
        equipment_needed,
        price_per_session,
        credits_required,
        duration_minutes,
        prerequisites,
        class_goals,
        intensity_level,
        waitlist_enabled,
        waitlist_capacity,
        auto_confirm_booking,
        cancellation_deadline_hours,
        safety_requirements,
        age_restrictions,
        modifications_available,
        is_active,
      } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Class ID is required",
        });
      }

      const updatedClass = await sql`
        UPDATE classes SET
          title = ${title},
          description = ${description || ""},
          instructor = ${instructor},
          date = ${date},
          start_time = ${start_time},
          end_time = ${end_time},
          max_participants = ${max_participants},
          location = ${location},
          class_type = ${class_type},
          difficulty_level = ${difficulty_level || "Intermediate"},
          equipment_needed = ${equipment_needed || ""},
          price_per_session = ${price_per_session || 0},
          credits_required = ${credits_required || 1},
          duration_minutes = ${duration_minutes || 60},
          prerequisites = ${prerequisites || ""},
          class_goals = ${class_goals || ""},
          intensity_level = ${intensity_level || 5},
          waitlist_enabled = ${waitlist_enabled || false},
          waitlist_capacity = ${waitlist_capacity || 0},
          auto_confirm_booking = ${auto_confirm_booking || true},
          cancellation_deadline_hours = ${cancellation_deadline_hours || 24},
          safety_requirements = ${safety_requirements || ""},
          age_restrictions = ${age_restrictions || ""},
          modifications_available = ${modifications_available || ""},
          is_active = ${is_active !== false},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (updatedClass.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Class not found",
        });
      }

      res.status(200).json({
        success: true,
        data: updatedClass[0],
      });
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update class",
      });
    }
  } else if (req.method === "DELETE") {
    // Delete/Cancel class
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Class ID is required",
        });
      }

      // First, get all users who have bookings for this class to update their counts
      const usersWithBookings = await sql`
        SELECT user_id, COUNT(*) as booking_count
        FROM bookings 
        WHERE class_id = ${id} AND status != 'cancelled'
        GROUP BY user_id
      `;

      // Update each user's booking count before deleting bookings
      for (const userBooking of usersWithBookings) {
        await sql`
          UPDATE users 
          SET weightlifting_classes_booked = GREATEST(weightlifting_classes_booked - ${userBooking.booking_count}, 0),
              updated_at = NOW()
          WHERE id = ${userBooking.user_id}
        `;
      }

      // Then delete all bookings for this class
      const deletedBookings = await sql`
        DELETE FROM bookings 
        WHERE class_id = ${id}
        RETURNING user_id
      `;

      console.log(
        `Deleted ${deletedBookings.length} bookings and updated ${usersWithBookings.length} user counts`
      );

      // Then mark the class as inactive
      const cancelledClass = await sql`
        UPDATE classes SET
          is_active = false,
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (cancelledClass.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Class not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Class cancelled successfully",
        data: cancelledClass[0],
      });
    } catch (error) {
      console.error("Error cancelling class:", error);
      res.status(500).json({
        success: false,
        error: "Failed to cancel class",
      });
    }
  } else {
    res.setHeader("Allow", ["POST", "PUT", "DELETE"]);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }
}
