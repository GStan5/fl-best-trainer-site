import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import {
  FaTimes,
  FaClock,
  FaUsers,
  FaMapMarkerAlt,
  FaDumbbell,
  FaExclamationTriangle,
  FaCheck,
} from "react-icons/fa";
import StripeCheckoutButton, {
  PACKAGE_CONFIGS,
} from "../shared/StripeCheckoutButton";

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

interface ClassModalProps {
  classData: ClassData | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (classId: string, joinWaitlist?: boolean) => void;
  onCancelBooking?: (booking: any) => void;
  isBooking?: boolean;
  sessionsRemaining?: number;
  weightliftingClassesRemaining?: number;
  isAuthenticated?: boolean;
  source?: "calendar" | "upcoming";
  currentlyBooked?: number;
  weightliftingPackage?: any;
  isAlreadyBooked?: boolean;
  currentBookings?: any[];
}

export default function ClassModal({
  classData,
  isOpen,
  onClose,
  onBook,
  onCancelBooking,
  isBooking = false,
  sessionsRemaining = 0,
  weightliftingClassesRemaining = 0,
  isAuthenticated = false,
  source = "calendar",
  currentlyBooked = 0,
  weightliftingPackage,
  isAlreadyBooked = false,
  currentBookings = [],
}: ClassModalProps) {
  const [mounted, setMounted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [localCurrentParticipants, setLocalCurrentParticipants] = useState(
    classData?.current_participants || 0
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update local state when classData changes (e.g., modal opens with new class)
  useEffect(() => {
    if (classData) {
      setLocalCurrentParticipants(classData.current_participants);
    }
  }, [classData?.current_participants]);

  if (!classData || !mounted) return null;

  const totalSessions =
    (weightliftingClassesRemaining || 0) + (sessionsRemaining || 0);
  const hasNoSessions = totalSessions === 0;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour24 = parseInt(hours);
    const hour12 = hour24 % 12 || 12;
    const ampm = hour24 >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    // Manual date parsing to avoid timezone issues
    const dateStr = dateString.split("T")[0]; // Get "2025-10-07" from "2025-10-07T04:00:00.000Z"
    const [year, month, day] = dateStr.split("-").map(Number);
    // Create date in local timezone (month is 0-based)
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getClassTypeColor = (classType: string) => {
    switch (classType) {
      case "HIIT":
        return "from-red-500 to-red-600";
      case "Strength":
        return "from-blue-500 to-blue-600";
      case "Yoga":
        return "from-green-500 to-green-600";
      case "Cardio":
        return "from-orange-500 to-orange-600";
      default:
        return "from-purple-500 to-purple-600";
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "text-green-400";
      case "intermediate":
        return "text-yellow-400";
      case "advanced":
        return "text-red-400";
      default:
        return "text-blue-400";
    }
  };

  const handleBookClick = () => {
    if (isAlreadyBooked && currentBookings.length > 0) {
      setShowConfirmation(true);
    } else {
      // Let the parent component handle capacity updates via data refresh
      onBook(classData.id, false);
    }
  };

  const handleConfirmBooking = () => {
    setShowConfirmation(false);
    // Let the parent component handle capacity updates via data refresh
    onBook(classData.id, false);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleWaitlistJoin = () => {
    // Note: Waitlist doesn't affect current participants count
    onBook(classData.id, true);
  };

  const handleCancelBooking = () => {
    if (onCancelBooking && currentBookings.length > 0) {
      onCancelBooking(currentBookings[0]); // Cancel the first booking for this class
    }
  };

  const spotsRemaining = classData.max_participants - localCurrentParticipants;
  const isFull = spotsRemaining <= 0;
  const isAlmostFull = spotsRemaining <= 2 && spotsRemaining > 0;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999999]"
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999999,
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 20 }}
            className={`bg-gradient-to-br from-navy to-black border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 w-[calc(100vw-1rem)] md:w-auto ${
              source === "upcoming"
                ? "max-w-xs sm:max-w-lg md:max-w-3xl lg:max-w-4xl"
                : "max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl"
            } max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getClassTypeColor(
                    classData.class_type
                  )} mb-3`}
                >
                  {classData.class_type}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {classData.title}
                </h2>
                <p className="text-white/80 text-lg">
                  with {classData.instructor}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <FaTimes />
              </motion.button>
            </div>

            {/* Booking Section - Top Priority */}
            <div className="bg-gradient-to-r from-royal/20 to-royal-light/20 border border-royal/30 rounded-lg p-4 mb-6">
              {/* Account Status Info */}
              {isAuthenticated && !hasNoSessions && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-white/80">
                      Sessions remaining:{" "}
                      <span className="text-green-400 font-medium">
                        {totalSessions}
                      </span>
                    </span>
                    <span className="text-white/80">
                      Currently booked:{" "}
                      <span className="text-blue-400 font-medium">
                        {currentlyBooked}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* Primary Book Button */}
              <div className="flex justify-center mb-4">
                {!isAuthenticated ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => (window.location.href = "/auth/signin")}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-royal to-royal-light text-white rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-royal/20"
                  >
                    Sign In to Book
                  </motion.button>
                ) : hasNoSessions ? (
                  <StripeCheckoutButton
                    package={
                      weightliftingPackage ||
                      PACKAGE_CONFIGS.find(
                        (pkg) => pkg.id === "weightlifting-10-class"
                      )!
                    }
                    className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-emerald/20 flex items-center justify-center space-x-2"
                    onSuccess={() => {
                      setTimeout(() => window.location.reload(), 2000);
                    }}
                    onError={(error) => {
                      console.error("Payment error:", error);
                    }}
                  >
                    <FaDumbbell className="w-4 h-4" />
                    <span>
                      Purchase Sessions - $
                      {weightliftingPackage?.price ||
                        PACKAGE_CONFIGS.find(
                          (pkg) => pkg.id === "weightlifting-10-class"
                        )?.price ||
                        400}
                    </span>
                  </StripeCheckoutButton>
                ) : (
                  <div className="flex flex-col w-full sm:w-auto gap-2">
                    {/* Show cancel button if already booked */}
                    {isAlreadyBooked && currentBookings.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCancelBooking}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                      >
                        <FaTimes className="w-4 h-4" />
                        <span>Cancel Booking</span>
                      </motion.button>
                    )}

                    {/* Main booking button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBookClick}
                      disabled={isBooking}
                      className={`px-8 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                        isBooking
                          ? "bg-royal-light/50 text-white cursor-wait"
                          : isFull
                          ? "bg-gray-600 text-gray-400"
                          : isAlreadyBooked
                          ? "bg-amber-600 hover:bg-amber-700 text-white hover:shadow-lg hover:shadow-amber/20"
                          : "bg-gradient-to-r from-royal to-royal-light text-white hover:shadow-lg hover:shadow-royal/20"
                      }`}
                    >
                      {isBooking ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          <span>Booking...</span>
                        </>
                      ) : isFull ? (
                        <>
                          <FaExclamationTriangle className="w-4 h-4" />
                          <span>Class Full</span>
                        </>
                      ) : isAlreadyBooked ? (
                        <>
                          <FaCheck className="w-4 h-4" />
                          <span>
                            Book Again ({currentBookings.length} booked)
                          </span>
                        </>
                      ) : (
                        <>
                          <FaCheck className="w-4 h-4" />
                          <span>Book This Class</span>
                        </>
                      )}
                    </motion.button>

                    {/* Waitlist button (only show when class is full) */}
                    {isFull && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleWaitlistJoin}
                        disabled={isBooking}
                        className={`px-8 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                          isBooking
                            ? "bg-amber-500/50 text-white cursor-wait"
                            : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber/20"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Join Waitlist</span>
                      </motion.button>
                    )}
                  </div>
                )}
              </div>

              {/* Class Capacity - Below Book Button */}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">Class Capacity</span>
                  <span className="text-white font-medium">
                    {localCurrentParticipants}/{classData.max_participants}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isFull
                        ? "bg-red-500"
                        : isAlmostFull
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${
                        (localCurrentParticipants /
                          classData.max_participants) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <div className="mt-1">
                  <span
                    className={`text-xs ${
                      isFull
                        ? "text-red-400"
                        : isAlmostFull
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  >
                    {isFull
                      ? "Class Full"
                      : isAlmostFull
                      ? `Only ${spotsRemaining} spots left!`
                      : `${spotsRemaining} spots available`}
                  </span>
                </div>
              </div>
            </div>

            {/* Class Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Date & Time */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center text-royal-light mb-2">
                  <FaClock className="mr-2" />
                  <span className="font-medium">Date & Time</span>
                </div>
                <div className="text-white">
                  <div className="font-medium">
                    {formatDate(classData.date)}
                  </div>
                  <div className="text-white/80">
                    {formatTime(classData.start_time)} -{" "}
                    {formatTime(classData.end_time)}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center text-royal-light mb-2">
                  <FaMapMarkerAlt className="mr-2" />
                  <span className="font-medium">Location</span>
                </div>
                <div className="text-white">{classData.location}</div>
              </div>

              {/* Capacity */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center text-royal-light mb-2">
                  <FaUsers className="mr-2" />
                  <span className="font-medium">Capacity</span>
                </div>
                <div className="text-white">
                  <div className="flex items-center space-x-2">
                    <span>
                      {localCurrentParticipants} / {classData.max_participants}
                    </span>
                    {isFull && (
                      <FaExclamationTriangle className="text-red-400" />
                    )}
                  </div>
                  <div
                    className={`text-sm ${
                      isFull
                        ? "text-red-400"
                        : isAlmostFull
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  >
                    {isFull
                      ? "Class Full"
                      : isAlmostFull
                      ? `Only ${spotsRemaining} spots left!`
                      : `${spotsRemaining} spots available`}
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center text-royal-light mb-2">
                  <FaDumbbell className="mr-2" />
                  <span className="font-medium">Difficulty</span>
                </div>
                <div
                  className={`font-medium ${getDifficultyColor(
                    classData.difficulty_level
                  )}`}
                >
                  {classData.difficulty_level}
                </div>
              </div>
            </div>

            {/* Description */}
            {classData.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  About This Class
                </h3>
                <p className="text-white/80 leading-relaxed">
                  {classData.description}
                </p>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </motion.button>
            </div>

            {/* Note */}
            <div className="mt-4 p-3 bg-royal/10 border border-royal/20 rounded-lg">
              <p className="text-xs text-white/70 text-center">
                {!isAuthenticated ? (
                  <>
                    📝 Note: You'll need to log in and have an active package to
                    book classes
                  </>
                ) : hasNoSessions ? (
                  <>
                    ⚠️ No sessions remaining - Purchase a package to book
                    classes
                  </>
                ) : isFull ? (
                  <>
                    🕐 This class is full, but you can join the waitlist! You'll
                    be automatically enrolled if someone cancels.
                  </>
                ) : (
                  <>
                    ✅ You have {totalSessions} session
                    {totalSessions !== 1 ? "s" : ""} remaining
                  </>
                )}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Confirmation Modal for duplicate bookings
  const confirmationModal = (
    <AnimatePresence>
      {showConfirmation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999999]"
          onClick={handleCancelConfirmation}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000000,
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-gradient-to-br from-navy to-black border border-white/20 rounded-xl p-6 w-[calc(100vw-2rem)] max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mb-4">
                <FaExclamationTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Already Booked
                </h3>
                <p className="text-white/80">
                  You already have {currentBookings.length} booking
                  {currentBookings.length !== 1 ? "s" : ""} for this class. Do
                  you want to book again?
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancelConfirmation}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmBooking}
                  className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-all"
                >
                  Book Again
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {createPortal(modalContent, document.body)}
      {createPortal(confirmationModal, document.body)}
    </>
  );
}
