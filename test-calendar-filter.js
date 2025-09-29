// Check when classes are scheduled by analyzing common dates
const today = new Date();
const currentMonth = today.getMonth(); // September = 8
const currentYear = today.getFullYear(); // 2025

console.log(
  `Currently viewing calendar for: ${today.toLocaleString("default", {
    month: "long",
  })} ${currentYear} (month index ${currentMonth})`
);

// Test some upcoming months
const testMonths = [
  { month: 8, name: "September 2025" },
  { month: 9, name: "October 2025" },
  { month: 10, name: "November 2025" },
  { month: 11, name: "December 2025" },
];

testMonths.forEach(({ month, name }) => {
  console.log(`\n${name}:`);

  // Check if January classes would show up when filtered for this month
  const testDates = ["2025-01-07", "2025-01-09", "2025-01-11"]; // Tue, Thu, Sat in January

  testDates.forEach((dateString) => {
    const [year, monthNum, day] = dateString.split("-").map(Number);
    const estDate = new Date(year, monthNum - 1, day);

    const matches =
      estDate.getMonth() === month && estDate.getFullYear() === currentYear;
    console.log(
      `  ${dateString} (${estDate.toDateString()}) -> matches: ${matches}`
    );
  });
});

// Let's also test if there are future dates that would show in current month
console.log("\nChecking upcoming dates for current month (September):");
const futureDates = [
  "2025-09-30", // Tuesday
  "2025-10-02", // Thursday
  "2025-10-04", // Saturday
];

futureDates.forEach((dateString) => {
  const [year, monthNum, day] = dateString.split("-").map(Number);
  const estDate = new Date(year, monthNum - 1, day);

  const matches =
    estDate.getMonth() === currentMonth &&
    estDate.getFullYear() === currentYear;
  console.log(
    `  ${dateString} (${estDate.toDateString()}) -> matches current month: ${matches}`
  );
});
