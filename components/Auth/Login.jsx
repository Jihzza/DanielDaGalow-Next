      // components/Auth/Login.jsx
      "use client"; // Directive needed for hooks and state

      import React, { useState } from 'react';
      // Import from Next.js
      import { useRouter } from 'next/navigation';
      import Link from 'next/link';

      // Adjust context/utility import paths based on your new project structure
      import { useAuth } from '../../contexts/AuthContext';
      import { useTranslation } from 'react-i18next';

      // Props: isModal (boolean), onSuccess (function), onForgotPassword (function)
      const Login = ({ isModal = false, onSuccess = () => {}, onForgotPassword = () => {} }) => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');
        const [loading, setLoading] = useState(false);
        const router = useRouter(); // Use Next.js router
        const { signIn } = useAuth();
        const { t } = useTranslation();

        const handleSubmit = async (e) => {
          e.preventDefault();
          setError('');
          setLoading(true);

          try {
            const { error: signInError } = await signIn(email, password); // Corrected variable name

            if (signInError) throw signInError; // Throw error if exists

            // Call onSuccess if in modal mode
            if (isModal) {
              onSuccess();
            } else {
              // Regular redirect for non-modal page version
              router.push('/'); // Navigate to homepage after login
            }
          } catch (err) { // Catch the thrown error
            setError(err.message || t('auth.login.errors.default'));
          } finally {
            setLoading(false);
          }
        };

        // Render link to signup page only if not in modal
        const bottomSection = !isModal && (
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('auth.login.signup_prompt')}{' '}
              <Link href="/signup" className="text-oxfordBlue hover:underline"> {/* Use Next.js Link */}
                {t('auth.login.signup_link')}
              </Link>
            </p>
          </div>
        );

        return (
          // Removed outer container if rendered inside modal, keep for standalone page
          <div className={isModal ? "" : "max-w-md mx-auto my-16 p-6 bg-gentleGray rounded-lg shadow-md"}>
            {!isModal && <h2 className="text-2xl font-bold text-oxfordBlue mb-6 text-center">{t('auth.login.title')}</h2>}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-black font-medium mb-1"> {/* Unique ID */}
                  {t('auth.login.email.label')}
                </label>
                <input
                  id="login-email" // Unique ID
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('auth.login.email.placeholder')}
                  className="w-full px-3 py-2 border bg-gentleGray border-oxfordBlue rounded-lg focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-black font-medium mb-1"> {/* Unique ID */}
                  {t('auth.login.password.label')}
                </label>
                <input
                  id="login-password" // Unique ID
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t('auth.login.password.placeholder')}
                  className="w-full px-3 py-2 border bg-gentleGray border-oxfordBlue rounded-lg focus:outline-none focus:ring-2 focus:ring-oxfordBlue placeholder:text-black/50"
                />
              </div>

              <div className="text-right">
                {/* In modal, use button to trigger view change via prop */}
                {isModal ? (
                  <button
                    type="button" // Important: type="button" to prevent form submission
                    onClick={onForgotPassword}
                    className="text-oxfordBlue hover:underline text-sm font-medium"
                  >
                    {t('auth.login.forgot_password')}
                  </button>
                ) : (
                  // On standalone page, use Next.js Link
                  <Link href="/forgot-password" className="text-oxfordBlue hover:underline text-sm font-medium">
                    {t('auth.login.forgot_password')}
                  </Link>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-oxfordBlue rounded-lg text-white py-2 px-4 font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {loading ? t('auth.login.submit.loading') : t('auth.login.submit.default')}
              </button>
            </form>

            {bottomSection}

          </div>
        );
      };

      export default Login;
      