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

    // Parse date safely - use simple local time format for better mobile compatibility
    const dateStr = classData.date.split("T")[0]; // Get "2025-10-07"
    const [year, month, day] = dateStr.split("-").map(Number);

    // Format times for Google Calendar without timezone conversion
    // This uses local time format which works better on mobile
    const formatTime = (timeStr: string) => {
      return timeStr.replace(":", "");
    };

    // Create the date/time strings in YYYYMMDDTHHMMSS format (local time)
    const dateFormatted = `${year}${month.toString().padStart(2, "0")}${day
      .toString()
      .padStart(2, "0")}`;
    const startTime = `${dateFormatted}T${formatTime(classData.start_time)}00`;
    const endTime = `${dateFormatted}T${formatTime(classData.end_time)}00`;

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
