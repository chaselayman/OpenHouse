"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Shield,
  Zap,
  Loader2,
  Cake,
  Star,
  Flame,
  TrendingUp,
  Home,
} from "lucide-react";
import { AUTOMATION_PRODUCTS } from "@/lib/hooks/useSubscriptions";

const automationDetails: Record<string, {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  features: string[];
}> = {
  bigdaybot: {
    name: "BigDayBot",
    description: "Automated birthday & anniversary campaigns",
    icon: Cake,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    features: [
      "Unlimited contacts",
      "Birthday campaigns",
      "Wedding anniversary campaigns",
      "Home purchase anniversary",
      "Move-in anniversary",
      "Kids' birthday tracking",
      "CSV import & CRM sync",
      "Customizable email templates",
      "Smart send timing",
      "Email open tracking",
    ],
  },
  reviewdrip: {
    name: "ReviewDrip",
    description: "Smart Google Review request timing",
    icon: Star,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    features: [
      "Smart timing algorithms",
      "Email + SMS channels",
      "Review tracking dashboard",
      "Custom message templates",
      "Automated follow-ups",
      "Review analytics",
      "Google integration",
      "Response rate tracking",
    ],
  },
  leadrevive: {
    name: "LeadRevive",
    description: "AI-powered cold lead re-engagement",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    features: [
      "AI message crafting",
      "Lead scoring",
      "Engagement tracking",
      "Multi-touch sequences",
      "Conversion analytics",
      "CRM integration",
      "A/B testing",
      "Response optimization",
    ],
  },
  touchbase: {
    name: "TouchBase",
    description: "Automated CMA emails to sellers",
    icon: TrendingUp,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    features: [
      "Automated CMA reports",
      "Market trend analysis",
      "Property value updates",
      "MLS data integration",
      "Seller engagement tracking",
      "Custom templates",
      "Scheduled delivery",
      "Open tracking",
    ],
  },
  openhouse: {
    name: "OpenHouse",
    description: "AI showing scheduling with ShowingTime",
    icon: Home,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    features: [
      "ShowingTime integration",
      "AI scheduling assistant",
      "Automatic confirmations",
      "Calendar sync",
      "Showing analytics",
      "Client notifications",
      "Feedback collection",
      "Route optimization",
    ],
  },
};

export default function SubscribePage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const automationId = params.id as string;

  const automation = automationDetails[automationId];
  const product = AUTOMATION_PRODUCTS.find((p) => p.id === automationId);

  if (!automation || !product) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[var(--foreground)]">
            Automation not found
          </h1>
          <Link
            href="/automations"
            className="text-sky-500 hover:text-sky-400 mt-4 inline-block"
          >
            Back to Automations
          </Link>
        </div>
      </div>
    );
  }

  const Icon = automation.icon;
  const price = (product.price_monthly / 100).toFixed(0);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // Call our API to create a Stripe checkout session
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          automationId,
          priceId: product.stripe_price_id,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error("Failed to create checkout:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Back Link */}
      <Link
        href="/automations"
        className="inline-flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Automations</span>
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className={`w-16 h-16 rounded-2xl ${automation.bgColor} flex items-center justify-center`}
        >
          <Icon className={`w-8 h-8 ${automation.color}`} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Subscribe to {automation.name}
          </h1>
          <p className="text-[var(--foreground-muted)]">{automation.description}</p>
        </div>
      </div>

      {/* Pricing Card */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-4xl font-bold text-[var(--foreground)]">${price}</span>
          <span className="text-[var(--foreground-muted)]">/month</span>
        </div>

        <div className="space-y-3 mb-6">
          {automation.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-500" />
              </div>
              <span className="text-sm text-[var(--foreground)]">{feature}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Subscribe Now - ${price}/mo
            </>
          )}
        </button>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <Shield className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <div className="text-sm font-medium text-[var(--foreground)]">Secure Payment</div>
          <div className="text-xs text-[var(--foreground-muted)]">Powered by Stripe</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <Zap className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <div className="text-sm font-medium text-[var(--foreground)]">Instant Access</div>
          <div className="text-xs text-[var(--foreground-muted)]">Start immediately</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <CreditCard className="w-6 h-6 text-sky-500 mx-auto mb-2" />
          <div className="text-sm font-medium text-[var(--foreground)]">Cancel Anytime</div>
          <div className="text-xs text-[var(--foreground-muted)]">No commitments</div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-medium text-[var(--foreground)] mb-1">
              When will I be charged?
            </h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              You&apos;ll be charged immediately upon subscribing, then monthly on the same date.
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-medium text-[var(--foreground)] mb-1">
              Can I cancel anytime?
            </h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              Yes! You can cancel your subscription at any time from your settings.
              You&apos;ll retain access until the end of your billing period.
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-medium text-[var(--foreground)] mb-1">
              Is there a free trial?
            </h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              We don&apos;t offer a free trial, but you can cancel within the first 7 days
              for a full refund if you&apos;re not satisfied.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
