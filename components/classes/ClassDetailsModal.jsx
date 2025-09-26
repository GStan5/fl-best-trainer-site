import React from "react";

export default function ClassDetailsModal({ classData, isOpen, onClose }) {
  if (!isOpen || !classData) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: "white",
          color: "black",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "500px",
          width: "90%",
        }}
      >
        <h2>{classData.title}</h2>
        <p>
          <strong>Instructor:</strong> {classData.instructor}
        </p>
        <p>
          <strong>Date:</strong> {classData.date}
        </p>
        <p>
          <strong>Time:</strong> {classData.start_time} - {classData.end_time}
        </p>
        <p>
          <strong>Location:</strong> {classData.location}
        </p>
        <p>
          <strong>Description:</strong> {classData.description}
        </p>
        <button
          onClick={onClose}
          style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
