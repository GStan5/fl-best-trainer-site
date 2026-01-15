// Simple test to verify the ClassesList filtering logic
console.log("🔍 Testing ClassesList filtering for October 15th...\n");

// Simulate the exact data we saw from the API
const testClass = {
  id: "c3aafe74-c0d9-4fe7-96fa-873e0821da6b",
  title: "Intro Weight Lifting – Exclusive 4-Person Training",
  date: new Date("Wed Oct 15 2025 00:00:00 GMT-0400 (Eastern Daylight Time)"), // Date object as returned
  start_time: "10:00:00",
  end_time: "11:00:00"
};

console.log("Raw class data:");
console.log(`- Date: ${testClass.date}`);
console.log(`- Date type: ${typeof testClass.date}`);
console.log(`- Start time: ${testClass.start_time}\n`);

// Test the UPDATED ClassesList logic (our fix)
console.log("=== TESTING UPDATED CLASSESLIST LOGIC ===");

try {
  // Handle both Date objects and date strings from the database
  const dateStr = typeof testClass.date === "string"
    ? testClass.date
    : new Date(testClass.date).toISOString().split("T")[0];

  console.log(`Converted dateStr: ${dateStr}`);

  // Include time in the comparison, not just date
  const classDateTime = new Date(`${dateStr}T${testClass.start_time}`);
  const isUpcoming = classDateTime > new Date();

  console.log(`Class DateTime: ${classDateTime.toISOString()}`);
  console.log(`Current Time: ${new Date().toISOString()}`);
  console.log(`Is upcoming: ${isUpcoming}`);

  if (isUpcoming) {
    console.log("✅ PASS: October 15th class WOULD be shown in ClassesList!");
  } else {
    console.log("❌ FAIL: October 15th class would NOT be shown");
  }

} catch (error) {
  console.log(`❌ ERROR in ClassesList logic: ${error.message}`);
}

// Test the OLD logic (what might still be on production)
console.log("\n=== TESTING OLD LOGIC (might be on production) ===");

try {
  // Old logic that would fail with Date objects
  const classDateTime = new Date(`${testClass.date}T${testClass.start_time}`);
  const isUpcoming = classDateTime > new Date();
  
  console.log(`Would this work? ${isUpcoming}`);
} catch (error) {
  console.log(`❌ OLD LOGIC FAILS: ${error.message}`);
  console.log("This is why October 15th wasn't showing before!");
}