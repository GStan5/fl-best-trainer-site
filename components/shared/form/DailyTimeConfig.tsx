import { useState } from "react";

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
  onDayChange?: (
    oldDay: string,
    newDay: string,
    newStartTime?: string,
    newEndTime?: string
  ) => void;
  isEditing?: boolean; // To show/hide change day buttons
}

const daysOfWeek = [
  { value: "sunday", label: "Sun", full: "Sunday" },
  { value: "monday", label: "Mon", full: "Monday" },
  { value: "tuesday", label: "Tue", full: "Tuesday" },
  { value: "wednesday", label: "Wed", full: "Wednesday" },
  { value: "thursday", label: "Thu", full: "Thursday" },
  { value: "friday", label: "Fri", full: "Friday" },
  { value: "saturday", label: "Sat", full: "Saturday" },
];

export default function DailyTimeConfig({
  selectedDays,
  dailySchedule,
  onTimeChange,
  onDayChange,
  isEditing = false,
}: DailyTimeConfigProps) {
  const [changeDayModal, setChangeDayModal] = useState<{
    isOpen: boolean;
    currentDay: string;
    currentStartTime: string;
    currentEndTime: string;
  }>({
    isOpen: false,
    currentDay: "",
    currentStartTime: "",
    currentEndTime: "",
  });

  const [newDaySelection, setNewDaySelection] = useState("");
  const [newStartTime, setNewStartTime] = useState("07:30");
  const [newEndTime, setNewEndTime] = useState("08:30");

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

  const openChangeDayModal = (
    day: string,
    startTime: string,
    endTime: string
  ) => {
    setChangeDayModal({
      isOpen: true,
      currentDay: day,
      currentStartTime: startTime,
      currentEndTime: endTime,
    });
    setNewDaySelection("");
    setNewStartTime(startTime);
    setNewEndTime(endTime);
  };

  const closeChangeDayModal = () => {
    setChangeDayModal({
      isOpen: false,
      currentDay: "",
      currentStartTime: "",
      currentEndTime: "",
    });
    setNewDaySelection("");
    setNewStartTime("07:30");
    setNewEndTime("08:30");
  };

  const handleDayChangeSubmit = () => {
    if (newDaySelection && onDayChange) {
      onDayChange(
        changeDayModal.currentDay,
        newDaySelection,
        newStartTime,
        newEndTime
      );
      closeChangeDayModal();
    }
  };

  // Get available days for selection (excluding currently selected days)
  const getAvailableDays = () => {
    return daysOfWeek.filter(
      (day) =>
        !selectedDays.includes(day.value) ||
        day.value === changeDayModal.currentDay
    );
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-3">
        Time Schedule for Each Day
      </label>
      <div className="space-y-3">
        {selectedDays
          .sort((a, b) => {
            const aIndex = daysOfWeek.findIndex((day) => day.value === a);
            const bIndex = daysOfWeek.findIndex((day) => day.value === b);
            return aIndex - bIndex;
          })
          .map((selectedDay) => {
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

                {/* Change Day Button - Only show when editing existing template */}
                {isEditing && onDayChange && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() =>
                        openChangeDayModal(
                          selectedDay,
                          daySchedule.start_time,
                          daySchedule.end_time
                        )
                      }
                      className="w-full px-3 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                      Change Day & Move Bookings
                    </button>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Migrate all {dayInfo?.full} {daySchedule.start_time}{" "}
                      classes and bookings to a new day/time
                    </p>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Change Day Modal */}
      {changeDayModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Change Day & Move Bookings
              </h3>
              <button
                onClick={closeChangeDayModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Moving:</strong>{" "}
                {
                  daysOfWeek.find((d) => d.value === changeDayModal.currentDay)
                    ?.full
                }{" "}
                classes from {changeDayModal.currentStartTime} -{" "}
                {changeDayModal.currentEndTime}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                All existing bookings and future classes will be transferred to
                the new day/time.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Day
                </label>
                <select
                  value={newDaySelection}
                  onChange={(e) => setNewDaySelection(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a new day...</option>
                  {getAvailableDays().map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.full}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Start Time
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New End Time
                  </label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <svg
                    className="w-5 h-5 text-yellow-400 mr-2 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">
                      Important:
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      This will move ALL existing bookings and future classes to
                      the new day/time. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeChangeDayModal}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDayChangeSubmit}
                disabled={!newDaySelection || !newStartTime || !newEndTime}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Move Classes & Bookings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
