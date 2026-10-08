import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

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

    const {
      packageId,
      packageName,
      packageDescription,
      price,
      sessions,
      packageType,
    } = req.body;

    // Validate required fields
    if (!packageId || !packageName || !price || !sessions || !packageType) {
      return res.status(400).json({
        error:
          "Missing required fields: packageId, packageName, price, sessions, packageType",
      });
    }

    // Payment-safety (2026-10-08): if this package lives in the database,
    // the database row is the only price source — the posted name, price,
    // and sessions are ignored, so no stale or tampered client can change
    // the charge. Non-database packages (private training configs) keep
    // their posted values. A failed lookup falls back to posted values so
    // checkout never breaks on a database hiccup.
    let chargeName = packageName;
    let chargeDescription = packageDescription;
    let chargeSessions = sessions;
    let chargePrice = Number(price);
    try {
      if (process.env.DATABASE_URL) {
        const { default: sql } = await import("../../../lib/database");
        const rows = await sql`
          SELECT name, description, sessions_included, price
          FROM packages
          WHERE id = ${packageId} AND is_active = true
        `;
        if (rows.length > 0) {
          chargeName = rows[0].name;
          chargeDescription = rows[0].description || packageDescription;
          chargeSessions = rows[0].sessions_included;
          chargePrice = Number(rows[0].price);
        }
      }
    } catch (dbError) {
      console.error(
        "[create-checkout-session] DB price lookup failed; using posted values:",
        dbError
      );
    }

    // Convert price to cents for Stripe
    const priceInCents = Math.round(chargePrice * 100);

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: chargeName,
              description: chargeDescription,
              metadata: {
                packageId,
                packageType,
                sessions: chargeSessions.toString(),
              },
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${
        process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3001"
      }/account?success=true&session_id={CHECKOUT_SESSION_ID}&package=${encodeURIComponent(
        chargeName
      )}`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3001"
      }/account?canceled=true`,
      metadata: {
        userId: session.user.email,
        packageId,
        packageName: chargeName,
        packageType,
        sessions: chargeSessions.toString(),
        price: chargePrice.toString(),
      },
      customer_email: session.user.email,
      billing_address_collection: "required",
    });

    res.status(200).json({ sessionId: checkoutSession.id });
  } catch (error) {
    console.error("Stripe checkout session creation error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
