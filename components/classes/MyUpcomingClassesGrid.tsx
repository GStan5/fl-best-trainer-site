import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

interface Booking {
  id: string;
  class_title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  instructor: string;
  status?: string;
  class_id: string;
}

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

interface MyUpcomingClassesGridProps {
  bookings: Booking[];
  classes: ClassData[];
  onClassSelect: (classData: ClassData, element?: HTMLElement) => void;
  onCancelBooking: (booking: Booking, element?: HTMLElement) => void;
  cancellingBooking: string | null;
}

export default function MyUpcomingClassesGrid({
  bookings,
  classes,
  onClassSelect,
  onCancelBooking,
  cancellingBooking,
}: MyUpcomingClassesGridProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [previousBookingsLength, setPreviousBookingsLength] = useState(
    bookings.length
  );
  const bookingsPerPage = 6;

  // Calculate pagination
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);
  const startIndex = currentPage * bookingsPerPage;
  const endIndex = startIndex + bookingsPerPage;
  const currentPageBookings = bookings.slice(startIndex, endIndex);

  // Handle page adjustments when bookings change
  useEffect(() => {
    const bookingsChanged = bookings.length !== previousBookingsLength;

    if (bookingsChanged) {
      // If bookings decreased (likely due to cancellation), try to stay on the same page
      if (bookings.length < previousBookingsLength) {
        // If current page is now out of bounds, go to the last valid page
        if (totalPages > 0 && currentPage >= totalPages) {
          setCurrentPage(Math.max(0, totalPages - 1));
        }
        // Otherwise, stay on the same page to maintain context
      }

      setPreviousBookingsLength(bookings.length);
    }
  }, [bookings.length, totalPages, currentPage, previousBookingsLength]);

  const handlePrevPage = () => {
    setCurrentPage(Math.max(0, currentPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(Math.min(totalPages - 1, currentPage + 1));
  };

  const handleBookingClick = (booking: Booking) => {
    // Find the real class data from the classes array
    const realClassData = classes.find((cls) => cls.id === booking.class_id);

    if (realClassData) {
      // Use the real class data which has all the correct information
      onClassSelect(realClassData);
    } else {
      // Fallback: convert booking to ClassData format (shouldn't happen normally)
      const classData: ClassData = {
        id: booking.class_id,
        title: booking.class_title,
        description: "", // Not available in booking
        instructor: booking.instructor,
        date: booking.date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        max_participants: 0, // Not available in booking
        current_participants: 0, // Not available in booking
        location: booking.location,
        class_type: "", // Not available in booking
        difficulty_level: "", // Not available in booking
        equipment_needed: "", // Not available in booking
        is_active: true,
      };
      onClassSelect(classData);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="bg-white/5 rounded-full p-4 sm:p-6 w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 flex items-center justify-center">
          <FaCalendarAlt className="text-white/40 text-xl sm:text-2xl" />
        </div>
        <h4 className="text-white font-semibold text-lg sm:text-xl mb-2">
          No upcoming classes
        </h4>
        <p className="text-white/70 text-sm sm:text-base mb-4 px-4">
          You haven't signed up for any classes yet
        </p>
        <div className="bg-royal-light/15 rounded-lg p-3 sm:p-4 max-w-sm mx-auto">
          <p className="text-royal-light font-medium text-sm sm:text-base">
            💡 Browse classes below to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid of booking cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {currentPageBookings.map((booking, index) => (
            <motion.div
              key={booking.id} // Use stable booking ID as key
              layout // Enable layout animations for smooth repositioning
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.2,
                layout: { duration: 0.3 },
              }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-royal-light/40 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer group"
              onClick={() => handleBookingClick(booking)}
            >
              {/* Header with Title and Status */}
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-white font-bold text-lg leading-tight group-hover:text-royal-light transition-colors">
                  {booking.class_title}
                </h4>
                <div className="ml-2">
                  {booking.status === "waitlist" && (
                    <div className="bg-amber-500/20 border border-amber-400/50 px-2 py-1 rounded-full flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                      <span className="text-amber-300 text-xs font-semibold uppercase tracking-wide">
                        Waitlist
                      </span>
                    </div>
                  )}
                  {booking.status === "confirmed" && (
                    <div className="bg-green-500/20 border border-green-400/50 px-2 py-1 rounded-full flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span className="text-green-300 text-xs font-semibold uppercase tracking-wide">
                        Confirmed
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Waitlist Alert */}
              {booking.status === "waitlist" && (
                <div className="bg-amber-900/30 border border-amber-400/30 px-3 py-2 rounded-lg mb-3">
                  <p className="text-amber-200 text-sm">
                    ⏳ On waitlist - you'll be automatically enrolled if a spot
                    opens up
                  </p>
                </div>
              )}

              {/* Date and Time */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-royal-light rounded-full"></div>
                  <span className="text-royal-light font-semibold text-sm">
                    {new Date(booking.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-white/90 font-medium text-sm">
                    {new Date(
                      `2000-01-01 ${booking.start_time}`
                    ).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}{" "}
                    -{" "}
                    {new Date(
                      `2000-01-01 ${booking.end_time}`
                    ).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-purple-300 font-medium text-sm truncate">
                    {booking.location}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span className="text-white/70 text-sm">
                    with {booking.instructor}
                  </span>
                </div>
              </div>

              {/* Cancel Button */}
              <div className="flex justify-end">
                {cancellingBooking === booking.id ? (
                  <div className="flex items-center bg-red-500/20 px-3 py-2 rounded-lg border border-red-500/30">
                    <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-red-300 text-xs font-medium">
                      Cancelling...
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelBooking(booking, e.currentTarget);
                    }}
                    className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-semibold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg touch-manipulation"
                    title="Cancel this booking"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className={`p-2 rounded-lg transition-all duration-200 ${
              currentPage === 0
                ? "bg-white/5 text-white/30 cursor-not-allowed"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <FaChevronLeft className="w-4 h-4" />
          </motion.button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentPage(i)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                  currentPage === i
                    ? "bg-royal-light text-royal-dark"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                {i + 1}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className={`p-2 rounded-lg transition-all duration-200 ${
              currentPage === totalPages - 1
                ? "bg-white/5 text-white/30 cursor-not-allowed"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <FaChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      {/* Show count */}
      <div className="text-center mt-4">
        <p className="text-white/60 text-sm">
          Showing {startIndex + 1}-{Math.min(endIndex, bookings.length)} of{" "}
          {bookings.length} upcoming classes
        </p>
      </div>
    </div>
  );
}
