import React from "react";

interface ParticipantStatsProps {
  currentParticipants: number;
  maxParticipants: number;
  price: number;
}

export default function ParticipantStats({
  currentParticipants,
  maxParticipants,
  price,
}: ParticipantStatsProps) {
  const participationRate =
    maxParticipants > 0 ? (currentParticipants / maxParticipants) * 100 : 0;
  const totalRevenue = currentParticipants * price;
  const potentialRevenue = maxParticipants * price;

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#fafbfc",
        border: "1px solid #e1e5e9",
        borderRadius: "12px",
        marginBottom: "20px",
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
        📊 Class Analytics
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "16px",
        }}
      >
        <div
          style={{
            padding: "12px",
            backgroundColor: "white",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "4px",
            }}
          >
            Participation Rate
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color:
                participationRate >= 80
                  ? "#10b981"
                  : participationRate >= 50
                  ? "#f59e0b"
                  : "#ef4444",
            }}
          >
            {participationRate.toFixed(0)}%
          </div>
        </div>

        <div
          style={{
            padding: "12px",
            backgroundColor: "white",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "4px",
            }}
          >
            Spots Available
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#374151",
            }}
          >
            {maxParticipants - currentParticipants}
          </div>
        </div>

        <div
          style={{
            padding: "12px",
            backgroundColor: "white",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "4px",
            }}
          >
            Current Revenue
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#10b981",
            }}
          >
            ${totalRevenue.toFixed(2)}
          </div>
        </div>

        <div
          style={{
            padding: "12px",
            backgroundColor: "white",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "4px",
            }}
          >
            Potential Revenue
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#6366f1",
            }}
          >
            ${potentialRevenue.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
