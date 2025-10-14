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

      // Handle date properly to avoid timezone issues
      const dateStr = typeof c.date === 'string' 
        ? c.date.split('T')[0] 
        : new Date(c.date).toISOString().split('T')[0];
      
      const classDateTime = new Date(`${dateStr}T${c.start_time}`);

      const now = new Date();
      // Only include classes that haven't started yet
      const isUpcoming = classDateTime > now;
      
      // Detailed debugging for October 15th
      if (c.title.includes("Intro Weight Lifting") || dateStr.includes("2025-10-15")) {
        console.log(`🔍 DEBUG Oct 15 ClassesList: ${c.title}`);
        console.log(`   Raw date: ${c.date}`);
        console.log(`   Parsed dateStr: ${dateStr}`);
        console.log(`   Start time: ${c.start_time}`);
        console.log(`   Final classDateTime: ${classDateTime.toString()}`);
        console.log(`   Current time (now): ${now.toString()}`);
        console.log(`   classDateTime > now: ${classDateTime > now}`);
        console.log(`   Time difference (hours): ${(classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)}`);
        console.log(`   Result: ${isUpcoming ? "✅ WILL SHOW" : "❌ WILL HIDE"}`);
        console.log("   ---");
      }
      
      console.log(
        `📅 ClassesList: ${c.title} on ${dateStr} at ${c.start_time}: ${
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
