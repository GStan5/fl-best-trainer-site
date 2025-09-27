import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import sql from "../../../lib/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const buf = JSON.stringify(req.body);
  const sig = req.headers["stripe-signature"]!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res
      .status(400)
      .json({ error: "Webhook signature verification failed" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;

      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("PaymentIntent succeeded:", paymentIntent.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  try {
    const { userId, packageId, packageName, packageType, sessions, price } =
      session.metadata!;

    // Get user ID from email
    const users =
      await sql`SELECT id FROM users WHERE email = ${userId} LIMIT 1;`;

    if (users.length === 0) {
      console.error("User not found:", userId);
      return;
    }

    const userIdNum = users[0].id;

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
          ${session.payment_intent as string},
          ${`Stripe checkout session: ${session.id}`},
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
          '2099-12-31 23:59:59'::timestamp,
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

      console.log("Successfully processed Stripe payment:", {
        userId,
        packageName,
        sessions,
        amount: price,
        purchaseId: purchase[0].id,
        userPackageId: userPackage[0].id,
      });
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error("Error handling successful payment:", error);
    throw error;
  }
}
