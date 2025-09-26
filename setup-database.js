const { neon } = require("@neondatabase/serverless");

// Get DATABASE_URL from environment variables
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_7kO5WntJRTDb@ep-raspy-sound-ad0ejzrd-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

async function setupDatabase() {
  try {
    console.log("🔄 Setting up database schema...");

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          google_id VARCHAR(255) UNIQUE,
          is_admin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log("✅ Users table created");

    // Create packages table
    await sql`
      CREATE TABLE IF NOT EXISTS packages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          sessions_included INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          duration_days INTEGER NOT NULL DEFAULT 30,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log("✅ Packages table created");

    // Create user_packages table
    await sql`
      CREATE TABLE IF NOT EXISTS user_packages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
          sessions_remaining INTEGER NOT NULL,
          purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
          stripe_payment_id VARCHAR(255),
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log("✅ User packages table created");

    // Create classes table
    await sql`
      CREATE TABLE IF NOT EXISTS classes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          instructor VARCHAR(255) NOT NULL DEFAULT 'Gavin Stanifer',
          date DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          max_participants INTEGER NOT NULL DEFAULT 8,
          current_participants INTEGER DEFAULT 0,
          location VARCHAR(255) DEFAULT 'FL Best Trainer Studio',
          class_type VARCHAR(100) NOT NULL,
          difficulty_level VARCHAR(50) DEFAULT 'Intermediate',
          equipment_needed TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log("✅ Classes table created");

    // Create bookings table
    await sql`
      CREATE TABLE IF NOT EXISTS bookings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
          user_package_id UUID REFERENCES user_packages(id) ON DELETE CASCADE,
          booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          status VARCHAR(50) DEFAULT 'confirmed',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, class_id)
      )
    `;
    console.log("✅ Bookings table created");

    // Add sample packages
    await sql`
      INSERT INTO packages (name, description, sessions_included, price, duration_days)
      VALUES 
        ('Single Session', 'Perfect for trying out our classes', 1, 25.00, 30),
        ('4-Session Package', 'Great for regular training', 4, 90.00, 60),
        ('8-Session Package', 'Best value for dedicated fitness enthusiasts', 8, 160.00, 90),
        ('12-Session Package', 'Comprehensive training package', 12, 220.00, 120)
      ON CONFLICT DO NOTHING
    `;
    console.log("✅ Sample packages added");

    // Add sample classes
    await sql`
      INSERT INTO classes (title, description, date, start_time, end_time, class_type, difficulty_level, equipment_needed)
      VALUES 
        ('Morning HIIT', 'High-intensity interval training to start your day', '2025-09-22', '07:00', '08:00', 'HIIT', 'Intermediate', 'Water bottle, towel'),
        ('Strength Training', 'Build muscle and increase strength', '2025-09-22', '18:00', '19:00', 'Strength', 'Beginner', 'None required'),
        ('Cardio Blast', 'Heart-pumping cardio workout', '2025-09-23', '07:00', '08:00', 'Cardio', 'Intermediate', 'Water bottle'),
        ('Core Focus', 'Strengthen your core muscles', '2025-09-23', '19:00', '20:00', 'Core', 'All Levels', 'Yoga mat'),
        ('Full Body Workout', 'Complete body conditioning', '2025-09-24', '18:00', '19:30', 'Full Body', 'Intermediate', 'Water bottle, towel'),
        ('Flexibility & Mobility', 'Improve flexibility and movement', '2025-09-25', '07:30', '08:30', 'Flexibility', 'All Levels', 'Yoga mat'),
        ('Power Training', 'Explosive movement and power development', '2025-09-26', '18:00', '19:00', 'Power', 'Advanced', 'None required'),
        ('Recovery Session', 'Gentle movement and stretching', '2025-09-27', '10:00', '11:00', 'Recovery', 'All Levels', 'Yoga mat, foam roller')
      ON CONFLICT DO NOTHING
    `;
    console.log("✅ Sample classes added");

    console.log("🎉 Database setup complete!");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
  }
}

setupDatabase();
