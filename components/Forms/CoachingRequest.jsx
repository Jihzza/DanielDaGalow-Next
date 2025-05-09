// components/Forms/CoachingRequest.jsx
"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import Image from 'next/image'; // Import next/image
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; // Keep library CSS import

// --- Adjust import paths as needed ---
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import InlineChatbotStep from "../chat/InlineChatbotStep"; // Check path
import { AuthModalContext } from "../../app/providers"; // Corrected import path
import { ServiceContext } from "../../contexts/ServiceContext";
import { useScrollToTopOnChange } from "../../hooks/useScrollToTopOnChange";
import { autoCreateAccount } from "../../utils/autoSignup";
import { validatePhoneNumber } from "../../utils/phoneValidation"; // For now, keep client-side
// --- End Adjust Paths ---

import { addMonths } from "date-fns";
import axios from "axios";

// Progress Indicator Component (remains the same)
function StepIndicator({ stepCount, currentStep, onStepClick = () => {} }) {
  return (
    <div className="flex items-center justify-center gap-1 md:gap-2 mt-6 md:mt-8">
      {Array.from({ length: stepCount }).map((_, idx) => {
        const stepNum = idx + 1;
        const isActive = currentStep === stepNum;
        return (
          <React.Fragment key={stepNum}>
            <button
              type="button"
              onClick={() => onStepClick(stepNum)}
              disabled={stepNum > currentStep && stepNum !== currentStep + 1}
              className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border-2 transition-colors text-sm md:text-base ${
                isActive
                  ? "bg-darkGold border-darkGold text-white transform scale-110"
                  : currentStep > stepNum
                  ? "bg-darkGold/50 border-darkGold/70 text-white/90 hover:border-darkGold"
                  : "bg-white/20 border-white/50 text-white/80 hover:border-darkGold hover:text-white"
              } ${stepNum > currentStep + 1 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              aria-label={`Go to step ${stepNum}`}
            >
              {stepNum}
            </button>
            {idx < stepCount - 1 && (
              <div className={`h-0.5 flex-1 mx-1 md:mx-2 transition-colors ${currentStep > stepNum ? "bg-darkGold" : "bg-white/20"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Step 1: Frequency Selection (remains largely the same)
function FrequencyStep({ formData, onChange }) {
  const { t } = useTranslation();
  const options = [
    { label: t("coaching_request.frequency_options.weekly"), value: "Weekly" },
    { label: t("coaching_request.frequency_options.daily"), value: "Daily" },
    { label: t("coaching_request.frequency_options.priority"), value: "Priority" },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 mb-6">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`px-3 py-3 rounded-xl md:rounded-2xl cursor-pointer text-center border-2 shadow-lg text-base md:text-lg bg-oxfordBlue transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-darkGold focus:ring-opacity-70 ${
            formData.frequency === opt.value
              ? "border-darkGold bg-darkGold/20 scale-[1.02]" // Active state
              : "border-darkGold hover:bg-darkGold/10 active:bg-darkGold/20"
          }`}
          onClick={() => onChange({ target: { name: "frequency", value: opt.value } })}
        >
          <p className="text-white font-medium">{opt.label}</p>
        </button>
      ))}
    </div>
  );
}

// Step 2: Contact Info
function ContactStep({ formData, onChange, onPhoneValidationResult }) { // Added onPhoneValidationResult
  const { t } = useTranslation();
  const { openAuthModal } = useContext(AuthModalContext);
  const phoneValidationTimeout = useRef(null);

  const [phoneValidationState, setPhoneValidationState] = useState({
    validating: false,
    validated: false, // Has a validation attempt been made?
    isValid: false,   // Is the current number valid?
    error: "",
  });

  const handlePhoneChange = (phone) => {
    onChange({ target: { name: "phone", value: phone } }); // Update parent form data
    setPhoneValidationState({ validating: false, validated: false, isValid: false, error: "" }); // Reset on change

    if (phoneValidationTimeout.current) clearTimeout(phoneValidationTimeout.current);

    if (phone.replace(/\D/g, "").length < 8) { // Basic length check before API call
      onPhoneValidationResult(false); // Inform parent it's not valid yet
      return;
    }

    phoneValidationTimeout.current = setTimeout(async () => {
      setPhoneValidationState(prev => ({ ...prev, validating: true, error: "" }));
      try {
        // **SECURITY/BEST PRACTICE NOTE for validatePhoneNumber:**
        // If validatePhoneNumber makes an API call with a secret key,
        // this should ideally be moved to a Next.js API Route to protect the key.
        // The client would call your API route, which then calls Numverify.
        const result = await validatePhoneNumber(phone); // Assuming this utility is adapted
        setPhoneValidationState({ validating: false, validated: true, isValid: result.isValid, error: result.isValid ? "" : t("coaching_request.form.phone_validation_error") });
        onPhoneValidationResult(result.isValid); // Notify parent of validation status
      } catch (error) {
        console.error("Phone validation error:", error);
        setPhoneValidationState({ validating: false, validated: true, isValid: false, error: "Validation service unavailable. Please proceed if your number is correct." });
        onPhoneValidationResult(false); // Or true if you want to allow proceeding on service error
      }
    }, 800);
  };

  useEffect(() => {
    return () => { if (phoneValidationTimeout.current) clearTimeout(phoneValidationTimeout.current); };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label htmlFor="coaching-name" className="block text-white mb-2 text-sm md:text-base">{t("coaching_request.form.name_label")}</label>
        <input id="coaching-name" name="name" type="text" value={formData.name} onChange={onChange} placeholder={t("coaching_request.form.name_placeholder")} required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold shadow-inner text-base md:text-lg transition-colors" />
      </div>
      <div>
        <label htmlFor="coaching-email" className="block text-white mb-2 text-sm md:text-base">{t("coaching_request.form.email_label")}</label>
        <input id="coaching-email" name="email" type="email" value={formData.email} onChange={onChange} placeholder={t("coaching_request.form.email_placeholder")} required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold shadow-inner text-base md:text-lg transition-colors" />
      </div>
      <div className="md:col-span-2"> {/* Phone input spans full width on md screens */}
        <label htmlFor="coaching-phone" className="block text-white mb-2 font-medium text-sm md:text-base">{t("coaching_request.form.phone_label")}</label>
        <div className="relative">
          <PhoneInput
            country={'es'} // Default country
            value={formData.phone}
            onChange={handlePhoneChange} // Use the new handler
            containerClass="!w-full"
            inputClass={`!w-full !h-[48px] md:!h-[52px] !bg-white/5 !border !border-white/10 !rounded-xl !text-white !placeholder-white/50 !text-base md:!text-lg focus:!ring-2 focus:!ring-darkGold ${phoneValidationState.error ? '!border-red-500' : (phoneValidationState.validated && phoneValidationState.isValid ? '!border-green-500' : '!border-white/10')}`}
            buttonClass="!bg-white/5 !border-l-0 !border-y-0 !border-r !border-white/10 hover:!bg-white/10"
            dropdownClass="!bg-oxfordBlue !text-white !rounded-xl !shadow-lg !border !border-darkGold"
            searchClass="!bg-white/5 !text-white !placeholder-white/50 !rounded-md !p-2 !my-2 !border-darkGold"
            enableSearch
            searchPlaceholder={t("coaching_request.form.phone_search_placeholder")}
          />
          {/* Validation Indicator */}
          {formData.phone.replace(/\D/g, "").length >= 8 && ( // Show only if min digits entered
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center pointer-events-none">
              {phoneValidationState.validating && <svg className="animate-spin h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {!phoneValidationState.validating && phoneValidationState.validated && phoneValidationState.isValid && <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
              {!phoneValidationState.validating && phoneValidationState.validated && !phoneValidationState.isValid && <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>}
            </div>
          )}
        </div>
        {phoneValidationState.error && <p className="text-red-400 text-xs mt-1">{phoneValidationState.error}</p>}
      </div>
      <div className="md:col-span-2 text-white text-xs text-right sm:text-sm">
        <button type="button" onClick={openAuthModal} className="text-gray-300 hover:text-darkGold underline">
          {t("services.common_login_signup")}
        </button>
      </div>
    </div>
  );
}

// Step 3: Payment Step
function PaymentStep({ selectedTier, requestId, onPaymentConfirmed, formData }) {
  const { t } = useTranslation();
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentConfirmedLocal, setPaymentConfirmedLocal] = useState(false);
  const [pollingError, setPollingError] = useState(null);
  // No changes to TIER_PRICES_CENTS or TIER_PLAN_NAMES

  const TIER_PRICES_CENTS = { Weekly: 4000, Daily: 9000, Priority: 23000 };
  const TIER_PLAN_NAMES = { Weekly: "Basic", Daily: "Standard", Priority: "Premium" };


  const priceInCents = TIER_PRICES_CENTS[selectedTier] || TIER_PRICES_CENTS["Weekly"];
  const priceDisplay = `€${(priceInCents / 100).toFixed(2)}`;
  const planName = TIER_PLAN_NAMES[selectedTier] || TIER_PLAN_NAMES["Weekly"];

  useEffect(() => {
    const pendingId = localStorage.getItem('pendingCoachingId');
    if (pendingId && pendingId === String(requestId)) {
      setPaymentStarted(true);
    }
  }, [requestId]);

  const handleStripeRedirect = async () => {
    setPollingError(null);
    if (!requestId || !selectedTier || !formData.email) {
      setPollingError(t('coaching_request.payment.error_missing_details', "Missing details for payment."));
      return;
    }
    try {
      localStorage.setItem('pendingCoachingId', String(requestId));
      // This call should already be correct if you followed Step 10
      const { data } = await axios.post("/api/stripe/checkout/coaching", {
        requestId,
        tier: selectedTier,
        email: formData.email,
        name: formData.name, // Pass name for Stripe product data
        // isTestBooking: false, // Add if you have a test mode for coaching
      });
      window.open(data.url, '_blank');
      setPaymentStarted(true);
    } catch (error) {
      console.error("Error creating Stripe subscription:", error);
      setPollingError(error.response?.data?.error || t('coaching_request.payment.error_stripe_session',"Failed to start subscription process."));
    }
  };

  useEffect(() => {
    if (!paymentStarted || !requestId || paymentConfirmedLocal) return;

    let intervalId; // To store the interval ID for cleanup

    const checkStatus = async () => {
      try {
        // *** UPDATED API CALL for status check ***
        const response = await axios.get(`/api/status/coaching/${requestId}`);
        if (response.data.paymentStatus === "paid") {
          setPaymentConfirmedLocal(true);
          onPaymentConfirmed(true);
          clearInterval(intervalId);
          localStorage.removeItem('pendingCoachingId');
        } else if (response.data.paymentStatus === "pending" && Math.random() < 0.1) { // Reduced frequency of force update
          // Attempt to force update less frequently
          console.log(`Attempting to force update status for coaching request: ${requestId}`);
          // *** UPDATED API CALL for force update (now POST) ***
          try {
            await axios.post(`/api/status/coaching/force-update/${requestId}`);
            // No need to immediately re-check here, the next interval will do it.
          } catch (forceUpdateError) {
            console.error("Error during force update attempt:", forceUpdateError);
            // Don't set pollingError here unless it's persistent
          }
        }
      } catch (error) {
        console.error("Error checking coaching payment status:", error);
        // Avoid setting pollingError for transient network issues,
        // but consider a counter for repeated failures.
        // setPollingError(t('coaching_request.payment.error_polling',"Error checking subscription status. Please refresh or contact support if payment was made."));
        // clearInterval(intervalId); // Decide if you want to stop polling on error
      }
    };

    // Initial check
    checkStatus();
    // Set up polling
    intervalId = setInterval(checkStatus, 7000); // Poll every 7 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [paymentStarted, requestId, onPaymentConfirmed, paymentConfirmedLocal, t]); // Added t to dependencies

  // Rest of the PaymentStep JSX remains the same...
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden mb-6">
        <div className="bg-darkGold/10 p-4 border-b border-white/10"><h3 className="text-white font-semibold text-center">{t('coaching_request.payment.summary_title', 'Subscription Details')}</h3></div>
        <div className="p-5 space-y-4">
          <div className="flex justify-between items-center"><span className="text-white/70">{t('coaching_request.payment.plan_label', 'Selected Plan:')}</span><div className="flex items-center gap-2"><span className="text-white font-medium">{planName}</span><span className="bg-darkGold/20 text-white text-xs px-2 py-0.5 rounded">{selectedTier}</span></div></div>
          <div className="flex justify-between items-center"><span className="text-white/70">{t('coaching_request.payment.price_label', 'Price:')}</span><div className="text-darkGold font-bold text-lg">{priceDisplay}<span className="text-white/50 text-sm font-normal">/month</span></div></div>
          <div className="flex justify-between items-center"><span className="text-white/70">{t('coaching_request.payment.billing_label', 'Billing:')}</span><span className="text-white">{t('coaching_request.payment.billing_value', 'Monthly')}</span></div>
          <div className="flex justify-between items-center"><span className="text-white/70">{t('coaching_request.payment.renewal_label', 'Renewal:')}</span><span className="text-white">{t('coaching_request.payment.renewal_value', 'Automatic')}</span></div>
          <div className="border-t border-white/10 my-2"></div>
          <div className="flex justify-between items-center text-sm"><span className="text-white/70">{t('coaching_request.payment.email_label', 'Email for billing:')}</span><span className="text-white break-all truncate max-w-[180px]">{formData.email}</span></div>
        </div>
        <div className="bg-white/5 p-3 text-xs text-white/60 text-center border-t border-white/10">{t('coaching_request.payment.cancel_info', 'You can cancel your subscription at any time from your account settings.')}</div>
      </div>
      <div className="space-y-4">
        {!paymentStarted ? (
          <button onClick={handleStripeRedirect} className="w-full py-3 bg-gradient-to-r from-darkGold to-amber-400 text-black font-semibold rounded-lg hover:from-amber-400 hover:to-amber-300 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-darkGold focus:ring-offset-oxfordBlue">
            {t('coaching_request.payment.start_subscription_button', 'Start Subscription')}
          </button>
        ) : paymentConfirmedLocal ? (
          <div className="flex items-center justify-center gap-2 bg-green-500/20 border border-green-400/30 rounded-lg p-3 text-green-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{t('coaching_request.payment.success_status', 'Subscription activated!')}</span></div>
        ) : (
          <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/20 rounded-lg p-3 text-white/80"><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div><span>{t('coaching_request.payment.confirming_status', 'Confirming subscription...')}</span></div>
        )}
        {pollingError && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm text-center" role="alert">{pollingError}</div>}
        {paymentStarted && !paymentConfirmedLocal && !pollingError && <p className="text-white/60 text-sm text-center">{t('coaching_request.payment.window_info', 'Payment window opened. Please complete and return.')}</p>}
      </div>
      <div className="mt-6 flex justify-center items-center gap-4">
        <img src="/assets/icons/stripe.svg" alt="Secure payments by Stripe" width={80} height={32} className="h-8 opacity-90" />
        <img src="/assets/icons/ssl-lock.svg" alt="SSL Secured" width={32} height={32} className="h-8 opacity-90" />
      </div>
    </div>
  );
}

// Main Coaching Request Component
export default function CoachingRequest({ onBackService }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { service, tier, setService, setTier } = useContext(ServiceContext); // Get tier from context

  // Initialize step: if tier is pre-selected (from Hero), start at step 2, else step 1.
  const [step, setStep] = useState(tier ? 2 : 1);
  const [formData, setFormData] = useState({
    frequency: tier || "", // Use tier from context if available
    name: "",
    email: "",
    phone: "",
  });

  const [isPhoneValid, setIsPhoneValid] = useState(false); // For ContactStep validation
  const formRef = useScrollToTopOnChange([step]);
  const [requestId, setRequestId] = useState(null); // To store ID from Supabase insert
  const [isSubmitting, setIsSubmitting] = useState(false); // For loading state during Supabase insert
  const [paymentDone, setPaymentDone] = useState(false); // Tracks if payment step is complete

  // Pre-fill form with user data and tier from context
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
      }));
    }
    if (tier) { // If tier comes from context (e.g., selected in Hero)
      setFormData(prev => ({ ...prev, frequency: tier }));
      if(step === 1) setStep(2); // If tier is set, and we are on step 1, move to step 2
    }
  }, [user, tier, step]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // If frequency is selected in step 1, and we are still on step 1, move to step 2
    if (name === "frequency" && value && step === 1) {
      setStep(2);
    }
  };

  const handlePhoneValidationResult = (isValid) => {
    setIsPhoneValid(isValid);
  };

  const STEPS = [
    { title: t("coaching_request.steps.frequency"), component: FrequencyStep },
    { title: t("coaching_request.steps.contact"), component: ContactStep },
    { title: t("coaching_request.steps.payment"), component: PaymentStep },
    { title: t("coaching_request.steps.chat"), component: InlineChatbotStep },
  ];
  const CurrentStepComponent = STEPS[step - 1].component;
  const TOTAL_FORM_STEPS = STEPS.length;

  const handlePaymentConfirmed = (confirmed) => setPaymentDone(confirmed);

  const canProceed = () => {
    if (step === 1) return !!formData.frequency; // Must select a frequency
    if (step === 2) {
      const isNameValid = formData.name && formData.name.trim().length >= 2;
      const isEmailValid = formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      // Phone validation is handled by isPhoneValid state updated by ContactStep
      return isNameValid && isEmailValid && isPhoneValid;
    }
    if (step === 3) return paymentDone; // Must complete payment
    return true; // For chatbot step, always allow proceeding (or handle its own "finish")
  };

  const handleNext = async () => {
    if (!canProceed()) return;

    if (step === 1) { // Moving from Frequency to Contact
      setStep(2);
    } else if (step === 2) { // Moving from Contact to Payment
      setIsSubmitting(true);
      try {
        let currentUserId = user?.id;
        if (!currentUserId && formData.email) {
          const accountResult = await autoCreateAccount(formData.name, formData.email);
          if (accountResult.userId) currentUserId = accountResult.userId;
          else if (accountResult.error) {
            console.error("Auto account creation failed:", accountResult.error);
            alert(t('coaching_request.errors.account_creation_failed', "Account creation failed. Please sign up or log in."));
            setIsSubmitting(false); return;
          }
        }

        const membershipStartDate = new Date();
        const membershipEndDate = addMonths(membershipStartDate, 1);
        const payload = {
          name: formData.name.trim(), email: formData.email.trim(), phone: formData.phone,
          service_type: formData.frequency,
          membership_start_date: membershipStartDate.toISOString(),
          membership_end_date: membershipEndDate.toISOString(),
          payment_status: "pending", // Will be updated by webhook/polling
        };
        if (currentUserId) payload.user_id = currentUserId;

        // **SECURITY NOTE:** Direct DB insert from client. Consider API Route.
        const { data, error } = await supabase.from("coaching_requests").insert(payload).select("id").single();
        if (error || !data) throw error || new Error("Coaching request creation failed");
        setRequestId(data.id); // Store the new request ID for payment and chat steps
        setStep(3); // Proceed to Payment
      } catch (error) {
        console.error("Error creating coaching request:", error);
        alert(t('coaching_request.errors.submission_failed', "Failed to submit coaching request. Please try again."));
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 3) { // Moving from Payment to Chat
      setStep(4);
    }
    // For step 4 (Chatbot), "Next" button might become "Finish"
  };

  const handleBack = () => {
    if (step > 1) {
        // If going back from payment (step 3) or chat (step 4) to contact (step 2),
        // or from contact (step 2) to frequency (step 1 if tier wasn't pre-selected)
        if (step === 2 && tier) { // If tier was pre-selected, back from contact goes to service selection
            onBackService();
        } else {
            setStep(s => s - 1);
        }
    } else { // step is 1
        onBackService(); // Call parent's back function to go to service selection
    }
  };

  const handleStepClick = (clickedStepNum) => {
    // Allow navigation back to any previous, completed step
    // Or back to service selection (which is step 0 in this form's context, handled by onBackService)
    if (clickedStepNum < step) {
        setStep(clickedStepNum);
    }
    // Do not allow jumping forward via step indicator for now
  };

  return (
    <section className="py-8 px-4" id="coaching-journey" ref={formRef}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-black">
          {t("coaching_request.title")}
        </h2>
        <div className="bg-oxfordBlue backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl border border-darkGold/50">
          <h3 className="text-xl md:text-2xl text-white mb-6 font-semibold">
            {STEPS[step - 1].title}
          </h3>

          {/* Pass correct props to CurrentStepComponent */}
          {step === 1 && <FrequencyStep formData={formData} onChange={handleChange} />}
          {step === 2 && <ContactStep formData={formData} onChange={handleChange} onPhoneValidationResult={handlePhoneValidationResult} />}
          {step === 3 && requestId && <PaymentStep selectedTier={formData.frequency} requestId={requestId} formData={formData} onPaymentConfirmed={handlePaymentConfirmed} />}
          {step === 4 && requestId && <InlineChatbotStep requestId={requestId} tableName="coaching_chat_messages" onFinish={() => {
             // Handle N8N webhook call for coaching completion
             const webhookUrl = process.env.NEXT_PUBLIC_N8N_COACHING_COMPLETE_WEBHOOK; // Ensure this env var is set
             if (webhookUrl && requestId) {
                axios.post(webhookUrl, { session_id: requestId })
                   .then(() => console.log(`Coaching completion webhook for ${requestId} triggered.`))
                   .catch(err => console.error("Error triggering coaching completion webhook:", err));
             }
             onBackService(); // Go back to service selection or a success page
          }} />}

          <StepIndicator stepCount={TOTAL_FORM_STEPS} currentStep={step} onStepClick={handleStepClick} />

          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={isSubmitting} // Disable if main form is submitting (step 2 to 3)
              className="px-4 py-2 border-2 border-darkGold text-darkGold rounded-xl hover:bg-darkGold/10 transition-colors font-medium"
            >
              {t("coaching_request.buttons.back")}
            </button>
            {step < TOTAL_FORM_STEPS && (
              <button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className="px-4 py-2 bg-darkGold text-black rounded-xl font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting && step === 2 ? ( // Show spinner only for the submission from contact to payment
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    {t("coaching_request.buttons.processing")}
                  </>
                ) : (
                  // Use specific labels for next step based on current step
                  step === 1 ? t("coaching_request.steps.contact") :
                  step === 2 ? t("coaching_request.steps.payment") :
                  step === 3 ? t("coaching_request.steps.chat") :
                  t("coaching_request.buttons.next")
                )}
              </button>
            )}
            {step === TOTAL_FORM_STEPS && ( // On the last step (Chatbot)
              <button
                onClick={() => {
                    // Final onFinish logic for the entire coaching request flow
                    const webhookUrl = process.env.NEXT_PUBLIC_N8N_COACHING_COMPLETE_WEBHOOK;
                    if (webhookUrl && requestId) {
                        axios.post(webhookUrl, { session_id: requestId })
                           .then(() => console.log(`Coaching flow completion webhook for ${requestId} triggered.`))
                           .catch(err => console.error("Error triggering coaching flow completion webhook:", err));
                    }
                    onBackService(); // Or navigate to a "Thank You" / "Success" page
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
              >
                {t("coaching_request.buttons.done", "Done")}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

