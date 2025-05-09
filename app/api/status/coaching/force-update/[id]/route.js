// app/api/status/coaching/force-update/[id]/route.js
// Proactively checks Stripe for a coaching session's payment status and updates Supabase.

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase client with the SERVICE ROLE KEY
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Handles POST requests to /api/status/coaching/force-update/[id]
// Using POST as this action might result in a database update.
// A GET request could also be justified if considered idempotent (just fetching and syncing).
export async function POST(request, { params }) {
  try {
    const { id } = params; // Get the coaching request ID from the URL path

    if (!id) {
      return NextResponse.json({ error: "Missing coaching request ID." }, { status: 400 });
    }

    // 1. Fetch the stripe_session_id from your 'coaching_requests' table
    const { data: coachingRequest, error: fetchError } = await supabaseAdmin
      .from("coaching_requests")
      .select("stripe_session_id, payment_status") // Also fetch current payment_status
      .eq("id", id) // Match by UUID
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: "Coaching request not found in database." }, { status: 404 });
      }
      console.error("Supabase error fetching coaching request for force update:", fetchError);
      throw fetchError;
    }

    if (!coachingRequest || !coachingRequest.stripe_session_id) {
      return NextResponse.json({ error: "Stripe session ID not found for this coaching request." }, { status: 404 });
    }

    // If already paid, no need to check Stripe again (optional optimization)
    if (coachingRequest.payment_status === 'paid') {
        return NextResponse.json({
            message: "Coaching request already marked as paid.",
            paymentStatus: coachingRequest.payment_status
        });
    }

    // 2. Retrieve the Checkout Session from Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(coachingRequest.stripe_session_id);

    if (!stripeSession) {
        return NextResponse.json({ error: "Could not retrieve session from Stripe." }, { status: 404 });
    }

    let newPaymentStatus = coachingRequest.payment_status; // Default to current status

    // 3. Check payment_status from Stripe and update Supabase if it's 'paid'
    if (stripeSession.payment_status === "paid") {
      newPaymentStatus = 'paid'; // Update local variable
      const { error: updateError } = await supabaseAdmin
        .from("coaching_requests")
        .update({ payment_status: "paid", updated_at: new Date().toISOString() }) // Also update updated_at
        .eq("id", id);

      if (updateError) {
        console.error("Supabase error updating coaching request payment status:", updateError);
        // Don't throw here, still return the status fetched from Stripe if possible
      }
    } else {
      // Optionally handle other Stripe statuses like 'unpaid', 'no_payment_required'
      console.log(`Stripe session ${stripeSession.id} status is ${stripeSession.payment_status}. Not updating Supabase.`);
    }

    return NextResponse.json({
      message: `Checked Stripe. Payment status: ${stripeSession.payment_status}. Supabase status: ${newPaymentStatus}`,
      paymentStatus: newPaymentStatus, // Return the (potentially updated) status from Supabase
      stripePaymentStatus: stripeSession.payment_status // Also return Stripe's status for clarity
    });

  } catch (err) {
    console.error("Error in force-update coaching status:", err);
    let errorMessage = "Internal Server Error. Could not force update coaching status.";
    if (err.type && err.type.startsWith('Stripe')) { // Check if it's a Stripe error
        errorMessage = err.message;
    } else if (err.message) {
        errorMessage = err.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
