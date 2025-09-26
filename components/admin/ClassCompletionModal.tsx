import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaUsers,
  FaCheck,
  FaCalendarAlt,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

interface Attendee {
  booking_id: string;
  user_id: string;
  name?: string;
  email: string;
  status: string;
  completed_at?: string;
  booking_date: string;
  weightlifting_classes_remaining: number;
  weightlifting_classes_booked: number;
  classes_attended: number;
  user_booking_count: number;
}

interface ClassData {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  current_participants: number;
  max_participants: number;
}

interface ClassCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  onClassCompleted: () => void;
}

export default function ClassCompletionModal({
  isOpen,
  onClose,
  classId,
  onClassCompleted,
}: ClassCompletionModalProps) {
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [selectedAttendees, setSelectedAttendees] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch class attendees when modal opens
  useEffect(() => {
    if (isOpen && classId) {
      fetchClassAttendees();
    }
  }, [isOpen, classId]);

  const fetchClassAttendees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/class-attendees?class_id=${classId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch attendees");
      }

      setClassData(data.class);
      setAttendees(data.attendees);

      // Pre-select all confirmed attendees who haven't been completed yet
      const uncompletedBookings = data.attendees
        .filter((attendee: Attendee) => attendee.status === "confirmed")
        .map((attendee: Attendee) => attendee.booking_id);
      setSelectedAttendees(new Set(uncompletedBookings));
    } catch (error) {
      console.error("Error fetching attendees:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch attendees"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendeeToggle = (bookingId: string) => {
    const newSelected = new Set(selectedAttendees);
    if (newSelected.has(bookingId)) {
      newSelected.delete(bookingId);
    } else {
      newSelected.add(bookingId);
    }
    setSelectedAttendees(newSelected);
  };

  const handleSelectAll = () => {
    const uncompletedBookings = attendees
      .filter((attendee) => attendee.status === "confirmed")
      .map((attendee) => attendee.booking_id);
    setSelectedAttendees(new Set(uncompletedBookings));
  };

  const handleDeselectAll = () => {
    setSelectedAttendees(new Set());
  };

  const handleCompleteClass = async () => {
    if (selectedAttendees.size === 0) {
      setError("Please select at least one attendee to complete");
      return;
    }

    setIsCompleting(true);
    setError(null);

    try {
      const response = await fetch("/api/complete-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_id: classId,
          attendee_booking_ids: Array.from(selectedAttendees),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete class");
      }

      // Show success and refresh data
      await fetchClassAttendees();
      onClassCompleted();

      // Reset selected attendees
      setSelectedAttendees(new Set());
    } catch (error) {
      console.error("Error completing class:", error);
      setError(
        error instanceof Error ? error.message : "Failed to complete class"
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50 p-3 sm:p-4"
        style={{ alignItems: "flex-start", paddingTop: "15vh" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-royal-dark text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaUsers className="text-royal-light" />
              <div>
                <h2 className="text-xl font-bold">Complete Class</h2>
                {classData && (
                  <p className="text-royal-light text-sm">
                    {classData.title} • {formatDate(classData.date)} at{" "}
                    {formatTime(classData.start_time)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-royal-light hover:text-white transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-dark"></div>
                <span className="ml-3 text-gray-600">Loading attendees...</span>
              </div>
            ) : attendees.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FaUsers size={48} className="mx-auto mb-4 opacity-30" />
                <p>No attendees found for this class.</p>
              </div>
            ) : (
              <>
                {/* Bulk Actions */}
                <div className="mb-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    {attendees.length} total attendees •{" "}
                    {selectedAttendees.size} selected
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSelectAll}
                      className="px-3 py-1 text-sm bg-royal-dark text-white rounded hover:bg-royal-dark/90 transition-colors"
                    >
                      Select All Confirmed
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Attendees List */}
                <div className="space-y-2">
                  {attendees.map((attendee) => (
                    <div
                      key={attendee.booking_id}
                      className={`p-4 border rounded-lg transition-all ${
                        attendee.status === "completed"
                          ? "bg-green-50 border-green-200"
                          : selectedAttendees.has(attendee.booking_id)
                          ? "bg-royal-light/10 border-royal-dark"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {attendee.status !== "completed" && (
                            <input
                              type="checkbox"
                              checked={selectedAttendees.has(
                                attendee.booking_id
                              )}
                              onChange={() =>
                                handleAttendeeToggle(attendee.booking_id)
                              }
                              className="w-4 h-4 text-royal-dark bg-gray-100 border-gray-300 rounded focus:ring-royal-light focus:ring-2"
                            />
                          )}
                          {attendee.status === "completed" && (
                            <FaCheckCircle
                              className="text-green-500"
                              size={16}
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {attendee.name || attendee.email}
                              {attendee.user_booking_count > 1 && (
                                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  {attendee.user_booking_count} bookings
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {attendee.email} • {attendee.classes_attended}{" "}
                              classes attended
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-gray-900">
                            {attendee.weightlifting_classes_remaining} available
                            • {attendee.weightlifting_classes_booked} booked
                          </div>
                          <div className="text-gray-500 capitalize">
                            {attendee.status}
                            {attendee.completed_at && (
                              <span>
                                {" "}
                                •{" "}
                                {new Date(
                                  attendee.completed_at
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Completing a class will deduct 1 session from each selected
              attendee and increment their classes attended counter.
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteClass}
                disabled={selectedAttendees.size === 0 || isCompleting}
                className="px-4 py-2 bg-royal-dark text-white rounded-lg hover:bg-royal-dark/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isCompleting ? (
                  <>
                    <FaSpinner className="animate-spin" size={16} />
                    <span>Completing...</span>
                  </>
                ) : (
                  <>
                    <FaCheck size={16} />
                    <span>Complete Class ({selectedAttendees.size})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
