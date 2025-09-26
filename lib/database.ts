import { neon } from "@neondatabase/serverless";

// Check if DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set!");
  console.log("Please add your Neon database connection string to .env.local:");
  console.log(
    "DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require"
  );
}

const sql = neon(process.env.DATABASE_URL || "");

export default sql;

// Database connection utility
export async function executeQuery(query: string, params: any[] = []) {
  try {
    // For Neon, we'll use template literals with the sql function
    const result = await sql`${query}`;
    return result;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Types for our database tables
export interface User {
  id: string;
  email: string;
  name: string;
  google_id?: string;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  sessions_included: number;
  price: number;
  duration_days: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserPackage {
  id: string;
  user_id: string;
  package_id: string;
  sessions_remaining: number;
  purchase_date: Date;
  expiry_date: Date;
  stripe_payment_id?: string;
  is_active: boolean;
}

export interface Class {
  id: string;
  title: string;
  description: string;
  instructor: string;
  date: Date;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  location: string;
  class_type: string;
  difficulty_level?: string;
  equipment_needed?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;

  // Enhanced fields - Pricing & Business
  price_per_session?: number;
  credits_required?: number;
  cancellation_deadline_hours?: number;

  // Enhanced fields - Class Details
  duration_minutes?: number;
  prerequisites?: string;
  class_goals?: string;
  intensity_level?: number; // 1-10 scale

  // Enhanced fields - Capacity & Booking
  waitlist_enabled?: boolean;
  waitlist_capacity?: number;
  auto_confirm_booking?: boolean;

  // Enhanced fields - Scheduling
  recurring_pattern?: string;
  class_series_id?: string;
  registration_opens?: Date;
  registration_closes?: Date;

  // Enhanced fields - Content & Safety
  safety_requirements?: string;
  age_restrictions?: string;
  modifications_available?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  class_id: string;
  user_package_id: string;
  booking_date: Date;
  status: "confirmed" | "cancelled" | "waitlist";
  created_at: Date;
  updated_at: Date;
}
