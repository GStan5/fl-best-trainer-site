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
  onClassSelect: (classItem: ClassData, element?: HTMLElement) => void;
}

export default function ClassesList({
  classes,
  onClassSelect,
}: ClassesListProps) {
  console.log("🔍 ClassesList: Processing classes:", classes.length);
  console.log("🔍 ClassesList: Raw classes data:", classes.map(c => ({
    title: c.title,
    date: c.date,
    dateType: typeof c.date,
    start_time: c.start_time,
    id: c.id
  })));
  const now = new Date();
  console.log("🕐 ClassesList: Current time:", now.toISOString());

  const upcomingClasses = classes
    .filter((c) => {
      // Must be active
      if (!c.is_active) {
        return false;
      }

      // Create full datetime for the class - using same approach as UpcomingClassesSection
      const classDate = new Date(c.date);
      const timeComponents = c.start_time.split(":");
      const classDateTime = new Date(classDate);
      classDateTime.setHours(
        parseInt(timeComponents[0]),
        parseInt(timeComponents[1]),
        0,
        0
      );

      // Only include classes that haven't started yet
      const isUpcoming = classDateTime > new Date();
      console.log(
        `📅 ClassesList: ${c.title} on ${classDate.toDateString()} at ${c.start_time}: ${
          isUpcoming ? "✅ upcoming" : "❌ past"
        }`
      );
      return isUpcoming;
    })
    .sort((a, b) => {
      // Sort chronologically by date, then time - same as UpcomingClassesSection
      if (a.date !== b.date) {
        return a.date.toString().localeCompare(b.date.toString());
      }
      return a.start_time.localeCompare(b.start_time);
    });

  console.log(
    "📊 ClassesList: Filtered to",
    upcomingClasses.length,
    "upcoming classes"
  );
  console.log("📊 ClassesList: Upcoming classes:", upcomingClasses.map(c => ({
    title: c.title,
    date: typeof c.date === "string" ? c.date : new Date(c.date).toISOString().split("T")[0],
    start_time: c.start_time,
    id: c.id
  })));

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
              onClick={(classItem, element) =>
                onClassSelect(classItem, element)
              }
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
