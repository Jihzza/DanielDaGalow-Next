// components/Forms/AnalysisRequest.jsx
// (Ensure this file is in your new Next.js project, e.g., under 'components/Forms/')
"use client";

import React, { useState, useEffect, useContext } from "react"; // Added useEffect
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from 'uuid'; // Ensure 'uuid' package is installed

// --- IMPORTANT: Adjust these import paths ---
// Verify these paths match your new Next.js project structure.
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
// Corrected AuthModalContext import:
import { AuthModalContext } from "../../app/providers"; // Assuming providers.js is in app/
import { useScrollToTopOnChange } from "../../hooks/useScrollToTopOnChange";
import { autoCreateAccount } from "../../utils/autoSignup";
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

// Step 1: Select Analysis Type (remains largely the same)
function TypeSelectionStep({ formData, onChange }) {
  const { t } = useTranslation();
  const options = [
    { label: t("analysis_request.type_options.stock", "Stock"), value: "stock" },
    { label: t("analysis_request.type_options.socialmedia", "Social Media"), value: "socialmedia" },
    { label: t("analysis_request.type_options.business", "Business"), value: "business" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 mb-6">
      {options.map((opt) => (
        <button // Changed div to button for better accessibility and interaction
          type="button"
          key={opt.value}
          onClick={() => onChange({ target: { name: "type", value: opt.value } })}
          className={`px-4 py-3 md:py-4 rounded-xl md:rounded-2xl cursor-pointer text-center border-2 shadow-lg transition-all text-base md:text-lg bg-oxfordBlue focus:outline-none focus:ring-2 focus:ring-darkGold focus:ring-opacity-70 transform hover:scale-105 ${
            formData.type === opt.value
              ? "border-darkGold bg-darkGold/20 scale-[1.02]" // Active state
              : "border-darkGold hover:bg-darkGold/10 active:bg-darkGold/20"
          }`}
        >
          <p className="text-white font-medium">{opt.label}</p>
        </button>
      ))}
    </div>
  );
}

// Step 2: Contact Info (AuthModalContext usage is key)
function ContactInfoStep({ formData, onChange }) {
  const { t } = useTranslation();
  const { openAuthModal } = useContext(AuthModalContext); // Correctly use context

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
      <div className="space-y-2">
        <label htmlFor="analysis-name" className="block text-white text-sm md:text-base font-medium">{t("analysis_request.form.name_label")}</label>
        <input
          id="analysis-name"
          name="name" type="text" value={formData.name} onChange={onChange}
          placeholder={t("analysis_request.form.name_placeholder")} required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold shadow-inner text-base md:text-lg transition-colors"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="analysis-email" className="block text-white text-sm md:text-base font-medium">{t("analysis_request.form.email_label")}</label>
        <input
          id="analysis-email"
          name="email" type="email" value={formData.email} onChange={onChange}
          placeholder={t("analysis_request.form.email_placeholder")} required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold shadow-inner text-base md:text-lg transition-colors"
        />
      </div>
      <div className="md:col-span-2 text-white text-xs text-right sm:text-sm"> {/* Adjusted col-span and text alignment */}
        <button type="button" onClick={openAuthModal} className="text-gray-300 hover:text-darkGold underline">
          {t("services.common_login_signup")}
        </button>
      </div>
    </div>
  );
}

// Step 3: Chatbot
function ChatbotStep({ requestId, serviceType }) { // Added serviceType prop for context
  const { t } = useTranslation();
  if (!requestId) {
    return <div className="text-white text-center p-4">{t('analysis_request.chatbot.waiting_for_request_id', 'Initializing chat... Please wait.')}</div>;
  }
  return (
    <div className="space-y-4">
      <InlineChatbotStep
        requestId={requestId} // This should be the session_id for the chat
        tableName="analysis_chat_messages"
        // onFinish can be handled by the main form's "Next/Finish" button
      />
    </div>
  );
}

