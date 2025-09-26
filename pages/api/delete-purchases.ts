import type { NextApiRequest, NextApiResponse } from "next";
import sql from "../../lib/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Delete all purchases for the specified user
    const deletedPurchases = await sql`
      DELETE FROM purchases 
      WHERE user_id = (SELECT id FROM users WHERE email = ${email})
      RETURNING *
    `;

    return res.status(200).json({
      success: true,
      message: `Deleted ${deletedPurchases.length} purchases for ${email}`,
      deleted: deletedPurchases,
    });
  } catch (error) {
    console.error("Error deleting purchases:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete purchases",
    });
  }
}
