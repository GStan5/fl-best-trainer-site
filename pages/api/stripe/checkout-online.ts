import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

// Independent for Life — online checkout (Phase 1).
// NEW sibling route: the in-person checkout (create-checkout-session.ts)
// is never modified. This route is deliberately GUEST checkout (no auth),
// for the low-friction $37 first purchase.
//
// SAFETY GUARD: this route refuses to create a session unless the Stripe
// secret key is a TEST key (sk_test_...) or ONLINE_SALES_LIVE === 'true'.
// That guarantees a Vercel preview deployment can never take real money.

const STARTER_PRODUCT = {
  name: "Independent for Life — 4-Week Starter Plan",
  description:
    "12 sessions. 30 minutes, 3 times a week. At home. A complete, trainer-written program for adults 50+.",
  amount: 3700, // $37.00 in cents
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  const salesLive = process.env.ONLINE_SALES_LIVE === "true";
  const testKey = secretKey.startsWith("sk_test_");

  if (!secretKey || (!testKey && !salesLive)) {
    return res
      .status(501)
      .json({ error: "online checkout not enabled" });
  }

  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: "2025-08-27.basil",
    });

    const origin =
      req.headers.origin ||
      (req.headers.host ? `https://${req.headers.host}` : "https://flbesttrainer.com");

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: STARTER_PRODUCT.name,
              description: STARTER_PRODUCT.description,
            },
            unit_amount: STARTER_PRODUCT.amount,
          },
          quantity: 1,
        },
      ],
      metadata: { product: "starter-plan" },
      success_url: `${origin}/starter?checkout=success`,
      cancel_url: `${origin}/starter?checkout=cancelled`,
    });

    return res.status(200).json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[checkout-online] Session creation failed:", err);
    return res
      .status(500)
      .json({ error: "Could not start checkout. Please try again." });
  }
}
