// app/profile/page.jsx

// Remove "use client" from here if you want the page itself to be a Server Component
// "use client"; // Keep if the entire page MUST be client-side, but prefer splitting

import React, { Suspense } from 'react'; // Import Suspense
import { createClient } from '@/lib/supabase/server'; // For server-side fetching
// import { cookies } from 'next/headers'; // createClient handles this
import { redirect } from 'next/navigation';
import ProfileClientComponent from '@/components/ProfileClientComponent'; // You'll create this

// This is the Server Component part of your page
async function ProfilePageData() {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    // This should ideally be caught by middleware, but good as a fallback
    console.error("Auth error or no user in profile page server component:", authError);
    redirect('/login?redirectedFrom=/profile'); // Redirect to login
  }

  // Fetch all data server-side
  // Using Promise.all for concurrent fetching
  const [profileRes, appointmentsRes, coachingRes, chatSessionsRes, adminProfileRes] = await Promise.all([
    supabase.from("profiles").select("full_name, username, avatar_url, phone_number").eq("id", user.id).maybeSingle(),
    supabase.from("bookings").select("*").eq("user_id", user.id).order("appointment_date", { ascending: true }),
    supabase.from("coaching_requests").select("id, service_type, created_at, membership_start_date, membership_end_date, payment_status").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("chat_sessions").select("id, title, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("profiles").select("role").eq("id", user.id).single() // For admin check
  ]).catch(err => {
    console.error("Error fetching profile data concurrently:", err);
    // Handle error appropriately, maybe redirect to an error page or show a message
    // For now, we'll let it proceed and ProfileClientComponent can show an error state
    return [null, null, null, null, null]; // Return nulls on error to avoid destructuring issues
  });


  const profile = profileRes?.data; // Access .data from the response
  const appointments = appointmentsRes?.data || [];
  const coachingRequests = coachingRes?.data || [];
  const chatSessions = chatSessionsRes?.data || [];
  const isAdmin = adminProfileRes?.data?.role === 'admin';
  let pendingTestimonials = [];

  if (isAdmin) {
    const { data: testimonialsData, error: testimonialsError } = await supabase
      .from("testimonials")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (testimonialsError) {
      console.error("Error fetching pending testimonials for admin:", testimonialsError);
    } else {
      pendingTestimonials = testimonialsData || [];
    }
  }
  
  // Pass the fetched data to a Client Component
  return (
    <ProfileClientComponent
      user={user} // Pass the user object
      initialProfile={profile}
      initialAppointments={appointments}
      initialCoachingRequests={coachingRequests}
      initialChatSessions={chatSessions}
      initialIsAdmin={isAdmin}
      initialPendingTestimonials={pendingTestimonials}
    />
  );
}

// The default export for the page will use Suspense for better loading states
export default function ProfilePage() {
  return (
    // Suspense fallback for the data fetching part
    // You can customize this loading UI
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[calc(100vh-150px)] bg-gradient-to-b from-oxfordBlue via-oxfordBlue to-gentleGray">
        <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-4 border-t-transparent border-white"></div>
      </div>
    }>
      <ProfilePageData />
    </Suspense>
  );
}

// Optional: Add metadata for this page
export const metadata = {
  title: 'My Profile - Daniel DaGalow',
  description: 'Manage your profile, appointments, and subscriptions.',
};
