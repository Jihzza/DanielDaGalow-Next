// app/login/page.jsx
"use client"; // This page will primarily render client components for the form

import LoginComponent from '@/components/Auth/Login'; // Your existing UI component
// Or import your AuthModal and manage its state if you prefer a modal flow for these pages
// import AuthModal from '@/components/Auth/AuthModal';
// import { useAuthModal } from '@/app/contexts/AuthModalContext'; // Assuming you have this

import { useAuth } from '@/app/contexts/AuthContext'; // Or wherever your AuthContext is
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get('redirectedFrom');

  // const { openModal } = useAuthModal(); // If using AuthModal directly on this page

  useEffect(() => {
    if (user) {
      // If the user is already logged in, redirect them
      router.replace(redirectedFrom || '/profile'); // Or your desired redirect path
    }
    // else if (!isAuthModalOpen && !user) { // Example logic for modal
    //   openModal('login');
    // }
  }, [user, router, redirectedFrom /*, openModal, isAuthModalOpen*/]);

  if (user) {
    return null; // Or a loading spinner while redirecting
  }

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
      {/*
        Option 1: Directly use your Login component
      */}
      <LoginComponent /* pass any necessary props, e.g., onSuccessfulLogin={() => router.push(redirectedFrom || '/profile')} */ />

      {/*
        Option 2: If you want to trigger the global AuthModal.
        This page might just be a placeholder that ensures the modal is shown,
        or it could have a button "Click here to Login" that opens the modal.
        The AuthModal itself is likely rendered in your main layout via providers.js
        If so, the logic in useEffect to redirect if 'user' exists is still key.
        You might not even need to render a specific form component here if the
        global modal handles it based on context.
      */}
      {/* <AuthModal />  -- If you want this page to *host* the modal instance directly (less common if it's global) */}
    </div>
  );
}