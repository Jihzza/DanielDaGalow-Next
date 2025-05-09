// components/ProfileClientComponent.jsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // For client-side navigation

// Adjust paths as per your project structure
import { useAuth } from '@/app/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client'; // Client-side Supabase for mutations
import OctagonalProfile from '@/components/common/OctagonalProfile';

import { useTranslation } from 'react-i18next';
import { format, addMonths } from 'date-fns';

// Helper function for tier names, dependent on translation
const getTierNames = (t) => ({
  Weekly: t('profile.tiers.basic', "Basic Membership"),
  Daily: t('profile.tiers.standard', "Standard Membership"),
  Priority: t('profile.tiers.premium', "Premium Membership"),
  // Add other service_type values from coaching_requests if they exist
});

export default function ProfileClientComponent({
  user, // User object passed from server component
  initialProfile,
  initialAppointments,
  initialCoachingRequests,
  initialChatSessions,
  initialIsAdmin,
  initialPendingTestimonials,
  // onChatOpen, // Prop to handle opening chat - implementation depends on your chat setup
}) {
  const { signOut, loading: authLoading } = useAuth(); // Get signOut and authLoading state
  const { t } = useTranslation();
  const router = useRouter();

  // Initialize state with server-fetched data
  const [profile, setProfile] = useState(initialProfile);
  const [appointments, setAppointments] = useState(initialAppointments || []);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [chatSessions, setChatSessions] = useState(initialChatSessions || []);
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);
  const [pendingTestimonials, setPendingTestimonials] = useState(initialPendingTestimonials || []);

  // Client-side specific loading/error states
  const [clientSideLoading, setClientSideLoading] = useState(false); // For actions like testimonial approval
  const [error, setError] = useState("");
  const [testimonialLoading, setTestimonialLoading] = useState(false); // For refreshing testimonials client-side

  // Supabase client for client-side mutations
  const supabase = createClient();

  // Process initial coaching requests into active subscriptions
  useEffect(() => {
    const tierNamesMap = getTierNames(t);
    const processedSubscriptions = (initialCoachingRequests || [])
      .filter(req => req.payment_status === 'paid') // Only show paid subscriptions
      .map((r) => {
        const startDate = new Date(r.membership_start_date || r.created_at);
        const endDate = r.membership_end_date ? new Date(r.membership_end_date) : addMonths(startDate, 1);
        return {
          id: r.id,
          name: tierNamesMap[r.service_type] || r.service_type, // Use translated tier name
          since: format(startDate, "P"),
          expiresOn: format(endDate, "P"),
          daysRemaining: Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
          isActive: new Date() <= endDate,
        };
      });
    setActiveSubscriptions(processedSubscriptions.filter(sub => sub.isActive));
  }, [initialCoachingRequests, t]);


  // Client-side function to refresh pending testimonials (if admin)
  const fetchPendingTestimonialsClient = useCallback(async () => {
    if (!isAdmin) return;
    setTestimonialLoading(true);
    setError("");
    try {
      const { data, error: testimonialsError } = await supabase
        .from("testimonials")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (testimonialsError) throw testimonialsError;
      setPendingTestimonials(data || []);
    } catch (err) {
      console.error("Error fetching pending testimonials (client):", err);
      setError(t('profile.error.fetch_testimonials_error', "Failed to refresh testimonials."));
    } finally {
      setTestimonialLoading(false);
    }
  }, [isAdmin, supabase, t]);

  const handleTestimonialAction = async (id, newStatus) => {
    setClientSideLoading(true);
    setError("");
    try {
      const { error: updateError } = await supabase
        .from("testimonials")
        .update({ status: newStatus })
        .eq("id", id);
      if (updateError) throw updateError;
      setPendingTestimonials((prev) => prev.filter((t) => t.id !== id));
      alert(t(`profile.sections.testimonial_review.${newStatus === 'approved' ? 'approved' : 'rejected'}_alert`, `Testimonial ${newStatus}.`));
    } catch (err) {
      console.error(`Error ${newStatus} testimonial:`, err);
      setError(t(`profile.sections.testimonial_review.${newStatus === 'approved' ? 'approve' : 'reject'}_error_alert`, `Error updating testimonial: ${err.message}`));
    } finally {
      setClientSideLoading(false);
    }
  };

  const handleSignOut = async () => {
    setError("");
    try {
      const { error } = await signOut();
      if (error) throw error;
      router.push('/'); // Navigate to homepage after sign out
    } catch (err) {
      console.error("Error signing out:", err);
      setError(t('profile.error.sign_out_error', `Failed to sign out: ${err.message}`));
    }
  };

  // Placeholder for onChatOpen - this needs to be implemented
  // based on how you want to handle chat opening (e.g., a modal, a new page)
  const handleChatOpen = (sessionId) => {
    console.log("ProfileClientComponent: Attempting to open chat for session:", sessionId || "new session");
    // If you have a global chat state/modal context, trigger it here.
    // Example: chatContext.openChat(sessionId);
    // Or navigate: router.push(sessionId ? `/chat/${sessionId}` : '/chat/new');
    alert("Chat functionality to be implemented / connected.");
  };

  // Avatar URL construction
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const avatarPublicUrl = profile?.avatar_url && supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/avatars/${profile.avatar_url}`
    : null;
  const fallbackInitial = (profile?.full_name?.[0] || user?.email?.[0] || "?").toUpperCase();

  if (authLoading) { // Still show loading if auth state is resolving client-side
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-150px)] bg-gradient-to-b from-oxfordBlue via-oxfordBlue to-gentleGray">
        <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-4 border-t-transparent border-white"></div>
      </div>
    );
  }

  if (!user) {
    // This should ideally be caught by middleware or the server component part,
    // but as a client-side fallback:
    router.push('/login?redirectedFrom=/profile');
    return null; // Or a loading spinner while redirecting
  }
  
  // If there was an error fetching initial data server-side, initialProfile might be null
  if (!initialProfile && !authLoading && user) {
     return (
        <div className="py-6 md:py-8 lg:py-12 px-4 md:px-6 lg:px-8 min-h-screen bg-gradient-to-b from-oxfordBlue via-oxfordBlue to-gentleGray">
            <div className="max-w-xs sm:max-w-md md:max-w-3xl lg:max-w-6xl mx-auto text-center p-10 text-red-100 bg-red-700/50 rounded-lg">
                <p className="font-semibold">{t("profile.error.load_profile_specific", "Could not load profile details.")}</p>
                <p className="text-sm">{t("common.try_again_later", "Please try again later or contact support.")}</p>
            </div>
        </div>
     );
  }


  return (
    <div className="py-6 md:py-8 lg:py-12 px-4 md:px-6 lg:px-8 min-h-screen bg-gradient-to-b from-oxfordBlue via-oxfordBlue to-gentleGray">
      <div className="max-w-xs sm:max-w-md md:max-w-3xl lg:max-w-6xl mx-auto">
        {/* Error Display Area */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
            {error}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-gentleGray rounded-xl shadow-lg p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 md:mb-8">
          <div className="flex-shrink-0">
            <OctagonalProfile
              size={profile?.avatar_url ? 80 : 60}
              borderColor="#002147"
              innerBorderColor="#FFFFFF"
              imageSrc={avatarPublicUrl}
              fallbackText={fallbackInitial}
              altText={profile?.full_name || "User profile"}
            />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 truncate">
              {profile?.full_name || t("profile.unnamed", "Valued User")}
            </h2>
            <p className="text-sm md:text-base text-gray-500 truncate">
              {profile?.username ? `@${profile.username}` : user.email}
            </p>
            <Link
              href="/edit-profile"
              className="mt-3 inline-block px-4 py-2 border border-oxfordBlue text-oxfordBlue hover:bg-oxfordBlue hover:text-white rounded-lg transition-colors duration-200 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-oxfordBlue"
            >
              {t("profile.edit_profile_button", "Edit Profile")}
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            {/* Appointments Section */}
            <div className="bg-gentleGray p-4 sm:p-6 rounded-xl shadow-lg h-auto">
              <h3 className="text-lg md:text-xl font-bold text-oxfordBlue pb-3 mb-3 border-b border-gray-300">
                {t("profile.sections.appointments.title", "Upcoming Consultations")}
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {appointments.length > 0 ? (
                  appointments.map((a) => (
                    <div key={a.id} className="border border-gray-200 rounded-lg shadow-sm p-3 transition-all hover:shadow-md bg-white">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                        <p className="text-sm md:text-base font-medium text-gray-700">
                          {format(new Date(a.appointment_date), "Pp")}
                        </p>
                        <span className="px-2 py-0.5 bg-oxfordBlue text-white text-xs rounded-full">
                          {a.duration_minutes} {t('profile.sections.appointments.min_suffix', 'min')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm md:text-base text-gray-500">{t("profile.sections.appointments.no_appointments", "No upcoming consultations.")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Subscriptions Section */}
            <div className="bg-gentleGray p-4 sm:p-6 rounded-xl shadow-lg h-auto">
              <h3 className="text-lg md:text-xl font-bold text-oxfordBlue pb-3 mb-3 border-b border-gray-300">
                {t("profile.sections.subscriptions.title", "Active Coaching")}
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {activeSubscriptions.length > 0 ? (
                  activeSubscriptions.map((sub) => (
                    <div key={sub.id} className="border border-gray-200 rounded-lg shadow-sm p-4 transition-all hover:shadow-md bg-white">
                      <div className="flex flex-col gap-1">
                        <p className="text-md font-semibold text-gray-800">{sub.name}</p>
                        <div className="text-xs text-gray-500">
                          <p>{t("profile.sections.subscriptions.since", "Since:")} {sub.since}</p>
                          <p>{t("profile.sections.subscriptions.expires", "Expires:")} {sub.expiresOn} ({sub.daysRemaining} {t('profile.sections.subscriptions.days_left', 'days left')})</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm md:text-base text-gray-500">{t("profile.sections.subscriptions.no_subscriptions", "No active coaching plans.")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Conversation History */}
          <div className="lg:col-span-2 bg-gentleGray p-4 sm:p-6 rounded-xl shadow-lg flex flex-col h-full min-h-[400px] lg:min-h-0">
            <h3 className="text-lg md:text-xl font-bold text-oxfordBlue pb-3 mb-3 border-b border-gray-300">
              {t("profile.sections.conversations.title", "Chat History")}
            </h3>
            <div className="flex-grow overflow-hidden">
              {chatSessions.length > 0 ? (
                <div className="space-y-2 h-full max-h-[calc(100%-40px)] md:max-h-[50vh] lg:max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                  {chatSessions.map((s) => (
                    <button
                      key={s.id}
                      className="w-full text-left transition-colors border border-gray-200 hover:bg-gray-100 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-oxfordBlue"
                      onClick={() => handleChatOpen(s.id)}
                      aria-label={`Open chat: ${s.title || "Chat Session"}`}
                    >
                      <div className="p-3 flex justify-between items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm md:text-base text-gray-800 truncate">
                            {s.title || t("profile.sections.conversations.default_chat_title", "Chat Session")}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {s.updated_at ? format(new Date(s.updated_at), "P") : ""}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg h-full flex flex-col items-center justify-center">
                  <p className="text-gray-500 mb-4">{t("profile.sections.conversations.no_chats", "No chat history found.")}</p>
                  <button
                    onClick={() => handleChatOpen()} // Open new chat
                    className="px-4 py-2 bg-darkGold text-black rounded-lg font-medium hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-darkGold"
                  >
                    {t("profile.sections.conversations.start_chat_button", "Start a New Chat")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin: Testimonial Review Section */}
        {isAdmin && (
          <div className="mt-6 md:mt-8 bg-gentleGray p-4 sm:p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-300">
              <h3 className="text-lg md:text-xl font-bold text-oxfordBlue">
                {t("profile.sections.testimonial_review.title", "Pending Testimonials")}
              </h3>
              <button
                onClick={fetchPendingTestimonialsClient}
                disabled={testimonialLoading || clientSideLoading}
                className="px-3 py-1 text-xs bg-oxfordBlue text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {testimonialLoading || clientSideLoading ? t('common.loading', 'Loading...') : t('common.refresh', 'Refresh')}
              </button>
            </div>
            {(testimonialLoading && !pendingTestimonials.length && !clientSideLoading) ? (
              <div className="flex justify-center py-8"><div className="animate-spin h-8 w-8 border-2 border-oxfordBlue border-t-transparent rounded-full"></div></div>
            ) : pendingTestimonials.length === 0 ? (
              <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">{t("profile.sections.testimonial_review.no_pending", "No testimonials awaiting review.")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingTestimonials.map((testimonial) => (
                  <div key={testimonial.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Image
                        src={testimonial.image_url || '/assets/icons/Profile_Branco_Placeholder.svg'}
                        alt={testimonial.author || "Author"}
                        width={40} height={40}
                        className="w-10 h-10 rounded-full object-cover border-2 border-darkGold"
                        onError={(e) => { e.currentTarget.src = '/assets/icons/Profile_Branco_Placeholder.svg'; }}
                      />
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm">{testimonial.author}</h4>
                        <p className="text-xs text-gray-500">{format(new Date(testimonial.created_at), "P")}</p>
                      </div>
                    </div>
                    <div className="px-3 py-3 bg-gray-50 rounded-lg mb-3 min-h-[60px]">
                      <p className="italic text-gray-700 text-sm">"{testimonial.quote}"</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleTestimonialAction(testimonial.id, 'rejected')} disabled={clientSideLoading} className="px-3 py-1 text-xs border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">{t("profile.sections.testimonial_review.reject", "Reject")}</button>
                      <button onClick={() => handleTestimonialAction(testimonial.id, 'approved')} disabled={clientSideLoading} className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">{t("profile.sections.testimonial_review.approve", "Approve")}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Sign Out Button - Placed at the bottom for clarity */}
        <div className="mt-8 pt-6 border-t border-gray-300/50 flex justify-center">
            <button
                onClick={handleSignOut}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gentleGray"
            >
                {t('profile.sign_out_button', "Sign Out")}
            </button>
        </div>
      </div>
    </div>
  );
}

