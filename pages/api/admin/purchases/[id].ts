import type { NextApiRequest, NextApiResponse } from "next";
import sql from "../../../../lib/database";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check authentication and admin status
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  // Check if user is admin
  const adminCheck = await sql`
    SELECT is_admin FROM users WHERE email = ${session.user.email}
  `;

  if (!adminCheck[0]?.is_admin) {
    return res.status(403).json({
      success: false,
      error: "Forbidden: Admin access required",
    });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      success: false,
      error: "Purchase ID is required",
    });
  }

  // UPDATE purchase
  if (req.method === "PUT") {
    try {
      const {
        package_type,
        sessions_included,
        amount_paid,
        payment_method,
        payment_status,
        notes,
        sessions_difference, // Change in sessions (positive or negative)
      } = req.body;

      // Get the current purchase to compare session changes
      const currentPurchase = await sql`
        SELECT * FROM purchases WHERE id = ${id}
      `;

      if (currentPurchase.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Purchase not found",
        });
      }

      const oldSessionsIncluded = currentPurchase[0].sessions_included;

      // Update purchase record
      const updatedPurchase = await sql`
        UPDATE purchases
        SET 
          package_type = ${package_type},
          sessions_included = ${sessions_included},
          amount_paid = ${amount_paid},
          payment_method = ${payment_method},
          payment_status = ${payment_status},
          notes = ${notes || null},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      // If sessions_included changed, update the user's remaining sessions
      if (sessions_difference && sessions_difference !== 0) {
        const userId = currentPurchase[0].user_id;
        const packageTypeLower = package_type.toLowerCase();

        if (
          packageTypeLower.includes("weightlifting") ||
          packageTypeLower.includes("strength") ||
          packageTypeLower.includes("class")
        ) {
          // Update weightlifting classes
          await sql`
            UPDATE users 
            SET weightlifting_classes_remaining = GREATEST(0, COALESCE(weightlifting_classes_remaining, 0) + ${sessions_difference})
            WHERE id = ${userId}
          `;
        } else if (
          packageTypeLower.includes("private") ||
          packageTypeLower.includes("personal")
        ) {
          // Update private sessions
          await sql`
            UPDATE users 
            SET private_sessions_remaining = GREATEST(0, COALESCE(private_sessions_remaining, 0) + ${sessions_difference})
            WHERE id = ${userId}
          `;
        } else {
          // Default to weightlifting classes
          await sql`
            UPDATE users 
            SET weightlifting_classes_remaining = GREATEST(0, COALESCE(weightlifting_classes_remaining, 0) + ${sessions_difference})
            WHERE id = ${userId}
          `;
        }
      }

      return res.status(200).json({
        success: true,
        data: updatedPurchase[0],
        message: "Purchase updated successfully",
      });
    } catch (error) {
      console.error("Error updating purchase:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update purchase",
      });
    }
  }

  // DELETE purchase
  if (req.method === "DELETE") {
    try {
      // Get purchase details before deleting
      const purchase = await sql`
        SELECT * FROM purchases WHERE id = ${id}
      `;

      if (purchase.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Purchase not found",
        });
      }

      const purchaseData = purchase[0];
      const userId = purchaseData.user_id;
      const sessionsIncluded = purchaseData.sessions_included;
      const packageTypeLower = purchaseData.package_type.toLowerCase();

      // Start transaction
      await sql`BEGIN`;

      try {
        // Remove sessions from user's account
        if (
          packageTypeLower.includes("weightlifting") ||
          packageTypeLower.includes("strength") ||
          packageTypeLower.includes("class")
        ) {
          await sql`
            UPDATE users 
            SET weightlifting_classes_remaining = GREATEST(0, COALESCE(weightlifting_classes_remaining, 0) - ${sessionsIncluded})
            WHERE id = ${userId}
          `;
        } else if (
          packageTypeLower.includes("private") ||
          packageTypeLower.includes("personal")
        ) {
          await sql`
            UPDATE users 
            SET private_sessions_remaining = GREATEST(0, COALESCE(private_sessions_remaining, 0) - ${sessionsIncluded})
            WHERE id = ${userId}
          `;
        } else {
          await sql`
            UPDATE users 
            SET weightlifting_classes_remaining = GREATEST(0, COALESCE(weightlifting_classes_remaining, 0) - ${sessionsIncluded})
            WHERE id = ${userId}
          `;
        }

        // Delete the purchase
        await sql`
          DELETE FROM purchases WHERE id = ${id}
        `;

        await sql`COMMIT`;

        return res.status(200).json({
          success: true,
          message: "Purchase deleted successfully",
          sessions_removed: sessionsIncluded,
        });
      } catch (error) {
        await sql`ROLLBACK`;
        throw error;
      }
    } catch (error) {
      console.error("Error deleting purchase:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete purchase",
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: `Method ${req.method} not allowed`,
  });
}
