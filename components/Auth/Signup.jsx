      // components/Auth/Signup.jsx
      "use client"; // Directive needed for hooks and state

      import React, { useState } from 'react';
      // Import from Next.js
      import { useRouter } from 'next/navigation';
      import Link from 'next/link'; // Import Link for non-modal version

      // Adjust context/utility import paths
      import { useAuth } from '../../contexts/AuthContext';
      import { useTranslation } from 'react-i18next';

      // Props: isModal (boolean), onSuccess (function), onSwitchToLogin (function)
      const Signup = ({ isModal = false, onSuccess = () => {}, onSwitchToLogin = () => {} }) => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [fullName, setFullName] = useState('');
        const [error, setError] = useState('');
        const [loading, setLoading] = useState(false);
        const [message, setMessage] = useState(''); // For success message
        const router = useRouter(); // Use Next.js router
        const { signUp } = useAuth();
        const { t } = useTranslation();

        const handleSubmit = async (e) => {
          e.preventDefault();
          setError('');
          setMessage('');
          setLoading(true);

          // Password validation
          if (password !== confirmPassword) {
            setError(t('auth.signup.errors.password_mismatch'));
            setLoading(false);
            return;
          }
          if (password.length < 6) {
            setError(t('auth.signup.errors.password_length'));
            setLoading(false);
            return;
          }

          try {
            // Call Supabase signUp from AuthContext
            const { data, error: signUpError } = await signUp(email, password, {
              // Send additional user data (like full_name)
              // Ensure your Supabase table/policies allow this
              data: { full_name: fullName }
            });

            if (signUpError) throw signUpError;

            // Handle success
            setMessage(t('auth.signup.success.message')); // Show confirmation message
            if (isModal) {
               // Optionally close modal after a delay or switch view
               // onSuccess(); // Or maybe switch to login: onSwitchToLogin();
               // Keep modal open to show message for a few seconds
               setTimeout(() => {
                  onSwitchToLogin(); // Switch to login view after showing message
               }, 3000);
            } else {
              // Redirect to login page after delay for standalone signup page
              setTimeout(() => router.push('/login'), 3000);
            }

          } catch (err) {
            setError(err.message || t('auth.signup.errors.default'));
          } finally {
            setLoading(false);
          }
        };

        return (
          <div className={isModal ? "" : "max-w-md mx-auto my-16 p-6 bg-gentleGray rounded-lg shadow-md"}>
             {!isModal && <h2 className="text-2xl font-bold text-oxfordBlue mb-6 text-center">{t('auth.signup.title')}</h2>}

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

            {/* Hide form after successful message display if needed */}
            {!message && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="signup-fullName" className="block text-black font-medium mb-1"> {/* Unique ID */}
                    {t('auth.signup.full_name.label')}
                  </label>
                  <input
                    id="signup-fullName" // Unique ID
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder={t('auth.signup.full_name.placeholder')}
                    className="w-full px-3 py-2 border bg-gentleGray border-oxfordBlue rounded-lg focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
                  />
                </div>

                <div>
                  <label htmlFor="signup-email" className="block text-black font-medium mb-1"> {/* Unique ID */}
                    {t('auth.signup.email.label')}
                  </label>
                  <input
                    id="signup-email" // Unique ID
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t('auth.signup.email.placeholder')}
                    className="w-full px-3 py-2 border bg-gentleGray border-oxfordBlue rounded-lg focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
                  />
                </div>

                <div>
                  <label htmlFor="signup-password" className="block text-black font-medium mb-1"> {/* Unique ID */}
                    {t('auth.signup.password.label')}
                  </label>
                  <input
                    id="signup-password" // Unique ID
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={t('auth.signup.password.placeholder')}
                    className="w-full px-3 py-2 border bg-gentleGray border-oxfordBlue rounded-lg focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
                  />
                </div>

                <div>
                  <label htmlFor="signup-confirmPassword" className="block text-black font-medium mb-1"> {/* Unique ID */}
                    {t('auth.signup.confirm_password.label')}
                  </label>
                  <input
                    id="signup-confirmPassword" // Unique ID
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder={t('auth.signup.confirm_password.placeholder')}
                    className="w-full px-3 py-2 border bg-gentleGray border-oxfordBlue rounded-lg focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-oxfordBlue rounded-lg text-white py-2 px-4 font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  {loading ? t('auth.signup.submit.loading') : t('auth.signup.submit.default')}
                </button>
              </form>
            )}

            {/* Switch to Login */}
            <div className="mt-4 text-center">
              <p className="text-black/50">
                {t('auth.signup.login_prompt')}{' '}
                {isModal ? (
                  <button
                    onClick={onSwitchToLogin} // Use prop in modal
                    className="text-oxfordBlue hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
                  >
                    {t('auth.signup.login_link')}
                  </button>
                ) : (
                  <Link href="/login" className="text-oxfordBlue hover:underline font-medium"> {/* Use Link for standalone page */}
                     {t('auth.signup.login_link')}
                  </Link>
                )}
              </p>
            </div>
          </div>
        );
      };

      export default Signup;
      