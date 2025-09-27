import { NextApiRequest, NextApiResponse } from "next";
import { neon } from "@neondatabase/serverless";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_7kO5WntJRTDb@ep-raspy-sound-ad0ejzrd-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

// Function to generate dates for recurring classes
function generateRecurringDates(
  startDate: string,
  endDate: string | null,
  recurringDays: string[]
): string[] {
  console.log("🔍 generateRecurringDates called with:", {
    startDate,
    endDate,
    recurringDays,
  });

  const dates: string[] = [];
  // Parse the date string manually to avoid timezone issues - use EST
  const [year, month, day] = startDate.split("-").map(Number);
  const start = new Date(year, month - 1, day, 12, 0, 0); // noon EST to avoid timezone issues

  console.log("📍 Parsed start date:", start);

  const end = endDate
    ? (() => {
        const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
        return new Date(endYear, endMonth - 1, endDay, 12, 0, 0); // noon EST
      })()
    : new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year if no end date

  console.log("📍 End date:", end);

  const dayMap: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  // Convert recurring days to numbers
  const targetDays = recurringDays.map((day) => dayMap[day.toLowerCase()]);
  console.log("🎯 Target days:", targetDays);

  const current = new Date(start);

  // Generate dates for up to 2 years or until end date
  let iterations = 0;
  while (current <= end && dates.length < 104 && iterations < 1000) {
    // 104 = 2 years of weekly classes
    iterations++;

    if (targetDays.includes(current.getDay())) {
      // Format date as YYYY-MM-DD to ensure consistency
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      dates.push(formattedDate);
      console.log(`✅ Added date: ${formattedDate} (day ${current.getDay()})`);
    }
    // Move to next day at noon EST to avoid timezone issues
    current.setDate(current.getDate() + 1);
    current.setHours(12, 0, 0, 0); // Reset to noon to maintain consistency
  }

  console.log(
    `🏁 Generated ${dates.length} dates after ${iterations} iterations`
  );
  return dates;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // Get all recurring class templates
    try {
      const templates = await sql`
        SELECT * FROM recurring_class_templates 
        ORDER BY created_at DESC
      `;

      return res.status(200).json({
        success: true,
        data: templates,
      });
    } catch (error) {
      console.error("Error fetching recurring templates:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch recurring class templates",
      });
    }
  } else if (req.method === "PUT") {
    // Update existing recurring class template
    try {
      const { id, updateFutureClasses = false, ...classData } = req.body;

      console.log("🔧 PUT request received for template:", id);
      console.log("📝 Update data:", JSON.stringify(classData, null, 2));

      if (!id) {
        return res.status(400).json({ error: "Template ID is required" });
      }

      // Build daily_schedule from individual day times if provided
      const daily_schedule = classData.daily_schedule || {};

      console.log(
        "📅 Daily schedule being saved:",
        JSON.stringify(daily_schedule, null, 2)
      );

      const updatedTemplate = await sql`
        UPDATE recurring_class_templates 
        SET 
          title = ${classData.title},
          description = ${classData.description},
          instructor = ${classData.instructor},
          class_type = ${classData.class_type},
          difficulty_level = ${classData.difficulty_level},
          location = ${classData.location},
          duration_minutes = ${classData.duration_minutes},
          max_participants = ${classData.max_participants},
          price_per_session = ${classData.price_per_session},
          credits_required = ${classData.credits_required},
          equipment_needed = ${classData.equipment_needed},
          prerequisites = ${classData.prerequisites},
          class_goals = ${classData.class_goals},
          intensity_level = ${classData.intensity_level},
          waitlist_enabled = ${classData.waitlist_enabled},
          waitlist_capacity = ${classData.waitlist_capacity},
          auto_confirm_booking = ${classData.auto_confirm_booking},
          cancellation_deadline_hours = ${
            classData.cancellation_deadline_hours
          },
          safety_requirements = ${classData.safety_requirements},
          age_restrictions = ${classData.age_restrictions},
          modifications_available = ${classData.modifications_available},
          recurring_days = ${classData.recurring_days},
          daily_schedule = ${JSON.stringify(daily_schedule)},
          start_time = ${classData.start_time},
          end_time = ${classData.end_time},
          start_date = ${classData.start_date},
          end_date = ${classData.end_date},
          is_active = ${classData.is_active},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;

      if (updatedTemplate.length === 0) {
        console.log("❌ Template not found for ID:", id);
        return res.status(404).json({ error: "Recurring template not found" });
      }

      console.log("✅ Template updated successfully:", updatedTemplate[0].id);
      console.log(
        "📝 Updated template data:",
        JSON.stringify(updatedTemplate[0], null, 2)
      );

      // If requested, update all future individual class instances
      if (updateFutureClasses) {
        console.log("🔄 Updating future class instances with new times...");

        // Get all future class instances for this template
        const futureClasses = await sql`
          SELECT id, date, EXTRACT(dow FROM date) as day_of_week
          FROM classes 
          WHERE parent_recurring_id = ${id} 
          AND date >= CURRENT_DATE
        `;

        console.log(
          `📅 Found ${futureClasses.length} future class instances to update`
        );

        // Day of week mapping (PostgreSQL uses 0=Sunday, 1=Monday, etc.)
        const dayMapping: { [key: number]: string } = {
          0: "sunday",
          1: "monday",
          2: "tuesday",
          3: "wednesday",
          4: "thursday",
          5: "friday",
          6: "saturday",
        };

        // Update each class instance with the correct time for its day
        for (const classInstance of futureClasses) {
          const dayName = dayMapping[classInstance.day_of_week];
          const daySchedule = daily_schedule[dayName];

          if (daySchedule) {
            console.log(
              `⏰ Updating class ${classInstance.id} (${dayName}) to ${daySchedule.start_time}-${daySchedule.end_time}`
            );

            await sql`
              UPDATE classes 
              SET 
                title = ${classData.title},
                description = ${classData.description},
                instructor = ${classData.instructor},
                class_type = ${classData.class_type},
                difficulty_level = ${classData.difficulty_level},
                location = ${classData.location},
                duration_minutes = ${classData.duration_minutes},
                max_participants = ${classData.max_participants},
                price_per_session = ${classData.price_per_session},
                credits_required = ${classData.credits_required},
                equipment_needed = ${classData.equipment_needed},
                prerequisites = ${classData.prerequisites},
                class_goals = ${classData.class_goals},
                intensity_level = ${classData.intensity_level},
                waitlist_enabled = ${classData.waitlist_enabled},
                waitlist_capacity = ${classData.waitlist_capacity},
                auto_confirm_booking = ${classData.auto_confirm_booking},
                cancellation_deadline_hours = ${classData.cancellation_deadline_hours},
                safety_requirements = ${classData.safety_requirements},
                age_restrictions = ${classData.age_restrictions},
                modifications_available = ${classData.modifications_available},
                recurring_days = ${classData.recurring_days},
                start_time = ${daySchedule.start_time},
                end_time = ${daySchedule.end_time},
                is_active = ${classData.is_active}
              WHERE id = ${classInstance.id}
            `;
          } else {
            console.log(
              `⚠️ No schedule found for ${dayName}, skipping class ${classInstance.id}`
            );
          }
        }

        console.log("✅ All future class instances updated with new times");
      }

      return res.status(200).json({
        success: true,
        message: "Recurring class template updated successfully",
        data: updatedTemplate[0],
      });
    } catch (error) {
      console.error("Error updating recurring template:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update recurring class template",
      });
    }
  } else if (req.method === "DELETE") {
    // Delete recurring class template and optionally future classes
    try {
      const { id, deleteFutureClasses = false } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Template ID is required" });
      }

      // First, get the template to confirm it exists
      const template = await sql`
        SELECT * FROM recurring_class_templates WHERE id = ${id}
      `;

      if (template.length === 0) {
        return res.status(404).json({ error: "Recurring template not found" });
      }

      // If requested, delete all future individual classes
      if (deleteFutureClasses) {
        // First, get all users who have bookings for these classes to update their counts
        const usersWithBookings = await sql`
          SELECT user_id, COUNT(*) as booking_count
          FROM bookings 
          WHERE class_id IN (
            SELECT id FROM classes 
            WHERE parent_recurring_id = ${id} 
            AND date >= CURRENT_DATE
          )
          AND status != 'cancelled'
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

        // Then delete bookings for these classes
        await sql`
          DELETE FROM bookings 
          WHERE class_id IN (
            SELECT id FROM classes 
            WHERE parent_recurring_id = ${id} 
            AND date >= CURRENT_DATE
          )
        `;

        // Finally delete the classes
        await sql`
          DELETE FROM classes 
          WHERE parent_recurring_id = ${id} 
          AND date >= CURRENT_DATE
        `;

        console.log(
          `Updated ${usersWithBookings.length} user booking counts for recurring class deletion`
        );
      } // Delete the template
      await sql`
        DELETE FROM recurring_class_templates WHERE id = ${id}
      `;

      return res.status(200).json({
        success: true,
        message: "Recurring class template deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting recurring template:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete recurring class template",
      });
    }
  } else if (req.method === "POST") {
    try {
      const classData = req.body;

      // Debug logging
      console.log("📝 Received recurring class data:", {
        is_recurring: classData.is_recurring,
        recurring_start_date: classData.recurring_start_date,
        recurring_days: classData.recurring_days,
        recurring_end_date: classData.recurring_end_date,
      });

      if (!classData.is_recurring) {
        return res
          .status(400)
          .json({ error: "This endpoint is for recurring classes only" });
      }

      // Validation
      if (
        !classData.recurring_start_date ||
        !classData.recurring_days ||
        classData.recurring_days.length === 0
      ) {
        return res
          .status(400)
          .json({ error: "Recurring start date and days are required" });
      }

      // Generate dates for the recurring pattern
      console.log("🗓️ Generating dates with:", {
        startDate: classData.recurring_start_date,
        endDate: classData.recurring_end_date,
        days: classData.recurring_days,
      });

      const recurringDates = generateRecurringDates(
        classData.recurring_start_date,
        classData.recurring_end_date,
        classData.recurring_days
      );

      console.log("📅 Generated dates:", recurringDates);

      if (recurringDates.length === 0) {
        return res.status(400).json({
          error: "No valid dates generated for the recurring pattern",
        });
      }

      // First, create the recurring template record
      const templateResult = await sql`
      INSERT INTO recurring_class_templates (
        title, description, instructor, class_type, difficulty_level, location,
        duration_minutes, max_participants, price_per_session, credits_required,
        equipment_needed, prerequisites, class_goals, intensity_level,
        waitlist_enabled, waitlist_capacity, auto_confirm_booking,
        cancellation_deadline_hours, safety_requirements, age_restrictions,
        modifications_available, recurring_days, start_time, end_time,
        start_date, end_date
      ) VALUES (
        ${classData.title}, ${classData.description}, ${classData.instructor},
        ${classData.class_type}, ${classData.difficulty_level}, ${
        classData.location
      },
        ${classData.duration_minutes}, ${classData.max_participants}, 
        ${classData.price_per_session}, ${classData.credits_required},
        ${classData.equipment_needed}, ${classData.prerequisites}, 
        ${classData.class_goals}, ${classData.intensity_level},
        ${classData.waitlist_enabled}, ${classData.waitlist_capacity}, 
        ${classData.auto_confirm_booking}, ${
        classData.cancellation_deadline_hours
      },
        ${classData.safety_requirements}, ${classData.age_restrictions},
        ${classData.modifications_available}, ${classData.recurring_days},
        ${classData.start_time}, ${classData.end_time},
        ${classData.recurring_start_date}, ${
        classData.recurring_end_date || null
      }
      ) RETURNING id
    `;

      const templateId = templateResult[0].id;

      // Create individual class instances for each date
      const classInstances = [];
      console.log(
        `🏗️ Creating individual class instances for ${recurringDates.length} dates`
      );

      for (const date of recurringDates) {
        // Parse the date string manually to avoid timezone issues - use EST
        const [year, month, day] = date.split("-").map(Number);
        const dateObj = new Date(year, month - 1, day, 12, 0, 0); // noon EST to avoid timezone issues
        const dayOfWeek = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ][dateObj.getDay()];

        console.log(
          `📅 Processing date ${date}, dayOfWeek: "${dayOfWeek}", recurring_days: ${JSON.stringify(
            classData.recurring_days
          )}`
        );

        // Get the specific times for this day, or fall back to default times
        const daySchedule = classData.daily_schedule?.[dayOfWeek] || {
          start_time: classData.start_time,
          end_time: classData.end_time,
        };

        // Only create class if this day is selected
        const shouldInclude = classData.recurring_days.includes(dayOfWeek);
        console.log(`🔍 Should include "${dayOfWeek}"? ${shouldInclude}`);

        if (shouldInclude) {
          const result = await sql`
          INSERT INTO classes (
            title, description, instructor, date, start_time, end_time,
            max_participants, location, class_type, difficulty_level,
            equipment_needed, price_per_session, credits_required,
            duration_minutes, prerequisites, class_goals, intensity_level,
            waitlist_enabled, waitlist_capacity, auto_confirm_booking,
            cancellation_deadline_hours, safety_requirements, age_restrictions,
            modifications_available, is_active, is_recurring, recurring_days,
            recurring_start_date, recurring_end_date, parent_recurring_id
          ) VALUES (
            ${classData.title}, ${classData.description}, ${
            classData.instructor
          },
            ${date}, ${daySchedule.start_time}, ${daySchedule.end_time},
            ${classData.max_participants}, ${classData.location}, 
            ${classData.class_type}, ${classData.difficulty_level},
            ${classData.equipment_needed}, ${classData.price_per_session}, 
            ${classData.credits_required}, ${classData.duration_minutes},
            ${classData.prerequisites}, ${classData.class_goals}, 
            ${classData.intensity_level}, ${classData.waitlist_enabled}, 
            ${classData.waitlist_capacity}, ${classData.auto_confirm_booking},
            ${classData.cancellation_deadline_hours}, ${
            classData.safety_requirements
          },
            ${classData.age_restrictions}, ${classData.modifications_available},
            true, true, ${classData.recurring_days}, ${
            classData.recurring_start_date
          },
            ${classData.recurring_end_date || null}, ${templateId}
          ) RETURNING *
        `;
          classInstances.push(result[0]);
        }
      }

      res.status(201).json({
        message: `Successfully created ${classInstances.length} recurring class instances`,
        templateId,
        classCount: classInstances.length,
        classes: classInstances,
        generatedDates: recurringDates,
      });
    } catch (error) {
      console.error("Error creating recurring classes:", error);
      res.status(500).json({
        error: "Failed to create recurring classes",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
