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
      const { month, year, completed } = req.query;

      let classes;

      // Determine if we're fetching completed or active classes
      const isCompleted = completed === "true";

      // If month and year are provided, filter by them
      if (month && year) {
        if (isCompleted) {
          classes = await sql`
            SELECT DISTINCT
              c.id,
              c.title,
              c.description,
              c.instructor,
              c.date,
              c.start_time,
              c.end_time,
              c.max_participants,
              c.current_participants,
              c.location,
              c.class_type,
              c.difficulty_level,
              c.equipment_needed,
              c.is_active,
              c.price_per_session,
              c.credits_required,
              c.cancellation_deadline_hours,
              c.duration_minutes,
              c.prerequisites,
              c.class_goals,
              c.intensity_level,
              c.waitlist_enabled,
              c.waitlist_capacity,
              c.auto_confirm_booking,
              c.recurring_pattern,
              c.class_series_id,
              c.registration_opens,
              c.registration_closes,
              c.safety_requirements,
              c.age_restrictions,
              c.modifications_available,
              c.created_at,
              c.updated_at,
              true as is_completed
            FROM classes c
            INNER JOIN bookings b ON b.class_id = c.id
            WHERE b.status = 'completed'
              AND EXTRACT(MONTH FROM c.date) = ${month}
              AND EXTRACT(YEAR FROM c.date) = ${year}
            ORDER BY c.date DESC, c.start_time DESC
          `;
        } else {
          classes = await sql`
            SELECT 
              id,
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
              is_active,
              price_per_session,
              credits_required,
              cancellation_deadline_hours,
              duration_minutes,
              prerequisites,
              class_goals,
              intensity_level,
              waitlist_enabled,
              waitlist_capacity,
              auto_confirm_booking,
              recurring_pattern,
              class_series_id,
              registration_opens,
              registration_closes,
              safety_requirements,
              age_restrictions,
              modifications_available,
              created_at,
              updated_at
            FROM classes 
            WHERE is_active = true
              AND EXTRACT(MONTH FROM date) = ${month}
              AND EXTRACT(YEAR FROM date) = ${year}
              AND id NOT IN (
                SELECT DISTINCT class_id 
                FROM bookings 
                WHERE status = 'completed'
              )
            ORDER BY date ASC, start_time ASC
          `;
        }
      } else {
        if (isCompleted) {
          classes = await sql`
            SELECT DISTINCT
              c.id,
              c.title,
              c.description,
              c.instructor,
              c.date,
              c.start_time,
              c.end_time,
              c.max_participants,
              c.current_participants,
              c.location,
              c.class_type,
              c.difficulty_level,
              c.equipment_needed,
              c.is_active,
              c.price_per_session,
              c.credits_required,
              c.cancellation_deadline_hours,
              c.duration_minutes,
              c.prerequisites,
              c.class_goals,
              c.intensity_level,
              c.waitlist_enabled,
              c.waitlist_capacity,
              c.auto_confirm_booking,
              c.recurring_pattern,
              c.class_series_id,
              c.registration_opens,
              c.registration_closes,
              c.safety_requirements,
              c.age_restrictions,
              c.modifications_available,
              c.created_at,
              c.updated_at,
              true as is_completed
            FROM classes c
            INNER JOIN bookings b ON b.class_id = c.id
            WHERE b.status = 'completed'
            ORDER BY c.date DESC, c.start_time DESC
          `;
        } else {
          classes = await sql`
            SELECT 
              id,
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
              is_active,
              price_per_session,
              credits_required,
              cancellation_deadline_hours,
              duration_minutes,
              prerequisites,
              class_goals,
              intensity_level,
              waitlist_enabled,
              waitlist_capacity,
              auto_confirm_booking,
              recurring_pattern,
              class_series_id,
              registration_opens,
              registration_closes,
              safety_requirements,
              age_restrictions,
              modifications_available,
              created_at,
              updated_at
            FROM classes 
            WHERE is_active = true
              AND id NOT IN (
                SELECT DISTINCT class_id 
                FROM bookings 
                WHERE status = 'completed'
              )
            ORDER BY date ASC, start_time ASC
          `;
        }
      }

      // Debug logging for October 15th issue
      console.log(`📊 API Classes: Returning ${classes.length} classes`);
      const oct15Classes = classes.filter(c => {
        const dateStr = typeof c.date === 'string' ? c.date.split('T')[0] : new Date(c.date).toISOString().split('T')[0];
        return dateStr === '2025-10-15';
      });
      console.log(`📊 API Classes: October 15th classes found: ${oct15Classes.length}`);
      if (oct15Classes.length > 0) {
        oct15Classes.forEach(c => {
          console.log(`📊 API Classes: Oct 15 - ${c.title} at ${c.start_time} (ID: ${c.id})`);
        });
      }

      res.status(200).json({
        success: true,
        data: classes,
      });
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch classes",
      });
    }
  } else if (req.method === "PUT") {
    try {
      const {
        id,
        title,
        description,
        instructor = "Gavin Stanifer",
        date,
        start_time,
        end_time,
        max_participants = 8,
        location,
        class_type,
        difficulty_level = "All Levels",
        equipment_needed,
        prerequisites,
        price_per_session,
        is_active = true,
      } = req.body;

      // Validate required fields
      if (
        !id ||
        !title ||
        !date ||
        !start_time ||
        !end_time ||
        !location ||
        !class_type
      ) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      const updatedClass = await sql`
        UPDATE classes SET
          title = ${title},
          description = ${description},
          instructor = ${instructor},
          date = ${date},
          start_time = ${start_time},
          end_time = ${end_time},
          max_participants = ${max_participants},
          location = ${location},
          class_type = ${class_type},
          difficulty_level = ${difficulty_level},
          equipment_needed = ${equipment_needed},
          prerequisites = ${prerequisites},
          price_per_session = ${price_per_session},
          is_active = ${is_active}
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
  } else if (req.method === "POST") {
    try {
      const {
        title,
        description,
        instructor = "Gavin Stanifer",
        date,
        start_time,
        end_time,
        max_participants = 8,
        location,
        class_type,
        difficulty_level = "All Levels",
        equipment_needed,
      } = req.body;

      // Validate required fields
      if (
        !title ||
        !date ||
        !start_time ||
        !end_time ||
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
          title, description, instructor, date, start_time, end_time,
          max_participants, location, class_type, difficulty_level, equipment_needed
        ) VALUES (
          ${title}, ${description}, ${instructor}, ${date}, ${start_time}, ${end_time},
          ${max_participants}, ${location}, ${class_type}, ${difficulty_level}, ${equipment_needed}
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
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }
}
