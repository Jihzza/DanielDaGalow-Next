// app/profile/page.jsx
"use client"; // Essential for hooks, client-side data fetching, and interactions

import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import Link from 'next/link'; // Import Link from Next.js
import Image from 'next/image'; // For OctagonalProfile if it uses next/image

// --- IMPORTANT: Adjust these import paths based on your new project structure ---
// Example: import { useAuth } from '@/contexts/AuthContext';
import { useAuth } from "../../contexts/AuthContext";
// Example: import { supabase } from '@/utils/supabaseClient';
import { supabase } from "../../utils/supabaseClient";
// Example: import OctagonalProfile from '@/components/common/Octagonal Profile';
import OctagonalProfile from "../../components/common/Octagonal Profile";
// --- End Adjust Paths ---

import { useTranslation } from "react-i18next";
import { format } from 'date-fns'; // For formatting dates

// Tier names can be part of your translation files or defined here
const tierNames = (t) => ({
  Weekly: t('profile.tiers.basic', "Basic Membership"), // Assuming 'Weekly' maps to Basic
  Daily: t('profile.tiers.standard', "Standard Membership"), // Assuming 'Daily' maps to Standard
  Priority: t('profile.tiers.premium', "Premium Membership"), // Assuming 'Priority' maps to Premium
  // Add other service_type values from coaching_requests if they exist
});


