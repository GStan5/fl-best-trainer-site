// Google Analytics Test Script
// Run this in your browser console on localhost:3000

console.log("🔍 Testing Google Analytics Integration...");

// Check if gtag is loaded
if (typeof window.gtag === "function") {
  console.log("✅ gtag function is loaded");

  // Check if GA tracking ID is set
  if (window.dataLayer) {
    console.log("✅ dataLayer exists:", window.dataLayer);

    // Find GA config in dataLayer
    const gaConfig = window.dataLayer.find(
      (item) => item && item[0] === "config" && item[1] === "G-54026TZSEQ"
    );

    if (gaConfig) {
      console.log("✅ GA tracking ID (G-54026TZSEQ) is configured");
    } else {
      console.log("❌ GA tracking ID not found in dataLayer");
    }
  } else {
    console.log("❌ dataLayer not found");
  }

  // Test a custom event
  console.log("🧪 Testing custom event...");
  window.gtag("event", "test_event", {
    event_category: "test",
    event_label: "manual_test",
    custom_parameter: "test_value",
  });
  console.log("✅ Test event sent");
} else {
  console.log("❌ gtag function not found - Google Analytics not loaded");
}

// Check for Google Analytics script
const gaScript = document.querySelector(
  'script[src*="googletagmanager.com/gtag/js"]'
);
if (gaScript) {
  console.log("✅ GA script tag found:", gaScript.src);
} else {
  console.log("❌ GA script tag not found");
}

console.log("🔍 Test complete - check Network tab for gtag requests");
