import { motion } from "framer-motion";
import { FaUsers, FaDumbbell, FaClock, FaCalendarAlt } from "react-icons/fa";

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

interface ClassStatsProps {
  classes: ClassData[];
}

export default function ClassStats({ classes }: ClassStatsProps) {
  const upcomingClasses = classes.filter((c) => new Date(c.date) >= new Date());
  const totalSpots = upcomingClasses.reduce(
    (sum, c) => sum + c.max_participants,
    0
  );
  const filledSpots = upcomingClasses.reduce(
    (sum, c) => sum + c.current_participants,
    0
  );
  const uniqueLocations = new Set(upcomingClasses.map((c) => c.location)).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="bg-black/40 backdrop-blur-lg rounded-lg p-4 border border-white/10">
          <div className="text-royal-light mb-2">
            <FaCalendarAlt size={20} />
          </div>
          <div className="text-2xl font-bold text-white">
            {upcomingClasses.length}
          </div>
          <div className="text-sm text-white/70">Upcoming Classes</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="bg-black/40 backdrop-blur-lg rounded-lg p-4 border border-white/10">
          <div className="text-royal-light mb-2">
            <FaUsers size={20} />
          </div>
          <div className="text-2xl font-bold text-white">
            {filledSpots}/{totalSpots}
          </div>
          <div className="text-sm text-white/70">Spots Filled</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="bg-black/40 backdrop-blur-lg rounded-lg p-4 border border-white/10">
          <div className="text-royal-light mb-2">📍</div>
          <div className="text-2xl font-bold text-white">{uniqueLocations}</div>
          <div className="text-sm text-white/70">Active Locations</div>
        </div>
      </motion.div>
    </div>
  );
}
