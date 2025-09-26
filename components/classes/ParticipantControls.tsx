import React, { useState, useEffect } from "react";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Participant {
  booking_id: string;
  user_id: string;
  name: string;
  email: string;
  status: string;
  booking_date: string;
}

interface ParticipantControlsProps {
  currentParticipants: number;
  maxParticipants: number;
  classId: string;
  onParticipantChange?: () => void; // Callback to refresh data
  isAdmin?: boolean; // New prop to enable admin features
}

export default function ParticipantControls({
  currentParticipants,
  maxParticipants,
  classId,
  onParticipantChange,
  isAdmin = true, // Default to true since this is admin interface
}: ParticipantControlsProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [forceConfirmed, setForceConfirmed] = useState<boolean>(false);

  const isFullyBooked = currentParticipants >= maxParticipants;
  const confirmedParticipants = participants.filter(
    (p) => p.status === "confirmed"
  );
  const waitlistParticipants = participants.filter(
    (p) => p.status === "waitlist"
  );

  // Fetch all clients
  useEffect(() => {
    fetchClients();
    fetchParticipants();
  }, [classId]);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      const result = await response.json();
      if (result.success) {
        setClients(result.data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}/participants`);
      const result = await response.json();
      if (result.success) {
        setParticipants(result.data);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const addParticipant = async () => {
    if (!selectedClientId) {
      setMessage("Please select a client to add");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/classes/${classId}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedClientId,
          isAdminOverride: isAdmin && forceConfirmed,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage(`✅ ${result.message || "Participant added successfully!"}`);
        setSelectedClientId("");
        setForceConfirmed(false);
        fetchParticipants();
        onParticipantChange?.();
      } else {
        setMessage(`❌ ${result.error || "Failed to add participant"}`);
      }
    } catch (error) {
      setMessage("❌ Error adding participant");
      console.error("Error adding participant:", error);
    }

    setIsLoading(false);
  };

  const removeParticipant = async (userId: string, userName: string) => {
    if (!confirm(`Remove ${userName} from this class?`)) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/classes/${classId}/participants`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage("✅ Participant removed successfully!");
        fetchParticipants();
        onParticipantChange?.();
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      setMessage("❌ Error removing participant");
      console.error("Error removing participant:", error);
    }

    setIsLoading(false);
  };

  // Get available clients (not already in this class)
  const availableClients = clients.filter(
    (client) =>
      !participants.some((participant) => participant.user_id === client.id)
  );

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#fafbfc",
        border: "1px solid #e1e5e9",
        borderRadius: "12px",
      }}
    >
      <h3
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          marginBottom: "16px",
          color: "#1f2937",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        👥 Participant Management
      </h3>

      {/* Progress Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#374151",
          }}
        >
          {confirmedParticipants.length} / {maxParticipants} confirmed
          {waitlistParticipants.length > 0 && (
            <span style={{ color: "#f59e0b", marginLeft: "8px" }}>
              (+{waitlistParticipants.length} waitlisted)
            </span>
          )}
        </div>

        <div
          style={{
            width: "200px",
            height: "8px",
            backgroundColor: "#e5e7eb",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${
                (confirmedParticipants.length / maxParticipants) * 100
              }%`,
              height: "100%",
              backgroundColor: isFullyBooked ? "#ef4444" : "#10b981",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* Add Participant Section */}
      <div
        style={{
          marginBottom: "20px",
          padding: "16px",
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h4
          style={{
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "12px",
            color: "#374151",
          }}
        >
          Add Participant
        </h4>

        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: "white",
            }}
          >
            <option value="">Select a client...</option>
            {availableClients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.email})
              </option>
            ))}
          </select>

          <button
            onClick={addParticipant}
            disabled={!selectedClientId || isLoading}
            style={{
              backgroundColor:
                !selectedClientId || isLoading ? "#9ca3af" : "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "600",
              cursor:
                !selectedClientId || isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {isLoading ? "⏳" : "➕"} Add
          </button>
        </div>

        {/* Admin Override Controls */}
        {isAdmin && isFullyBooked && (
          <div
            style={{
              marginBottom: "12px",
              padding: "12px",
              backgroundColor: "#fef3c7",
              border: "1px solid #f59e0b",
              borderRadius: "6px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#92400e",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={forceConfirmed}
                onChange={(e) => setForceConfirmed(e.target.checked)}
                style={{
                  width: "16px",
                  height: "16px",
                }}
              />
              🔓 Admin Override: Force confirm (bypass class limit)
            </label>
            <div
              style={{
                fontSize: "12px",
                color: "#92400e",
                marginTop: "4px",
                fontStyle: "italic",
              }}
            >
              Will add participant as confirmed even when class is full
            </div>
          </div>
        )}

        {availableClients.length === 0 && (
          <div
            style={{
              fontSize: "14px",
              color: "#6b7280",
              fontStyle: "italic",
            }}
          >
            All clients are already registered for this class
          </div>
        )}

        {/* Class Status Information */}
        {!isAdmin && isFullyBooked && (
          <div
            style={{
              fontSize: "14px",
              color: "#f59e0b",
              fontWeight: "500",
              marginTop: "8px",
            }}
          >
            ⚠️ Class is full - new participants will be added to waitlist
          </div>
        )}
      </div>

      {/* Current Participants List */}
      <div
        style={{
          marginBottom: "16px",
        }}
      >
        {/* Confirmed Participants */}
        <div style={{ marginBottom: "20px" }}>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "12px",
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ✅ Confirmed Participants ({confirmedParticipants.length})
          </h4>

          {confirmedParticipants.length === 0 ? (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f0f9ff",
                border: "1px solid #7dd3fc",
                borderRadius: "6px",
                color: "#0284c7",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              ℹ️ No confirmed participants yet
            </div>
          ) : (
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              {confirmedParticipants.map((participant) => (
                <div
                  key={participant.booking_id}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #e2e8f0",
                    backgroundColor: "white",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#1f2937",
                        fontSize: "14px",
                      }}
                    >
                      {participant.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      {participant.email}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      removeParticipant(participant.user_id, participant.name)
                    }
                    disabled={isLoading}
                    style={{
                      backgroundColor: isLoading ? "#9ca3af" : "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: isLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Waitlist Participants */}
        {waitlistParticipants.length > 0 && (
          <div>
            <h4
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#374151",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ⏳ Waitlisted Participants ({waitlistParticipants.length})
            </h4>

            <div
              style={{
                border: "1px solid #f59e0b",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              {waitlistParticipants.map((participant, index) => (
                <div
                  key={participant.booking_id}
                  style={{
                    padding: "12px 16px",
                    borderBottom:
                      index < waitlistParticipants.length - 1
                        ? "1px solid #fbbf24"
                        : "none",
                    backgroundColor: "#fffbeb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#1f2937",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#f59e0b",
                          color: "white",
                          fontSize: "10px",
                          padding: "2px 6px",
                          borderRadius: "10px",
                        }}
                      >
                        #{index + 1}
                      </span>
                      {participant.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      {participant.email}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      removeParticipant(participant.user_id, participant.name)
                    }
                    disabled={isLoading}
                    style={{
                      backgroundColor: isLoading ? "#9ca3af" : "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: isLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {message && (
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: message.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${
              message.startsWith("✅") ? "#bbf7d0" : "#fca5a5"
            }`,
            borderRadius: "6px",
            color: message.startsWith("✅") ? "#166534" : "#dc2626",
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "12px",
          }}
        >
          {message}
        </div>
      )}

      {/* Waitlist Information */}
      {waitlistParticipants.length > 0 && (
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "#fffbeb",
            border: "1px solid #fbbf24",
            borderRadius: "6px",
            color: "#92400e",
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "12px",
          }}
        >
          ℹ️ {waitlistParticipants.length} participant
          {waitlistParticipants.length > 1 ? "s" : ""} on waitlist. They will be
          automatically confirmed when spots become available.
        </div>
      )}
    </div>
  );
}
