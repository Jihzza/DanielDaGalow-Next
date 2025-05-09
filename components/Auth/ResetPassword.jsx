      // components/Auth/ResetPassword.jsx
      "use client"; // Directive needed for hooks, state, and window access

      import React, { useState, useEffect } from 'react';
      // Import from Next.js
      import { useRouter, useSearchParams } from 'next/navigation'; // Can use useSearchParams as well

      // Adjust utility import paths
      import { supabase } from '../../utils/supabaseClient';
      import { useTranslation } from 'react-i18next';

      const ResetPassword = () => {
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [error, setError] = useState('');
        const [message, setMessage] = useState('');
        const [loading, setLoading] = useState(false);
        const router = useRouter(); // Use Next.js router
        const searchParams = useSearchParams(); // Hook to read query params server/client side
        const { t } = useTranslation();

        // This useEffect attempts to set the session based on URL fragment,
        // but Supabase handles this automatically on redirect if configured correctly.
        // It might be redundant if Supabase redirects properly after email link click.
        // Keeping it for now as it was in the original code.
        useEffect(() => {
          // Supabase handles session setting via hash fragment automatically on redirect.
          // We might only need to check if the user is eventually authenticated
          // or if an error occurred during the redirect process.

          // Check for error parameters from Supabase redirect
          const errorParam = searchParams.get('error');
          const errorDescription = searchParams.get('error_description');

          if (errorParam) {
             console.error(`Error from Supabase redirect: ${errorParam} - ${errorDescription}`);
             setError(errorDescription || t('auth.reset_password.errors.invalid_link'));
          }

          // Listen for the PASSWORD_RECOVERY event which signifies successful session set
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
             if (event === 'PASSWORD_RECOVERY') {
                console.log('Password recovery event received, session set.');
                // Clear errors if session is now set
                setError('');
             }
          });

          return () => {
             subscription?.unsubscribe();
          };

        }, [searchParams, t]); // Depend on searchParams

        const handleSubmit = async (e) => {
          e.preventDefault();
          setError('');
          setMessage('');
          setLoading(true);

          if (password !== confirmPassword) {
            setError(t('auth.reset_password.errors.password_mismatch'));
            setLoading(false);
            return;
          }
          if (password.length < 6) {
            setError(t('auth.reset_password.errors.password_length'));
            setLoading(false);
            return;
          }

          try {
            // Attempt to update the user's password
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw updateError;

            setMessage(t('auth.reset_password.success.message'));
            // Redirect to login after a delay
            setTimeout(() => router.push('/login'), 3000);

          } catch (err) {
            console.error('⚠️ Error updating password:', err);
            // Provide more specific error messages if possible
            if (err.message.includes("session is required")) {
               setError(t('auth.reset_password.errors.session_expired'));
            } else {
               setError(err.message || t('auth.reset_password.errors.default'));
            }
          } finally {
            setLoading(false);
          }
        };

        return (
          // This component is likely meant to be a standalone page
          <div className="max-w-md mx-auto my-16 p-6 bg-gentleGray rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-oxfordBlue mb-6 text-center">
              {t('auth.reset_password.title')}
            </h2>

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

            {/* Only show form if no success message and no critical error */}
            {!message && !error?.includes('invalid_link') && !error?.includes('session_expired') && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reset-password" className="block text-black font-medium mb-1"> {/* Unique ID */}
                    {t('auth.reset_password.password.label')}
                  </label>
                  <input
                    id="reset-password" // Unique ID
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={t('auth.reset_password.password.placeholder')}
                    className="w-full px-3 py-2 border border-oxfordBlue rounded-md bg-gentleGray focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
                  />
                </div>

                <div>
                  <label htmlFor="reset-confirmPassword" className="block text-black font-medium mb-1"> {/* Unique ID */}
                    {t('auth.reset_password.confirm_password.label')}
                  </label>
                  <input
                    id="reset-confirmPassword" // Unique ID
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder={t('auth.reset_password.confirm_password.placeholder')}
                    className="w-full px-3 py-2 border border-oxfordBlue rounded-md bg-gentleGray focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-oxfordBlue text-white py-2 px-4 rounded-md font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  {loading ? t('auth.reset_password.submit.loading') : t('auth.reset_password.submit.default')}
                </button>
              </form>
            )}
          </div>
        );
      };

      export default ResetPassword;
      