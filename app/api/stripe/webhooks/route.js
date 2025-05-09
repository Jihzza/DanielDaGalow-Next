// app/api/stripe/webhooks/route.js
// This single webhook handles events for both bookings and coaching.

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

// Get your Stripe Webhook Secret from .env.local
// IMPORTANT: This MUST match the secret in your Stripe Dashboard webhook configuration.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  const sig = request.headers.get('stripe-signature');
  // Stripe requires the raw body to construct the event.
  const requestBuffer = await request.arrayBuffer(); // Read body as ArrayBuffer
  const bodyString = Buffer.from(requestBuffer).toString('utf8'); // Convert to string

  let event;

  try {
    // Verify the event came from Stripe using the signature and your webhook secret
    event = stripe.webhooks.constructEvent(bodyString, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Error verifying webhook signature: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log(`🔔 Checkout session completed: ${session.id}`);
      console.log("Metadata:", session.metadata); // Log metadata to verify

      // Get service_type and internal_id from metadata
      const serviceType = session.metadata?.service_type;
      const internalId = session.metadata?.internal_id || session.client_reference_id; // Fallback to client_reference_id

      if (!internalId) {
        console.error("Webhook Error: Missing internal_id or client_reference_id in session.");
        return NextResponse.json({ error: "Missing reference ID." }, { status: 400 });
      }

      if (serviceType === 'booking') {
        // Handle successful booking payment
        console.log(`Processing booking payment for ID: ${internalId}`);
        const { error: bookingUpdateError } = await supabaseAdmin
          .from('bookings')
          .update({ payment_status: 'paid' })
          .eq('id', internalId); // Use the ID from metadata

        if (bookingUpdateError) {
          console.error(`Webhook: Supabase error updating booking ${internalId}:`, bookingUpdateError);
          return NextResponse.json({ error: "Failed to update booking status." }, { status: 500 });
        }
        console.log(`Booking ${internalId} payment status updated to 'paid'.`);

      } else if (serviceType === 'coaching') {
        // Handle successful coaching payment
        console.log(`Processing coaching payment for ID: ${internalId}`);
        const { error: coachingUpdateError } = await supabaseAdmin
          .from('coaching_requests')
          .update({ payment_status: 'paid' })
          .eq('id', internalId); // Use the ID from metadata

        if (coachingUpdateError) {
          console.error(`Webhook: Supabase error updating coaching_request ${internalId}:`, coachingUpdateError);
          return NextResponse.json({ error: "Failed to update coaching request status." }, { status: 500 });
        }
        console.log(`Coaching request ${internalId} payment status updated to 'paid'.`);

      } else {
        console.warn(`Webhook: Received checkout.session.completed for unknown service_type: ${serviceType} or missing metadata. Client Ref: ${session.client_reference_id}`);
        // Decide if you want to error out or just acknowledge
        // return NextResponse.json({ error: "Unknown service type in metadata." }, { status: 400 });
      }
      break;

    // TODO: Handle other event types from Stripe if needed
    // case 'invoice.payment_succeeded':
    //   const invoice = event.data.object;
    //   // Handle recurring subscription payments for coaching if applicable
    //   if (invoice.subscription_details?.metadata?.service_type === 'coaching') {
    //     // ... logic to update coaching subscription status ...
    //   }
    //   break;
    // case 'invoice.payment_failed':
    //   // ... handle failed subscription payments ...
    //   break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}
