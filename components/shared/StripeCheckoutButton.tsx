import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { FaSpinner, FaCreditCard } from "react-icons/fa";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  sessions: number;
  type: "weightlifting" | "private" | "combo";
  features?: string[];
}

interface StripeCheckoutButtonProps {
  package: Package;
  className?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function StripeCheckoutButton({
  package: pkg,
  className = "",
  children,
  onSuccess,
  onError,
}: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      const error =
        "Stripe is not properly configured. Please contact support.";
      console.error(error);
      onError?.(error);
      return;
    }

    try {
      setLoading(true);

      // Create checkout session
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: pkg.id,
          packageName: pkg.name,
          packageDescription: pkg.description,
          price: pkg.price,
          sessions: pkg.sessions,
          packageType: pkg.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during checkout";
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const defaultClassName = `
    w-full inline-flex items-center justify-center px-6 py-3 
    bg-gradient-to-r from-royal to-royal-light 
    hover:from-royal-light hover:to-royal
    text-white font-medium rounded-lg 
    transition-all duration-300 
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:ring-2 focus:ring-royal/50 focus:outline-none
    ${className}
  `;

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={defaultClassName}
      aria-label={`Purchase ${pkg.name} for $${pkg.price}`}
    >
      {loading ? (
        <>
          <FaSpinner className="animate-spin mr-2" />
          Processing...
        </>
      ) : (
        <>
          {children || (
            <>
              <FaCreditCard className="mr-2" />
              Buy for ${pkg.price}
            </>
          )}
        </>
      )}
    </button>
  );
}

// Predefined package configurations
export const PACKAGE_CONFIGS: Package[] = [
  {
    id: "weightlifting-10-class",
    name: "10-Class Weightlifting Package",
    description: "Small group training • 4-person max • Expert instruction",
    price: 400,
    sessions: 10,
    type: "weightlifting",
    features: [
      "Small group training (max 4 people)",
      "Expert weightlifting instruction",
      "Progressive strength building",
      "Form correction and safety",
      "Best value for regular training",
    ],
  },
  {
    id: "private-1-session",
    name: "Private Training Session",
    description: "1-on-1 training • Personalized program • Flexible scheduling",
    price: 150,
    sessions: 1,
    type: "private",
    features: [
      "60-minute one-on-one session",
      "Personalized workout program",
      "Flexible scheduling",
      "Full attention and form correction",
    ],
  },
  {
    id: "private-4-sessions",
    name: "4 Private Sessions Package",
    description: "Four 1-on-1 sessions • Save $20 per session",
    price: 520,
    sessions: 4,
    type: "private",
    features: [
      "Four 60-minute sessions",
      "Save $20 per session",
      "Personalized program development",
      "Progress tracking included",
    ],
  },
  {
    id: "starter-package",
    name: "Starter Package (8 Sessions)",
    description:
      "Eight 60-minute sessions • $130/session • Perfect for beginners",
    price: 1040,
    sessions: 8,
    type: "private",
    features: [
      "Eight 60-minute sessions",
      "Comprehensive fitness assessment",
      "Custom workout program",
      "Nutrition recommendations",
      "Form guidance and technique tips",
    ],
  },
  {
    id: "commitment-package",
    name: "Commitment Package (12 Sessions)",
    description: "Twelve sessions • $120/session • Popular choice",
    price: 1440,
    sessions: 12,
    type: "private",
    features: [
      "Twelve 60-minute sessions",
      "Advanced personalized program",
      "Priority scheduling",
      "Comprehensive fitness assessment",
      "Expert form guidance",
    ],
  },
  {
    id: "transform-package",
    name: "Transform Package (24 Sessions)",
    description: "Twenty-four sessions • $100/session • Maximum results",
    price: 2400,
    sessions: 24,
    type: "private",
    features: [
      "Twenty-four 60-minute sessions",
      "Complete body transformation program",
      "Premium scheduling priority",
      "Comprehensive fitness assessments",
      "Customized program adjustments",
    ],
  },
];

// Helper function to get package by ID
export const getPackageById = (id: string): Package | undefined => {
  return PACKAGE_CONFIGS.find((pkg) => pkg.id === id);
};

// Helper function to get packages by type
export const getPackagesByType = (
  type: "weightlifting" | "private" | "combo"
): Package[] => {
  return PACKAGE_CONFIGS.filter((pkg) => pkg.type === type);
};
