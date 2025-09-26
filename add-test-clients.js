// Script to add test clients to the database
const sql = require("./lib/database");

const testClients = [
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    google_id: null,
    is_admin: false,
  },
  {
    name: "Mike Rodriguez",
    email: "mike.rodriguez@email.com",
    google_id: null,
    is_admin: false,
  },
  {
    name: "Emily Chen",
    email: "emily.chen@email.com",
    google_id: null,
    is_admin: false,
  },
  {
    name: "David Thompson",
    email: "david.thompson@email.com",
    google_id: null,
    is_admin: false,
  },
  {
    name: "Lisa Martinez",
    email: "lisa.martinez@email.com",
    google_id: null,
    is_admin: false,
  },
  {
    name: "Alex Kim",
    email: "alex.kim@email.com",
    google_id: null,
    is_admin: false,
  },
  {
    name: "Rachel Brown",
    email: "rachel.brown@email.com",
    google_id: null,
    is_admin: false,
  },
  {
    name: "James Wilson",
    email: "james.wilson@email.com",
    google_id: null,
    is_admin: false,
  },
];

async function addTestClients() {
  try {
    console.log("Adding test clients to database...");

    for (const client of testClients) {
      try {
        const result = await sql`
          INSERT INTO users (name, email, google_id, is_admin)
          VALUES (${client.name}, ${client.email}, ${client.google_id}, ${client.is_admin})
          ON CONFLICT (email) DO NOTHING
          RETURNING id, name, email
        `;

        if (result.length > 0) {
          console.log(
            `✅ Added client: ${result[0].name} (${result[0].email})`
          );
        } else {
          console.log(
            `⚠️  Client already exists: ${client.name} (${client.email})`
          );
        }
      } catch (error) {
        console.error(`❌ Error adding client ${client.name}:`, error);
      }
    }

    console.log("\n🎉 Test clients setup complete!");

    // Show all users in database
    const allUsers =
      await sql`SELECT id, name, email, is_admin FROM users ORDER BY name`;
    console.log("\n📋 All users in database:");
    allUsers.forEach((user) => {
      console.log(
        `  ${user.name} (${user.email}) ${
          user.is_admin ? "[ADMIN]" : "[CLIENT]"
        }`
      );
    });
  } catch (error) {
    console.error("❌ Error setting up test clients:", error);
  }
}

addTestClients();