export default function AnalysisRequest({ onBackService }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: "",
    name: "", // Initialize empty, then fill from user context
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null); // To store the ID of the analysis_requests record
  const [chatSessionId, setChatSessionId] = useState(null); // To store the session_id for the chat

  const formRef = useScrollToTopOnChange([step]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
      }));
    }
  }, [user]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "type" && value && step === 1) { // If type is selected, move to step 2
      setStep(2);
    }
  };

  const STEPS = [
    { title: t("analysis_request.steps.type", "1. Select Analysis Type"), component: TypeSelectionStep },
    { title: t("analysis_request.steps.contact", "2. Your Information"), component: ContactInfoStep },
    { title: t("analysis_request.steps.chatbot", "3. Provide Details"), component: ChatbotStep },
  ];
  const CurrentStepComponent = STEPS[step - 1].component;
  const TOTAL_FORM_STEPS = STEPS.length;

  const handleStepClick = (clickedStepNum) => {
    // Allow navigation back to any previous, completed step
    if (clickedStepNum < step) {
        setStep(clickedStepNum);
    }
    // Do not allow jumping forward via step indicator for now
  };

  const canProceed = () => {
    if (step === 1) return !!formData.type;
    if (step === 2) return formData.name.trim() && formData.email.trim() && /\S+@\S+\.\S+/.test(formData.email); // Basic email validation
    // For step 3 (chatbot), proceeding is handled by its own "Finish" or by this form's "Finish"
    return true;
  };

  const handleNext = async () => {
    if (!canProceed()) return;

    if (step === 2) { // Submitting contact info, creating request, then going to chatbot
      setIsSubmitting(true);
      try {
        let currentUserId = user?.id;
        if (!currentUserId && formData.email) {
          const accountResult = await autoCreateAccount(formData.name, formData.email);
          if (accountResult.userId) currentUserId = accountResult.userId;
          else if (accountResult.error) {
            console.error("Auto account creation failed:", accountResult.error);
            alert(t('analysis_request.errors.account_creation_failed', "Account creation failed. Please sign up or log in."));
            setIsSubmitting(false); return;
          }
        }

        const newChatSessionId = uuidv4(); // Generate a unique session ID for this chat

        // **SECURITY NOTE:** Direct DB insert from client. Consider API Route.
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          service_type: formData.type,
          session_id: newChatSessionId, // Store the chat session_id
          status: "pending_chat", // Initial status
        };
        if (currentUserId) payload.user_id = currentUserId;

        const { data, error } = await supabase
          .from("analysis_requests") // Your table for analysis requests
          .insert(payload)
          .select("id, session_id") // Select both the request ID and the session_id
          .single(); // Use single if you expect one row

        if (error || !data) throw error || new Error("Analysis request creation failed");

        setCurrentRequestId(data.id); // Store the main request ID
        setChatSessionId(data.session_id); // Store the session_id for the chatbot
        setStep(3); // Move to chatbot step
      } catch (error) {
        console.error("Error submitting analysis request:", error);
        alert(t('analysis_request.errors.submission_failed', "Failed to submit your request. Please try again."));
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === TOTAL_FORM_STEPS) { // Finishing from the last step (Chatbot)
      // Mark as complete, or call onBackService, or navigate to a success page
      console.log("Analysis request and chat completed for request ID:", currentRequestId, "and chat session ID:", chatSessionId);
      // ** TODO: Potentially update analysis_requests status to 'chat_completed' or similar via API **
      setIsComplete(true); // Show success message
      // onBackService(); // Or call parent's back function
    } else {
      setStep(s => s + 1); // Move to next step (e.g., from Type to Contact)
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else onBackService(); // Call parent's back function if on first step
  };

  return (
    <section className="py-8 px-4" ref={formRef}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-black">
          {t("analysis_request.title")}
        </h2>
        <div className="bg-oxfordBlue backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl border border-darkGold/50">
          {/* Step Content */}
          {!isComplete && step <= TOTAL_FORM_STEPS && (
            <>
              <h3 className="text-xl md:text-2xl text-white mb-6 font-semibold">
                {STEPS[step - 1].title}
              </h3>
              {/* Dynamically render the current step's component */}
              <CurrentStepComponent
                formData={formData}
                onChange={handleChange}
                requestId={chatSessionId} // Pass chatSessionId to ChatbotStep as 'requestId'
                serviceType={formData.type} // Pass serviceType to ChatbotStep for context
              />
            </>
          )}

          {/* Success Message (shown after final step is completed) */}
          {isComplete && (
            <div className="text-center py-8">
              <h3 className="text-xl md:text-2xl text-white mb-4 font-semibold">
                {t("analysis_request.success_title", "Request Submitted Successfully!")}
              </h3>
              <p className="text-white/90 mb-6">
                {t("analysis_request.success_message", "Thank you for your analysis request. We will review the details and the chat transcript and get back to you soon via email.")}
              </p>
              <button
                onClick={onBackService} // Go back to service selection or a designated page
                className="px-6 py-3 bg-darkGold text-black rounded-xl font-semibold hover:bg-opacity-90 transition-colors"
              >
                {t("analysis_request.buttons.done", "Done")}
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
                  {t("analysis_request.buttons.back", "Back")}
                </button>
                {/* Show Next or Finish button */}
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isSubmitting}
                  className={`px-4 py-2 md:px-5 md:py-3 rounded-xl font-semibold text-sm md:text-base flex items-center
                    ${!canProceed() || isSubmitting
                      ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                      : step === TOTAL_FORM_STEPS
                      ? "bg-green-500 hover:bg-green-600 text-white transition-colors" // Finish button style
                      : "bg-darkGold hover:bg-yellow-500 text-black transition-colors" // Next button style
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      {t("analysis_request.buttons.processing", "Processing...")}
                    </>
                  ) : (
                    step === TOTAL_FORM_STEPS
                      ? t("analysis_request.buttons.finish", "Finish & Submit")
                      : t("analysis_request.buttons.next", "Next")
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
