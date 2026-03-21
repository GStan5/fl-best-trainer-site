const https = require("https");

const options = {
  hostname: "flbesttrainer.com",
  path: "/api/cron/daily-class-summary",
  method: "GET",
  headers: {},
};

const req = https.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("Status Code:", res.statusCode);
    console.log("Response:", data);
    try {
      const json = JSON.parse(data);
      console.log("\n✅ Report sent successfully!");
      console.log("Classes:", json.classCount);
      console.log("Total Participants:", json.totalParticipants);
    } catch (e) {
      console.log("Response body:", data);
    }
  });
});

req.on("error", (error) => {
  console.error("Error:", error);
});

req.end();
