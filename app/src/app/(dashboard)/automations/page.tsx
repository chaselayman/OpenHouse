"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Home,
  Flame,
  TrendingUp,
  Star,
  Cake,
  ChevronRight,
  ChevronDown,
  Zap,
  Lock,
  CreditCard,
} from "lucide-react";
import { useSubscriptions, AUTOMATION_PRODUCTS } from "@/lib/hooks/useSubscriptions";

interface Automation {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  features: string[];
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  href: string;
  comingSoon?: boolean;
}

const automations: Automation[] = [
  {
    id: "bigdaybot",
    name: "BigDayBot",
    description: "Drip campaigns for Anniversaries, Birthdays, and special occasions",
    longDescription: "Automatically send personalized messages to your clients on their special days. Import contacts via CSV, sync from your CRM, or add manually.",
    features: [
      "Birthday & anniversary campaigns",
      "Kids' birthday tracking",
      "Home purchase anniversaries",
      "Customizable email templates",
      "Smart send timing",
    ],
    icon: Cake,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    href: "/automations/bigdaybot",
  },
  {
    id: "reviewdrip",
    name: "ReviewDrip",
    description: "Automated Google Review requests with smart timing",
    longDescription: "Boost your online reputation with perfectly-timed review requests. Smart delays ensure you reach clients when they're most likely to leave positive feedback.",
    features: [
      "Smart timing algorithms",
      "Multi-channel (email + SMS)",
      "Review tracking dashboard",
      "Custom message templates",
      "Automated follow-ups",
    ],
    icon: Star,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    href: "/automations/reviewdrip",
    comingSoon: true,
  },
  {
    id: "leadrevive",
    name: "LeadRevive",
    description: "Revive cold leads with personalized AI messages",
    longDescription: "Re-engage cold leads with AI-crafted messages that feel personal. Our AI analyzes lead history to create compelling, context-aware outreach.",
    features: [
      "AI-powered message crafting",
      "Lead scoring & prioritization",
      "Engagement tracking",
      "Multi-touch sequences",
      "Conversion analytics",
    ],
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    href: "/automations/leadrevive",
    comingSoon: true,
  },
  {
    id: "touchbase",
    name: "TouchBase",
    description: "Automated Cost Analysis emails to Sellers",
    longDescription: "Stay top of mind with sellers by automatically sending them CMA updates. Uses MLS data to provide relevant market insights.",
    features: [
      "Automated CMA reports",
      "Market trend analysis",
      "Property value updates",
      "MLS data integration",
      "Seller engagement tracking",
    ],
    icon: TrendingUp,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    href: "/automations/touchbase",
    comingSoon: true,
  },
  {
    id: "openhouse",
    name: "OpenHouse",
    description: "AI-powered showing scheduling with ShowingTime",
    longDescription: "Let AI handle your showing requests. Integrates with ShowingTime to automatically schedule, confirm, and manage property showings.",
    features: [
      "ShowingTime integration",
      "AI scheduling assistant",
      "Automatic confirmations",
      "Calendar sync",
      "Showing analytics",
    ],
    icon: Home,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/20",
    href: "/automations/openhouse",
    comingSoon: true,
  },
];

export default function AutomationsPage() {
  const { isSubscribed, isLoading } = useSubscriptions();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getPrice = (automationId: string) => {
    const product = AUTOMATION_PRODUCTS.find((p) => p.id === automationId);
    return product ? (product.price_monthly / 100).toFixed(0) : "0";
  };

  const subscribedCount = automations.filter(
    (a) => !a.comingSoon && isSubscribed(a.id)
  ).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Automations</h1>
            <p className="text-sm text-[var(--foreground-muted)]">
              {subscribedCount} of {automations.filter((a) => !a.comingSoon).length} automations subscribed
            </p>
          </div>
        </div>
      </div>

      {/* Automation Cards */}
      <div className="grid gap-4">
        {automations.map((automation) => {
          const Icon = automation.icon;
          const hasSubscription = !automation.comingSoon && isSubscribed(automation.id);
          const isExpanded = expandedId === automation.id;
          const price = getPrice(automation.id);

          return (
            <div
              key={automation.id}
              className={`glass-card rounded-2xl overflow-hidden transition-all ${
                hasSubscription ? "border-emerald-500/30" : ""
              } ${automation.comingSoon ? "opacity-60" : ""}`}
            >
              {/* Main Card Content */}
              <div className="p-6">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl ${automation.bgColor} border ${automation.borderColor} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`w-7 h-7 ${automation.color}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        {automation.name}
                      </h3>
                      {automation.comingSoon && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-500/20 text-[var(--foreground-muted)] text-xs font-medium">
                          Coming Soon
                        </span>
                      )}
                      {hasSubscription && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-xs font-medium">
                          Subscribed
                        </span>
                      )}
                      {!automation.comingSoon && !hasSubscription && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-medium flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          ${price}/mo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--foreground-muted)] mt-1">
                      {automation.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Expand/Collapse */}
                    <button
                      onClick={() => toggleExpand(automation.id)}
                      disabled={automation.comingSoon}
                      className={`w-10 h-10 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg-hover)] transition-all ${
                        automation.comingSoon ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Configure/Subscribe Link */}
                    {!automation.comingSoon ? (
                      hasSubscription ? (
                        <Link
                          href={automation.href}
                          className="w-10 h-10 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg-hover)] transition-all"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      ) : (
                        <Link
                          href={`/automations/${automation.id}/subscribe`}
                          className="px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-all flex items-center gap-2"
                        >
                          <CreditCard className="w-4 h-4" />
                          Subscribe
                        </Link>
                      )
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--foreground-muted)] opacity-50 cursor-not-allowed">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <div
                className={`collapsible-content ${
                  isExpanded ? "expanded" : "collapsed"
                }`}
              >
                <div className="px-6 pb-6 pt-2 border-t border-[var(--card-border)]">
                  <p className="text-sm text-[var(--foreground-muted)] mb-4">
                    {automation.longDescription}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {automation.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${automation.bgColor.replace('/10', '')}`} />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {!hasSubscription && !automation.comingSoon && (
                    <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-[var(--foreground)]">
                          ${price}
                        </span>
                        <span className="text-[var(--foreground-muted)]">/month</span>
                      </div>
                      <Link
                        href={`/automations/${automation.id}/subscribe`}
                        className="px-6 py-2.5 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-400 transition-all"
                      >
                        Subscribe Now
                      </Link>
                    </div>
                  )}

                  {hasSubscription && (
                    <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex items-center justify-between">
                      <div className="text-sm text-emerald-500 font-medium">
                        Active subscription - ${price}/month
                      </div>
                      <Link
                        href={automation.href}
                        className="px-6 py-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] font-semibold hover:bg-[var(--card-bg-hover)] transition-all"
                      >
                        Configure
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {isLoading ? "-" : subscribedCount}
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">Active Subscriptions</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="text-2xl font-bold text-[var(--foreground)]">0</div>
          <div className="text-sm text-[var(--foreground-muted)]">Messages Sent (30d)</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="text-2xl font-bold text-[var(--foreground)]">0</div>
          <div className="text-sm text-[var(--foreground-muted)]">Contacts Reached</div>
        </div>
      </div>
    </div>
  );
}
