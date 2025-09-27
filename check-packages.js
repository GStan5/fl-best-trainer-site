// Simple script to clean up packages via API calls
const https = require("https");

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3001,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function cleanupPackages() {
  try {
    console.log("🧹 Checking current packages...");

    // Get current packages
    const response = await makeRequest("GET", "/api/packages");

    if (response.success) {
      console.log("📦 Current packages:");
      response.data.forEach((pkg) => {
        console.log(
          `  - ${pkg.name}: $${pkg.price} (${pkg.sessions_included} sessions)`
        );
      });

      if (response.data.length === 1) {
        console.log(
          "\n✅ Perfect! You already have only 1 package in your database."
        );
        console.log(
          "You can edit its price through the admin panel at /admin → Packages tab"
        );
      } else {
        console.log(
          `\n⚠️ Found ${response.data.length} packages. You mentioned you only want the $400 one.`
        );
        console.log(
          "Please manually remove the unwanted packages through the admin panel."
        );
      }
    } else {
      console.log("❌ Failed to fetch packages:", response.error);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
    console.log(
      "\nℹ️ Make sure your dev server is running on http://localhost:3001"
    );
  }
}

cleanupPackages();
