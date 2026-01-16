import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { automationId, priceId } = body;

    if (!automationId) {
      return NextResponse.json(
        { error: "Missing automation ID" },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription for this automation
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("automation_id", automationId)
      .in("status", ["active", "trialing"])
      .single();

    if (existingSubscription) {
      return NextResponse.json(
        { error: "You already have an active subscription for this automation" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email, full_name")
      .eq("id", user.id)
      .single();

    if (profile?.stripe_customer_id) {
      stripeCustomerId = profile.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email || profile?.email,
        name: profile?.full_name || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      stripeCustomerId = customer.id;

      // Save Stripe customer ID to profile
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customer.id })
        .eq("id", user.id);
    }

    // Price mapping if no priceId provided (fallback prices)
    const priceMapping: Record<string, number> = {
      bigdaybot: 1200, // $12
      reviewdrip: 1400, // $14
      leadrevive: 1900, // $19
      touchbase: 2400, // $24
      openhouse: 2900, // $29
    };

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: priceId
        ? [{ price: priceId, quantity: 1 }]
        : [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `${automationId.charAt(0).toUpperCase() + automationId.slice(1)} Subscription`,
                  description: `Monthly subscription to ${automationId}`,
                },
                unit_amount: priceMapping[automationId] || 1200,
                recurring: {
                  interval: "month",
                },
              },
              quantity: 1,
            },
          ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/automations/${automationId}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/automations/${automationId}/subscribe?canceled=true`,
      metadata: {
        user_id: user.id,
        automation_id: automationId,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          automation_id: automationId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout" },
      { status: 500 }
    );
  }
}
