"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Subscription {
  id: string;
  automation_id: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
}

export interface AutomationProduct {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  stripe_price_id: string | null;
}

// Automation pricing (in cents for Stripe, display in dollars)
export const AUTOMATION_PRODUCTS: AutomationProduct[] = [
  {
    id: "bigdaybot",
    name: "BigDayBot",
    description: "Automated birthday & anniversary campaigns",
    price_monthly: 1200, // $12/mo
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_BIGDAYBOT_PRICE_ID || null,
  },
  {
    id: "reviewdrip",
    name: "ReviewDrip",
    description: "Smart Google Review request timing",
    price_monthly: 1400, // $14/mo
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_REVIEWDRIP_PRICE_ID || null,
  },
  {
    id: "leadrevive",
    name: "LeadRevive",
    description: "AI-powered cold lead re-engagement",
    price_monthly: 1900, // $19/mo
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_LEADREVIVE_PRICE_ID || null,
  },
  {
    id: "touchbase",
    name: "TouchBase",
    description: "Automated CMA emails to sellers",
    price_monthly: 2400, // $24/mo
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_TOUCHBASE_PRICE_ID || null,
  },
  {
    id: "openhouse",
    name: "OpenHouse",
    description: "AI showing scheduling with ShowingTime",
    price_monthly: 2900, // $29/mo
    stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_OPENHOUSE_PRICE_ID || null,
  },
];

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSubscriptions([]);
        return;
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["active", "trialing"]);

      if (error) {
        console.error("Error fetching subscriptions:", error);
        setSubscriptions([]);
        return;
      }

      setSubscriptions(data || []);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const isSubscribed = (automationId: string): boolean => {
    return subscriptions.some(
      (sub) => sub.automation_id === automationId &&
               (sub.status === "active" || sub.status === "trialing")
    );
  };

  const getSubscription = (automationId: string): Subscription | undefined => {
    return subscriptions.find((sub) => sub.automation_id === automationId);
  };

  const getProduct = (automationId: string): AutomationProduct | undefined => {
    return AUTOMATION_PRODUCTS.find((p) => p.id === automationId);
  };

  return {
    subscriptions,
    isLoading,
    isSubscribed,
    getSubscription,
    getProduct,
    refetch: fetchSubscriptions,
  };
}
