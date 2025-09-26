import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import sql from "../../../../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);

    console.log("Session:", session);

    if (!session?.user?.email) {
      console.log("No session email found");
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Check if user is admin
    const isAdmin =
      session.user.email === "gavinstanifer@live.com" ||
      session.user.email === "gavinstaniferengineering@gmail.com";

    console.log("User email:", session.user.email);
    console.log("Is admin:", isAdmin);

    if (!isAdmin) {
      console.log("Access denied for user:", session.user.email);
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    if (req.method !== "PUT") {
      res.setHeader("Allow", ["PUT"]);
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`,
      });
    }

    const { clientId } = req.query;
    const {
      weightlifting_classes_remaining,
      personal_training_sessions_remaining,
    } = req.body;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: "Client ID is required",
      });
    }

    // Validate that the values are non-negative integers
    const weightlifting = parseInt(weightlifting_classes_remaining) || 0;
    const personalTraining =
      parseInt(personal_training_sessions_remaining) || 0;

    if (weightlifting < 0 || personalTraining < 0) {
      return res.status(400).json({
        success: false,
        error: "Session counts must be non-negative integers",
      });
    }

    // Update the client's session counts
    const result = await sql`
      UPDATE users 
      SET 
        weightlifting_classes_remaining = ${weightlifting},
        personal_training_sessions_remaining = ${personalTraining},
        updated_at = NOW()
      WHERE id = ${clientId}
      RETURNING 
        id,
        email,
        first_name,
        last_name,
        weightlifting_classes_remaining,
        personal_training_sessions_remaining
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Client not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Session counts updated successfully",
      client: result[0],
    });
  } catch (error) {
    console.error("Error updating session counts:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update session counts",
    });
  }
}
