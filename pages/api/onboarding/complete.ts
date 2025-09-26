import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import sql from "../../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const {
      firstName,
      lastName,
      phone,
      address,
      emergencyContactName,
      emergencyContactPhone,
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !phone ||
      !emergencyContactName ||
      !emergencyContactPhone
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Update user with onboarding information
    const result = await sql`
      UPDATE users 
      SET 
        first_name = ${firstName},
        last_name = ${lastName},
        phone = ${phone},
        address = ${address || null},
        emergency_contact_name = ${emergencyContactName},
        emergency_contact_phone = ${emergencyContactPhone},
        onboarding_completed = true,
        updated_at = NOW()
      WHERE email = ${session.user.email}
      RETURNING id, first_name, last_name, onboarding_completed
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    console.log(`✅ Onboarding completed for user: ${session.user.email}`);

    res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      user: result[0],
    });
  } catch (error) {
    console.error("❌ Error completing onboarding:", error);
    res.status(500).json({
      success: false,
      error: "Failed to complete onboarding",
    });
  }
}
