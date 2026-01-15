// Test the FIXED ClassesList date logic
console.log("🔍 Testing FIXED ClassesList date logic...\n");

// Simulate the October 15th class data as it comes from the API
const testClass = {
  id: "c3aafe74-c0d9-4fe7-96fa-873e0821da6b",
  title: "Intro Weight Lifting – Exclusive 4-Person Training",
  date: new Date("2025-10-15T00:00:00.000Z"), // This is what we saw in the API response
  start_time: "10:00:00",
  is_active: true
};

console.log("=== TESTING FIXED LOGIC ===");

// Handle date properly to avoid timezone issues
const dateStr = typeof testClass.date === 'string' 
  ? testClass.date.split('T')[0] 
  : new Date(testClass.date).toISOString().split('T')[0];

const timeComponents = testClass.start_time.split(":");
const classDateTime = new Date(`${dateStr}T${testClass.start_time}`);

const now = new Date();
const isUpcoming = classDateTime > now;

console.log(`Date processing:`);
console.log(`- Raw date: ${testClass.date}`);
console.log(`- Extracted dateStr: ${dateStr}`);
console.log(`- Start time: ${testClass.start_time}`);
console.log(`- Combined string: ${dateStr}T${testClass.start_time}:00`);
console.log(`- Final classDateTime: ${classDateTime.toString()}`);
console.log(`- Current time (now): ${now.toString()}`);
console.log(`- classDateTime > now: ${classDateTime > now}`);
console.log(`- Time difference (hours): ${(classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)}`);
console.log(`- Result: ${isUpcoming ? "✅ WILL SHOW in ClassesList" : "❌ WILL HIDE from ClassesList"}`);

console.log("\n=== TIMEZONE ANALYSIS ===");
console.log(`- Class datetime UTC: ${classDateTime.toISOString()}`);
console.log(`- Class datetime local: ${classDateTime.toLocaleString()}`);
console.log(`- Current time UTC: ${now.toISOString()}`);
console.log(`- Current time local: ${now.toLocaleString()}`);

if (isUpcoming) {
  console.log("\n🎉 SUCCESS! October 15th class will now show!");
} else {
  console.log("\n❌ Still not working...");
}