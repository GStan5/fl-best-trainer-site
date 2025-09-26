import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

interface DayScheduleSelectorProps {
  selectedDays: string[];
  onDayToggle: (day: string, checked: boolean) => void;
  error?: string;
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

export default function DayScheduleSelector({
  selectedDays,
  onDayToggle,
  error,
}: DayScheduleSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-3">
        Select Days <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <motion.label
              key={day.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-center cursor-pointer p-3 rounded-lg transition-all ${
                isSelected
                  ? "bg-purple-100 text-purple-700 border-2 border-purple-300"
                  : "bg-gray-50 text-gray-600 hover:bg-purple-50 border-2 border-transparent"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onDayToggle(day.value, e.target.checked)}
                className="sr-only"
              />
              <span className="text-xs font-medium">{day.label}</span>
            </motion.label>
          );
        })}
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-2 flex items-center">
          <FaExclamationTriangle className="mr-1 text-xs" />
          {error}
        </p>
      )}
    </div>
  );
}
