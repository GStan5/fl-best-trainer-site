import React, { useState } from "react";
import ParticipantControls from "./ParticipantControls";
import ParticipantStats from "./ParticipantStats";
import ClassEditor from "./ClassEditor";

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
  onEditClass?: (classData: Class) => void;
  onRefreshClasses?: () => void; // New prop for refreshing class data
}

export default function EnhancedModal({
  isOpen,
  onClose,
  classData,
  onAddParticipant,
  onRemoveParticipant,
  onEditClass,
  onRefreshClasses,
}: ClassModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "details" | "participants" | "edit"
  >("details");
  const [refreshKey, setRefreshKey] = useState(0);

  if (!isOpen || !classData) return null;

  const price = Number(classData.price_per_session) || 0;
  const showParticipantManagement = classData.id;
  const showEditButton = onEditClass && classData.id;

  const handleParticipantChange = () => {
    // Trigger a refresh by updating the key
    setRefreshKey((prev) => prev + 1);
    // Refresh the main classes data to update participant counts
    onRefreshClasses?.();
  };

  const handleSaveEdit = (updatedClass: Class) => {
    if (onEditClass) {
      onEditClass(updatedClass);
    }
    setIsEditing(false);
    setActiveTab("details");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setActiveTab("details");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "0px",
        left: "0px",
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
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
          borderRadius: "16px",
          maxWidth: "700px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          border: "1px solid #e5e5e5",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 24px 0 24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  margin: "0 0 8px 0",
                  color: "#1f2937",
                }}
              >
                {classData.title}
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                <span>👨‍🏫 {classData.instructor}</span>
                <span>📅 {classData.date}</span>
                <span>
                  🕐 {classData.start_time} - {classData.end_time}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                backgroundColor: "#f3f4f6",
                color: "#6b7280",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                fontSize: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: "flex",
              gap: "2px",
              marginBottom: "-1px",
            }}
          >
            {["details", "participants", "edit"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                disabled={tab === "participants" && !showParticipantManagement}
                style={{
                  backgroundColor: activeTab === tab ? "white" : "#f9fafb",
                  color: activeTab === tab ? "#3b82f6" : "#6b7280",
                  border: "1px solid #e5e7eb",
                  borderBottom:
                    activeTab === tab ? "1px solid white" : "1px solid #e5e7eb",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                  padding: "12px 20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor:
                    tab === "participants" && !showParticipantManagement
                      ? "not-allowed"
                      : "pointer",
                  textTransform: "capitalize",
                  opacity:
                    tab === "participants" && !showParticipantManagement
                      ? 0.5
                      : 1,
                }}
              >
                {tab === "details" && "📋"}
                {tab === "participants" && "👥"}
                {tab === "edit" && "✏️"}
                {" " + tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          {activeTab === "details" && (
            <div>
              {/* Basic Info Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: "12px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#0369a1",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    📍 Location
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#1f2937",
                    }}
                  >
                    {classData.location}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "12px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#059669",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    🏷️ Class Type
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#1f2937",
                    }}
                  >
                    {classData.class_type}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#fefce8",
                    border: "1px solid #fde047",
                    borderRadius: "12px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#ca8a04",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    💰 Price
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#1f2937",
                    }}
                  >
                    ${price.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >
                <h4
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1f2937",
                    marginBottom: "12px",
                  }}
                >
                  📝 Description
                </h4>
                <p style={{ color: "#374151", lineHeight: "1.6", margin: 0 }}>
                  {classData.description}
                </p>
              </div>

              {/* Additional Details */}
              <div style={{ display: "grid", gap: "12px" }}>
                {classData.difficulty_level && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>⚡</span>
                    <strong style={{ color: "#1f2937", minWidth: "120px" }}>
                      Difficulty:
                    </strong>
                    <span style={{ color: "#374151" }}>
                      {classData.difficulty_level}
                    </span>
                  </div>
                )}

                {classData.equipment_needed && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>🎯</span>
                    <strong style={{ color: "#1f2937", minWidth: "120px" }}>
                      Equipment:
                    </strong>
                    <span style={{ color: "#374151" }}>
                      {classData.equipment_needed}
                    </span>
                  </div>
                )}

                {classData.prerequisites && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>📋</span>
                    <strong style={{ color: "#1f2937", minWidth: "120px" }}>
                      Prerequisites:
                    </strong>
                    <span style={{ color: "#374151" }}>
                      {classData.prerequisites}
                    </span>
                  </div>
                )}

                {classData.is_recurring &&
                  classData.recurring_days &&
                  classData.recurring_days.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontSize: "16px" }}>🔄</span>
                      <strong style={{ color: "#1f2937", minWidth: "120px" }}>
                        Recurring:
                      </strong>
                      <span style={{ color: "#374151" }}>
                        {classData.recurring_days.join(", ")}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          )}

          {activeTab === "participants" && showParticipantManagement && (
            <div>
              <ParticipantStats
                currentParticipants={classData.current_participants || 0}
                maxParticipants={classData.max_participants}
                price={price}
              />

              <ParticipantControls
                currentParticipants={classData.current_participants || 0}
                maxParticipants={classData.max_participants}
                classId={classData.id!}
                onParticipantChange={handleParticipantChange}
                isAdmin={true}
              />
            </div>
          )}

          {activeTab === "edit" && showEditButton && (
            <ClassEditor
              classData={classData}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
