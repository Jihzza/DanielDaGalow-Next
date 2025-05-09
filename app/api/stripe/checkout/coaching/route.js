    // app/api/stripe/checkout/coaching/route.js
    import { NextResponse } from 'next/server';
    import Stripe from 'stripe';
    import { createClient } from '@supabase/supabase-js';

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const TIER_PRICES_CENTS = {
      Weekly: 4000, Daily: 9000, Priority: 23000,
    };

    export async function POST(request) {
      try {
        const body = await request.json();
        // Ensure 'name' is passed from client if needed for product_data.name
        const { requestId, tier, email, isTestBooking, name } = body;

        if (!requestId || !tier || !email) {
          return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }
        if (TIER_PRICES_CENTS[tier] === undefined) {
          return NextResponse.json({ error: `Invalid coaching tier: ${tier}.` }, { status: 400 });
        }
        const unitAmount = isTestBooking === true ? 0 : TIER_PRICES_CENTS[tier];

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const successUrl = `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=coaching&request_id=${requestId}`;
        const cancelUrl = `${siteUrl}/payment/cancelled?type=coaching&request_id=${requestId}`;

        // Determine if this is a subscription or one-time payment based on your business logic
        // For this example, keeping mode: "payment" as per original function.
        // If it's a subscription, you'll need a Stripe Price ID for the tier.
        const sessionParams = {
          mode: "payment", // CHANGE TO "subscription" IF IT'S RECURRING
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: "eur",
              unit_amount: unitAmount,
              product_data: {
                name: isTestBooking
                  ? `Test Coaching Subscription (${tier})`
                  : `Coaching Package: ${tier} with ${name || 'Client'}`,
                description: `Coaching Request ID: ${requestId}`,
              },
              // If mode: "subscription", add:
              // recurring: { interval: 'month' },
            },
            quantity: 1,
          }],
          // If mode: "subscription", use price ID instead of price_data:
          // line_items: [{ price: process.env[`STRIPE_PRICE_ID_${tier.toUpperCase()}`], quantity: 1 }],

          client_reference_id: requestId,
          customer_email: email,
          success_url: successUrl,
          cancel_url: cancelUrl,
          // --- ADD THIS METADATA ---
          metadata: {
            service_type: 'coaching',
            internal_id: requestId,
            tier: tier, // Optionally pass tier for webhook logic
            is_test: isTestBooking ? 'true' : 'false',
          }
          // --- END METADATA ---
        };

        const session = await stripe.checkout.sessions.create(sessionParams);

        const { error: updateError } = await supabaseAdmin
          .from("coaching_requests")
          .update({ stripe_session_id: session.id })
          .eq("id", requestId);

        if (updateError) {
          console.error("Supabase update error (coaching checkout):", updateError);
          // Log error but proceed
        }

        return NextResponse.json({ url: session.url });
      } catch (err) {
        console.error("Error in /api/stripe/checkout/coaching:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
      }
    }
    