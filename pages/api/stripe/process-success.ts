import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import sql from "../../../lib/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    // Retrieve the Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    // Extract metadata
    const { userId, packageId, packageName, packageType, sessions, price } =
      checkoutSession.metadata!;

    // Make sure the session belongs to the current user
    if (userId !== session.user.email) {
      return res
        .status(403)
        .json({ error: "Session belongs to different user" });
    }

    // Get user ID from email
    const users =
      await sql`SELECT id FROM users WHERE email = ${userId} LIMIT 1;`;

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userIdNum = users[0].id;

    // Check if this purchase has already been processed
    const existingPurchase = await sql`
      SELECT id FROM purchases 
      WHERE stripe_payment_intent_id = ${
        checkoutSession.payment_intent as string
      }
      LIMIT 1
    `;

    if (existingPurchase.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Purchase already processed",
        alreadyProcessed: true,
      });
    }

    // Start a transaction to ensure both purchase and user_package are created
    await sql`BEGIN`;

    try {
      // Insert new purchase record
      const purchase = await sql`
        INSERT INTO purchases (
          user_id,
          package_type,
          sessions_included,
          amount_paid,
          payment_method,
          payment_status,
          stripe_payment_intent_id,
          notes,
          payment_completed_at
        ) VALUES (
          ${userIdNum},
          ${packageName},
          ${parseInt(sessions)},
          ${parseFloat(price)},
          'stripe',
          'completed',
          ${checkoutSession.payment_intent as string},
          ${`Stripe checkout session: ${checkoutSession.id}`},
          NOW()
        )
        RETURNING *
      `;

      // Create user_package record to add sessions to user's account
      const userPackage = await sql`
        INSERT INTO user_packages (
          user_id,
          sessions_remaining,
          purchase_date,
          expiry_date,
          is_active
        ) VALUES (
          ${userIdNum},
          ${parseInt(sessions)},
          NOW(),
          NOW() + INTERVAL '90 days',
          true
        )
        RETURNING *
      `;

      // Add sessions to user's account based on package type
      if (
        packageType === "weightlifting" ||
        packageName.toLowerCase().includes("weightlifting")
      ) {
        // Add to weightlifting classes
        await sql`
          UPDATE users 
          SET weightlifting_classes_remaining = COALESCE(weightlifting_classes_remaining, 0) + ${parseInt(
            sessions
          )}
          WHERE id = ${userIdNum}
        `;
      } else if (
        packageType === "private" ||
        packageName.toLowerCase().includes("private")
      ) {
        // Add to private sessions
        await sql`
          UPDATE users 
          SET private_sessions_remaining = COALESCE(private_sessions_remaining, 0) + ${parseInt(
            sessions
          )}
          WHERE id = ${userIdNum}
        `;
      } else {
        // Default to weightlifting classes for general packages
        await sql`
          UPDATE users 
          SET weightlifting_classes_remaining = COALESCE(weightlifting_classes_remaining, 0) + ${parseInt(
            sessions
          )}
          WHERE id = ${userIdNum}
        `;
      }

      await sql`COMMIT`;

      res.status(200).json({
        success: true,
        data: {
          purchase: purchase[0],
          user_package: userPackage[0],
          sessions_added: parseInt(sessions),
        },
      });
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error("Error processing successful payment:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
