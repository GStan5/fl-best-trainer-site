// Manual trigger for daily class summary
// This bypasses the cron schedule and sends the report immediately

require("dotenv").config({ path: ".env.local" });
const https = require("https");

const cronSecret = process.env.CRON_SECRET;

const options = {
  hostname: "www.flbesttrainer.com",
  path: "/api/cron/daily-class-summary",
  method: "GET",
  headers: cronSecret
    ? {
        Authorization: `Bearer ${cronSecret}`,
      }
    : {},
};

if (!cronSecret) {
  console.log(
    "⚠️  CRON_SECRET not found - attempting without authentication...\n",
  );
}

console.log("📧 Triggering daily class summary report...\n");

const req = https.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("Status Code:", res.statusCode);
    console.log("");

    try {
      const json = JSON.parse(data);

      if (json.success) {
        console.log("✅ Report sent successfully!");
        console.log("📊 Classes:", json.classCount || 0);
        console.log("👥 Total Participants:", json.totalParticipants || 0);
        console.log("📧 Email sent:", json.emailSent ? "Yes" : "No");
        if (json.message) {
          console.log("Message:", json.message);
        }
      } else {
        console.log("❌ Report failed");
        console.log("Error:", json.error || "Unknown error");
      }
    } catch (e) {
      console.log("Response:", data);
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Request failed:", error.message);
});

req.end();
