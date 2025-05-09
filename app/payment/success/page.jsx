// app/payment/success/page.jsx
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import axios from 'axios'; // Or use fetch

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const stripeSessionId = searchParams.get("session_id"); // Stripe's session_id
  const bookingId = searchParams.get("booking_id"); // Your internal booking_id from Supabase
  const coachingRequestId = searchParams.get("request_id"); // Your internal coaching_request_id
  const type = searchParams.get("type"); // 'booking' or 'coaching'

  const internalId = type === 'booking' ? bookingId : coachingRequestId;

  const [status, setStatus] = useState("pending"); // pending | paid | error
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!internalId || !type) {
      setError(t('payment_success.missing_info', "Information missing to confirm payment."));
      setStatus("error");
      return;
    }

    let attempts = 0;
    const maxAttempts = 12; // Poll for up to 60 seconds (12 * 5s)
    let intervalId;

    const checkStatus = async () => {
      attempts++;
      try {
        const apiUrl = type === 'booking'
          ? `/api/status/booking/${internalId}`
          : `/api/status/coaching/${internalId}`;

        const response = await axios.get(apiUrl);

        if (response.data.paymentStatus === "paid") {
          setStatus("paid");
          clearInterval(intervalId);
          // Start countdown to redirect
          let currentCountdown = 5;
          const countdownInterval = setInterval(() => {
            currentCountdown -= 1;
            setCountdown(currentCountdown);
            if (currentCountdown === 0) {
              clearInterval(countdownInterval);
              router.push(type === 'booking' ? '/calendar' : '/profile'); // Redirect to relevant page
            }
          }, 1000);
        } else if (attempts >= maxAttempts) {
          setError(t('payment_success.timeout_error', "Could not confirm payment after several attempts. Please check your email or contact support."));
          setStatus("error");
          clearInterval(intervalId);
        }
        // If still pending, do nothing, interval will call again
      } catch (err) {
        console.error("Error checking payment status:", err);
        setError(t('payment_success.status_check_error', "Error checking payment status."));
        setStatus("error");
        clearInterval(intervalId);
      }
    };

    // Initial check, then poll
    checkStatus();
    intervalId = setInterval(checkStatus, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [internalId, type, router, t]);

  if (status === "error") {
    return (
      <div className="text-center p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">{t('payment_success.error_title', "Payment Confirmation Error")}</h1>
        <p className="mb-4">{error}</p>
        <Link href="/" className="text-oxfordBlue hover:underline">
          {t('payment_success.go_home', "Go to Homepage")}
        </Link>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-oxfordBlue mb-4">{t('payment_success.pending_title', "Confirming Your Payment...")}</h1>
        <div className="flex justify-center items-center my-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-oxfordBlue"></div>
        </div>
        <p className="text-gray-600">{t('payment_success.pending_message', "Please wait a moment while we confirm your payment. This page will update automatically.")}</p>
      </div>
    );
  }

  // status === "paid"
  return (
    <div className="text-center p-6 bg-green-50 border border-green-400 text-green-700 rounded-lg shadow-md">
      <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <h1 className="text-2xl font-bold mb-3">{t('payment_success.success_title', "Payment Successful!")}</h1>
      <p className="mb-2">{t('payment_success.success_message', "Your payment has been confirmed.")}</p>
      {type === 'booking' && <p className="mb-4">{t('payment_success.booking_confirmed_message', "Your consultation is booked. You will receive a confirmation email shortly.")}</p>}
      {type === 'coaching' && <p className="mb-4">{t('payment_success.coaching_confirmed_message', "Your coaching plan is now active. Welcome aboard!")}</p>}
      <p className="text-sm text-gray-500">{t('payment_success.redirect_message', `Redirecting in ${countdown} seconds...`)}</p>
      <div className="mt-6">
        <Link href={type === 'booking' ? '/calendar' : '/profile'} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          {type === 'booking' ? t('payment_success.view_calendar_button', "View Calendar") : t('payment_success.view_profile_button', "Go to Profile")}
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  // Suspense is required by Next.js when using useSearchParams in a page.
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-oxfordBlue"></div></div>}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-oxfordBlue to-gentleGray p-4">
        <PaymentSuccessContent />
      </div>
    </Suspense>
  );
}
