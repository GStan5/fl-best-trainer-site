import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaDollarSign,
  FaInfo,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaUserMinus,
  FaDumbbell,
  FaExclamationTriangle,
  FaCheck,
  FaHeart,
  FaStar,
  FaSave,
  FaSearch,
} from "react-icons/fa";

interface Class {
  id?: string;
  title: string;
  description: string;
  instructor: string;
  date: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants?: number;
  location: string;
  class_type: string;
  difficulty_level?: string;
  equipment_needed?: string;
  prerequisites?: string;
  price_per_session?: number;
  is_active?: boolean;
  is_recurring?: boolean;
  recurring_days?: string[];
  class_goals?: string;
  intensity_level?: string;
  waitlist_enabled?: boolean;
  waitlist_capacity?: number;
  auto_confirm_booking?: boolean;
  cancellation_deadline_hours?: number;
  safety_requirements?: string;
  age_restrictions?: string;
  modifications_available?: string;
  credits_required?: number;
  duration_minutes?: number;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  booking_id?: string;
  status?: string;
  booking_date?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface UpgradedClassDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: Class | null;
  onAddParticipant?: (classId: string, userId: string) => void;
  onRemoveParticipant?: (classId: string, userId: string) => void;
  onEditClass?: (classData: Class) => void;
  onDeleteClass?: (classId: string) => void;
  isAdmin?: boolean;
  showBookingActions?: boolean;
  currentUserBooked?: boolean;
  onRefreshData?: () => void;
}

