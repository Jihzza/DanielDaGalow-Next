"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ForgotPasswordComponent from '@/components/Auth/ForgotPassword'; // Adjust path if necessary
import { useAuth } from '@/app/contexts/AuthContext'; // Adjust path if necessary
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/profile'); // Redirect if already logged in
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
          {/* Title is inside the ForgotPasswordComponent for standalone page */}
          <ForgotPasswordComponent
            isModal={false} // Explicitly false for standalone page
            onSuccess={() => {
              // The component itself shows a success message.
              // No further action needed here unless you want to redirect after a delay.
            }}
            // onBackToLogin is handled by the Link within ForgotPasswordComponent for non-modal
          />
        </div>
      </div>
    </div>
  );
}