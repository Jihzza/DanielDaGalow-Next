// app/api/status/coaching/[id]/route.js
// Fetches the payment status for a specific coaching request.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the SERVICE ROLE KEY for admin-level operations.
// These environment variables should be in your .env.local file.
// NEXT_PUBLIC_SUPABASE_URL is your project URL.
// SUPABASE_SERVICE_ROLE_KEY is your secret service_role key (server-side only).
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Handles GET requests to /api/status/coaching/[id]
// `params` object contains dynamic route segments, e.g., params.id
export async function GET(request, { params }) {
  try {
    const { id } = params; // Get the coaching request ID from the URL path

    if (!id) {
      return NextResponse.json({ error: "Missing coaching request ID." }, { status: 400 });
    }

    // Query the 'coaching_requests' table for the specific ID
    const { data, error } = await supabaseAdmin
      .from("coaching_requests")
      .select("payment_status") // Only select the payment_status field
      .eq("id", id) // Match by the UUID
      .single(); // Expecting only one record for a given ID

    if (error) {
      if (error.code === 'PGRST116') { // PGRST116: No rows found
        return NextResponse.json({ error: "Coaching request not found." }, { status: 404 });
      }
      console.error("Supabase error fetching coaching status:", error);
      // For other errors, throw to be caught by the generic error handler
      throw error;
    }

    if (!data) { // Should be caught by PGRST116, but as a fallback
        return NextResponse.json({ error: "Coaching request not found." }, { status: 404 });
    }

    // Return the payment status
    return NextResponse.json({ paymentStatus: data.payment_status });

  } catch (err) {
    console.error("Error fetching coaching status:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error. Could not fetch coaching status." }, { status: 500 });
  }
}
