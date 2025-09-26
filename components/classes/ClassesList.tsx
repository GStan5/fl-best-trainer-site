import { motion } from "framer-motion";
import { FaCalendarAlt } from "react-icons/fa";
import ClassCard from "./ClassCard";

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

interface ClassesListProps {
  classes: ClassData[];
  onClassSelect: (classItem: ClassData) => void;
}

export default function ClassesList({
  classes,
  onClassSelect,
}: ClassesListProps) {
  console.log("🔍 ClassesList: Processing classes:", classes.length);
  const now = new Date();
  console.log("🕐 ClassesList: Current time:", now.toISOString());

  const upcomingClasses = classes
    .filter((c) => {
      // Include time in the comparison, not just date
      const classDateTime = new Date(`${c.date}T${c.start_time}`);
      const isUpcoming = classDateTime > new Date();
      console.log(
        `📅 ClassesList: ${c.title} on ${c.date} at ${c.start_time}: ${
          isUpcoming ? "✅ upcoming" : "❌ past"
        }`
      );
      return isUpcoming;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.start_time}`);
      const dateB = new Date(`${b.date}T${b.start_time}`);
      return dateA.getTime() - dateB.getTime();
    });

  console.log(
    "📊 ClassesList: Filtered to",
    upcomingClasses.length,
    "upcoming classes"
  );

  const classesToShow = upcomingClasses.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="mt-16"
    >
      <div className="flex items-center mb-8">
        <FaCalendarAlt className="text-2xl text-royal-light mr-3" />
        <h2 className="text-2xl font-bold text-white">Upcoming Classes</h2>
      </div>

      {classesToShow.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-white/60 text-lg">
            No upcoming classes found.
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classesToShow.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              onClick={() => onClassSelect(classItem)}
            />
          ))}
        </div>
      )}

      {upcomingClasses.length > 6 && (
        <div className="text-center mt-8">
          <p className="text-white/60">
            Showing {classesToShow.length} of {upcomingClasses.length} upcoming
            classes
          </p>
        </div>
      )}
    </motion.div>
  );
}
