import { useState } from "react";
import { useRouter } from "next/router";

const testClients = [
  { name: "Sarah Johnson", email: "sarah.johnson@email.com" },
  { name: "Mike Rodriguez", email: "mike.rodriguez@email.com" },
  { name: "Emily Chen", email: "emily.chen@email.com" },
  { name: "David Thompson", email: "david.thompson@email.com" },
  { name: "Lisa Martinez", email: "lisa.martinez@email.com" },
  { name: "Alex Kim", email: "alex.kim@email.com" },
  { name: "Rachel Brown", email: "rachel.brown@email.com" },
  { name: "James Wilson", email: "james.wilson@email.com" },
];

export default function AddTestClients() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const router = useRouter();

  const addTestClients = async () => {
    setIsLoading(true);
    setResults([]);

    for (const client of testClients) {
      try {
        const response = await fetch("/api/clients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(client),
        });

        const result = await response.json();

        if (result.success) {
          setResults((prev) => [
            ...prev,
            `✅ Added: ${client.name} (${client.email})`,
          ]);
        } else if (response.status === 409) {
          setResults((prev) => [
            ...prev,
            `⚠️ Already exists: ${client.name} (${client.email})`,
          ]);
        } else {
          setResults((prev) => [
            ...prev,
            `❌ Failed: ${client.name} - ${result.error}`,
          ]);
        }
      } catch (error) {
        setResults((prev) => [...prev, `❌ Error: ${client.name} - ${error}`]);
      }
    }

    setIsLoading(false);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>Add Test Clients</h1>
      <p>
        This page will add test clients to the database for testing participant
        management.
      </p>

      <button
        onClick={addTestClients}
        disabled={isLoading}
        style={{
          padding: "12px 24px",
          backgroundColor: isLoading ? "#ccc" : "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: isLoading ? "not-allowed" : "pointer",
          fontSize: "16px",
          marginBottom: "20px",
        }}
      >
        {isLoading ? "Adding Clients..." : "Add Test Clients"}
      </button>

      <button
        onClick={() => router.push("/admin")}
        style={{
          padding: "12px 24px",
          backgroundColor: "#10b981",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          marginLeft: "10px",
        }}
      >
        Go to Classes Admin
      </button>

      {results.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Results:</h3>
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "6px",
              fontFamily: "monospace",
            }}
          >
            {results.map((result, index) => (
              <div key={index} style={{ marginBottom: "5px" }}>
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: "40px" }}>
        <h3>Test Clients to be Added:</h3>
        <ul>
          {testClients.map((client, index) => (
            <li key={index}>
              {client.name} ({client.email})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
