      // components/Forms/MergedServiceForm.jsx
      // (Assuming this is the correct path in your new Next.js project)
      "use client"; // Directive needed for hooks, state, and context

      import React, { useState, useEffect, useRef, useContext } from "react";
      import { useTranslation } from "react-i18next";
      // Import from Next.js
      import { useSearchParams } from 'next/navigation'; // Changed from react-router-dom

      // --- IMPORTANT: Adjust these import paths ---
      // Ensure these paths correctly point to their new locations.
      import AnalysisRequest from "./AnalysisRequest"; // Example: if in the same folder
      import Booking from "./Booking";
      import CoachingRequest from "./CoachingRequest";
      import PitchDeckRequest from "./PitchDeckRequest";
      import { ServiceContext } from "../../contexts/ServiceContext"; // Example: ../../app/contexts/ServiceContext
      import { useScrollToTopOnChange } from "../../hooks/useScrollToTopOnChange"; // Example: ../../hooks/useScrollToTopOnChange
      // --- End Adjust Paths ---

      export default function MergedServiceForm() {
        const { t } = useTranslation();
        const searchParams = useSearchParams(); // Use Next.js hook
        const initialService = searchParams.get("service"); // This will work

        const { service, setService } = useContext(ServiceContext);
        // Initialize step based on service from context OR initialService from URL
        const [step, setStep] = useState(service || initialService ? 2 : 1);

        // Custom hook for scrolling (ensure it's adapted for Next.js)
        const formRef = useScrollToTopOnChange([step, service]);

        const services = [
          { label: t("service_form.services.consultation"), value: "booking" },
          { label: t("service_form.services.coaching"), value: "coaching" },
          { label: t("service_form.services.analysis"), value: "analysis" },
          { label: t("service_form.services.pitch_deck"), value: "pitchdeck" },
        ];

        const SERVICE_COMPONENT = {
          analysis: AnalysisRequest,
          booking: Booking,
          coaching: CoachingRequest,
          pitchdeck: PitchDeckRequest,
        };

        const SERVICE_STEPS = { // Number of internal steps for each form
          analysis: 3,  // Example: AnalysisRequest might have 3 internal steps
          booking: 5,   // Example: Booking might have 5 internal steps
          coaching: 4,  // Example
          pitchdeck: 4, // Example
        };

        // Effect to jump to step 2 if a service is selected (either from context or URL)
        useEffect(() => {
          if (service) { // If service is set via context (e.g., from Hero section)
            setStep(2);
          } else if (initialService && services.find(s => s.value === initialService)) {
            // If service is from URL and valid, set it in context and go to step 2
            setService(initialService);
            setStep(2);
          } else {
            // No service selected, ensure we are at step 1
            setService(null); // Clear any lingering service from context
            setStep(1);
          }
        }, [service, initialService, setService]); // Rerun if service or initialService changes

        const handleBackToServiceSelection = () => {
          setService(null); // Clear the selected service in context
          setStep(1);       // Go back to step 1 (service selection)
          // Optionally, clear URL params if you want:
          // router.push(pathname); // Assuming router and pathname are available if needed
        };

        // Total steps for the progress indicator
        // Step 1 is service selection. Subsequent steps are internal to the selected form.
        const totalStepsForIndicator = 1 + (service ? SERVICE_STEPS[service] : 0);

        // Click handler for step indicators (if you implement them)
        const onStepIndicatorClick = (clickedStepNumber) => {
          if (clickedStepNumber === 1) {
            handleBackToServiceSelection();
          } else if (service && clickedStepNumber <= totalStepsForIndicator) {
            // This assumes child forms (Booking, CoachingRequest) handle internal step changes.
            // MergedServiceForm's 'step' primarily tracks:
            // 1 = service selection, 2 = active child form.
            // If child forms expose a way to set their internal step, you could call it here.
            // For now, clicking step > 1 while a service is active just ensures we are on step 2.
            setStep(2);
          }
        };

        const selectServiceAndProceed = (serviceValue) => {
          setService(serviceValue); // Set service in context
          setStep(2);             // Move to the form display step
        };

        // Dynamically get the component for the currently selected service
        const CurrentFormComponent = service ? SERVICE_COMPONENT[service] : null;

        // Placeholder for Step Indicator UI
        // You would build this out to show dots/numbers for steps
        const StepIndicator = () => {
          if (!service) return null; // Don't show indicator on service selection step

          return (
            <div className="flex justify-center items-center space-x-2 my-6">
              {/* Step 1: Service Selection (always considered done if a service is active) */}
              <div
                onClick={() => onStepIndicatorClick(1)}
                className={`w-3 h-3 rounded-full cursor-pointer ${step >= 1 ? 'bg-darkGold' : 'bg-gray-300'}`}
                title="Select Service"
              ></div>
              {/* Dots for internal steps of the CurrentFormComponent */}
              {Array.from({ length: SERVICE_STEPS[service] }).map((_, index) => {
                const internalStepNumber = index + 1; // Step within the child form
                const overallStepNumber = 1 + internalStepNumber; // Overall step in MergedServiceForm
                // This logic is simplified. Actual current step within child form needs to be managed
                // by the child form itself and potentially communicated back up if needed.
                // For now, just showing all internal steps as available.
                return (
                  <div
                    key={overallStepNumber}
                    // onClick={() => onStepIndicatorClick(overallStepNumber)} // Needs more complex logic
                    className={`w-3 h-3 rounded-full ${'bg-gray-300'}`} // Placeholder: all gray
                    title={`Step ${internalStepNumber}`}
                  ></div>
                );
              })}
            </div>
          );
        };


        // Render service selection view (Step 1)
        if (step === 1 || !service || !CurrentFormComponent) {
          return (
            <section id="service-selection" className="py-8 px-4 min-h-[calc(100vh-200px)]" ref={formRef}> {/* Added min-height */}
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-4xl font-bold text-center mb-6 text-black">
                  {t("service_form.title")}
                </h2>
                <div className="bg-oxfordBlue backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl border border-darkGold/30"> {/* Added border */}
                  <h3 className="text-xl md:text-2xl text-white mb-4 md:mb-6 font-semibold">
                    {t("service_form.choose_service")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {services.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => selectServiceAndProceed(s.value)}
                        className="px-3 py-3 sm:px-4 sm:py-4 rounded-xl md:rounded-2xl cursor-pointer text-center border-2 border-darkGold shadow-lg hover:bg-darkGold/20 active:bg-darkGold/30 focus:outline-none focus:ring-2 focus:ring-darkGold focus:ring-opacity-70 transition-all duration-150 ease-in-out transform hover:scale-105" // Enhanced styles
                      >
                        <span className="block text-white font-medium text-base sm:text-lg md:text-xl">
                          {s.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // Render the selected service's form (Step 2 onwards, handled by child)
        return (
          // The ID "service-selection" is kept for scrolling purposes from other sections
          <section id="service-selection" className="py-8 px-4" ref={formRef}>
            <div className="max-w-3xl mx-auto">
              {/* Optional: Render a more dynamic StepIndicator here if needed */}
              {/* <StepIndicator /> */}
              {CurrentFormComponent && (
                <CurrentFormComponent
                  onBackService={handleBackToServiceSelection} // Prop to go back to service selection
                  // Pass other necessary props to child forms if they need them
                  // e.g., currentStep (if managed here), setStep (if child needs to update parent step)
                />
              )}
            </div>
          </section>
        );
      }
      