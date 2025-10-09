import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaMapMarkerAlt,
  FaEye,
  FaTrash,
  FaUserPlus,
  FaUserMinus,
  FaCheck,
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
}

interface ClassInstanceRowProps {
  classData: Class;
  onViewDetails: (classData: Class) => void;
  onEditClass: (classData: Class) => void;
  onDeleteClass: (classId: string) => void;
  onAddParticipant: (classId: string) => void;
  onRemoveParticipant: (classId: string) => void;
  onCompleteClass?: (classId: string) => void;
}

export default function ClassInstanceRow({
  classData,
  onViewDetails,
  onEditClass,
  onDeleteClass,
  onAddParticipant,
  onRemoveParticipant,
  onCompleteClass,
}: ClassInstanceRowProps) {
  const openClassDetailsWindow = () => {
    const price = Number(classData.price_per_session) || 0;
    const classDetails = `
      <html>
        <head>
          <title>Class Details - ${classData.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
            h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            .detail { margin: 10px 0; }
            .label { font-weight: bold; color: #666; }
            .close-btn { 
              position: fixed; top: 10px; right: 10px; 
              background: #f44336; color: white; border: none; 
              padding: 10px 15px; border-radius: 5px; cursor: pointer; 
            }
          </style>
        </head>
        <body>
          <button class="close-btn" onclick="window.close()">✕ Close</button>
          <h1>${classData.title}</h1>
          <div class="detail"><span class="label">Instructor:</span> ${
            classData.instructor
          }</div>
          <div class="detail"><span class="label">Date:</span> ${
            classData.date
          }</div>
          <div class="detail"><span class="label">Time:</span> ${
            classData.start_time
          } - ${classData.end_time}</div>
          <div class="detail"><span class="label">Location:</span> ${
            classData.location
          }</div>
          <div class="detail"><span class="label">Class Type:</span> ${
            classData.class_type
          }</div>
          <div class="detail"><span class="label">Participants:</span> ${
            classData.current_participants || 0
          } / ${classData.max_participants}</div>
          <div class="detail"><span class="label">Price:</span> $${price.toFixed(
            2
          )}</div>
          ${
            classData.difficulty_level
              ? `<div class="detail"><span class="label">Difficulty:</span> ${classData.difficulty_level}</div>`
              : ""
          }
          ${
            classData.equipment_needed
              ? `<div class="detail"><span class="label">Equipment Needed:</span> ${classData.equipment_needed}</div>`
              : ""
          }
          ${
            classData.prerequisites
              ? `<div class="detail"><span class="label">Prerequisites:</span> ${classData.prerequisites}</div>`
              : ""
          }
          <div class="detail"><span class="label">Description:</span> ${
            classData.description
          }</div>
          ${
            classData.is_recurring && classData.recurring_days
              ? `<div class="detail"><span class="label">Recurring Days:</span> ${classData.recurring_days.join(
                  ", "
                )}</div>`
              : ""
          }
        </body>
      </html>
    `;

    const newWindow = window.open(
      "",
      "_blank",
      "width=700,height=600,scrollbars=yes,resizable=yes"
    );
    if (newWindow) {
      newWindow.document.write(classDetails);
      newWindow.document.close();
    }
  };
  const currentParticipants = classData.current_participants || 0;
  const occupancyPercentage =
    (currentParticipants / classData.max_participants) * 100;
  const isClassFull = currentParticipants >= classData.max_participants;
  const isEmpty = currentParticipants <= 0;
  const pricePerSession = Number(classData.price_per_session) || 0;

  // Don't render if no id (shouldn't happen with valid data)
  if (!classData.id) return null;

  // Determine if class is in the past - with safe date parsing
  let classDateTime;
  let isPastClass = false;
  let canCompleteClass = false;

  try {
    // Handle different date formats from database - convert to string first
    let dateStr: string;
    if (
      classData.date &&
      typeof classData.date === "object" &&
      "toISOString" in classData.date
    ) {
      // It's a Date object
      dateStr = (classData.date as Date).toISOString().split("T")[0];
    } else {
      // It's a string, extract just the date part
      dateStr = String(classData.date).split("T")[0];
    }

    classDateTime = new Date(`${dateStr}T${classData.start_time}`);

    if (!isNaN(classDateTime.getTime())) {
      const now = new Date();
      isPastClass = classDateTime < now;

      // More lenient completion logic - allow completing classes from today and earlier
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      canCompleteClass = classDateTime <= today;
    }

    // Debug logging (only if date is valid)
    if (!isNaN(classDateTime.getTime())) {
      console.log("Class completion debug:", {
        title: classData.title,
        rawDate: classData.date,
        dateStr: dateStr,
        start_time: classData.start_time,
        classDateTime: classDateTime.toISOString(),
        isPastClass,
        canCompleteClass,
        hasOnCompleteClass: !!onCompleteClass,
      });
    }
  } catch (error) {
    console.error("Date parsing error for class:", classData.title, error);
    // Default to not allowing completion if date parsing fails
    canCompleteClass = false;
    isPastClass = false;
  }

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`border-b border-slate-700 hover:bg-slate-750 transition-colors ${
        isPastClass ? "opacity-75" : ""
      }`}
    >
      {/* Class Info */}
      <td className="px-6 py-4">
        <div>
          <div className="font-medium text-white flex items-center">
            {classData.title}
            {classData.is_recurring && (
              <span className="ml-2 px-2 py-1 text-xs bg-purple-500 text-white rounded-full">
                Recurring
              </span>
            )}
            {isPastClass && (
              <span className="ml-2 px-2 py-1 text-xs bg-slate-500 text-white rounded-full">
                Past
              </span>
            )}
          </div>
          <div className="text-sm text-slate-400">{classData.class_type}</div>
          {classData.instructor && (
            <div className="text-xs text-slate-500 mt-1">
              Instructor: {classData.instructor}
            </div>
          )}
        </div>
      </td>

      {/* Date & Time */}
      <td className="px-6 py-4 text-sm text-white">
        <div className="flex items-center mb-1">
          <FaCalendarAlt className="mr-2 text-slate-400" />
          {(() => {
            // Parse date safely to avoid timezone issues
            const dateStr = classData.date.split("T")[0]; // Get "2025-10-09"
            const [year, month, day] = dateStr.split("-").map(Number);
            const localDate = new Date(year, month - 1, day);
            return localDate.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
          })()}
        </div>
        <div className="flex items-center text-slate-400">
          <FaClock className="mr-2" />
          {classData.start_time} - {classData.end_time}
        </div>
      </td>

      {/* Participants */}
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaUsers className="mr-2 text-slate-400" />
              <span className="font-medium text-white">
                {classData.current_participants}/{classData.max_participants}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              {occupancyPercentage.toFixed(0)}%
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                occupancyPercentage >= 90
                  ? "bg-red-500"
                  : occupancyPercentage >= 70
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
            />
          </div>

          {/* Quick participant management */}
          {!isPastClass && (
            <div className="flex space-x-1">
              <button
                onClick={() => onAddParticipant(classData.id!)}
                disabled={isClassFull}
                className="p-1 text-green-400 hover:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed rounded transition-colors"
                title="Add participant"
              >
                <FaUserPlus className="text-xs" />
              </button>
              <button
                onClick={() => onRemoveParticipant(classData.id!)}
                disabled={isEmpty}
                className="p-1 text-red-400 hover:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed rounded transition-colors"
                title="Remove participant"
              >
                <FaUserMinus className="text-xs" />
              </button>
            </div>
          )}
        </div>
      </td>

      {/* Location */}
      <td className="px-6 py-4 text-sm text-white">
        <div className="flex items-center">
          <FaMapMarkerAlt className="mr-2 text-slate-400" />
          <span className="truncate" title={classData.location}>
            {classData.location}
          </span>
        </div>
      </td>

      {/* Price */}
      <td className="px-6 py-4 text-sm font-medium text-white">
        ${pricePerSession.toFixed(2)}
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          {/* View Details */}
          <button
            onClick={() => onViewDetails(classData)}
            className="p-2 text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
            title="View Details"
          >
            <FaEye />
          </button>

          {/* Complete Class - for classes happening today or in the past */}
          {canCompleteClass && onCompleteClass && (
            <button
              onClick={() => onCompleteClass(classData.id!)}
              className="p-2 text-yellow-400 hover:bg-slate-700 rounded-lg transition-colors"
              title="Complete Class"
            >
              <FaCheck />
            </button>
          )}

          {/* Delete/Cancel Class - only for future classes */}
          {!isPastClass && (
            <button
              onClick={() => onDeleteClass(classData.id!)}
              className="p-2 text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
              title="Cancel Class"
            >
              <FaTrash />
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  );
}
