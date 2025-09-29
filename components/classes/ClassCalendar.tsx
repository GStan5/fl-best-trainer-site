import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaUsers,
  FaMapMarkerAlt,
} from "react-icons/fa";

interface ClassData {
  id: string;
  title: string;
  description: string;
  instructor: string;
  date: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  location: string;
  class_type: string;
  difficulty_level: string;
  equipment_needed: string;
  is_active: boolean;
}

interface CalendarProps {
  classes: ClassData[];
  onClassSelect: (classData: ClassData, element?: HTMLElement) => void;
  onDateSelect: (date: Date) => void;
}

export default function ClassCalendar({
  classes,
  onClassSelect,
  onDateSelect,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of the month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Get classes for the current month - manually parse date string to avoid timezone issues
  const monthClasses = classes.filter((classItem) => {
    // Extract date components directly from ISO string to avoid Date constructor timezone issues
    const dateStr = classItem.date.split("T")[0]; // Get just the date part: "2025-10-07"
    const [year, month, day] = dateStr.split("-").map(Number);

    // Month is 0-based in JavaScript, so subtract 1 from parsed month
    return month - 1 === currentMonth && year === currentYear;
  });

  // Group classes by date and sort by start time
  const classesByDate = monthClasses.reduce((acc, classItem) => {
    // Extract day directly from ISO string to avoid any Date constructor issues
    const dateStr = classItem.date.split("T")[0]; // Get just the date part: "2025-10-07"
    const [year, month, day] = dateStr.split("-").map(Number);
    const dateKey = day.toString();

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(classItem);
    return acc;
  }, {} as Record<string, ClassData[]>);

  // Sort classes within each date by start time
  Object.keys(classesByDate).forEach((dateKey) => {
    classesByDate[dateKey].sort((a, b) => {
      return a.start_time.localeCompare(b.start_time);
    });
  });

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDate(null);
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(clickedDate);
    onDateSelect(clickedDate);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour24 = parseInt(hours);
    const hour12 = hour24 % 12 || 12;
    const ampm = hour24 >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes} ${ampm}`;
  };

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const isSelected = (day: number) => {
    return (
      selectedDate &&
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  const isPastDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return (
      date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
    );
  };

  // Generate calendar days
  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="h-20 sm:h-24 md:h-36 lg:h-40"></div>
    );
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayClasses = classesByDate[day.toString()] || [];
    const hasClasses = dayClasses.length > 0;
    const isPast = isPastDate(day);

    calendarDays.push(
      <motion.div
        key={day}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`h-20 sm:h-24 md:h-36 lg:h-40 border border-white/10 p-1 sm:p-1.5 md:p-2 cursor-pointer transition-all duration-200 relative overflow-hidden touch-manipulation
          ${isToday(day) ? "bg-royal/20 border-royal" : ""}
          ${isSelected(day) ? "bg-royal/30 border-royal-light" : ""}
          ${hasClasses && !isPast ? "hover:bg-white/5" : ""}
          ${isPast ? "opacity-50" : ""}
        `}
        onClick={() => !isPast && handleDateClick(day)}
      >
        <div className="flex justify-between items-center mb-0.5 sm:mb-1">
          <div
            className={`text-xs sm:text-sm md:text-base font-medium 
            ${isToday(day) ? "text-royal-light" : "text-white"}
            ${isPast ? "text-white/40" : ""}
          `}
          >
            {day}
          </div>
          {/* Visual indicator for busy days */}
          {dayClasses.length >= 4 && !isPast && (
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                dayClasses.length >= 6 ? "bg-red-400" : "bg-amber-400"
              }`}
              title={`${dayClasses.length} classes scheduled`}
            ></div>
          )}
        </div>

        {hasClasses && (
          <div className="space-y-0.5 overflow-hidden">
            {/* Show classes based on screen size - mobile: 2, tablet+: up to 5 */}
            <div className="block sm:hidden">
              {dayClasses.slice(0, 2).map((classItem, index) => (
                <motion.div
                  key={classItem.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`text-xs bg-gradient-to-r px-2 py-1 rounded text-white cursor-pointer truncate touch-manipulation
                    ${
                      classItem.location
                        .toLowerCase()
                        .includes("bayfront park recreation center") ||
                      classItem.location.toLowerCase().includes("bayfront")
                        ? "from-green-500 to-green-600"
                        : "from-gray-500 to-gray-600"
                    }
                    ${isPast ? "opacity-60" : "hover:scale-105"}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isPast) onClassSelect(classItem, e.currentTarget);
                  }}
                  title={`${classItem.title} - ${formatTime(
                    classItem.start_time
                  )} (${classItem.current_participants}/${
                    classItem.max_participants
                  })`}
                >
                  <div className="text-center">
                    <span className="font-medium">
                      {formatTime(classItem.start_time)}
                    </span>
                  </div>
                </motion.div>
              ))}
              {dayClasses.length > 2 && (
                <div
                  className="text-xs text-white/60 text-center bg-white/10 rounded py-1 cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={() => handleDateClick(day)}
                >
                  +{dayClasses.length - 2} more
                </div>
              )}
            </div>

            <div className="hidden sm:block">
              {dayClasses
                .slice(0, Math.min(5, dayClasses.length))
                .map((classItem, index) => (
                  <motion.div
                    key={classItem.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`text-xs bg-gradient-to-r px-1.5 py-0.5 rounded text-white cursor-pointer truncate touch-manipulation
                    ${
                      classItem.location
                        .toLowerCase()
                        .includes("bayfront park recreation center") ||
                      classItem.location.toLowerCase().includes("bayfront")
                        ? "from-green-500 to-green-600"
                        : "from-gray-500 to-gray-600"
                    }
                    ${isPast ? "opacity-60" : "hover:scale-105"}
                  `}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isPast) onClassSelect(classItem, e.currentTarget);
                    }}
                    title={`${classItem.title} - ${formatTime(
                      classItem.start_time
                    )} (${classItem.current_participants}/${
                      classItem.max_participants
                    })`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate pr-1">
                        {classItem.title.length > 12
                          ? `${classItem.title.substring(0, 12)}...`
                          : classItem.title}
                      </span>
                      <span className="text-xs whitespace-nowrap">
                        {formatTime(classItem.start_time)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="text-xs opacity-80 truncate">
                        {classItem.instructor.split(",")[0]}
                      </span>
                      <span className="text-xs opacity-90">
                        {classItem.current_participants}/
                        {classItem.max_participants}
                      </span>
                    </div>
                  </motion.div>
                ))}
              {dayClasses.length > 5 && (
                <div
                  className="text-xs text-white/60 text-center bg-white/10 rounded py-1 cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={() => handleDateClick(day)}
                >
                  +{dayClasses.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-lg rounded-xl border border-white/10 p-3 sm:p-4 md:p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateMonth("prev")}
          className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors touch-manipulation"
        >
          <FaChevronLeft className="text-sm sm:text-base" />
        </motion.button>

        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          {monthNames[currentMonth]} {currentYear}
        </h2>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigateMonth("next")}
          className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors touch-manipulation"
        >
          <FaChevronRight className="text-sm sm:text-base" />
        </motion.button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-white/60 font-medium py-1 sm:py-2 text-xs sm:text-sm md:text-base"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentMonth}-${currentYear}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-7 gap-0.5 sm:gap-1"
        >
          {calendarDays}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10">
        <h3 className="text-white font-medium mb-2 sm:mb-3 text-sm sm:text-base">
          Training Location
        </h3>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
            <span className="text-white/80 text-xs">
              Bayfront Park Recreation Center
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
