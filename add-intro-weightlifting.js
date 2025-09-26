const { neon } = require("@neondatabase/serverless");

// Get DATABASE_URL from environment variables
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_7kO5WntJRTDb@ep-raspy-sound-ad0ejzrd-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

async function addIntroWeightLiftingClasses() {
  try {
    console.log("🔄 Adding Intro Weight Lifting classes...");

    // Clear existing sample classes and add your specific classes
    await sql`DELETE FROM classes`;
    console.log("✅ Cleared existing sample classes");

    // Add multiple "Intro Weight Lifting" classes for the week
    await sql`
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
        modifications_available
      ) VALUES 
      
      -- Monday Evening
      (
        'Intro Weight Lifting – Exclusive 4-Person Training',
        'Perfect introduction to weight lifting in a small group setting. Learn proper form, basic exercises, and build confidence in the gym. Maximum 4 participants for personalized attention.',
        'Gavin Stanifer',
        '2025-09-22',
        '18:00',
        '19:00',
        4,
        0,
        'FL Best Trainer Studio',
        'Strength Training',
        'Beginner',
        'Dumbbells, barbells, weight plates, bench, squat rack',
        35.00,
        1,
        60,
        'No prior weight lifting experience required. Must complete health questionnaire.',
        'Learn fundamental movement patterns, proper form, basic strength exercises, and gym safety protocols.',
        4,
        true,
        2,
        true,
        24,
        'Please inform instructor of any injuries or health conditions. Proper athletic wear and closed-toe shoes required.',
        'Ages 16 and up (under 18 requires parent/guardian consent)',
        'Exercises can be modified for different fitness levels and physical limitations'
      ),
      
      -- Wednesday Morning
      (
        'Intro Weight Lifting – Exclusive 4-Person Training',
        'Perfect introduction to weight lifting in a small group setting. Learn proper form, basic exercises, and build confidence in the gym. Maximum 4 participants for personalized attention.',
        'Gavin Stanifer',
        '2025-09-24',
        '10:00',
        '11:00',
        4,
        1,
        'FL Best Trainer Studio',
        'Strength Training',
        'Beginner',
        'Dumbbells, barbells, weight plates, bench, squat rack',
        35.00,
        1,
        60,
        'No prior weight lifting experience required. Must complete health questionnaire.',
        'Learn fundamental movement patterns, proper form, basic strength exercises, and gym safety protocols.',
        4,
        true,
        2,
        true,
        24,
        'Please inform instructor of any injuries or health conditions. Proper athletic wear and closed-toe shoes required.',
        'Ages 16 and up (under 18 requires parent/guardian consent)',
        'Exercises can be modified for different fitness levels and physical limitations'
      ),
      
      -- Friday Evening
      (
        'Intro Weight Lifting – Exclusive 4-Person Training',
        'Perfect introduction to weight lifting in a small group setting. Learn proper form, basic exercises, and build confidence in the gym. Maximum 4 participants for personalized attention.',
        'Gavin Stanifer',
        '2025-09-26',
        '17:30',
        '18:30',
        4,
        2,
        'FL Best Trainer Studio',
        'Strength Training',
        'Beginner',
        'Dumbbells, barbells, weight plates, bench, squat rack',
        35.00,
        1,
        60,
        'No prior weight lifting experience required. Must complete health questionnaire.',
        'Learn fundamental movement patterns, proper form, basic strength exercises, and gym safety protocols.',
        4,
        true,
        2,
        true,
        24,
        'Please inform instructor of any injuries or health conditions. Proper athletic wear and closed-toe shoes required.',
        'Ages 16 and up (under 18 requires parent/guardian consent)',
        'Exercises can be modified for different fitness levels and physical limitations'
      ),
      
      -- Saturday Morning
      (
        'Intro Weight Lifting – Exclusive 4-Person Training',
        'Perfect introduction to weight lifting in a small group setting. Learn proper form, basic exercises, and build confidence in the gym. Maximum 4 participants for personalized attention.',
        'Gavin Stanifer',
        '2025-09-27',
        '09:00',
        '10:00',
        4,
        0,
        'FL Best Trainer Studio',
        'Strength Training',
        'Beginner',
        'Dumbbells, barbells, weight plates, bench, squat rack',
        35.00,
        1,
        60,
        'No prior weight lifting experience required. Must complete health questionnaire.',
        'Learn fundamental movement patterns, proper form, basic strength exercises, and gym safety protocols.',
        4,
        true,
        2,
        true,
        24,
        'Please inform instructor of any injuries or health conditions. Proper athletic wear and closed-toe shoes required.',
        'Ages 16 and up (under 18 requires parent/guardian consent)',
        'Exercises can be modified for different fitness levels and physical limitations'
      )
    `;

    console.log("✅ Added Intro Weight Lifting classes for the week");
    console.log("📅 Classes scheduled:");
    console.log("   • Monday 9/22 at 6:00 PM (0/4 spots filled)");
    console.log("   • Wednesday 9/24 at 10:00 AM (1/4 spots filled)");
    console.log("   • Friday 9/26 at 5:30 PM (2/4 spots filled)");
    console.log("   • Saturday 9/27 at 9:00 AM (0/4 spots filled)");

    console.log("🎉 Intro Weight Lifting classes setup complete!");
  } catch (error) {
    console.error("❌ Failed to add classes:", error);
  }
}

addIntroWeightLiftingClasses();
