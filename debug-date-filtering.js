// Test script to debug date filtering issue
const now = new Date();
console.log("Current time:", now.toISOString());
console.log("Current local time:", now.toLocaleString());

// Simulate tomorrow's class data (October 15th, 2025)
const testClass = {
  id: "test",
  title: "Test Class",
  date: "2025-10-15", // Tomorrow's date
  start_time: "09:00", // 9 AM
  end_time: "10:00",
};

console.log("\n=== Testing ClassesList logic ===");
// This is the logic from ClassesList.tsx
const classDateTime = new Date(`${testClass.date}T${testClass.start_time}`);
const isUpcoming = classDateTime > new Date();
console.log(`Class date: ${testClass.date}`);
console.log(`Class time: ${testClass.start_time}`);
console.log(`Class DateTime: ${classDateTime.toISOString()}`);
console.log(`Class DateTime (local): ${classDateTime.toLocaleString()}`);
console.log(`Is upcoming: ${isUpcoming}`);

console.log("\n=== Testing ClassStats logic ===");
// This is the logic from ClassStats.tsx
const classDateOnly = new Date(testClass.date);
const isUpcomingStats = classDateOnly >= new Date();
console.log(`Class date only: ${classDateOnly.toISOString()}`);
console.log(`Class date only (local): ${classDateOnly.toLocaleString()}`);
console.log(`Is upcoming (stats): ${isUpcomingStats}`);

console.log("\n=== Current Date Details ===");
const currentDate = new Date();
console.log(`Today: ${currentDate.toDateString()}`);
console.log(`Tomorrow should be: October 15, 2025`);

// Test what happens at different times of day
const testTimes = ["08:00", "12:00", "18:00", "23:59"];
console.log("\n=== Testing different class times for tomorrow ===");
testTimes.forEach((time) => {
  const testDateTime = new Date(`${testClass.date}T${time}`);
  const isUpcomingTest = testDateTime > new Date();
  console.log(
    `${time}: ${testDateTime.toLocaleString()} - Upcoming: ${isUpcomingTest}`
  );
});
