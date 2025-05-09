"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ResetPasswordComponent from '@/components/Auth/ResetPassword'; // Adjust path if necessary
import { useAuth } from '@/app/contexts/AuthContext'; // Adjust path if necessary
import { useTranslation } from 'react-i18next';

export default function ResetPasswordPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  // The ResetPasswordComponent itself handles the logic for updating the password
  // based on the token in the URL (handled by Supabase client).
  // It also handles showing success/error messages.

  useEffect(() => {
    // If a user becomes authenticated on this page (after successful reset and auto-login, if applicable)
    // or if they somehow land here while already logged in, redirect them.
    if (!authLoading && user) {
      router.replace('/profile');
    }
  }, [user, authLoading, router]);

  if (authLoading && !user) { // Show loading only if not yet authenticated
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
          {/* Title is inside the ResetPasswordComponent */}
          <ResetPasswordComponent />
        </div>
      </div>
    </div>
  );
}