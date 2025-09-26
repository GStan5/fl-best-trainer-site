import React from "react";
import ParticipantControls from "./ParticipantControls";
import ParticipantStats from "./ParticipantStats";

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
  onAddParticipant?: (classId: string) => void;
  onRemoveParticipant?: (classId: string) => void;
}

export default function WorkingModal({
  isOpen,
  onClose,
  classData,
  onAddParticipant,
  onRemoveParticipant,
}: ClassModalProps) {
  if (!isOpen || !classData) return null;

  const price = Number(classData.price_per_session) || 0;
  const showParticipantManagement =
    onAddParticipant && onRemoveParticipant && classData.id;

  return (
    <div
      style={{
        position: "fixed",
        top: "0px",
        left: "0px",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        zIndex: "999999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          border: "1px solid #e5e5e5",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            borderBottom: "2px solid #f0f0f0",
            paddingBottom: "15px",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              margin: "0",
              color: "#1f2937",
            }}
          >
            {classData.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 12px",
              fontSize: "18px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ color: "#374151", lineHeight: "1.6" }}>
          <div style={{ marginBottom: "12px" }}>
            <strong style={{ color: "#1f2937" }}>Instructor:</strong>{" "}
            {classData.instructor}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <strong style={{ color: "#1f2937" }}>Date:</strong> {classData.date}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <strong style={{ color: "#1f2937" }}>Time:</strong>{" "}
            {classData.start_time} - {classData.end_time}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <strong style={{ color: "#1f2937" }}>Location:</strong>{" "}
            {classData.location}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <strong style={{ color: "#1f2937" }}>Class Type:</strong>{" "}
            {classData.class_type}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <strong style={{ color: "#1f2937" }}>Participants:</strong>{" "}
            {classData.current_participants || 0} / {classData.max_participants}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <strong style={{ color: "#1f2937" }}>Price:</strong> $
            {price.toFixed(2)}
          </div>

          {classData.difficulty_level && (
            <div style={{ marginBottom: "12px" }}>
              <strong style={{ color: "#1f2937" }}>Difficulty:</strong>{" "}
              {classData.difficulty_level}
            </div>
          )}

          {classData.equipment_needed && (
            <div style={{ marginBottom: "12px" }}>
              <strong style={{ color: "#1f2937" }}>Equipment Needed:</strong>{" "}
              {classData.equipment_needed}
            </div>
          )}

          {classData.prerequisites && (
            <div style={{ marginBottom: "12px" }}>
              <strong style={{ color: "#1f2937" }}>Prerequisites:</strong>{" "}
              {classData.prerequisites}
            </div>
          )}

          <div
            style={{
              marginBottom: "12px",
              padding: "12px",
              backgroundColor: "#f9fafb",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
            }}
          >
            <strong style={{ color: "#1f2937" }}>Description:</strong>
            <br />
            {classData.description}
          </div>

          {classData.is_recurring &&
            classData.recurring_days &&
            classData.recurring_days.length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#1f2937" }}>Recurring Days:</strong>{" "}
                {classData.recurring_days.join(", ")}
              </div>
            )}
        </div>

        {/* Participant Management Section */}
        {showParticipantManagement && (
          <>
            <ParticipantStats
              currentParticipants={classData.current_participants || 0}
              maxParticipants={classData.max_participants}
              price={price}
            />

            <ParticipantControls
              currentParticipants={classData.current_participants || 0}
              maxParticipants={classData.max_participants}
              classId={classData.id!}
              onAddParticipant={onAddParticipant!}
              onRemoveParticipant={onRemoveParticipant!}
            />
          </>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "15px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
