// Simple test script to verify waiver API
// Run with: node test-waiver.js (after starting the dev server)

const testWaiverSubmission = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/waiver", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        phone: "555-123-4567",
        signature: "Test Signature",
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Waiver API test successful:", result);
    } else {
      console.log("❌ Waiver API test failed:", result);
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
};

// Only run if Gmail credentials are set
if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
  testWaiverSubmission();
} else {
  console.log(
    "⚠️  Please set GMAIL_USER and GMAIL_PASS environment variables first"
  );
  console.log("See WAIVER_SETUP_GUIDE.md for instructions");
}
