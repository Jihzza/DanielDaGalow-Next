      // components/carousel/Bugs.jsx
      "use client"; // Directive needed for hooks and state

      import React, { useState, useEffect } from "react"; // Added useEffect
      import { useTranslation } from "react-i18next";

      // --- IMPORTANT: Adjust these import paths ---
      import { supabase } from "../../utils/supabaseClient"; // Adjust path if needed
      import { useAuth } from "../../contexts/AuthContext"; // Adjust path if needed
      // --- End Adjust Paths ---

      function BugReport() { // Renamed component
        const { t } = useTranslation();
        const { user } = useAuth();
        const [formData, setFormData] = useState({
          name: "",
          email: "",
          description: "",
        });
        const [submitStatus, setSubmitStatus] = useState({
          success: false,
          error: false,
          message: "",
        });
        const [loading, setLoading] = useState(false); // Added loading state

        // Pre-fill form with user data if available when user state changes
        useEffect(() => {
          if (user) {
            setFormData(prev => ({
              ...prev, // Keep existing description if user logs in while typing
              name: user.user_metadata?.full_name || prev.name || "",
              email: user.email || prev.email || ""
            }));
          } else {
             // Optionally clear fields if user logs out, or keep them
             // setFormData(prev => ({ ...prev, name: "", email: "" }));
          }
        }, [user]);

        const handleChange = (e) => {
          const { name, value } = e.target;
          setFormData((prev) => ({
            ...prev,
            [name]: value,
          }));
        };

        const handleSubmit = async (e) => {
          e.preventDefault();
          setSubmitStatus({ success: false, error: false, message: "" });
          setLoading(true);

          // Basic validation
          if (!formData.description.trim()) {
            setSubmitStatus({
              success: false, error: true, message: t("bug_report.validation.required_fields"),
            });
            setLoading(false);
            return;
          }

          try {
            // *** SECURITY NOTE: Direct DB insert from client. ***
            // This works if RLS allows it, but consider moving to an API Route/Server Action later.
            const { data, error } = await supabase.from("bug_reports").insert({
              user_id: user?.id || null, // Send null if user not logged in
              name: formData.name.trim() || null, // Send null if empty
              email: formData.email.trim() || null, // Send null if empty
              description: formData.description.trim(),
              status: "new", // Default status
            });

            if (error) throw error;

            // Reset form (keeping user details if logged in) and show success
            setFormData(prev => ({
               ...prev,
               description: "", // Only clear description
            }));

            setSubmitStatus({
              success: true, error: false, message: t("bug_report.messages.success"),
            });
            // Optionally clear message after a delay
            setTimeout(() => setSubmitStatus({ success: false, error: false, message: "" }), 5000);

          } catch (error) {
            console.error("Bug Report Submission Error:", error);
            setSubmitStatus({
              success: false, error: true, message: t("bug_report.messages.error"),
            });
          } finally {
             setLoading(false);
          }
        };

        return (
          <section id="bug-report" className="w-full">
            <div className="max-w-4xl mx-auto h-full flex flex-col">
              <div className="flex flex-col pb-6">
                <h2 className="text-2xl md:text-4xl py-4 font-bold text-center text-black">
                  {t("bug_report.title")}
                </h2>
                <p className="text-center text-black max-w-2xl mx-auto md:text-lg">
                  {t("bug_report.description")}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="bg-oxfordBlue rounded-xl p-6 space-y-6 border border-darkGold/50 shadow-lg" // Added border/shadow
              >
                {/* Name Input */}
                <div>
                  <label htmlFor="bug-name" className="block mb-2 text-sm font-medium text-gray-200"> {/* Adjusted text color/size */}
                    {t("bug_report.form.name_label")}
                  </label>
                  <input
                    type="text"
                    id="bug-name" // Unique ID
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-darkGold rounded-xl px-4 py-2 md:text-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold" // Adjusted styling
                    placeholder={t("bug_report.form.name_placeholder")}
                    autoComplete="name"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="bug-email" className="block mb-2 text-sm font-medium text-gray-200"> {/* Adjusted text color/size */}
                    {t("bug_report.form.email_label")}
                  </label>
                  <input
                    type="email"
                    id="bug-email" // Unique ID
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-darkGold rounded-xl px-4 py-2 md:text-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold" // Adjusted styling
                    placeholder={t("bug_report.form.email_placeholder")}
                    autoComplete="email"
                    // Not making email required here, backend can handle if needed
                  />
                </div>

                {/* Description Textarea */}
                <div>
                  <label htmlFor="bug-description" className="block mb-2 text-sm font-medium text-gray-200"> {/* Adjusted text color/size */}
                    {t("bug_report.form.description_label")}
                  </label>
                  <textarea
                    id="bug-description" // Unique ID
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-white/10 border border-darkGold rounded-xl px-4 py-2 md:text-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold resize-none" // Added resize-none
                    placeholder={t("bug_report.form.description_placeholder")}
                    required // Description is required
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-darkGold text-black font-bold py-3 md:py-4 rounded-xl hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-darkGold" // Added focus style
                  >
                    {loading ? t('common.loading') : t("bug_report.form.submit_button")} {/* Use a common loading translation */}
                  </button>
                </div>

                {/* Status Message */}
                {(submitStatus.success || submitStatus.error) && (
                  <div
                    role="alert" // Accessibility
                    className={`p-3 rounded-xl text-center text-sm ${ // Adjusted padding/size
                      submitStatus.success
                        ? "bg-green-600/20 text-green-300 border border-green-500/50" // Added border
                        : "bg-red-600/20 text-red-300 border border-red-500/50" // Added border
                    }`}
                  >
                    {submitStatus.message}
                  </div>
                )}
              </form>
            </div>
          </section>
        );
      }

      export default BugReport;
      