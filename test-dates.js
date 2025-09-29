const now = new Date();
console.log("Current date:", now);
console.log("Current month (0-based):", now.getMonth());
console.log("Current year:", now.getFullYear());
console.log("Month name:", now.toLocaleString("default", { month: "long" }));

// Test date parsing
const testDate = "2025-01-07";
const jsDate = new Date(testDate);
const [year, month, day] = testDate.split("-").map(Number);
const estDate = new Date(year, month - 1, day);

console.log("\nTest date parsing:");
console.log("Original string:", testDate);
console.log("JS Date (UTC):", jsDate, "Month:", jsDate.getMonth());
console.log("EST Date (local):", estDate, "Month:", estDate.getMonth());
