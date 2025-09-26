import React, { useState } from "react";

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

interface ClassEditorProps {
  classData: Class;
  onSave: (updatedClass: Class) => void;
  onCancel: () => void;
}

export default function ClassEditor({
  classData,
  onSave,
  onCancel,
}: ClassEditorProps) {
  // Format the date to YYYY-MM-DD for the HTML date input
  const formatDateForInput = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If invalid date, use current date
      return new Date().toISOString().split("T")[0];
    }
    return date.toISOString().split("T")[0];
  };

  const [editedClass, setEditedClass] = useState<Class>({
    ...classData,
    date: formatDateForInput(classData.date),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedClass);
  };

  const updateField = (field: keyof Class, value: any) => {
    setEditedClass((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
      <div
        style={{
          padding: "20px",
          backgroundColor: "#f8fafc",
          border: "2px solid #3b82f6",
          borderRadius: "12px",
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "20px",
            color: "#1f2937",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          ✏️ Edit Class Details
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
                color: "#374151",
              }}
            >
              Class Title
            </label>
            <input
              type="text"
              value={editedClass.title}
              onChange={(e) => updateField("title", e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
                color: "#374151",
              }}
            >
              Instructor
            </label>
            <input
              type="text"
              value={editedClass.instructor}
              onChange={(e) => updateField("instructor", e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
                color: "#374151",
              }}
            >
              Date
            </label>
            <input
              type="date"
              value={editedClass.date}
              onChange={(e) => updateField("date", e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
                color: "#374151",
              }}
            >
              Location
            </label>
            <input
              type="text"
              value={editedClass.location}
              onChange={(e) => updateField("location", e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
                color: "#374151",
              }}
            >
              Start Time
            </label>
            <input
              type="time"
              value={editedClass.start_time}
              onChange={(e) => updateField("start_time", e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
                color: "#374151",
              }}
            >
              End Time
            </label>
            <input
              type="time"
              value={editedClass.end_time}
              onChange={(e) => updateField("end_time", e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
                color: "#374151",
              }}
            >
              Max Participants
            </label>
            <input
              type="number"
              min="1"
              value={editedClass.max_participants}
              onChange={(e) =>
                updateField("max_participants", parseInt(e.target.value))
              }
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                marginBottom: "6px",
                color: "#374151",
              }}
            >
              Price per Session
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={editedClass.price_per_session || 0}
              onChange={(e) =>
                updateField("price_per_session", parseFloat(e.target.value))
              }
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "600",
              marginBottom: "6px",
              color: "#374151",
            }}
          >
            Description
          </label>
          <textarea
            value={editedClass.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              resize: "vertical",
            }}
            required
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "16px",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            style={{
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </form>
  );
}
