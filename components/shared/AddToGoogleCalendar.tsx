import { motion } from "framer-motion";
import { FaGoogle, FaExternalLinkAlt } from "react-icons/fa";

interface ClassData {
  id: string;
  title: string;
  description: string;
  instructor: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  class_type: string;
  difficulty_level: string;
}

interface AddToGoogleCalendarProps {
  classData: ClassData;
  isBooked?: boolean;
  className?: string;
}

export default function AddToGoogleCalendar({
  classData,
  isBooked = false,
  className = "",
}: AddToGoogleCalendarProps) {
  // Generate Google Calendar "Add to Calendar" link
  const generateGoogleCalendarLink = () => {
    if (!classData) return "";

    // Parse date and create proper Date objects
    // Handle both Date objects and date strings from the database
    const dateStr =
      typeof classData.date === "string"
        ? classData.date.split("T")[0] // Get "2025-10-07"
        : new Date(classData.date).toISOString().split("T")[0]; // Convert Date object to string

    const [year, month, day] = dateStr.split("-").map(Number);
    const [startHour, startMinute] = classData.start_time
      .split(":")
      .map(Number);
    const [endHour, endMinute] = classData.end_time.split(":").map(Number);

    // Create Date objects - this ensures proper timezone handling
    const startDate = new Date(year, month - 1, day, startHour, startMinute);
    const endDate = new Date(year, month - 1, day, endHour, endMinute);

    // Format for Google Calendar in UTC format with proper conversion
    const formatDateForGoogle = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = "00";

      // Return in local time format without timezone suffix
      return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    };

    const startTime = formatDateForGoogle(startDate);
    const endTime = formatDateForGoogle(endDate);

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `${classData.title} - Fitness Class`,
      dates: `${startTime}/${endTime}`,
      details: `${classData.description}\n\nInstructor: ${classData.instructor}\nDifficulty: ${classData.difficulty_level}\nClass Type: ${classData.class_type}`,
      location: classData.location,
      trp: "false", // Don't show recurring options
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <div
      className={`bg-green-500/10 border border-green-500/20 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <FaGoogle className="text-green-300" />
        <span className="text-white font-medium">Add to Google Calendar</span>
      </div>
      <p className="text-green-300/80 text-sm mb-3">
        {isBooked
          ? "📅 Add this booked class to your Google Calendar - no authentication required!"
          : "📅 After booking, click the button below to manually add this class to your Google Calendar - no authentication required!"}
      </p>
      <motion.a
        href={generateGoogleCalendarLink()}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all"
      >
        <FaGoogle className="text-sm" />
        <span>Add to Google Calendar</span>
        <FaExternalLinkAlt className="text-xs" />
      </motion.a>
    </div>
  );
}
