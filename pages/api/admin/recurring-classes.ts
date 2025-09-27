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
    // Handle special day change action
    if (req.body.action === "change_day") {
      try {
        const { id, oldDay, newDay, newStartTime, newEndTime } = req.body;

        console.log(
          `🔄 Day change request: ${oldDay} → ${newDay} with times ${newStartTime}-${newEndTime}`
        );

        if (!id || !oldDay || !newDay) {
          return res
            .status(400)
            .json({ error: "Missing required parameters for day change" });
        }

        // Get current template data
        const currentTemplate = await sql`
          SELECT * FROM recurring_class_templates WHERE id = ${id}
        `;

        if (currentTemplate.length === 0) {
          return res.status(404).json({ error: "Template not found" });
        }

        const template = currentTemplate[0];
        const recurringDays = template.recurring_days || [];
        const dailySchedule =
          typeof template.daily_schedule === "string"
            ? JSON.parse(template.daily_schedule || "{}")
            : template.daily_schedule || {};

        // Update the recurring days and daily schedule
        const updatedRecurringDays = recurringDays.filter(
          (day: string) => day !== oldDay
        );
        if (!updatedRecurringDays.includes(newDay)) {
          updatedRecurringDays.push(newDay);
        }

        const updatedDailySchedule = { ...dailySchedule };
        delete updatedDailySchedule[oldDay];
        updatedDailySchedule[newDay] = {
          start_time: newStartTime,
          end_time: newEndTime,
        };

        // Day of week mapping for PostgreSQL (0=Sunday, 1=Monday, etc.)
        const dayOfWeekMapping: { [key: string]: number } = {
          sunday: 0,
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
        };

        const oldDayNum = dayOfWeekMapping[oldDay.toLowerCase()];
        const newDayNum = dayOfWeekMapping[newDay.toLowerCase()];

        // Get all future classes for the old day with their bookings
        const classesToMove = await sql`
          SELECT c.*, 
                 COALESCE(json_agg(
                   json_build_object(
                     'id', b.id,
                     'user_id', b.user_id,
                     'status', b.status,
                     'user_package_id', b.user_package_id,
                     'booking_date', b.booking_date
                   )
                   ORDER BY b.created_at
                 ) FILTER (WHERE b.id IS NOT NULL), '[]') as bookings
          FROM classes c
          LEFT JOIN bookings b ON c.id = b.class_id
          WHERE c.parent_recurring_id = ${id} 
          AND c.date >= CURRENT_DATE
          AND EXTRACT(dow FROM c.date) = ${oldDayNum}
          AND c.is_active = true
          GROUP BY c.id
        `;

        console.log(
          `📅 Found ${classesToMove.length} classes to migrate from ${oldDay} to ${newDay}`
        );

        // For each class, calculate the new date and create a new class
        for (const oldClass of classesToMove) {
          const oldDate = new Date(oldClass.date);
          const dayDifference = newDayNum - oldDayNum;

          // Calculate new date
          const newDate = new Date(oldDate);
          newDate.setDate(oldDate.getDate() + dayDifference);

          // If the new date would be in the past, move it to the next week
          const today = new Date();
          if (newDate < today) {
            newDate.setDate(newDate.getDate() + 7);
          }

          const newDateStr = newDate.toISOString().split("T")[0];

          console.log(
            `🔄 Moving class from ${oldClass.date} (${oldDay}) to ${newDateStr} (${newDay})`
          );

          // Create new class
          const newClass = await sql`
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
              ${oldClass.title}, ${oldClass.description}, ${oldClass.instructor},
              ${newDateStr}, ${newStartTime}, ${newEndTime},
              ${oldClass.max_participants}, ${oldClass.location}, 
              ${oldClass.class_type}, ${oldClass.difficulty_level},
              ${oldClass.equipment_needed}, ${oldClass.price_per_session}, 
              ${oldClass.credits_required}, ${oldClass.duration_minutes},
              ${oldClass.prerequisites}, ${oldClass.class_goals}, 
              ${oldClass.intensity_level}, ${oldClass.waitlist_enabled}, 
              ${oldClass.waitlist_capacity}, ${oldClass.auto_confirm_booking},
              ${oldClass.cancellation_deadline_hours}, ${oldClass.safety_requirements},
              ${oldClass.age_restrictions}, ${oldClass.modifications_available},
              true, true, ${updatedRecurringDays}, ${template.start_date},
              ${template.end_date}, ${id}
            )
            RETURNING id
          `;

          const newClassId = newClass[0].id;

          // Move all bookings to the new class
          const bookings = oldClass.bookings || [];
          let confirmedBookingsCount = 0;

          for (const booking of bookings) {
            if (booking.id) {
              await sql`
                UPDATE bookings 
                SET class_id = ${newClassId},
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${booking.id}
              `;
              console.log(
                `📋 Moved booking ${booking.id} to new class ${newClassId}`
              );

              // Count confirmed bookings for participant count
              if (booking.status === "confirmed") {
                confirmedBookingsCount++;
              }
            }
          }

          // Update the participant count for the new class
          await sql`
            UPDATE classes 
            SET current_participants = ${confirmedBookingsCount}
            WHERE id = ${newClassId}
          `;
          console.log(
            `👥 Updated participant count to ${confirmedBookingsCount} for new class ${newClassId}`
          );

          // Delete the old class (bookings are now moved)
          await sql`
            DELETE FROM classes WHERE id = ${oldClass.id}
          `;
          console.log(`🗑️ Deleted old class ${oldClass.id}`);
        }

        // Only update the template AFTER all class migrations succeed
        console.log(
          "📝 All class migrations successful - now updating template with:",
          {
            id,
            updatedRecurringDays,
            updatedDailySchedule: JSON.stringify(updatedDailySchedule),
          }
        );

        const updateResult = await sql`
          UPDATE recurring_class_templates 
          SET 
            recurring_days = ${updatedRecurringDays},
            daily_schedule = ${JSON.stringify(updatedDailySchedule)},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `;

        console.log(
          "📝 Template update result:",
          updateResult.length > 0 ? "SUCCESS" : "NO ROWS AFFECTED"
        );

        if (updateResult.length === 0) {
          throw new Error("Failed to update template - no rows affected");
        }

        return res.status(200).json({
          success: true,
          message: `Successfully moved ${classesToMove.length} classes and their bookings from ${oldDay} to ${newDay}`,
          movedClasses: classesToMove.length,
        });
      } catch (error) {
        console.error("Error in day change:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to change day",
        });
      }
    }

    // Update existing recurring class template
    try {
      const { id, updateFutureClasses = true, ...classData } = req.body; // Default to true - always update associated classes

      console.log("🔧 PUT request received for template:", id);
      console.log(`📝 Update data: ${JSON.stringify(classData, null, 2)}`);
      console.log(
        `🔄 Will ${
          updateFutureClasses ? "UPDATE" : "NOT UPDATE"
        } future classes`
      );

      if (!id) {
        return res.status(400).json({ error: "Template ID is required" });
      }

      // Get the current template to compare days
      const currentTemplate = await sql`
        SELECT recurring_days, start_date, end_date FROM recurring_class_templates WHERE id = ${id}
      `;

      if (currentTemplate.length === 0) {
        return res.status(404).json({ error: "Recurring template not found" });
      }

      const oldDays = currentTemplate[0].recurring_days || [];
      const newDays = classData.recurring_days || [];

      console.log("📅 Day comparison:", { oldDays, newDays });

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
        console.log(
          "🔄 Updating future class instances and handling day changes..."
        );

        // Handle day changes if recurring days were modified
        if (JSON.stringify(oldDays.sort()) !== JSON.stringify(newDays.sort())) {
          console.log("📅 Recurring days changed - handling day updates...");

          const removedDays = oldDays.filter(
            (day: string) => !newDays.includes(day)
          );
          const addedDays = newDays.filter(
            (day: string) => !oldDays.includes(day)
          );

          console.log("➖ Removed days:", removedDays);
          console.log("➕ Added days:", addedDays);

          // For removed days: Mark future classes as inactive (preserve existing bookings)
          if (removedDays.length > 0) {
            const dayOfWeekMapping: { [key: string]: number } = {
              sunday: 0,
              monday: 1,
              tuesday: 2,
              wednesday: 3,
              thursday: 4,
              friday: 5,
              saturday: 6,
            };

            for (const removedDay of removedDays) {
              const dayNum = dayOfWeekMapping[removedDay.toLowerCase()];
              await sql`
                UPDATE classes 
                SET is_active = false, 
                    updated_at = CURRENT_TIMESTAMP
                WHERE parent_recurring_id = ${id} 
                AND date >= CURRENT_DATE
                AND EXTRACT(dow FROM date) = ${dayNum}
              `;
              console.log(
                `🚫 Deactivated future ${removedDay} classes (bookings preserved)`
              );
            }
          }

          // For added days: Generate new classes going forward
          if (addedDays.length > 0) {
            console.log("🏗️ Creating new classes for added days...");

            const startDate =
              classData.start_date || currentTemplate[0].start_date;
            const endDate = classData.end_date || currentTemplate[0].end_date;

            // Generate dates for the new days only
            const newDates = generateRecurringDates(
              startDate,
              endDate,
              addedDays
            );

            // Filter to only future dates
            const today = new Date().toISOString().split("T")[0];
            const futureDates = newDates.filter((date) => date >= today);

            console.log(
              `📅 Will create ${futureDates.length} new classes for added days`
            );

            for (const date of futureDates) {
              const [year, month, day] = date.split("-").map(Number);
              const dateObj = new Date(year, month - 1, day, 12, 0, 0);
              const dayOfWeek = [
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
              ][dateObj.getDay()];

              if (addedDays.includes(dayOfWeek)) {
                const daySchedule = daily_schedule[dayOfWeek] || {
                  start_time: classData.start_time,
                  end_time: classData.end_time,
                };

                const startTime = daySchedule.start_time?.trim();
                const endTime = daySchedule.end_time?.trim();

                if (
                  startTime &&
                  endTime &&
                  startTime !== "" &&
                  endTime !== ""
                ) {
                  console.log(`➕ Creating new ${dayOfWeek} class on ${date}`);

                  await sql`
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
                      ${date}, ${startTime}, ${endTime},
                      ${classData.max_participants}, ${classData.location}, 
                      ${classData.class_type}, ${classData.difficulty_level},
                      ${classData.equipment_needed}, ${
                    classData.price_per_session
                  }, 
                      ${classData.credits_required}, ${
                    classData.duration_minutes
                  },
                      ${classData.prerequisites}, ${classData.class_goals}, 
                      ${classData.intensity_level}, ${
                    classData.waitlist_enabled
                  }, 
                      ${classData.waitlist_capacity}, ${
                    classData.auto_confirm_booking
                  },
                      ${classData.cancellation_deadline_hours}, ${
                    classData.safety_requirements
                  },
                      ${classData.age_restrictions}, ${
                    classData.modifications_available
                  },
                      true, true, ${newDays}, ${startDate},
                      ${endDate || null}, ${id}
                    )
                  `;
                }
              }
            }
          }
        }

        // Get all future class instances for this template (now including any newly created ones)
        const futureClasses = await sql`
          SELECT id, date, EXTRACT(dow FROM date) as day_of_week
          FROM classes 
          WHERE parent_recurring_id = ${id} 
          AND date >= CURRENT_DATE
          AND is_active = true
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

      // Build success message based on what was updated
      let message = "Recurring class template updated successfully";
      if (updateFutureClasses) {
        const dayChanges =
          JSON.stringify(oldDays.sort()) !== JSON.stringify(newDays.sort());
        if (dayChanges) {
          message =
            "Recurring class template updated with day changes - future classes updated, bookings preserved";
        } else {
          message =
            "Recurring class template and all future classes updated successfully";
        }
      } else {
        message =
          "Recurring class template updated successfully (future classes unchanged)";
      }

      return res.status(200).json({
        success: true,
        message,
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
      const { id, deleteFutureClasses = true } = req.body; // Default to true - always delete associated classes

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

      console.log(
        `🗑️ Deleting template ${id} and ${
          deleteFutureClasses ? "ALL" : "NO"
        } associated classes`
      );

      // Always delete all individual classes associated with this template (unless explicitly opted out)
      if (deleteFutureClasses) {
        // First, get all users who have bookings for these classes to update their counts
        const usersWithBookings = await sql`
          SELECT user_id, COUNT(*) as booking_count
          FROM bookings 
          WHERE class_id IN (
            SELECT id FROM classes 
            WHERE parent_recurring_id = ${id}
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

        // Then delete bookings for these classes (all classes, not just future ones)
        await sql`
          DELETE FROM bookings 
          WHERE class_id IN (
            SELECT id FROM classes 
            WHERE parent_recurring_id = ${id}
          )
        `;

        // Finally delete ALL the classes associated with this template
        await sql`
          DELETE FROM classes 
          WHERE parent_recurring_id = ${id}
        `;

        console.log(
          `🧹 Updated ${usersWithBookings.length} user booking counts and deleted all classes for template ${id}`
        );
      } // Delete the template
      await sql`
        DELETE FROM recurring_class_templates WHERE id = ${id}
      `;

      return res.status(200).json({
        success: true,
        message: deleteFutureClasses
          ? "Recurring class template and all associated classes deleted successfully"
          : "Recurring class template deleted successfully (classes preserved)",
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

      // First, prepare and validate all class instances (without creating template yet)
      const classInstances = [];
      const classesToCreate = [];
      console.log(
        `🏗️ Preparing individual class instances for ${recurringDates.length} dates`
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

        // Validate that times are not empty strings and are in valid format
        const startTime = daySchedule.start_time?.trim();
        const endTime = daySchedule.end_time?.trim();

        // Only create class if this day is selected and has valid times
        const shouldInclude = classData.recurring_days.includes(dayOfWeek);
        const hasValidTimes =
          startTime && endTime && startTime !== "" && endTime !== "";

        console.log(`🔍 Should include "${dayOfWeek}"? ${shouldInclude}`);
        console.log(
          `⏰ Times for ${dayOfWeek}: start="${startTime}", end="${endTime}"`
        );

        if (!shouldInclude) {
          console.log(
            `⏭️ Skipping ${dayOfWeek} - not in selected recurring days`
          );
          continue;
        }

        if (!hasValidTimes) {
          console.log(
            `⚠️ Skipping ${dayOfWeek} - missing or empty start/end times`
          );
          continue;
        }

        console.log(
          `✅ Preparing class for ${dayOfWeek} on ${date} from ${startTime} to ${endTime}`
        );

        // Collect class data to create later (after template is created)
        classesToCreate.push({
          date,
          startTime,
          endTime,
          dayOfWeek,
        });
      }

      // Check if we have any classes to create
      if (classesToCreate.length === 0) {
        return res.status(400).json({
          error:
            "No valid classes could be created from the recurring pattern. Please check your time schedules.",
        });
      }

      console.log(`📋 Will create ${classesToCreate.length} classes`);

      // Now create the recurring template record (only if we have classes to create)
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
      console.log(`📝 Created template with ID: ${templateId}`);

      // Now create all the individual class instances
      console.log(
        `🏗️ Creating ${classesToCreate.length} individual class instances`
      );

      try {
        for (const classToCreate of classesToCreate) {
          const { date, startTime, endTime, dayOfWeek } = classToCreate;

          console.log(
            `📅 Creating class for ${dayOfWeek} on ${date} from ${startTime} to ${endTime}`
          );

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
              ${date}, ${startTime}, ${endTime},
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
              ${classData.age_restrictions}, ${
            classData.modifications_available
          },
              true, true, ${classData.recurring_days}, ${
            classData.recurring_start_date
          },
              ${classData.recurring_end_date || null}, ${templateId}
            ) RETURNING *
          `;
          classInstances.push(result[0]);
        }
      } catch (classCreationError) {
        // If class creation fails, clean up the template that was created
        console.error(
          "❌ Failed to create classes, cleaning up template:",
          classCreationError
        );

        try {
          await sql`DELETE FROM recurring_class_templates WHERE id = ${templateId}`;
          console.log("🧹 Cleaned up template after class creation failure");
        } catch (cleanupError) {
          console.error("⚠️ Failed to cleanup template:", cleanupError);
        }

        throw new Error(
          `Failed to create individual classes: ${
            classCreationError instanceof Error
              ? classCreationError.message
              : "Unknown error"
          }`
        );
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
