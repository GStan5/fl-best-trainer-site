import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
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

interface UpcomingClassesSectionProps {
  classes: ClassData[];
  onClassSelect: (classItem: ClassData, element?: HTMLElement) => void;
}

export default function UpcomingClassesSection({
  classes,
  onClassSelect,
}: UpcomingClassesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Start open by default
  const [currentPage, setCurrentPage] = useState(0);
  const classesPerPage = 6;

  // Filter and sort upcoming classes
  const getUpcomingClasses = () => {
    const now = new Date();

    const upcomingClasses = classes.filter((classItem) => {
      // Must be active
      if (!classItem.is_active) {
        return false;
      }

      // Handle date properly to avoid timezone issues
      const dateStr =
        typeof classItem.date === "string"
          ? classItem.date.split("T")[0]
          : new Date(classItem.date).toISOString().split("T")[0];

      const classDateTime = new Date(`${dateStr}T${classItem.start_time}`);

      const isUpcoming = classDateTime > now;

      // Only include classes that haven't started yet
      return isUpcoming;
    });

    // Sort chronologically by date, then time
    const sortedClasses = upcomingClasses.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.start_time.localeCompare(b.start_time);
    });

    return sortedClasses;
  };

  const upcomingClasses = getUpcomingClasses();

  // Calculate pagination
  const totalPages = Math.ceil(upcomingClasses.length / classesPerPage);
  const startIndex = currentPage * classesPerPage;
  const endIndex = startIndex + classesPerPage;
  const currentPageClasses = upcomingClasses.slice(startIndex, endIndex);

  // Reset to first page when expanding or when current page is out of bounds
  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
    setCurrentPage(0);
  };

  const handlePrevPage = () => {
    setCurrentPage(Math.max(0, currentPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(Math.min(totalPages - 1, currentPage + 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="mt-8 sm:mt-12 md:mt-16"
    >
      {/* Main Container */}
      <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
        {/* Header with toggle */}
        <button
          className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-white/5 transition-all duration-300 touch-manipulation"
          onClick={handleToggleExpanded}
        >
          <div className="flex items-center">
            <FaCalendarAlt className="text-lg sm:text-2xl text-royal-light mr-2 sm:mr-3" />
            <h2 className="text-lg sm:text-2xl font-bold text-white">
              Upcoming Classes
            </h2>
            <span className="ml-2 sm:ml-3 text-royal-light text-xs sm:text-sm font-medium bg-royal-light/10 px-2 sm:px-3 py-1 rounded-full">
              {upcomingClasses.length} classes
            </span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-white/60 hover:text-white"
          >
            <FaChevronDown className="text-lg sm:text-xl" />
          </motion.div>
        </button>

        {/* Classes dropdown content with animation */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="overflow-hidden border-t border-white/10"
            >
              {upcomingClasses.length === 0 ? (
                <div className="text-center py-8 sm:py-12 px-4 sm:px-6">
                  <div className="text-white/60 text-base sm:text-lg">
                    No upcoming classes found.
                  </div>
                  <div className="text-white/40 text-sm mt-2">
                    Check back later for new classes!
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900/30">
                  {/* Pagination Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gray-800/30 border-b border-white/5 gap-2 sm:gap-0">
                    <div className="text-white/60 text-xs sm:text-sm">
                      Showing {startIndex + 1}-
                      {Math.min(endIndex, upcomingClasses.length)} of{" "}
                      {upcomingClasses.length} classes
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                          onClick={handlePrevPage}
                          disabled={currentPage === 0}
                          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-royal-light/20 text-royal-light hover:bg-royal-light hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 touch-manipulation"
                        >
                          <FaChevronLeft className="text-xs sm:text-sm" />
                          <span className="text-xs sm:text-sm font-medium">
                            Previous
                          </span>
                        </button>

                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <span className="text-white/60 text-xs sm:text-sm">
                            Page
                          </span>
                          <span className="text-royal-light font-semibold bg-royal-light/20 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm">
                            {currentPage + 1}
                          </span>
                          <span className="text-white/60 text-xs sm:text-sm">
                            of {totalPages}
                          </span>
                        </div>

                        <button
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages - 1}
                          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-royal-light/20 text-royal-light hover:bg-royal-light hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 touch-manipulation"
                        >
                          <span className="text-xs sm:text-sm font-medium">
                            Next
                          </span>
                          <FaChevronRight className="text-xs sm:text-sm" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Classes Grid Container */}
                  <div className="p-4 sm:p-6">
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {currentPageClasses.map((classItem, index) => (
                        <motion.div
                          key={classItem.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <ClassCard
                            classItem={classItem}
                            onClick={(classItem, element) =>
                              onClassSelect(classItem, element)
                            }
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
