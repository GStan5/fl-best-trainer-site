import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import sql from "../../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Prevent caching to ensure fresh data
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Check user's onboarding status
    const result = await sql`
      SELECT 
        id,
        email,
        name,
        first_name,
        last_name,
        phone,
        address,
        emergency_contact_name,
        emergency_contact_phone,
        fitness_goals,
        medical_conditions,
        waiver_signed,
        waiver_signed_date,
        onboarding_completed,
        weightlifting_classes_remaining,
        weightlifting_classes_booked,
        classes_attended,
        personal_training_sessions_remaining,
        is_admin
      FROM users 
      WHERE email = ${session.user.email}
    `;

    if (result.length === 0) {
      // User doesn't exist in database yet, create them
      console.log(`🆕 Creating new user in database: ${session.user.email}`);

      try {
        await sql`
          INSERT INTO users (
            email, 
            name,
            first_name,
            last_name,
            onboarding_completed,
            waiver_signed
          ) VALUES (
            ${session.user.email},
            ${session.user.name || ""},
            ${session.user.name?.split(" ")[0] || ""},
            ${session.user.name?.split(" ").slice(1).join(" ") || ""},
            false,
            false
          )
        `;

        // Now fetch the newly created user
        const newUserResult = await sql`
          SELECT 
            id,
            email,
            name,
            first_name,
            last_name,
            phone,
            address,
            emergency_contact_name,
            emergency_contact_phone,
            fitness_goals,
            medical_conditions,
            waiver_signed,
            waiver_signed_date,
            onboarding_completed,
            weightlifting_classes_remaining,
            weightlifting_classes_booked,
            classes_attended,
            personal_training_sessions_remaining,
            is_admin
          FROM users 
          WHERE email = ${session.user.email}
        `;

        const user = newUserResult[0];
        const needsOnboarding = !user.onboarding_completed;
        const needsWaiver = !user.waiver_signed;
        const hasBasicInfo = !!(
          user.first_name &&
          user.last_name &&
          user.phone &&
          user.emergency_contact_name &&
          user.emergency_contact_phone
        );

        console.log(
          `✅ New user created and needs onboarding: ${needsOnboarding}, needs waiver: ${needsWaiver}`
        );

        return res.status(200).json({
          success: true,
          user: {
            ...user,
            needsOnboarding,
            needsWaiver,
            hasBasicInfo,
          },
        });
      } catch (createError) {
        console.error("❌ Error creating user:", createError);
        return res.status(500).json({
          success: false,
          error: "Failed to create user",
        });
      }
    }

    const user = result[0];

    // Determine what steps are needed
    const needsOnboarding = !user.onboarding_completed;
    const needsWaiver = !user.waiver_signed;
    const hasBasicInfo = !!(
      user.first_name &&
      user.last_name &&
      user.phone &&
      user.emergency_contact_name &&
      user.emergency_contact_phone
    );

    res.status(200).json({
      success: true,
      user: {
        ...user,
        needsOnboarding,
        needsWaiver,
        hasBasicInfo,
      },
    });
  } catch (error) {
    console.error("❌ Error checking onboarding status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check onboarding status",
    });
  }
}
