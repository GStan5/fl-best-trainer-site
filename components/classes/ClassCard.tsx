import { motion } from "framer-motion";
import { FaUsers } from "react-icons/fa";

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

interface ClassCardProps {
  classItem: ClassData;
  onClick: (classItem: ClassData, element?: HTMLElement) => void;
}

// Function to get color scheme based on location
const getLocationColors = (location: string) => {
  const locationLower = location.toLowerCase();

  if (
    locationLower.includes("fl best trainer studio") ||
    locationLower.includes("studio")
  ) {
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  } else if (
    locationLower.includes("bayfront") ||
    locationLower.includes("park")
  ) {
    return "bg-blue-500/20 text-blue-300 border-blue-500/30";
  } else if (
    locationLower.includes("home") ||
    locationLower.includes("client")
  ) {
    return "bg-purple-500/20 text-purple-300 border-purple-500/30";
  } else if (
    locationLower.includes("gym") ||
    locationLower.includes("fitness")
  ) {
    return "bg-orange-500/20 text-orange-300 border-orange-500/30";
  } else {
    return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
};

// Function to get abbreviated location name
const getLocationAbbrev = (location: string) => {
  if (location.includes("FL Best Trainer Studio")) return "Studio";
  if (location.includes("Bayfront Park")) return "Bayfront";
  if (location.includes("Client")) return "Client Home";
  return location.length > 15 ? location.substring(0, 15) + "..." : location;
};

export default function ClassCard({ classItem, onClick }: ClassCardProps) {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick(classItem, event.currentTarget);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-black/40 backdrop-blur-lg rounded-lg p-3 sm:p-4 border border-white/10 cursor-pointer touch-manipulation"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-2 sm:mb-3">
        <h4 className="font-medium text-white text-sm sm:text-base leading-tight pr-2">
          {classItem.title}
        </h4>
      </div>

      {/* Location Badge - More Prominent */}
      <div className="mb-2 sm:mb-3">
        <span
          className={`inline-flex items-center text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium border ${getLocationColors(
            classItem.location
          )}`}
        >
          📍 {getLocationAbbrev(classItem.location)}
        </span>
      </div>

      {/* Time and Participant Info */}
      <div className="flex justify-between items-center text-xs sm:text-sm text-white/70 mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-medium">
            {classItem.start_time.slice(0, 5)} -{" "}
            {classItem.end_time.slice(0, 5)}
          </span>
        </div>
        <div className="flex items-center bg-white/10 px-2 py-1 rounded-full">
          <FaUsers className="mr-1 sm:mr-1.5 text-white/60 text-xs" />
          <span className="font-medium text-white text-xs sm:text-sm">
            {classItem.current_participants}/{classItem.max_participants}
          </span>
        </div>
      </div>

      {/* Date and Class Type */}
      <div className="flex justify-between items-center text-xs text-white/60">
        <span className="font-medium">
          {new Date(classItem.date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="text-white/50 text-xs">{classItem.class_type}</span>
      </div>
    </motion.div>
  );
}
