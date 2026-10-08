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

const PRODUCTS = {
  starter: {
    name: "Independent for Life — 4-Week Starter Plan",
    description:
      "12 sessions. 30 minutes, 3 times a week. At home. A complete, trainer-written program for adults 50+.",
    amount: 3700, // $37.00 in cents
    metadataProduct: "starter-plan",
    successPath: "/thank-you-starter",
    cancelPath: "/starter?checkout=cancelled",
    mode: "payment",
  },
  "self-study": {
    name: "Independent for Life — Self-Study",
    description:
      "The same 18 sessions. The same three tests. The same video library. The only thing missing is the coach looking over your shoulder.",
    amount: 19700, // $197.00 in cents
    metadataProduct: "self-study",
    successPath: "/self-study?checkout=success",
    cancelPath: "/self-study?checkout=cancelled",
    mode: "payment",
  },
  // Phase 3: continuity subscriptions (PAGE_COPY PAGE 7). The only
  // recurring products in the online ladder; same guard applies.
  "monthly-97": {
    name: "Independent for Life Monthly",
    description:
      "A new training block every month, weekly group Q&A, quarterly retesting, member community, and The Steady Letter.",
    amount: 9700, // $97.00/mo in cents
    metadataProduct: "monthly-97",
    successPath: "/monthly?checkout=success",
    cancelPath: "/monthly?checkout=cancelled",
    mode: "subscription",
  },
  "monthly-147": {
    name: "Independent for Life Monthly Plus",
    description: "Everything in Monthly, plus 1:1 text access to Gavin.",
    amount: 14700, // $147.00/mo in cents
    metadataProduct: "monthly-147",
    successPath: "/monthly?checkout=success",
    cancelPath: "/monthly?checkout=cancelled",
    mode: "subscription",
  },
  "monthly-197": {
    name: "Independent for Life Monthly Best",
    description:
      "Everything in Plus, plus a personal form-video review every month.",
    amount: 19700, // $197.00/mo in cents
    metadataProduct: "monthly-197",
    successPath: "/monthly?checkout=success",
    cancelPath: "/monthly?checkout=cancelled",
    mode: "subscription",
  },
} as const;

type ProductKey = keyof typeof PRODUCTS;

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

  const requested =
    typeof req.body?.product === "string" ? req.body.product : "";
  const productKey: ProductKey =
    requested in PRODUCTS ? (requested as ProductKey) : "starter";
  const product = PRODUCTS[productKey];

  // Monthly stays closed until its own launch switch (2026-10-08 flip
  // decision: starter + self-study go live; monthly waits for the cohort
  // Week-5 launch). Test keys are exempt so preview rehearsals keep
  // working; with a live key, monthly products refuse until
  // MONTHLY_SALES_LIVE === 'true'.
  const monthlyLive = process.env.MONTHLY_SALES_LIVE === "true";
  if (productKey.startsWith("monthly") && !testKey && !monthlyLive) {
    return res
      .status(501)
      .json({ error: "monthly enrollment is not open yet" });
  }
  const isSubscription = product.mode === "subscription";

  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: "2025-08-27.basil",
    });

    const origin =
      req.headers.origin ||
      (req.headers.host ? `https://${req.headers.host}` : "https://flbesttrainer.com");

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: isSubscription ? "subscription" : "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.amount,
            ...(isSubscription
              ? { recurring: { interval: "month" as const } }
              : {}),
          },
          quantity: 1,
        },
      ],
      metadata: { product: product.metadataProduct },
      success_url: `${origin}${product.successPath}`,
      cancel_url: `${origin}${product.cancelPath}`,
    });

    return res.status(200).json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[checkout-online] Session creation failed:", err);
    return res
      .status(500)
      .json({ error: "Could not start checkout. Please try again." });
  }
}
