      // components/Auth/ForgotPassword.jsx
      "use client"; // Directive needed for hooks and state

      import React, { useState } from 'react';
      // Import from Next.js
      import Link from 'next/link';

      // Adjust context/utility import paths
      import { useAuth } from '../../contexts/AuthContext';
      import { useTranslation } from 'react-i18next';

      // Props: isModal (boolean), onSuccess (function), onBackToLogin (function)
      const ForgotPassword = ({ isModal = false, onSuccess = () => {}, onBackToLogin = () => {} }) => {
        const [email, setEmail] = useState('');
        const [message, setMessage] = useState('');
        const [error, setError] = useState('');
        const [loading, setLoading] = useState(false);
        const { resetPassword } = useAuth(); // Get function from context
        const { t } = useTranslation();

        const handleSubmit = async (e) => {
          e.preventDefault();
          setMessage('');
          setError('');
          setLoading(true);

          try {
            // The actual 'redirectTo' URL is configured within the resetPassword
            // function inside AuthContext.js - ensure it points to your Next.js route.
            const { error: resetError } = await resetPassword(email); // Call context function

            if (resetError) throw resetError;

            setMessage(t('auth.forgot_password.success.message'));
            onSuccess(); // Notify parent (e.g., modal)

            // If in modal, auto-return to login after a delay to show message
            if (isModal) {
              setTimeout(() => {
                onBackToLogin();
              }, 3000);
            }
          } catch (err) {
            setError(err.message || t('auth.forgot_password.errors.default'));
          } finally {
            setLoading(false);
          }
        };

        return (
          <div className={isModal ? "" : "max-w-md mx-auto my-16 p-6 bg-gentleGray rounded-lg shadow-md"}>
            {!isModal && (
               <h2 className="text-2xl font-bold text-oxfordBlue mb-6 text-center">
                  {t('auth.forgot_password.title')}
               </h2>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
                {message}
              </div>
            )}

            {/* Only show form if no success message */}
            {!message && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-black font-medium mb-1"> {/* Unique ID */}
                    {t('auth.forgot_password.email.label')}
                  </label>
                  <input
                    id="forgot-email" // Unique ID
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t('auth.forgot_password.email.placeholder')}
                    className="w-full px-3 py-2 border border-oxfordBlue rounded-md bg-gentleGray focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-oxfordBlue text-white py-2 px-4 rounded-md font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  {loading
                    ? t('auth.forgot_password.submit.loading')
                    : t('auth.forgot_password.submit.default')}
                </button>
              </form>
            )}

            {/* Back to Login Link/Button */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isModal ? (
                  <button
                    type="button" // Prevent form submission
                    onClick={onBackToLogin}
                    className="text-oxfordBlue hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
                  >
                    {t('auth.forgot_password.back_to_login')}
                  </button>
                ) : (
                  <Link href="/login" className="text-oxfordBlue hover:underline font-medium"> {/* Use Next.js Link */}
                    {t('auth.forgot_password.back_to_login')}
                  </Link>
                )}
              </p>
            </div>
          </div>
        );
      };

      export default ForgotPassword;
      