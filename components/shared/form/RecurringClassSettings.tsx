import InputField from "./InputField";
import DayScheduleSelector from "./DayScheduleSelector";
import DailyTimeConfig from "./DailyTimeConfig";

interface RecurringClassSettingsProps {
  isRecurring: boolean;
  recurringDays: string[];
  recurringStartDate: string;
  recurringEndDate: string;
  dailySchedule: {
    [day: string]: {
      start_time: string;
      end_time: string;
    };
  };
  errors: Record<string, string>;
  onRecurringToggle?: (checked: boolean) => void;
  onDayToggle: (day: string, checked: boolean) => void;
  onTimeChange: (
    day: string,
    field: "start_time" | "end_time",
    value: string
  ) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  hideToggle?: boolean;
  isEditing?: boolean;
  onDayChange?: (
    oldDay: string,
    newDay: string,
    newStartTime?: string,
    newEndTime?: string
  ) => void;
}

export default function RecurringClassSettings({
  isRecurring,
  recurringDays,
  recurringStartDate,
  recurringEndDate,
  dailySchedule,
  errors,
  onRecurringToggle,
  onDayToggle,
  onTimeChange,
  onStartDateChange,
  onEndDateChange,
  hideToggle = false,
  isEditing = false,
  onDayChange,
}: RecurringClassSettingsProps) {
  return (
    <div className="space-y-4">
      {/* Recurring Class Toggle */}
      {!hideToggle && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-start">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => onRecurringToggle?.(e.target.checked)}
              className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <div className="ml-3">
              <label className="text-sm font-medium text-purple-800">
                Recurring Class
              </label>
              <p className="text-sm text-purple-600">
                Create a class that repeats on selected days of the week
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Settings */}
      {isRecurring && (
        <div className="space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Start Date"
              type="date"
              value={recurringStartDate}
              onChange={(value) => onStartDateChange(value as string)}
              required
              error={errors.recurring_start_date}
            />
            <div>
              <InputField
                label="End Date (Optional)"
                type="date"
                value={recurringEndDate}
                onChange={(value) => onEndDateChange(value as string)}
                error={errors.recurring_end_date}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for ongoing classes (continues until manually
                stopped)
              </p>
            </div>
          </div>

          {/* Days Selection */}
          <DayScheduleSelector
            selectedDays={recurringDays}
            onDayToggle={onDayToggle}
            error={errors.recurring_days}
          />

          {/* Per-day Time Configuration */}
          <DailyTimeConfig
            selectedDays={recurringDays}
            dailySchedule={dailySchedule}
            onTimeChange={onTimeChange}
            isEditing={isEditing}
            onDayChange={onDayChange}
          />
        </div>
      )}
    </div>
  );
}
