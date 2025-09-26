interface DailyTimeSchedule {
  [day: string]: {
    start_time: string;
    end_time: string;
  };
}

interface DailyTimeConfigProps {
  selectedDays: string[];
  dailySchedule: DailyTimeSchedule;
  onTimeChange: (
    day: string,
    field: "start_time" | "end_time",
    value: string
  ) => void;
}

const daysOfWeek = [
  { value: "monday", label: "Mon", full: "Monday" },
  { value: "tuesday", label: "Tue", full: "Tuesday" },
  { value: "wednesday", label: "Wed", full: "Wednesday" },
  { value: "thursday", label: "Thu", full: "Thursday" },
  { value: "friday", label: "Fri", full: "Friday" },
  { value: "saturday", label: "Sat", full: "Saturday" },
  { value: "sunday", label: "Sun", full: "Sunday" },
];

export default function DailyTimeConfig({
  selectedDays,
  dailySchedule,
  onTimeChange,
}: DailyTimeConfigProps) {
  if (selectedDays.length === 0) return null;

  const handleStartTimeChange = (day: string, startTime: string) => {
    console.log("🕐 Start time changing for", day, ":", startTime);

    // Update start time
    onTimeChange(day, "start_time", startTime);

    // Auto-calculate end time (start time + 1 hour)
    if (startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const endHour = (hours + 1) % 24; // Handle 23:00 -> 00:00
      const endTime = `${endHour.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      console.log("🕐 Auto-setting end time for", day, ":", endTime);
      onTimeChange(day, "end_time", endTime);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-3">
        Time Schedule for Each Day
      </label>
      <div className="space-y-3">
        {selectedDays.map((selectedDay) => {
          const dayInfo = daysOfWeek.find((d) => d.value === selectedDay);
          const daySchedule = dailySchedule[selectedDay] || {
            start_time: "07:30",
            end_time: "08:30",
          };

          console.log(`📅 ${selectedDay} schedule:`, daySchedule);

          return (
            <div key={selectedDay} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">
                  {dayInfo?.full}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={daySchedule.start_time || "07:30"}
                    onChange={(e) =>
                      handleStartTimeChange(selectedDay, e.target.value)
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={daySchedule.end_time || "08:30"}
                    onChange={(e) =>
                      onTimeChange(selectedDay, "end_time", e.target.value)
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
