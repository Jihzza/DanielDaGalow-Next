// app/api/status/booking/[id]/route.js
// This API route handles fetching the payment status for a specific booking.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the SERVICE ROLE KEY for admin-level operations.
// IMPORTANT: Store these in .env.local.
// NEXT_PUBLIC_SUPABASE_URL is your project URL.
// SUPABASE_SERVICE_ROLE_KEY is your secret service_role key.
// These keys should NOT be prefixed with NEXT_PUBLIC_ if they are only used server-side,
// but since createClient is often shared, NEXT_PUBLIC_SUPABASE_URL is fine.
// The SERVICE_ROLE_KEY is the critical one to keep server-side only.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, // This is fine as public
  process.env.SUPABASE_SERVICE_ROLE_KEY  // This MUST be kept secret and only used server-side
);

// This function handles GET requests to /api/status/booking/[id]
// The `params` object will contain the dynamic route segments, e.g., params.id
export async function GET(request, { params }) {
  try {
    const { id } = params; // Get the booking ID from the URL path

    if (!id) {
      return NextResponse.json({ error: "Missing booking ID." }, { status: 400 });
    }

    // Query the 'bookings' table for the specific booking ID
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("payment_status") // Only select the payment_status
      .eq("id", id)
      .single(); // Expecting only one booking for a given ID

    if (error) {
      if (error.code === 'PGRST116') { // PGRST116: No rows found
        return NextResponse.json({ error: "Booking not found." }, { status: 404 });
      }
      console.error("Supabase error fetching booking status:", error);
      throw error; // Rethrow for generic error handling
    }

    if (!data) { // Should be caught by PGRST116, but as a fallback
        return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    // Return the payment status
    return NextResponse.json({ paymentStatus: data.payment_status });

  } catch (err) {
    console.error("Error fetching booking status:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error. Could not fetch booking status." }, { status: 500 });
  }
}
