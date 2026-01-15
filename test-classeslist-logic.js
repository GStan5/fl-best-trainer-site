// Test the exact date logic used in ClassesList locally
console.log("🔍 Testing ClassesList date logic locally...\n");

// Simulate the October 15th class data as it comes from the API
const testClass = {
  id: "c3aafe74-c0d9-4fe7-96fa-873e0821da6b",
  title: "Intro Weight Lifting – Exclusive 4-Person Training",
  date: new Date("2025-10-15T00:00:00.000Z"), // This is what we saw in the API response
  start_time: "10:00:00",
  is_active: true
};

console.log("Raw test data:");
console.log(`- Title: ${testClass.title}`);
console.log(`- Date: ${testClass.date}`);
console.log(`- Date type: ${typeof testClass.date}`);
console.log(`- Start time: ${testClass.start_time}`);
console.log(`- Is active: ${testClass.is_active}\n`);

// Test the ClassesList logic exactly as written
console.log("=== TESTING CLASSESLIST LOGIC ===");

// Must be active
if (!testClass.is_active) {
  console.log("❌ Class is not active - would be filtered out");
} else {
  console.log("✅ Class is active - passes first filter");
}

// Create full datetime for the class - using same approach as UpcomingClassesSection
const classDate = new Date(testClass.date);
const timeComponents = testClass.start_time.split(":");
const classDateTime = new Date(classDate);
classDateTime.setHours(
  parseInt(timeComponents[0]),
  parseInt(timeComponents[1]),
  0,
  0
);

const now = new Date();
const isUpcoming = classDateTime > now;

console.log(`\nDate processing:`);
console.log(`- Raw date: ${testClass.date}`);
console.log(`- Parsed classDate: ${classDate.toString()}`);
console.log(`- Start time: ${testClass.start_time}`);
console.log(`- Final classDateTime: ${classDateTime.toString()}`);
console.log(`- Current time (now): ${now.toString()}`);
console.log(`- classDateTime > now: ${classDateTime > now}`);
console.log(`- Time difference (hours): ${(classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)}`);
console.log(`- Result: ${isUpcoming ? "✅ WILL SHOW in ClassesList" : "❌ WILL HIDE from ClassesList"}`);

// Also test the UpcomingClassesSection logic for comparison
console.log("\n=== TESTING UPCOMINGCLASSESSECTION LOGIC ===");
const classDate2 = new Date(testClass.date);
const timeComponents2 = testClass.start_time.split(":");
const classDateTime2 = new Date(classDate2);
classDateTime2.setHours(
  parseInt(timeComponents2[0]),
  parseInt(timeComponents2[1]),
  0,
  0
);

const isUpcoming2 = classDateTime2 > now;

console.log(`- Same classDateTime: ${classDateTime2.toString()}`);
console.log(`- Same comparison: ${classDateTime2 > now}`);
console.log(`- Result: ${isUpcoming2 ? "✅ WILL SHOW in UpcomingClassesSection" : "❌ WILL HIDE from UpcomingClassesSection"}`);

if (isUpcoming !== isUpcoming2) {
  console.log("\n❗ MISMATCH between components!");
} else {
  console.log(`\n${isUpcoming ? "✅" : "❌"} Both components agree: ${isUpcoming ? "SHOW" : "HIDE"}`);
}

// Test timezone issues
console.log("\n=== TIMEZONE ANALYSIS ===");
console.log(`- Your local timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
console.log(`- Class date UTC: ${testClass.date.toISOString()}`);
console.log(`- Class date local: ${testClass.date.toLocaleString()}`);
console.log(`- Final class datetime UTC: ${classDateTime.toISOString()}`);
console.log(`- Final class datetime local: ${classDateTime.toLocaleString()}`);
console.log(`- Current time UTC: ${now.toISOString()}`);
console.log(`- Current time local: ${now.toLocaleString()}`);