export default function UpgradedClassDetailsModal({
  classData,
  isOpen,
  onClose,
  onAddParticipant,
  onRemoveParticipant,
  onEditClass,
  onDeleteClass,
  isAdmin = false,
  showBookingActions = false,
  currentUserBooked = false,
  onRefreshData,
}: UpgradedClassDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedClass, setEditedClass] = useState<Class | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Prevent scroll on iOS
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.width = "unset";
    }

    // Clean up on unmount
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.position = "unset";
      document.body.style.width = "unset";
    };
  }, [isOpen]);

  // Initialize edited class data when modal opens
  useEffect(() => {
    if (classData && isOpen) {
      setEditedClass({ ...classData });
      loadParticipants();
    }
  }, [classData, isOpen]);

  // Load participants for the class
  const loadParticipants = async () => {
    if (!classData?.id) return;

    setIsLoadingParticipants(true);
    try {
      const response = await fetch(`/api/classes/${classData.id}/participants`);
      if (response.ok) {
        const result = await response.json();
        console.log("Participants API response:", result); // Debug log
        if (result.success && result.data) {
          // Map the API response to our participant interface
          const mappedParticipants = result.data.map((p: any) => ({
            id: p.user_id,
            name: p.name,
            email: p.email,
            booking_id: p.booking_id,
            status: p.status,
            booking_date: p.booking_date,
          }));
          setParticipants(mappedParticipants);
        } else {
          setParticipants([]);
        }
      } else {
        console.error("Failed to fetch participants:", response.status);
        setParticipants([]);
      }
    } catch (error) {
      console.error("Error loading participants:", error);
      setParticipants([]);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  // Search for users to add as participants
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle adding a participant
  const handleAddParticipant = async (user: User) => {
    if (!classData?.id) return;

    try {
      const response = await fetch(
        `/api/classes/${classData.id}/participants`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, isAdminOverride: true }),
        }
      );

      if (response.ok) {
        setParticipants((prev) => [
          ...prev,
          {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        ]);
        setSearchQuery("");
        setSearchResults([]);
        // Update class participant count
        if (editedClass) {
          setEditedClass({
            ...editedClass,
            current_participants: (editedClass.current_participants || 0) + 1,
          });
        }
        // Refresh parent component data
        if (onRefreshData) {
          onRefreshData();
        }
      }
    } catch (error) {
      console.error("Error adding participant:", error);
    }
  };

  // Handle removing a participant
  const handleRemoveParticipant = async (participant: Participant) => {
    if (!classData?.id) return;

    console.log("Removing participant:", {
      participant,
      classId: classData.id,
    });

    try {
      const response = await fetch(
        `/api/classes/${classData.id}/participants`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: participant.id }),
        }
      );

      console.log("Remove API Response status:", response.status);
      const responseData = await response.json();
      console.log("Remove API Response data:", responseData);

      if (response.ok) {
        // Reload participants to get the updated list
        loadParticipants();
        // Update class participant count
        if (editedClass) {
          setEditedClass({
            ...editedClass,
            current_participants: Math.max(
              0,
              (editedClass.current_participants || 0) - 1
            ),
          });
        }
        // Refresh parent component data
        if (onRefreshData) {
          onRefreshData();
        }
        alert("Participant removed successfully!");
      } else {
        alert(
          `Failed to remove participant: ${
            responseData.error || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error removing participant:", error);
      alert("Error removing participant. Please try again.");
    }
  };

  // Handle saving class changes
  const handleSaveClass = async () => {
    if (!editedClass?.id) return;

    try {
      const response = await fetch("/api/classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedClass),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && onEditClass) {
          onEditClass(result.data);
        }
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving class:", error);
    }
  };

  // Handle adding participant by user selection
  const handleAddUser = async (user: User) => {
    if (!classData?.id) return;

    console.log("Adding participant:", { user, classId: classData.id });

    try {
      const response = await fetch(
        `/api/classes/${classData.id}/participants`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            isAdminOverride: true,
          }),
        }
      );

      console.log("API Response status:", response.status);
      const responseData = await response.json();
      console.log("API Response data:", responseData);

      if (response.ok) {
        // Reload participants to show the updated list
        loadParticipants();
        setSearchQuery("");
        setShowUserDropdown(false);
        // Update class participant count
        if (editedClass) {
          setEditedClass({
            ...editedClass,
            current_participants: (editedClass.current_participants || 0) + 1,
          });
        }
        alert("Participant added successfully!");
      } else {
        alert(
          `Failed to add participant: ${
            responseData.error || "User not found or already enrolled"
          }`
        );
      }
    } catch (error) {
      console.error("Error adding participant:", error);
      alert("Error adding participant. Please try again.");
    }
  };

  // Handle direct participant addition by email (fallback)
  const handleDirectAdd = async () => {
    if (!searchQuery.trim() || !classData?.id) return;

    console.log("Adding participant by email:", {
      email: searchQuery.trim(),
      classId: classData.id,
    });

    try {
      const response = await fetch(
        `/api/classes/${classData.id}/participants`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: searchQuery.trim().toLowerCase(),
            isAdminOverride: true,
          }),
        }
      );

      console.log("API Response status:", response.status);
      const responseData = await response.json();
      console.log("API Response data:", responseData);

      if (response.ok) {
        loadParticipants();
        setSearchQuery("");
        setShowUserDropdown(false);
        if (editedClass) {
          setEditedClass({
            ...editedClass,
            current_participants: (editedClass.current_participants || 0) + 1,
          });
        }
        alert("Participant added successfully!");
      } else {
        alert(
          `Failed to add participant: ${
            responseData.error || "User not found or already enrolled"
          }`
        );
      }
    } catch (error) {
      console.error("Error adding participant:", error);
      alert("Error adding participant. Please try again.");
    }
  };

  // Load all users for searching
  const loadAvailableUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  // Filter users based on search query
  const filteredUsers = availableUsers.filter(
    (user) =>
      searchQuery.length > 0 &&
      (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Load available users when modal opens
  useEffect(() => {
    if (isOpen && isAdmin) {
      loadAvailableUsers();
    }
  }, [isOpen, isAdmin]);

  // Show/hide dropdown based on search query
  useEffect(() => {
    setShowUserDropdown(searchQuery.length > 0 && filteredUsers.length > 0);
  }, [searchQuery, filteredUsers]);

  if (!isOpen || !classData || !editedClass) return null;

  const currentParticipants = classData.current_participants || 0;
  const pricePerSession = Number(classData.price_per_session) || 0;

  // Parse date safely to avoid timezone issues
  const formatDate = (dateString: string) => {
    const dateStr = dateString.split("T")[0]; // Get "2025-10-09"
    const [year, month, day] = dateStr.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    const dateStr = dateString.split("T")[0];
    const [year, month, day] = dateStr.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getLocationColorClass = (location: string) => {
    const loc = location ? location.toLowerCase() : "";
    switch (loc) {
      case "gym":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "studio":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "outdoor":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "pool":
        return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
      default:
        return "text-slate-300 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    const level = difficulty ? difficulty.toLowerCase() : "";
    switch (level) {
      case "beginner":
        return "bg-green-500 text-white";
      case "intermediate":
        return "bg-yellow-500 text-black";
      case "advanced":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getIntensityStars = (intensity?: string | null) => {
    const level =
      intensity && typeof intensity === "string" ? intensity.toLowerCase() : "";
    const starCount =
      level === "low" ? 1 : level === "medium" ? 2 : level === "high" ? 3 : 0;
    return Array.from({ length: 3 }, (_, i) => (
      <FaStar
        key={i}
        className={i < starCount ? "text-yellow-400" : "text-gray-600"}
      />
    ));
  };

  const capacityPercentage = Math.min(
    (currentParticipants / classData.max_participants) * 100,
    100
  );
  const isFullyBooked = currentParticipants >= classData.max_participants;
  const isAlmostFull = capacityPercentage >= 80;

  // Don't render on server side or before component is mounted
  if (!isMounted || typeof window === "undefined") {
    return null;
  }

  // Debug logging for mobile
  if (isOpen) {
    console.log("Modal opening", {
      isMobile: window.innerWidth <= 768,
      classData: classData?.id,
      isMounted,
      windowWidth: window.innerWidth,
    });
  }

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
          onTouchStart={(e) => {
            if (e.target === e.currentTarget) {
              e.preventDefault();
            }
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-white/10 mx-4 sm:mx-0"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "calc(100vw - 2rem)",
              maxHeight: "calc(100vh - 2rem)",
            }}
          >
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6 relative">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedClass.title}
                        onChange={(e) =>
                          setEditedClass({
                            ...editedClass,
                            title: e.target.value,
                          })
                        }
                        className="text-2xl font-bold bg-white/20 text-white placeholder-white/70 border border-white/30 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-white">
                        {editedClass.title}
                      </h2>
                    )}
                    {editedClass.difficulty_level && (
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(
                          editedClass.difficulty_level
                        )}`}
                      >
                        {editedClass.difficulty_level}
                      </span>
                    )}
                    {editedClass.is_recurring && (
                      <span className="px-3 py-1 text-xs bg-purple-500 text-white rounded-full font-semibold">
                        Recurring
                      </span>
                    )}
                    {currentUserBooked && (
                      <span className="px-3 py-1 text-xs bg-green-500 text-white rounded-full font-semibold flex items-center gap-1">
                        <FaCheck className="text-xs" />
                        Booked
                      </span>
                    )}
                    {isAdmin && (
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSaveClass}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm flex items-center gap-1 transition-colors"
                            >
                              <FaSave />
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setIsEditing(false);
                                setEditedClass({ ...classData });
                              }}
                              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm flex items-center gap-1 transition-colors"
                          >
                            <FaEdit />
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-100/80">with</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedClass.instructor}
                        onChange={(e) =>
                          setEditedClass({
                            ...editedClass,
                            instructor: e.target.value,
                          })
                        }
                        className="text-lg bg-white/20 text-blue-100 placeholder-blue-100/70 border border-white/30 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                    ) : (
                      <span className="text-blue-100 text-lg">
                        {editedClass.instructor}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-blue-100/80 text-sm">
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt />
                      {isEditing ? (
                        <input
                          type="date"
                          value={editedClass.date.split("T")[0]}
                          onChange={(e) =>
                            setEditedClass({
                              ...editedClass,
                              date: e.target.value,
                            })
                          }
                          className="bg-white/20 text-blue-100 border border-white/30 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                      ) : (
                        formatShortDate(editedClass.date)
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <FaClock />
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            value={editedClass.start_time}
                            onChange={(e) =>
                              setEditedClass({
                                ...editedClass,
                                start_time: e.target.value,
                              })
                            }
                            className="bg-white/20 text-blue-100 border border-white/30 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white/50"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={editedClass.end_time}
                            onChange={(e) =>
                              setEditedClass({
                                ...editedClass,
                                end_time: e.target.value,
                              })
                            }
                            className="bg-white/20 text-blue-100 border border-white/30 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white/50"
                          />
                        </div>
                      ) : (
                        `${editedClass.start_time} - ${editedClass.end_time}`
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedClass.location}
                          onChange={(e) =>
                            setEditedClass({
                              ...editedClass,
                              location: e.target.value,
                            })
                          }
                          className="bg-white/20 text-blue-100 placeholder-blue-100/70 border border-white/30 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                      ) : (
                        editedClass.location
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Date</p>
                      <p className="text-white font-semibold">
                        {formatDate(classData.date)}
                      </p>
                    </div>
                    <FaCalendarAlt className="text-blue-400" />
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Duration</p>
                      <p className="text-white font-semibold">
                        {classData.duration_minutes
                          ? `${classData.duration_minutes} min`
                          : "N/A"}
                      </p>
                    </div>
                    <FaClock className="text-green-400" />
                  </div>
                </div>

                <div
                  className={`rounded-lg p-4 border ${getLocationColorClass(
                    classData.location
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Location</p>
                      <p className="font-semibold">{classData.location}</p>
                    </div>
                    <FaMapMarkerAlt />
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Price</p>
                      <p className="text-white font-semibold">
                        ${pricePerSession.toFixed(2)}
                      </p>
                    </div>
                    <FaDollarSign className="text-yellow-400" />
                  </div>
                </div>
              </div>

              {/* Participants Section */}
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FaUsers className="text-blue-400" />
                    Participants
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    {isFullyBooked && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs flex items-center gap-1">
                        <FaExclamationTriangle />
                        Full
                      </span>
                    )}
                    {isAlmostFull && !isFullyBooked && (
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                        Almost Full
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">
                      {editedClass.current_participants || 0} /{" "}
                      {editedClass.max_participants} enrolled
                    </span>
                    <span className="text-slate-400 text-sm">
                      {Math.min(
                        ((editedClass.current_participants || 0) /
                          editedClass.max_participants) *
                          100,
                        100
                      ).toFixed(0)}
                      % capacity
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(
                          ((editedClass.current_participants || 0) /
                            editedClass.max_participants) *
                            100,
                          100
                        )}%`,
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        (editedClass.current_participants || 0) >=
                        editedClass.max_participants
                          ? "bg-red-500"
                          : (editedClass.current_participants || 0) /
                              editedClass.max_participants >=
                            0.8
                          ? "bg-orange-500"
                          : "bg-gradient-to-r from-blue-500 to-green-500"
                      }`}
                    />
                  </div>
                </div>

                {/* Add Participant Section */}
                {isAdmin && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search by name or email..."
                          value={searchQuery}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSearchQuery(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (filteredUsers.length === 1) {
                                handleAddUser(filteredUsers[0]);
                              } else {
                                handleDirectAdd();
                              }
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {/* User Search Dropdown */}
                        {searchQuery.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                            {filteredUsers.length > 0 ? (
                              filteredUsers.map((user) => (
                                <div
                                  key={user.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddUser(user);
                                  }}
                                  className="px-4 py-2 hover:bg-slate-600 cursor-pointer text-white border-b border-slate-600 last:border-b-0"
                                >
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm text-slate-400">
                                    {user.email}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-slate-400 text-sm">
                                No users found matching "{searchQuery}"
                                <br />
                                <span className="text-xs">
                                  Press Enter to add by email directly
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (filteredUsers.length === 1) {
                            handleAddUser(filteredUsers[0]);
                          } else {
                            handleDirectAdd();
                          }
                        }}
                        disabled={!searchQuery.trim()}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <FaUserPlus />
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Current Participants List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">
                      Enrolled Participants
                    </h4>
                    <div className="flex items-center gap-2 text-xs">
                      {participants.filter((p) => p.status === "confirmed")
                        .length > 0 && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                          {
                            participants.filter((p) => p.status === "confirmed")
                              .length
                          }{" "}
                          Confirmed
                        </span>
                      )}
                      {participants.filter((p) => p.status === "waitlist")
                        .length > 0 && (
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full">
                          {
                            participants.filter((p) => p.status === "waitlist")
                              .length
                          }{" "}
                          Waitlisted
                        </span>
                      )}
                    </div>
                  </div>
                  {isLoadingParticipants ? (
                    <div className="text-slate-400 text-center py-4">
                      Loading participants...
                    </div>
                  ) : participants.length === 0 ? (
                    <div className="text-slate-400 text-center py-4">
                      No participants enrolled yet
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {/* Confirmed Participants */}
                      {participants
                        .filter((p) => p.status === "confirmed")
                        .map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-white font-medium">
                                  {participant.name}
                                </p>
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                                  ✓ Confirmed
                                </span>
                              </div>
                              <p className="text-slate-400 text-sm">
                                {participant.email}
                              </p>
                            </div>
                            {isAdmin && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveParticipant(participant);
                                }}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors flex items-center gap-1"
                              >
                                <FaUserMinus />
                                Remove
                              </button>
                            )}
                          </div>
                        ))}

                      {/* Waitlisted Participants */}
                      {participants
                        .filter((p) => p.status === "waitlist")
                        .map((participant, index) => (
                          <div
                            key={participant.id}
                            className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/30"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-white font-medium">
                                  {participant.name}
                                </p>
                                <span className="px-2 py-1 bg-orange-500/30 text-orange-300 rounded-full text-xs font-medium flex items-center gap-1">
                                  <FaClock size={10} />
                                  Waitlist #{index + 1}
                                </span>
                              </div>
                              <div className="flex flex-col gap-1 mt-1">
                                <p className="text-slate-400 text-sm">
                                  {participant.email}
                                </p>
                                {participant.booking_date && (
                                  <p className="text-slate-500 text-xs">
                                    Joined waitlist:{" "}
                                    {new Date(
                                      participant.booking_date
                                    ).toLocaleDateString()}{" "}
                                    at{" "}
                                    {new Date(
                                      participant.booking_date
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                            {isAdmin && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveParticipant(participant);
                                }}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors flex items-center gap-1"
                              >
                                <FaUserMinus />
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {editedClass.waitlist_enabled &&
                  editedClass.waitlist_capacity && (
                    <p className="text-slate-400 text-sm mt-4">
                      Waitlist available (up to {editedClass.waitlist_capacity}{" "}
                      people)
                    </p>
                  )}
              </div>

              {/* Description & Goals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                    <FaInfo className="text-blue-400" />
                    Description
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={editedClass.description || ""}
                      onChange={(e) =>
                        setEditedClass({
                          ...editedClass,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Enter class description..."
                    />
                  ) : (
                    <p className="text-slate-300 leading-relaxed">
                      {editedClass.description || "No description provided."}
                    </p>
                  )}
                </div>

                <div className="bg-purple-500/10 rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                    <FaDumbbell className="text-purple-400" />
                    Class Goals
                  </h3>
                  {isEditing ? (
                    <textarea
                      value={editedClass.class_goals || ""}
                      onChange={(e) =>
                        setEditedClass({
                          ...editedClass,
                          class_goals: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Enter class goals..."
                    />
                  ) : (
                    <p className="text-slate-300 leading-relaxed">
                      {editedClass.class_goals || "No goals specified."}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <h4 className="text-slate-400 text-sm mb-1">Class Type</h4>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedClass.class_type}
                      onChange={(e) =>
                        setEditedClass({
                          ...editedClass,
                          class_type: e.target.value,
                        })
                      }
                      className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white font-medium">
                      {editedClass.class_type}
                    </p>
                  )}
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <h4 className="text-slate-400 text-sm mb-1">Intensity</h4>
                  {isEditing ? (
                    <select
                      value={editedClass.intensity_level || ""}
                      onChange={(e) =>
                        setEditedClass({
                          ...editedClass,
                          intensity_level: e.target.value,
                        })
                      }
                      className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select intensity</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  ) : editedClass.intensity_level ? (
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {editedClass.intensity_level}
                      </span>
                      <div className="flex gap-1">
                        {getIntensityStars(editedClass.intensity_level)}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400">Not specified</p>
                  )}
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <h4 className="text-slate-400 text-sm mb-1">
                    Max Participants
                  </h4>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedClass.max_participants}
                      onChange={(e) =>
                        setEditedClass({
                          ...editedClass,
                          max_participants: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  ) : (
                    <p className="text-white font-medium">
                      {editedClass.max_participants}
                    </p>
                  )}
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <h4 className="text-slate-400 text-sm mb-1">Equipment</h4>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedClass.equipment_needed || ""}
                      onChange={(e) =>
                        setEditedClass({
                          ...editedClass,
                          equipment_needed: e.target.value,
                        })
                      }
                      className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Equipment needed..."
                    />
                  ) : (
                    <p className="text-white font-medium">
                      {editedClass.equipment_needed || "None specified"}
                    </p>
                  )}
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <h4 className="text-slate-400 text-sm mb-1">Prerequisites</h4>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedClass.prerequisites || ""}
                      onChange={(e) =>
                        setEditedClass({
                          ...editedClass,
                          prerequisites: e.target.value,
                        })
                      }
                      className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Prerequisites..."
                    />
                  ) : (
                    <p className="text-white font-medium">
                      {editedClass.prerequisites || "None"}
                    </p>
                  )}
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <h4 className="text-slate-400 text-sm mb-1">Location</h4>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedClass.location}
                      onChange={(e) =>
                        setEditedClass({
                          ...editedClass,
                          location: e.target.value,
                        })
                      }
                      className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-white font-medium">
                      {editedClass.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Recurring Schedule */}
              {classData.is_recurring &&
                classData.recurring_days &&
                classData.recurring_days.length > 0 && (
                  <div className="bg-indigo-500/10 rounded-xl p-6 border border-indigo-500/20">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                      <FaCalendarAlt className="text-indigo-400" />
                      Recurring Schedule
                    </h3>
                    <p className="text-slate-300">
                      This class repeats every{" "}
                      <span className="text-white font-medium">
                        {classData.recurring_days
                          .map(
                            (day) => day.charAt(0).toUpperCase() + day.slice(1)
                          )
                          .join(", ")}
                      </span>
                    </p>
                  </div>
                )}

              {/* Delete Button */}
              {isAdmin && onDeleteClass && editedClass.id && (
                <div className="flex justify-end pt-6 border-t border-slate-700/50">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to delete this class? This action cannot be undone."
                        )
                      ) {
                        onDeleteClass(editedClass.id!);
                        onClose();
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <FaTrash />
                    Delete Class
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
