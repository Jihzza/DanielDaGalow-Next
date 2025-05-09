"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SignupComponent from '@/components/Auth/Signup'; // Adjust path if necessary
import { useAuth } from '@/app/contexts/AuthContext'; // Adjust path if necessary
import { useTranslation } from 'react-i18next';

export default function SignupPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/profile'); // Redirect to profile if already logged in
    }
  }, [user, authLoading, router]);

  if (authLoading || user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-oxfordBlue via-oxfordBlue to-gentleGray">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-oxfordBlue via-oxfordBlue to-gentleGray p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <img
              src="/assets/logos/DaGalow Logo.svg" // Ensure this path is correct
              alt="DaGalow Logo"
              className="w-48 mx-auto"
            />
          </Link>
        </div>
        <div className="bg-gentleGray p-6 md:p-8 rounded-xl shadow-2xl border border-darkGold/30">
          <h2 className="text-2xl md:text-3xl font-bold text-oxfordBlue mb-6 text-center">
            {t('auth.signup.title', 'Create Account')}
          </h2>
          <SignupComponent
            isModal={false} // Explicitly false for standalone page
            onSuccess={() => {
              // Signup component handles showing a message, then might redirect or switch view.
              // For a standalone page, a redirect to login after message is common.
              // This is handled within the SignupComponent's success logic.
            }}
            // onSwitchToLogin is handled by the Link within SignupComponent for non-modal
          />
        </div>
      </div>
    </div>
  );
}