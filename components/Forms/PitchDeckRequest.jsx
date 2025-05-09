// components/Forms/PitchDeckRequest.jsx
// (Ensure this file is in your new Next.js project, e.g., under 'components/Forms/')
"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// --- IMPORTANT: Adjust these import paths ---
// Verify these paths match your new Next.js project structure.
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
// Corrected AuthModalContext import:
import { AuthModalContext } from "../../app/providers"; // Assuming providers.js is in app/
import { useScrollToTopOnChange } from "../../hooks/useScrollToTopOnChange";
import { autoCreateAccount } from "../../utils/autoSignup";
import { validatePhoneNumber } from "../../utils/phoneValidation"; // Review security of this utility
import InlineChatbotStep from "../chat/InlineChatbotStep"; // Check path
// --- End Adjust Paths ---

// Progress Indicator Component (remains the same, defined locally)
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

// Step 1: Project Selection
function ProjectSelectionStep({ formData, onChange }) {
  const { t } = useTranslation();
  const projects = [
    // Ensure translation keys exist
    { label: t("pitch_deck_request.project_options.perspectiv", "Perspectiv"), value: "perspectiv" },
    { label: t("pitch_deck_request.project_options.galow_club", "Galow.Club"), value: "galow" },
    { label: t("pitch_deck_request.project_options.pizzaria", "Pizzaria"), value: "pizzaria" },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 mb-6">
      {projects.map((p) => (
        <button // Changed div to button
          type="button"
          key={p.value}
          onClick={() => onChange({ target: { name: "project", value: p.value } })}
          className={`px-3 py-3 rounded-xl md:rounded-2xl cursor-pointer text-center border-2 shadow-lg text-base md:text-lg bg-oxfordBlue transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-darkGold focus:ring-opacity-70 ${
            formData.project === p.value
              ? "border-darkGold bg-darkGold/20 scale-[1.02]"
              : "border-darkGold hover:bg-darkGold/10 active:bg-darkGold/20"
          }`}
        >
          <span className="text-white font-medium">{p.label}</span>
        </button>
      ))}
    </div>
  );
}

