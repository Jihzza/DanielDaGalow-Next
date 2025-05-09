// app/settings/page.jsx
"use client"; // Essential for hooks, client-side logic

import React, { useState, useEffect, Suspense } from "react"; // Added Suspense
// Import from Next.js
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// --- IMPORTANT: Adjust these import paths based on your new project structure ---
// Example: import { useAuth } from '@/contexts/AuthContext';
import { useAuth } from "../../contexts/AuthContext";
// Example: import { supabase } from '@/utils/supabaseClient';
import { supabase } from "../../utils/supabaseClient";
// Example: import AuthModal from '@/components/Auth/AuthModal';
import AuthModal from "../../components/Auth/AuthModal";
// Example: import { getCookie, setCookie, deleteCookie } from '@/utils/cookieUtils';
import { getCookie, setCookie, deleteCookie } from "../../utils/cookieUtils"; // Ensure this utility is Next.js compatible if it uses router
// --- End Adjust Paths ---

import { useTranslation } from "react-i18next";

// Define SettingsPageContent to use useSearchParams
function SettingsPageContent() {
  const { user, signOut, loading: authLoading } = useAuth(); // Renamed loading to authLoading
  const router = useRouter();
  const searchParams = useSearchParams(); // For reading URL query parameters
  const { t } = useTranslation();

  const [pageLoading, setPageLoading] = useState(true); // Separate loading state for profile data
  const [profile, setProfile] = useState(null);
  const [activeSection, setActiveSection] = useState(null); // e.g., 'account', 'privacy', 'privacy-policy'
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Privacy settings states (can be fetched from DB later)
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public", // Example values: 'public', 'friends', 'private'
    shareAnalytics: true,
    chatRetention: "6months", // Example values: '1month', '3months', '6months', '1year', 'forever'
  });

  // Read initial section from URL query parameter
  useEffect(() => {
    const sectionFromUrl = searchParams.get('section');
    if (sectionFromUrl) {
      setActiveSection(sectionFromUrl);
    }
  }, [searchParams]);


  const fetchProfile = React.useCallback(async () => {
    if (!user) {
      setPageLoading(false);
      return;
    }
    try {
      setPageLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*") // Select specific fields you need
        .eq("id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116: No rows found
      setProfile(data);
      // TODO: Fetch and set actual privacySettings from user's profile if stored in DB
    } catch (error) {
      console.error("Error fetching settings profile:", error.message);
      // Handle error display to user
    } finally {
      setPageLoading(false);
    }
  }, [user]); // Added user to dependency array

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else if (!authLoading) { // If not loading auth and no user
      setPageLoading(false); // Stop page loading
    }
  }, [user, authLoading, fetchProfile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/"); // Navigate to homepage after sign out
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  const handlePrivacyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrivacySettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveSettings = async (section) => {
    if (!user && (section === "account" || section === "privacy" || section === "sessions")) {
      setShowAuthModal(true);
      return;
    }
    // ** TODO for Phase 3 (Backend Integration): **
    // Replace alert with an API call to your Next.js backend to save settings.
    // Example:
    // try {
    //   setLoading(true); // Indicate saving
    //   const response = await fetch('/api/settings/save', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ section, settings: section === 'privacy' ? privacySettings : {} }),
    //   });
    //   if (!response.ok) throw new Error('Failed to save settings');
    //   alert(`${section} settings saved successfully!`);
    // } catch (error) {
    //   console.error(`Error saving ${section} settings:`, error);
    //   alert(`Failed to save ${section} settings.`);
    // } finally {
    //   setLoading(false);
    // }
    alert(`${t(`settings.sections.${section}.title`, section)} settings saved! (This is a placeholder)`);
    // setActiveSection(null); // Optionally close the section after saving or show success
  };

  // Sub-components for UI elements
  const ToggleSwitch = ({ name, isChecked, onChange, label, description }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between py-4 gap-2 md:gap-4">
      <div className="md:flex-1">
        <h3 className="font-semibold text-gray-700">{label}</h3>
        {description && <p className="text-sm text-gray-500 mt-1 md:pr-8">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer self-start md:self-center mt-2 md:mt-0">
        <input type="checkbox" name={name} checked={isChecked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-oxfordBlue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-oxfordBlue"></div>
      </label>
    </div>
  );

  const SelectInput = ({ name, value, onChange, label, description, options }) => (
    <div className="py-4">
      <div className="mb-2 md:flex md:justify-between md:items-start">
        <div className="md:flex-1 md:pr-8">
          <h3 className="font-semibold text-gray-700">{label}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <select
          name={name} value={value} onChange={onChange}
          className="w-full md:w-auto md:min-w-[200px] lg:min-w-[250px] mt-2 md:mt-0 px-3 py-2 border border-oxfordBlue rounded-md focus:outline-none focus:ring-2 focus:ring-oxfordBlue bg-white text-gray-700 text-sm" // Adjusted styling
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const LoginPrompt = () => (
    <div className="text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-white">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h3 className="mt-2 text-lg font-medium text-gray-900">{t('settings.login_required_title', "Authentication Required")}</h3>
      <p className="mt-1 text-sm text-gray-500">{t('settings.login_required_message', 'Please log in or sign up to access and manage your settings.')}</p>
      <div className="mt-6">
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-5 py-2.5 bg-oxfordBlue text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-oxfordBlue"
        >
          {t('auth.login.title', 'Log In / Sign Up')}
        </button>
      </div>
    </div>
  );

  // Static content renderers (remain the same)
  const renderPrivacyPolicy = () => (
    <div className="prose prose-sm md:prose lg:prose-lg max-w-none">
      <h3 className="text-xl md:text-2xl font-bold text-oxfordBlue mb-4">
        {t("settings.privacy_policy.title")}
      </h3>
      <p className="mb-4 text-sm md:text-base">Last updated: April 26, 2025</p>

      <p className="mb-2 text-sm md:text-base">
        At DaGalow, we respect your privacy and are committed to protecting your
        personal data. This Privacy Policy explains how we collect, use, and
        safeguard your information when you use our website and services.
      </p>

      <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">1. Information We Collect</h4>
      <p className="mb-2 text-sm md:text-base">
        We collect information you provide directly to us, including:
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm md:text-base">
        <li>Personal information (name, email address, phone number)</li>
        <li>Profile information</li>
        <li>Payment and transaction information</li>
        <li>Communications you send to us</li>
        <li>Usage information and interaction with our services</li>
      </ul>

      <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">
        2. How We Use Your Information
      </h4>
      <p className="mb-2 text-sm md:text-base">We use your information to:</p>
      <ul className="list-disc pl-6 mb-4 text-sm md:text-base">
        <li>Provide, maintain, and improve our services</li>
        <li>Process transactions and send related information</li>
        <li>Send you technical notices, updates, and support messages</li>
        <li>Respond to your comments and questions</li>
        <li>Personalize your experience</li>
        <li>Monitor and analyze trends and usage</li>
      </ul>

      <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">3. Sharing of Information</h4>
      <p className="mb-2 text-sm md:text-base">We may share your information with:</p>
      <ul className="list-disc pl-6 mb-4 text-sm md:text-base">
        <li>Service providers who perform services on our behalf</li>
        <li>Payment processors</li>
        <li>Professional advisors</li>
        <li>When required by law or to protect rights</li>
      </ul>

      <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">4. Your Rights</h4>
      <p className="mb-2 text-sm md:text-base">
        Depending on your location, you may have rights to:
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm md:text-base">
        <li>Access personal data we hold about you</li>
        <li>Request correction of your personal data</li>
        <li>Request deletion of your personal data</li>
        <li>Object to processing of your personal data</li>
        <li>Request restriction of processing your personal data</li>
        <li>Request transfer of your personal data</li>
        <li>Withdraw consent</li>
      </ul>

      <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">5. Contact Us</h4>
      <p className="mb-4 text-sm md:text-base">
        If you have any questions about this Privacy Policy, please contact us
        at privacy@dagalow.com
      </p>
    </div>
  );

  const renderTermsOfService = () => (
    <div className="prose prose-sm md:prose lg:prose-lg max-w-none">
      <h3 className="text-xl md:text-2xl font-bold text-oxfordBlue mb-4">
        {t("settings.terms_of_service.title")}
      </h3>
      <p className="mb-4 text-sm md:text-base">Last updated: April 26, 2025</p>

      <p className="mb-2 text-sm md:text-base">
        Please read these Terms of Service ("Terms") carefully before using the
        DaGalow website and services operated by DaGalow ("we," "us," or "our").
      </p>

      <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">1. Acceptance of Terms</h4>
      <p className="mb-4 text-sm md:text-base">
        By accessing or using our service, you agree to be bound by these Terms.
        If you disagree with any part of the terms, you may not access the
        service.
      </p>

      <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">2. User Accounts</h4>
      <p className="mb-4 text-sm md:text-base">
        When you create an account with us, you must provide accurate, complete,
        and up-to-date information. You are responsible for safeguarding the
        password and for all activities that occur under your account. You agree
        to notify us immediately of any unauthorized use of your account.
      </p>

      <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">
        3. Payments and Subscriptions
      </h4>
      <p className="mb-2 text-sm md:text-base">For paid services:</p>
      <ul className="list-disc pl-6 mb-4 text-sm md:text-base">
        <li>
          You agree to pay all fees or charges to your account based on the
          fees, charges, and billing terms in effect at the time a fee or charge
          is due and payable.
        </li>
        <li>You must provide a valid payment method for paying all fees.</li>
        <li>Subscriptions will automatically renew until cancelled.</li>
        <li>
          Cancellations must be made at least 24 hours before the end of the
          current billing period.
        </li>
      </ul>

      <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">4. Coaching Services</h4>
      <p className="mb-4 text-sm md:text-base">
        Our coaching services are provided for informational and educational
        purposes only. We do not guarantee specific results. Implementation of
        advice and recommendations is at your own risk and discretion.
      </p>

      <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">5. Intellectual Property</h4>
      <p className="mb-4 text-sm md:text-base">
        The Service and its original content, features, and functionality are
        and will remain the exclusive property of DaGalow. Our service is
        protected by copyright, trademark, and other laws. Our trademarks may
        not be used in connection with any product or service without our prior
        written consent.
      </p>

      <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">6. Termination</h4>
      <p className="mb-4 text-sm md:text-base">
        We may terminate or suspend your account immediately, without prior
        notice or liability, for any reason, including without limitation if you
        breach the Terms. Upon termination, your right to use the Service will
        immediately cease.
      </p>

      <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">
        7. Limitation of Liability
      </h4>
      <p className="mb-4 text-sm md:text-base">
        In no event shall DaGalow, its directors, employees, partners, agents,
        suppliers, or affiliates, be liable for any indirect, incidental,
        special, consequential or punitive damages, including without
        limitation, loss of profits, data, use, goodwill, or other intangible
        losses.
      </p>

      <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">8. Changes to Terms</h4>
      <p className="mb-4 text-sm md:text-base">
        We reserve the right to modify or replace these Terms at any time. It is
        your responsibility to review these Terms periodically for changes.
      </p>

      <h4 className="font-bold text-lg md:text-xl mt-6 mb-2">9. Contact Us</h4>
      <p className="mb-4 text-sm md:text-base">
        If you have any questions about these Terms, please contact us at
        terms@dagalow.com
      </p>
    </div>
  );

  const renderSettingsContent = () => {
    // Ensure translation keys exist for all these cases
    switch (activeSection) {
      case "account":
        return user ? (
          <div>
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 lg:p-8">
              <div className="py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 text-lg md:text-xl">{t('settings.account.email_label', 'Email Address')}</h3>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 space-y-2 md:space-y-0">
                  <p className="text-gray-600 text-sm md:text-base">{user.email}</p>
                  <button disabled className="w-full md:w-auto text-oxfordBlue/70 text-xs md:text-sm px-3 py-1 border border-oxfordBlue/50 rounded-lg cursor-not-allowed">
                    {t('settings.account.change_email_button', 'Change Email (Disabled)')}
                  </button>
                </div>
              </div>
              <div className="py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 text-lg md:text-xl">{t('settings.account.password_label', 'Password')}</h3>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 space-y-2 md:space-y-0">
                  <p className="text-gray-600 text-sm md:text-base">••••••••••••</p>
                  <Link href="/forgot-password"  // Use Next.js Link
                    className="w-full md:w-auto text-oxfordBlue hover:underline text-xs md:text-sm px-3 py-1 border border-oxfordBlue rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-oxfordBlue">
                    {t('settings.account.reset_password_button', 'Reset Password')}
                  </Link>
                </div>
              </div>
              <div className="py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 text-lg md:text-xl">{t('settings.account.profile_info_label', 'Profile Information')}</h3>
                <div className="mt-2">
                    <Link href="/edit-profile" // Use Next.js Link
                    className="w-full md:w-auto text-oxfordBlue hover:underline text-xs md:text-sm px-3 py-1 border border-oxfordBlue rounded-lg inline-block text-center focus:outline-none focus:ring-1 focus:ring-oxfordBlue">
                    {t('settings.account.edit_profile_button', 'Edit Profile Details')}
                    </Link>
                </div>
              </div>
              <div className="py-4 space-y-4">
                <h3 className="font-semibold text-gray-800 text-lg md:text-xl">{t('settings.account.actions_label', 'Account Actions')}</h3>
                <div className="flex flex-col md:flex-row justify-between gap-3">
                  <button onClick={handleSignOut} className="text-oxfordBlue text-sm px-4 py-2 border border-oxfordBlue rounded-lg hover:bg-oxfordBlue/10 transition-colors w-full md:w-auto">
                    {t('settings.account.sign_out_button', 'Sign Out')}
                  </button>
                  <button disabled className="text-sm text-red-600/70 hover:bg-red-50 px-4 py-2 border border-red-600/70 rounded-lg transition-colors w-full md:w-auto cursor-not-allowed">
                    {t('settings.account.delete_account_button', 'Delete Account (Disabled)')}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={() => setActiveSection(null)} className="border-2 border-gray-400 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base w-full sm:w-auto">
                {t('common.back', 'Back')}
              </button>
              {/* <button onClick={() => saveSettings("account")} className="bg-oxfordBlue text-white py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors text-sm md:text-base w-full sm:w-auto">
                {t('common.save_settings', 'Save Settings')}
              </button> */}
            </div>
          </div>
        ) : <LoginPrompt />;
      case "privacy":
        return user ? (
          <div>
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 lg:p-8">
              <div className="border-b border-gray-200">
                <ToggleSwitch name="shareAnalytics" isChecked={privacySettings.shareAnalytics} onChange={handlePrivacyChange}
                  label={t('settings.privacy.analytics_label', "Usage Analytics")}
                  description={t('settings.privacy.analytics_description', "Allow us to collect anonymous usage data to improve our services.")} />
              </div>
              <div className="border-b border-gray-200">
                <SelectInput name="chatRetention" value={privacySettings.chatRetention} onChange={handlePrivacyChange}
                  label={t('settings.privacy.retention_label', "Data Retention")}
                  description={t('settings.privacy.retention_description', "Choose how long we keep your consultation chat history.")}
                  options={[
                    { value: "1month", label: t('settings.privacy.retention_options.1month', "1 Month") },
                    { value: "3months", label: t('settings.privacy.retention_options.3months', "3 Months") },
                    { value: "6months", label: t('settings.privacy.retention_options.6months', "6 Months") },
                    { value: "1year", label: t('settings.privacy.retention_options.1year', "1 Year") },
                    { value: "forever", label: t('settings.privacy.retention_options.forever', "Indefinitely (Not Recommended)") },
                  ]} />
              </div>
              <div className="py-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-700">{t('settings.privacy.download_label', "Data Download")}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t('settings.privacy.download_description', "Download a copy of all your personal data.")}</p>
                  </div>
                  <button disabled className="text-oxfordBlue/70 border border-oxfordBlue/50 hover:bg-oxfordBlue/10 py-1 px-3 rounded-lg transition-colors text-sm mt-2 md:mt-0 cursor-not-allowed">
                    {t('settings.privacy.request_data_button', "Request Data (Coming Soon)")}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={() => setActiveSection(null)} className="border-2 border-gray-400 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base w-full sm:w-auto">
                {t('common.back', 'Back')}
              </button>
              <button onClick={() => saveSettings("privacy")} className="bg-oxfordBlue text-white py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors text-sm md:text-base w-full sm:w-auto">
                {t('common.save_settings', 'Save Settings')}
              </button>
            </div>
          </div>
        ) : <LoginPrompt />;
      case "others": // This section now just links to policy pages
        return ( // No user check needed if just showing links
          <div>
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 lg:p-8">
              <div className="md:grid md:grid-cols-2 md:gap-6">
                <div className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all mb-4 md:mb-0 flex justify-between items-center focus-within:ring-2 focus-within:ring-oxfordBlue" onClick={() => setActiveSection("privacy-policy")} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setActiveSection("privacy-policy")}>
                  <div className="flex items-center"><div className="bg-oxfordBlue/10 p-2 md:p-3 rounded-full mr-3 md:mr-4"><svg className="w-5 h-5 md:w-6 md:h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></div><div><span className="font-medium text-sm md:text-base text-gray-800">{t("settings.privacy_policy.title", "Privacy Policy")}</span></div></div>
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all flex justify-between items-center focus-within:ring-2 focus-within:ring-oxfordBlue" onClick={() => setActiveSection("terms-of-service")} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setActiveSection("terms-of-service")}>
                  <div className="flex items-center"><div className="bg-oxfordBlue/10 p-2 md:p-3 rounded-full mr-3 md:mr-4"><svg className="w-5 h-5 md:w-6 md:h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div><div><span className="font-medium text-sm md:text-base text-gray-800">{t("settings.terms_of_service.title", "Terms of Service")}</span></div></div>
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setActiveSection(null)} className="border-2 border-gray-400 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base w-full sm:w-auto">
                {t('common.back', 'Back')}
              </button>
            </div>
          </div>
        );
      case "privacy-policy": // Render static content
        return (
          <div>
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 lg:p-8">
              <div className="max-h-[60vh] md:max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {renderPrivacyPolicy()}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setActiveSection("others")} className="border-2 border-gray-400 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base">
                {t('common.back', 'Back')}
              </button>
            </div>
          </div>
        );
      case "terms-of-service": // Render static content
        return (
          <div>
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 lg:p-8">
              <div className="max-h-[60vh] md:max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {renderTermsOfService()}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setActiveSection("others")} className="border-2 border-gray-400 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base">
                {t('common.back', 'Back')}
              </button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  // Main page loading state
  if (authLoading || pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-oxfordBlue"></div>
      </div>
    );
  }

  const settingsCategories = [
    { id: "account", titleKey: "settings.sections.account.title", descriptionKey: "settings.sections.account.description", icon: <svg className="w-5 h-5 md:w-6 md:h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> },
    { id: "privacy", titleKey: "settings.sections.privacy.title", descriptionKey: "settings.sections.privacy.description", icon: <svg className="w-5 h-5 md:w-6 md:h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg> },
    { id: "others", titleKey: "settings.sections.others.title", descriptionKey: "settings.sections.others.description", icon: <svg className="w-5 h-5 md:w-6 md:h-6 text-oxfordBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>, colSpan: "md:col-span-2" },
  ];

  return (
    // Removed <main> tag, assuming it's in app/layout.js
    <div className="min-h-screen bg-gradient-to-b from-oxfordBlue via-oxfordBlue to-gentleGray py-6 md:py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {activeSection ? (
          <div className="bg-gentleGray rounded-xl shadow-md md:shadow-lg p-4 md:p-6 lg:p-8">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-oxfordBlue mb-6">
              {activeSection === "privacy-policy" ? t("settings.privacy_policy.title") :
               activeSection === "terms-of-service" ? t("settings.terms_of_service.title") :
               activeSection === "others" ? t("settings.sections.others.title") :
               t(`settings.sections.${activeSection}.title`, `Settings: ${activeSection}`)}
            </h1>
            {renderSettingsContent()}
          </div>
        ) : (
          <>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 text-white">
              {t('settings.page_title', "Settings")}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {settingsCategories.map(category => (
                <div
                  key={category.id}
                  className={`bg-gentleGray rounded-xl shadow-md p-4 md:p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] focus-within:ring-2 focus-within:ring-oxfordBlue ${category.colSpan || ''}`}
                  onClick={() => setActiveSection(category.id)}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveSection(category.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-oxfordBlue/10 p-2 md:p-3 rounded-full mr-3 md:mr-4">{category.icon}</div>
                      <div>
                        <h2 className="text-lg md:text-xl font-semibold text-oxfordBlue">{t(category.titleKey)}</h2>
                        <p className="text-gray-600 mt-1 text-sm md:text-base">{t(category.descriptionKey)}</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-oxfordBlue opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialView="login" />
      </div>
    </div>
  );
}

// Wrap SettingsPageContent with Suspense for useSearchParams
export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-oxfordBlue"></div></div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
