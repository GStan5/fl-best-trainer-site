export interface RecurringTemplate {
  id?: string;
  title: string;
  description: string;
  instructor: string;
  class_type: string;
  difficulty_level: string;
  location: string;
  duration_minutes: number;
  max_participants: number;
  price_per_session: number;
  credits_required: number;
  equipment_needed: string;
  prerequisites: string;
  class_goals: string;
  intensity_level: number;
  waitlist_enabled: boolean;
  waitlist_capacity: number;
  auto_confirm_booking: boolean;
  cancellation_deadline_hours: number;
  safety_requirements: string;
  age_restrictions: string;
  modifications_available: string;
  is_active: boolean;
  recurring_days: string[];
  daily_schedule?: { [day: string]: { start_time: string; end_time: string } };
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string | null;
  created_at?: string;
  updated_at?: string;
  // Optional bulk operation flags
  updateFutureClasses?: boolean;
  deleteFutureClasses?: boolean;
}

export interface Class {
  id?: string;
  title: string;
  description: string;
  instructor: string;
  date: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants?: number;
  location: string;
  class_type: string;
  difficulty_level: string;
  equipment_needed: string;
  price_per_session: number;
  credits_required: number;
  duration_minutes: number;
  prerequisites: string;
  class_goals: string;
  intensity_level: number;
  waitlist_enabled: boolean;
  waitlist_capacity: number;
  auto_confirm_booking: boolean;
  cancellation_deadline_hours: number;
  safety_requirements: string;
  age_restrictions: string;
  modifications_available: string;
  is_active: boolean;
  // Recurring class fields
  is_recurring?: boolean;
  recurring_days?: string[];
  recurring_start_date?: string;
  recurring_end_date?: string;
  parent_recurring_id?: string;
  // Enhanced: Per-day scheduling
  daily_schedule?: {
    [day: string]: {
      start_time: string;
      end_time: string;
    };
  };
}