export default function ProfilePage({ onChatOpen }) { // onChatOpen prop is expected from parent
  const { user, loading: authLoading } = useAuth(); // Destructure loading as authLoading
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [pageLoading, setPageLoading] = useState(true); // Separate loading state for page data
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [chatSessions, setChatSessions] = useState([]); // Renamed from 'sessions' for clarity
  // const [selectedSession, setSelectedSession] = useState(null); // Not directly used for rendering selected state
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingTestimonials, setPendingTestimonials] = useState([]);
  const [testimonialLoading, setTestimonialLoading] = useState(false);

  const fetchProfileData = useCallback(async () => {
    if (!user) {
      setPageLoading(false);
      return;
    }
    setPageLoading(true);
    setError("");
    try {
      const [profileRes, appointmentsRes, coachingRes, chatSessionsRes] = await Promise.all([
        supabase.from("profiles").select("full_name, username, avatar_url, phone_number").eq("id", user.id).single(),
        supabase.from("bookings").select("*").eq("user_id", user.id).order("appointment_date", { ascending: true }),
        supabase.from("coaching_requests").select("id, service_type, created_at, membership_start_date, membership_end_date, payment_status").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("chat_sessions").select("id, title, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false })
      ]);

      if (profileRes.error && profileRes.error.code !== 'PGRST116') throw profileRes.error; // PGRST116: no rows found, not an error for single()
      setProfile(profileRes.data);

      if (appointmentsRes.error) throw appointmentsRes.error;
      setAppointments(appointmentsRes.data || []);

      if (coachingRes.error) throw coachingRes.error;
      const processedSubscriptions = (coachingRes.data || [])
        .filter(req => req.payment_status === 'paid') // Only show paid subscriptions
        .map((r) => {
          const startDate = new Date(r.membership_start_date || r.created_at);
          // Assuming membership_end_date is correctly set by webhook or backend logic
          const endDate = r.membership_end_date ? new Date(r.membership_end_date) : addMonths(startDate, 1);
          return {
            id: r.id,
            name: tierNames(t)[r.service_type] || r.service_type,
            since: format(startDate, "P"), // Using date-fns for formatting
            expiresOn: format(endDate, "P"),
            daysRemaining: Math.max(0, Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))),
            isActive: new Date() <= endDate,
          };
        });
      setActiveSubscriptions(processedSubscriptions.filter(sub => sub.isActive));

      if (chatSessionsRes.error) throw chatSessionsRes.error;
      setChatSessions(chatSessionsRes.data || []);

    } catch (err) {
      console.error("Error in fetchProfileData:", err);
      setError(err.message || "Failed to load profile data.");
    } finally {
      setPageLoading(false);
    }
  }, [user, t]); // Added t to dependencies

  const checkAdminStatus = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.role === "admin") {
        setIsAdmin(true);
        fetchPendingTestimonials(); // Fetch testimonials if admin
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Error checking admin status:", err);
    }
  }, [user]); // Removed fetchPendingTestimonials from here, called conditionally

  const fetchPendingTestimonials = async () => {
    setTestimonialLoading(true);
    try {
      const { data, error } = await supabase.from("testimonials").select("*").eq("status", "pending").order("created_at", { ascending: false });
      if (error) throw error;
      setPendingTestimonials(data || []);
    } catch (err) {
      console.error("Error fetching pending testimonials:", err);
    } finally {
      setTestimonialLoading(false);
    }
  };


  useEffect(() => {
    if (user) {
      fetchProfileData();
      checkAdminStatus();
    } else if (!authLoading) { // If not auth loading and no user, stop page loading
      setPageLoading(false);
    }
  }, [user, authLoading, fetchProfileData, checkAdminStatus]);


  // Admin actions for testimonials
  const handleTestimonialAction = async (id, newStatus) => {
    // **SECURITY NOTE:** These are direct DB writes from client.
    // Ideal for Phase 3: Move to a secure API Route/Server Action.
    try {
      const { error } = await supabase.from("testimonials").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      setPendingTestimonials((prev) => prev.filter((t) => t.id !== id));
      alert(t(`profile.sections.testimonial_review.${newStatus === 'approved' ? 'approved' : 'rejected'}_alert` , `Testimonial ${newStatus}.`));
      // No need to call fetchPendingTestimonials() again if removing locally
    } catch (err) {
      console.error(`Error ${newStatus === 'approved' ? 'approving' : 'rejecting'} testimonial:`, err);
      alert(t(`profile.sections.testimonial_review.${newStatus === 'approved' ? 'approve' : 'reject'}_error_alert`, `Error updating testimonial.`));
    }
  };


  if (authLoading || pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-150px)]"> {/* Adjusted height */}
        <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-4 border-t-transparent border-oxfordBlue"></div>
      </div>
    );
  }

  if (!user) {
    // This state should ideally be handled by route protection (middleware or HOC in CRA terms)
    // For now, show a message or redirect.
    // In Next.js, you might use `router.push('/login')` here if `useRouter` is imported.
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-700">{t('profile.please_login', 'Please log in to view your profile.')}</p>
        <Link href="/login" className="mt-4 inline-block bg-oxfordBlue text-white px-6 py-2 rounded hover:bg-opacity-90">
          {t('navigation.login', 'Login')}
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 m-4 rounded-lg text-center border border-red-300">
        <h3 className="font-bold text-lg">{t("profile.error.title", "Error Loading Profile")}</h3>
        <p>{error}</p>
        <button onClick={fetchProfileData} className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
          {t('common.try_again', 'Try Again')}
        </button>
      </div>
    );
  }

  // Use NEXT_PUBLIC_ for client-side env vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const avatarPublicUrl = profile?.avatar_url && supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/avatars/${profile.avatar_url}`
    : null;

  const fallbackInitial = (profile?.full_name?.[0] || user?.email?.[0] || "?").toUpperCase();

  return (
    // Removed main tag, as layout.js likely provides it. Add pt for header.
    <div className="py-6 md:py-8 lg:py-12 px-4 md:px-6 lg:px-8 min-h-screen bg-gradient-to-b from-oxfordBlue via-oxfordBlue to-gentleGray">
      <div className="max-w-xs sm:max-w-md md:max-w-3xl lg:max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gentleGray rounded-xl shadow-lg p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 md:mb-8">
          <div className="flex-shrink-0">
            <OctagonalProfile
              size={profile?.avatar_url ? 80 : 60} // Larger if image exists
              borderColor="#002147" // oxfordBlue
              innerBorderColor="#FFFFFF" // White for better contrast on gentleGray
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
              href="/edit-profile" // Use Next.js Link and href
              className="mt-3 inline-block px-4 py-2 border border-oxfordBlue text-oxfordBlue hover:bg-oxfordBlue hover:text-white rounded-lg transition-colors duration-200 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-oxfordBlue"
            >
              {t("profile.edit_profile_button", "Edit Profile")}
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Column 1: Appointments & Subscriptions (stacked on smaller, side-by-side on lg) */}
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            {/* Appointments Section */}
            <div className="bg-gentleGray p-4 sm:p-6 rounded-xl shadow-lg h-auto"> {/* Removed fixed height */}
              <h3 className="text-lg md:text-xl font-bold text-oxfordBlue pb-3 mb-3 border-b border-gray-300">
                {t("profile.sections.appointments.title", "Upcoming Consultations")}
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar"> {/* Scrollable */}
                {appointments.length > 0 ? (
                  appointments.map((a) => (
                    <div key={a.id} className="border border-gray-200 rounded-lg shadow-sm p-3 transition-all hover:shadow-md bg-white">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                        <p className="text-sm md:text-base font-medium text-gray-700">
                          {format(new Date(a.appointment_date), "Pp")} {/* e.g., Sep 4, 2023, 7:00 PM */}
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
            <div className="bg-gentleGray p-4 sm:p-6 rounded-xl shadow-lg h-auto"> {/* Removed fixed height */}
              <h3 className="text-lg md:text-xl font-bold text-oxfordBlue pb-3 mb-3 border-b border-gray-300">
                {t("profile.sections.subscriptions.title", "Active Coaching")}
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar"> {/* Scrollable */}
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

          {/* Column 2: Conversation History (takes more space on lg) */}
          <div className="lg:col-span-2 bg-gentleGray p-4 sm:p-6 rounded-xl shadow-lg flex flex-col h-full min-h-[400px] lg:min-h-0"> {/* Ensure it has some min height */}
            <h3 className="text-lg md:text-xl font-bold text-oxfordBlue pb-3 mb-3 border-b border-gray-300">
              {t("profile.sections.conversations.title", "Chat History")}
            </h3>
            <div className="flex-grow overflow-hidden">
              {chatSessions.length > 0 ? (
                <div className="space-y-2 h-full max-h-[calc(100%-40px)] md:max-h-[50vh] lg:max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar"> {/* Adjusted max-h */}
                  {chatSessions.map((s) => (
                    <button
                      key={s.id}
                      className="w-full text-left transition-colors border border-gray-200 hover:bg-gray-100 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-oxfordBlue"
                      onClick={() => onChatOpen && onChatOpen(s.id)} // Call prop if it exists
                      aria-label={`Open chat: ${s.title || "Chat Session"}`}
                    >
                      <div className="p-3 flex justify-between items-center gap-2">
                        <div className="flex-1 min-w-0"> {/* Allow text to truncate */}
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
                    onClick={() => onChatOpen && onChatOpen()} // Open new chat
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
                onClick={fetchPendingTestimonials}
                disabled={testimonialLoading}
                className="px-3 py-1 text-xs bg-oxfordBlue text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {testimonialLoading ? t('common.loading', 'Loading...') : t('common.refresh', 'Refresh')}
              </button>
            </div>
            {testimonialLoading && !pendingTestimonials.length ? (
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
                      {/* Use next/image for testimonial avatar */}
                      <Image
                        src={testimonial.image_url || '/assets/icons/Profile_Branco_Placeholder.svg'} // Ensure placeholder exists
                        alt={testimonial.author || "Author"}
                        width={40} height={40}
                        className="w-10 h-10 rounded-full object-cover border-2 border-darkGold"
                        onError={(e) => { e.currentTarget.src = '/assets/icons/Profile_Branco_Placeholder.svg'; }} // Fallback
                      />
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm">{testimonial.author}</h4>
                        <p className="text-xs text-gray-500">{format(new Date(testimonial.created_at), "P")}</p>
                      </div>
                    </div>
                    <div className="px-3 py-3 bg-gray-50 rounded-lg mb-3 min-h-[60px]"> {/* Min height for quote */}
                      <p className="italic text-gray-700 text-sm">"{testimonial.quote}"</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleTestimonialAction(testimonial.id, 'rejected')} className="px-3 py-1 text-xs border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors">{t("profile.sections.testimonial_review.reject", "Reject")}</button>
                      <button onClick={() => handleTestimonialAction(testimonial.id, 'approved')} className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{t("profile.sections.testimonial_review.approve", "Approve")}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

