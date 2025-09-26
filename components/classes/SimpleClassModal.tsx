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

export default function SimpleClassModal({
  isOpen,
  onClose,
  classData,
}: ClassModalProps) {
  console.log("SimpleClassModal render:", { isOpen, classData: !!classData });

  if (!isOpen || !classData) return null;

  const price = Number(classData.price_per_session) || 0;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          color: "#333",
          border: "3px solid red",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              margin: 0,
              color: "red",
            }}
          >
            DEBUG: {classData.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "red",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "white",
              padding: "5px 10px",
              borderRadius: "4px",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ lineHeight: "1.6" }}>
          <div style={{ marginBottom: "12px" }}>
            <strong>Instructor:</strong> {classData.instructor}
          </div>
          <div style={{ marginBottom: "12px" }}>
            <strong>Date:</strong> {classData.date}
          </div>
          <div style={{ marginBottom: "12px" }}>
            <strong>Time:</strong> {classData.start_time} - {classData.end_time}
          </div>
          <div style={{ marginBottom: "12px" }}>
            <strong>Location:</strong> {classData.location}
          </div>
          <div style={{ marginBottom: "12px" }}>
            <strong>Class Type:</strong> {classData.class_type}
          </div>
          <div style={{ marginBottom: "12px" }}>
            <strong>Participants:</strong> {classData.current_participants || 0}{" "}
            / {classData.max_participants}
          </div>
          <div style={{ marginBottom: "12px" }}>
            <strong>Price:</strong> ${price.toFixed(2)}
          </div>

          {classData.difficulty_level && (
            <div style={{ marginBottom: "12px" }}>
              <strong>Difficulty:</strong> {classData.difficulty_level}
            </div>
          )}

          {classData.equipment_needed && (
            <div style={{ marginBottom: "12px" }}>
              <strong>Equipment Needed:</strong> {classData.equipment_needed}
            </div>
          )}

          {classData.prerequisites && (
            <div style={{ marginBottom: "12px" }}>
              <strong>Prerequisites:</strong> {classData.prerequisites}
            </div>
          )}

          <div style={{ marginBottom: "12px" }}>
            <strong>Description:</strong> {classData.description}
          </div>

          {classData.is_recurring &&
            classData.recurring_days &&
            classData.recurring_days.length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <strong>Recurring Days:</strong>{" "}
                {classData.recurring_days.join(", ")}
              </div>
            )}
        </div>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
