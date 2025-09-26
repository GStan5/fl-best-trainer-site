import React from "react";

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

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: Class | null;
}

export default function TailwindClassModal({
  isOpen,
  onClose,
  classData,
}: ClassModalProps) {
  console.log("TailwindClassModal render:", { isOpen, classData: !!classData });

  if (!isOpen || !classData) return null;

  const price = Number(classData.price_per_session) || 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto border-4 border-red-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-600">
            WORKING: {classData.title}
          </h2>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 text-gray-700">
          <div>
            <strong>Instructor:</strong> {classData.instructor}
          </div>
          <div>
            <strong>Date:</strong> {classData.date}
          </div>
          <div>
            <strong>Time:</strong> {classData.start_time} - {classData.end_time}
          </div>
          <div>
            <strong>Location:</strong> {classData.location}
          </div>
          <div>
            <strong>Class Type:</strong> {classData.class_type}
          </div>
          <div>
            <strong>Participants:</strong> {classData.current_participants || 0}{" "}
            / {classData.max_participants}
          </div>
          <div>
            <strong>Price:</strong> ${price.toFixed(2)}
          </div>

          {classData.difficulty_level && (
            <div>
              <strong>Difficulty:</strong> {classData.difficulty_level}
            </div>
          )}

          {classData.equipment_needed && (
            <div>
              <strong>Equipment Needed:</strong> {classData.equipment_needed}
            </div>
          )}

          {classData.prerequisites && (
            <div>
              <strong>Prerequisites:</strong> {classData.prerequisites}
            </div>
          )}

          <div>
            <strong>Description:</strong> {classData.description}
          </div>

          {classData.is_recurring &&
            classData.recurring_days &&
            classData.recurring_days.length > 0 && (
              <div>
                <strong>Recurring Days:</strong>{" "}
                {classData.recurring_days.join(", ")}
              </div>
            )}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
