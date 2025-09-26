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

export default function BasicModal({
  isOpen,
  onClose,
  classData,
}: ClassModalProps) {
  console.log("BasicModal render:", { isOpen, classData: !!classData });

  if (!isOpen) {
    console.log("Modal not open, returning null");
    return null;
  }

  if (!classData) {
    console.log("No class data, returning null");
    return null;
  }

  console.log("Modal should be visible now!");

  return (
    <div
      style={{
        position: "fixed",
        top: "0px",
        left: "0px",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(255, 0, 0, 0.9)",
        zIndex: "999999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "yellow",
          border: "5px solid red",
          padding: "20px",
          width: "400px",
          minHeight: "300px",
          color: "black",
          fontSize: "16px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h1 style={{ color: "red", fontSize: "24px", marginBottom: "20px" }}>
          🎉 MODAL IS WORKING! 🎉
        </h1>

        <div style={{ marginBottom: "10px" }}>
          <strong>Title:</strong> {classData.title}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <strong>Instructor:</strong> {classData.instructor}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <strong>Date:</strong> {classData.date}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <strong>Time:</strong> {classData.start_time} - {classData.end_time}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <strong>Location:</strong> {classData.location}
        </div>

        <button
          onClick={onClose}
          style={{
            backgroundColor: "red",
            color: "white",
            padding: "10px 20px",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          CLOSE MODAL
        </button>
      </div>
    </div>
  );
}
