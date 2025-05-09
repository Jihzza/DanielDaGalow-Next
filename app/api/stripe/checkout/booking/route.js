    // app/api/stripe/checkout/booking/route.js
    import { NextResponse } from 'next/server';
    import Stripe from 'stripe';
    import { createClient } from '@supabase/supabase-js';

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const DURATION_PRICES_CENTS = {
      45: 0, 60: 9000, 75: 11250, 90: 13500, 105: 15750, 120: 18000
    };

    export async function POST(request) {
      try {
        const body = await request.json();
        const { bookingId, duration, email, isTestBooking, name } = body;

        if (!bookingId || !duration || !email) {
          return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }
        const numericDuration = parseInt(duration, 10);
        if (isNaN(numericDuration) || DURATION_PRICES_CENTS[numericDuration] === undefined) {
          return NextResponse.json({ error: `Invalid duration: ${duration}.` }, { status: 400 });
        }
        const unitAmount = isTestBooking === true ? 0 : DURATION_PRICES_CENTS[numericDuration];

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const successUrl = `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=booking&booking_id=${bookingId}`;
        const cancelUrl = `${siteUrl}/payment/cancelled?type=booking&booking_id=${bookingId}`;

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: "eur",
              unit_amount: unitAmount,
              product_data: {
                name: isTestBooking
                  ? `Test Consultation with ${name || 'Client'} (${numericDuration}min)`
                  : `Consultation with ${name || 'Client'} (${numericDuration}min)`,
                description: `Booking ID: ${bookingId}`,
              },
            },
            quantity: 1,
          }],
          client_reference_id: bookingId,
          customer_email: email,
          success_url: successUrl,
          cancel_url: cancelUrl,
          // --- ADD THIS METADATA ---
          metadata: {
            service_type: 'booking',
            internal_id: bookingId, // Can be same as client_reference_id or different if needed
            is_test: isTestBooking ? 'true' : 'false',
          }
          // --- END METADATA ---
        });

        const { error: updateError } = await supabaseAdmin
          .from("bookings")
          .update({ stripe_session_id: session.id, is_test_booking: isTestBooking === true })
          .eq("id", bookingId);

        if (updateError) {
          console.error("Supabase update error (booking checkout):", updateError);
          // Log error but proceed
        }

        return NextResponse.json({ url: session.url });
      } catch (err) {
        console.error("Error in /api/stripe/checkout/booking:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
      }
    }
    