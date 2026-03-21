require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

sql`
  SELECT email, name, is_admin, onboarding_completed, waiver_signed 
  FROM users 
  WHERE LOWER(email) IN ('flbesttrainer@gmail.com', 'gavinstanifer@live.com')
`
  .then((rows) => {
    if (rows.length === 0) {
      console.log("❌ Neither email found in the database");
      return;
    }
    rows.forEach((r) => {
      console.log("---");
      console.log("Email:               ", r.email);
      console.log("is_admin:            ", r.is_admin);
      console.log("onboarding_completed:", r.onboarding_completed);
      console.log("waiver_signed:       ", r.waiver_signed);
    });

    const missing = [
      "flbesttrainer@gmail.com",
      "gavinstanifer@live.com",
    ].filter((e) => !rows.find((r) => r.email.toLowerCase() === e));
    if (missing.length > 0) {
      console.log("\n⚠️  Not found in DB:", missing.join(", "));
      console.log("   (These emails have never signed in via Google)");
    }
  })
  .catch((e) => console.error(e));