// Step 2: Contact Info
function ContactInfoStep({ formData, onChange, onPhoneValidationResult }) { // Added onPhoneValidationResult
  const { t } = useTranslation();
  const { openAuthModal } = useContext(AuthModalContext);
  const phoneValidationTimeout = useRef(null);

  const [phoneValidationState, setPhoneValidationState] = useState({
    validating: false,
    validated: false,
    isValid: false,
    error: "",
  });

  const handlePhoneChange = (phone) => {
    onChange({ target: { name: "phone", value: phone } });
    setPhoneValidationState({ validating: false, validated: false, isValid: false, error: "" });

    if (phoneValidationTimeout.current) clearTimeout(phoneValidationTimeout.current);
    if (phone.replace(/\D/g, "").length < 8) {
      onPhoneValidationResult(false);
      return;
    }

    phoneValidationTimeout.current = setTimeout(async () => {
      setPhoneValidationState(prev => ({ ...prev, validating: true, error: "" }));
      try {
        // **SECURITY/BEST PRACTICE NOTE for validatePhoneNumber:**
        // If this utility calls an external API with a secret key,
        // it should be moved to a Next.js API Route to protect the key.
        const result = await validatePhoneNumber(phone);
        setPhoneValidationState({ validating: false, validated: true, isValid: result.isValid, error: result.isValid ? "" : t("pitch_deck_request.form.phone_validation_error", "Invalid phone number") });
        onPhoneValidationResult(result.isValid);
      } catch (error) {
        console.error("Phone validation error:", error);
        setPhoneValidationState({ validating: false, validated: true, isValid: false, error: "Validation service unavailable. Proceed if number is correct." });
        onPhoneValidationResult(false); // Or true to allow proceeding on service error
      }
    }, 800);
  };

  useEffect(() => {
    return () => { if (phoneValidationTimeout.current) clearTimeout(phoneValidationTimeout.current); };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
      <div className="space-y-2">
        <label htmlFor="pitch-name" className="block text-white text-sm md:text-base font-medium">{t("pitch_deck_request.form.name_label")}</label>
        <input
          id="pitch-name" name="name" type="text" value={formData.name} onChange={onChange}
          placeholder={t("pitch_deck_request.form.name_placeholder")} required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold shadow-inner text-base md:text-lg transition-colors"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="pitch-email" className="block text-white text-sm md:text-base font-medium">{t("pitch_deck_request.form.email_label")}</label>
        <input
          id="pitch-email" name="email" type="email" value={formData.email} onChange={onChange}
          placeholder={t("pitch_deck_request.form.email_placeholder")} required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold shadow-inner text-base md:text-lg transition-colors"
        />
      </div>
      <div className="md:col-span-2 space-y-2"> {/* Phone input spans full width */}
        <label htmlFor="pitch-phone" className="block text-white text-sm md:text-base font-medium">{t("coaching_request.form.phone_label")}</label> {/* Using coaching translation key as it's generic */}
        <div className="relative">
          <PhoneInput
            country={'es'} // Default country
            value={formData.phone}
            onChange={handlePhoneChange}
            containerClass="!w-full"
            inputClass={`!w-full !h-[48px] md:!h-[52px] !bg-white/5 !border !border-white/10 !rounded-xl !text-white !placeholder-white/50 !text-base md:!text-lg focus:!ring-2 focus:!ring-darkGold ${phoneValidationState.error ? '!border-red-500' : (phoneValidationState.validated && phoneValidationState.isValid ? '!border-green-500' : '!border-white/10')}`}
            buttonClass="!bg-white/5 !border-l-0 !border-y-0 !border-r !border-white/10 hover:!bg-white/10"
            dropdownClass="!bg-oxfordBlue !text-white !rounded-xl !shadow-lg !border !border-darkGold"
            searchClass="!bg-white/5 !text-white !placeholder-white/50 !rounded-md !p-2 !my-2 !border-darkGold"
            enableSearch
            searchPlaceholder={t("coaching_request.form.phone_search_placeholder")}
          />
          {formData.phone.replace(/\D/g, "").length >= 8 && (
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

// Step 3: Chatbot (New Step, similar to AnalysisRequest)
function ChatbotStep({ requestId, serviceType }) { // Added serviceType for context
  const { t } = useTranslation();
  if (!requestId) {
    return <div className="text-white text-center p-4">{t('pitch_deck_request.chatbot.waiting_for_request_id', 'Initializing chat... Please wait.')}</div>;
  }
  return (
    <div className="space-y-4">
      <InlineChatbotStep
        requestId={requestId} // This should be the session_id for the chat
        tableName="pitchdeck_chat_messages"
        // onFinish can be handled by the main form's "Next/Finish" button
      />
    </div>
  );
}


export default function PitchDeckRequest({ onBackService }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    project: "",
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false); // To show success message
  const [currentRequestId, setCurrentRequestId] = useState(null); // For the pitch_requests table ID
  const [chatSessionId, setChatSessionId] = useState(null); // For the chat session ID
  const [isPhoneValid, setIsPhoneValid] = useState(false); // For ContactStep validation

  const formRef = useScrollToTopOnChange([step]);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
      }));
      // Fetch phone from profiles table
      const fetchUserProfile = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("phone_number")
          .eq("id", user.id)
          .single();
        if (!error && data && data.phone_number) {
          setFormData(prev => ({ ...prev, phone: data.phone_number }));
          // Pre-validate if phone number exists
          // This might trigger an API call on load if phone exists, consider UX
          // await handlePhonePreValidation(data.phone_number);
        }
      };
      fetchUserProfile();
    }
  }, [user]);

  // Pre-validation function (optional, if you want to validate stored phone on load)
  // const handlePhonePreValidation = async (phone) => {
  //   if (phone.replace(/\D/g, "").length >= 8) {
  //     const result = await validatePhoneNumber(phone);
  //     setIsPhoneValid(result.isValid);
  //   }
  // };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "project" && value && step === 1) {
      setStep(2); // Move to Contact Info step
    }
  };

  const handlePhoneValidationResult = (isValid) => {
    setIsPhoneValid(isValid);
  };


  const STEPS = [
    { title: t("pitch_deck_request.steps.project", "1. Select Project"), component: ProjectSelectionStep },
    { title: t("pitch_deck_request.steps.contact", "2. Your Information"), component: ContactInfoStep },
    { title: t("pitch_deck_request.steps.chat", "3. Provide Details"), component: ChatbotStep },
  ];
  const CurrentStepComponent = STEPS[step - 1].component;
  const TOTAL_FORM_STEPS = STEPS.length;

  const handleStepClick = (clickedStepNum) => {
    if (clickedStepNum < step) setStep(clickedStepNum);
  };

  const canProceed = () => {
    if (step === 1) return !!formData.project;
    if (step === 2) {
      return formData.name.trim() &&
             formData.email.trim() &&
             /\S+@\S+\.\S+/.test(formData.email) && // Basic email format
             formData.phone.replace(/\D/g, "").length >= 8 && // Min phone length
             isPhoneValid; // Check validated phone status
    }
    return true; // For chatbot step
  };

  const handleNext = async () => {
    if (!canProceed()) return;

    if (step === 2) { // Submitting contact info, creating request, then going to chatbot
      setIsSubmitting(true);
      try {
        let currentUserId = user?.id;
        if (!currentUserId && formData.email) { // Auto-create account if not logged in
          const accountResult = await autoCreateAccount(formData.name, formData.email);
          if (accountResult.userId) currentUserId = accountResult.userId;
          else if (accountResult.error) {
            console.error("Auto account creation failed:", accountResult.error);
            alert(t('pitch_deck_request.errors.account_creation_failed', "Account creation failed. Please sign up or log in."));
            setIsSubmitting(false); return;
          }
        }

        const newChatSessionId = uuidv4(); // Generate unique ID for the chat session

        // **SECURITY NOTE:** Direct DB insert from client. Consider API Route for Phase 3.
        const payload = {
          project: formData.project,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone,
          session_id: newChatSessionId, // Store the chat session_id
          status: "pending_chat", // Initial status
        };
        if (currentUserId) payload.user_id = currentUserId;

        const { data, error } = await supabase
          .from("pitch_requests") // Your table for pitch deck requests
          .insert(payload)
          .select("id, session_id") // Select the request ID and session_id
          .single();

        if (error || !data) throw error || new Error("Pitch deck request creation failed");

        setCurrentRequestId(data.id); // Store the main request ID
        setChatSessionId(data.session_id); // Store the session_id for the chatbot
        setStep(3); // Move to chatbot step

      } catch (error) {
        console.error("Error submitting pitch deck request:", error);
        alert(t('pitch_deck_request.errors.submission_failed', "Failed to submit your request. Please try again."));
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === TOTAL_FORM_STEPS) { // Finishing from the last step (Chatbot)
      console.log("Pitch deck request and chat completed for request ID:", currentRequestId, "and chat session ID:", chatSessionId);
      // ** TODO: Potentially update pitch_requests status to 'chat_completed' or similar via API **
      setIsComplete(true); // Show success message
    } else {
      setStep(s => s + 1); // Move to next step (e.g., from Project Selection to Contact Info)
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else onBackService(); // Call parent's back function if on first step
  };

  return (
    <section className="py-8 px-4" id="pitch-deck-request" ref={formRef}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-black">
          {t("pitch_deck_request.title")}
        </h2>
        <div className="bg-oxfordBlue backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl border border-darkGold/50">
          {/* Step Content */}
          {!isComplete && step <= TOTAL_FORM_STEPS && (
            <>
              <h3 className="text-xl md:text-2xl text-white mb-6 font-semibold">
                {STEPS[step - 1].title}
              </h3>
              <CurrentStepComponent
                formData={formData}
                onChange={handleChange}
                onPhoneValidationResult={handlePhoneValidationResult} // Pass to ContactInfoStep
                requestId={chatSessionId} // Pass chatSessionId to ChatbotStep as 'requestId'
                serviceType={formData.project} // Pass project as serviceType for context
              />
            </>
          )}

          {/* Success Message */}
          {isComplete && (
            <div className="text-center py-8">
              <h3 className="text-xl md:text-2xl text-white mb-4 font-semibold">
                {t("pitch_deck_request.success_title", "Request Submitted Successfully!")}
              </h3>
              <p className="text-white/90 mb-6">
                {t("pitch_deck_request.success_message", "Thank you for your pitch deck request. We'll review the details and chat transcript, then get back to you soon via email.")}
              </p>
              <button
                onClick={onBackService}
                className="px-6 py-3 bg-darkGold text-black rounded-xl font-semibold hover:bg-opacity-90 transition-colors"
              >
                {t("pitch_deck_request.buttons.done", "Done")}
              </button>
            </div>
          )}

          {/* Navigation Controls (only if not complete) */}
          {!isComplete && (
            <>
              <StepIndicator stepCount={TOTAL_FORM_STEPS} currentStep={step} onStepClick={handleStepClick} />
              <div className="flex justify-between mt-8">
                <button
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="px-4 py-2 md:px-5 md:py-3 border-2 border-darkGold text-darkGold rounded-xl hover:bg-darkGold/10 active:bg-darkGold/20 transition-colors font-medium text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-darkGold focus:ring-opacity-50"
                >
                  {t("pitch_deck_request.buttons.back", "Back")}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isSubmitting}
                  className={`px-4 py-2 md:px-5 md:py-3 rounded-xl font-semibold text-sm md:text-base flex items-center
                    ${!canProceed() || isSubmitting
                      ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                      : step === TOTAL_FORM_STEPS
                      ? "bg-green-500 hover:bg-green-600 text-white transition-colors"
                      : "bg-darkGold hover:bg-yellow-500 text-black transition-colors"
                    }`}
                >
                  {isSubmitting && step === 2 ? ( // Spinner for step 2 submission
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      {t("pitch_deck_request.buttons.processing", "Processing...")}
                    </>
                  ) : (
                    step === TOTAL_FORM_STEPS
                      ? t("pitch_deck_request.buttons.finish", "Finish & Submit")
                      : t("pitch_deck_request.buttons.next", "Next")
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
