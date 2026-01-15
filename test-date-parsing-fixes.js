// Test the updated date parsing logic for My Upcoming Classes
console.log("🔍 Testing updated date parsing logic...\n");

// Simulate data that might come from the database
const testBookings = [
  // Case 1: Date as string (current expected format)
  {
    id: "1",
    class_title: "Test Class 1",
    date: "2025-10-15T04:00:00.000Z", // String format
    start_time: "10:00:00",
    end_time: "11:00:00",
    location: "Studio A",
    instructor: "Gavin",
  },

  // Case 2: Date as Date object (problematic format)
  {
    id: "2",
    class_title: "Test Class 2",
    date: new Date("2025-10-16T04:00:00.000Z"), // Date object
    start_time: "09:00:00",
    end_time: "10:00:00",
    location: "Studio B",
    instructor: "Gavin",
  },
];

console.log("=== TESTING UPDATED DATE PARSING LOGIC ===");

testBookings.forEach((booking, index) => {
  console.log(`\nBooking ${index + 1}:`);
  console.log(`- Title: ${booking.class_title}`);
  console.log(`- Date type: ${typeof booking.date}`);
  console.log(`- Date value: ${booking.date}`);

  try {
    // This is the updated logic from MyUpcomingClassesGrid
    const dateStr =
      typeof booking.date === "string"
        ? booking.date.split("T")[0] // Get "2025-10-07" from "2025-10-07T04:00:00.000Z"
        : new Date(booking.date).toISOString().split("T")[0]; // Convert Date object to string

    console.log(`- Parsed dateStr: ${dateStr}`);

    const [year, month, day] = dateStr.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    const formattedDate = localDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    console.log(`- Formatted date: ${formattedDate}`);
    console.log(`✅ Success!`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
});

console.log("\n=== TESTING FILTERING LOGIC ===");

testBookings.forEach((booking, index) => {
  console.log(`\nBooking ${index + 1} filtering test:`);

  try {
    // This is the updated logic from classes.tsx fetchMyBookings
    const dateStr =
      typeof booking.date === "string"
        ? booking.date.split("T")[0]
        : new Date(booking.date).toISOString().split("T")[0];

    const [year, month, day] = dateStr.split("-").map(Number);
    const timeComponents = booking.start_time.split(":");
    const classDateTime = new Date(
      year,
      month - 1,
      day,
      parseInt(timeComponents[0]),
      parseInt(timeComponents[1]),
      0,
      0
    );

    const isUpcoming = classDateTime > new Date();
    console.log(`- Class DateTime: ${classDateTime.toLocaleString()}`);
    console.log(`- Is upcoming: ${isUpcoming}`);
    console.log(`✅ Filtering logic works!`);
  } catch (error) {
    console.log(`❌ Filtering error: ${error.message}`);
  }
});

console.log("\n🎉 All date parsing tests completed!");
