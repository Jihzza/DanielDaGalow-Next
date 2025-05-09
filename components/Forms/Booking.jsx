// components/Forms/Booking.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from 'next/image'; // Import next/image
// Adjust import paths based on your new project structure
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import InlineChatbotStep from "../chat/InlineChatbotStep"; // Check path
import { useScrollToTopOnChange } from "../../hooks/useScrollToTopOnChange"; // Check path
import { autoCreateAccount } from "../../utils/autoSignup"; // Check path
import { fetchBookings } from "../../services/bookingService"; // Check path

import {
  format, addDays, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, isWeekend, addMinutes, isBefore, addMonths,
} from "date-fns";
import { useTranslation } from "react-i18next";
import axios from "axios"; // Keep axios for now

// Import Swiper React components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules"; // Removed Virtual as it wasn't used
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Shared StepIndicator (assuming it's defined or imported correctly)
// If defined in this file, it's fine. If imported, check its path.
function StepIndicator({ stepCount, currentStep, onStepClick = () => {} }) {
  return (
    <div className="flex items-center justify-center py-4 gap-1 md:gap-2">
      {Array.from({ length: stepCount }).map((_, idx) => {
        const stepNum = idx + 1;
        const isActive = currentStep === stepNum;
        return (
          <React.Fragment key={stepNum}>
            <button
              type="button"
              onClick={() => onStepClick(stepNum)}
              disabled={stepNum > currentStep && stepNum !== currentStep + 1} // Allow clicking next step if current is complete
              className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border-2 transition-colors text-sm md:text-base ${
                isActive
                  ? "bg-darkGold border-darkGold text-white transform scale-110"
                  : currentStep > stepNum
                  ? "bg-darkGold/50 border-darkGold/70 text-white/90 hover:border-darkGold" // Completed step
                  : "bg-white/20 border-white/50 text-white/80 hover:border-darkGold hover:text-white" // Pending step
              } ${
                stepNum > currentStep + 1 // More than one step ahead
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              aria-label={`Go to step ${stepNum}`}
            >
              {stepNum}
            </button>
            {idx < stepCount - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 md:mx-2 transition-colors ${
                  currentStep > stepNum ? "bg-darkGold" : "bg-white/20"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function DateTimeStep({
  selectedDate, onSelectDate, currentMonth, onChangeMonth,
  selectedTime, selectedDuration, onSelectTime, availability, minDate,
}) {
  const { t } = useTranslation(); // For potential translations in this sub-component
  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const prevMonthDays = [];
  const nextMonthDays = [];
  const firstDayOfWeek = days[0].getDay();
  const daysFromPrev = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  for (let i = daysFromPrev; i > 0; i--) prevMonthDays.push(addDays(days[0], -i));
  const totalCells = 42;
  const daysFromNext = totalCells - (days.length + prevMonthDays.length);
  for (let i = 1; i <= daysFromNext; i++) nextMonthDays.push(addDays(days[days.length - 1], i));
  const calendar = [...prevMonthDays, ...days, ...nextMonthDays];

  const timeSlots = availability.filter((slot) => slot.allowed.length > 0);
  const availableTimes = timeSlots.map((slot) => slot.slot).sort();
  const availableDurations = [45, 60, 75, 90, 105, 120];

  const durationSwiperRef = useRef(null);
  const timeSwiperRef = useRef(null);

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}min`;
    if (minutes % 60 === 0) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 60)}h${minutes % 60}min`;
  };

  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes) return "--:--"; // Handle null/undefined
    const [h, m] = startTime.split(":").map(Number);
    const date = new Date(); // Use a dummy date object for time calculations
    date.setHours(h, m, 0, 0);
    const endDate = addMinutes(date, durationMinutes);
    return format(endDate, "HH:mm");
  };

  const handleDurationSelect = (duration) => {
    if (selectedTime) {
      onSelectTime({ slot: selectedTime, dur: duration });
    } else if (availableTimes.length > 0) {
      onSelectTime({ slot: availableTimes[0], dur: duration });
    } else {
      onSelectTime({ slot: null, dur: duration }); // Select duration even if no time picked yet
    }
  };

  const handleTimeSelect = (time) => {
    if (selectedDuration) {
      onSelectTime({ slot: time, dur: selectedDuration });
    } else if (availableDurations.length > 0) {
      const firstAvailableDuration = timeSlots.find((slot) => slot.slot === time)?.allowed[0] || availableDurations[0];
      onSelectTime({ slot: time, dur: firstAvailableDuration });
    } else {
        onSelectTime({ slot: time, dur: null }); // Select time even if no duration picked yet
    }
  };

  const isDurationAvailable = (duration) => {
    if (!selectedTime) return true;
    const timeSlot = timeSlots.find((slot) => slot.slot === selectedTime);
    return timeSlot && timeSlot.allowed.includes(duration);
  };

  const isTimeAvailable = (time) => {
    const timeSlot = timeSlots.find((slot) => slot.slot === time);
    return timeSlot && timeSlot.allowed.length > 0;
  };

  // Initialize Swipers to selected values if they exist
  useEffect(() => {
    if (selectedDuration && durationSwiperRef.current?.swiper) {
      const index = availableDurations.indexOf(selectedDuration);
      if (index !== -1) durationSwiperRef.current.swiper.slideToLoop(index, 0);
    }
  }, [selectedDuration, availableDurations, availability]); // Rerun if availability changes

  useEffect(() => {
    if (selectedTime && timeSwiperRef.current?.swiper) {
      const index = availableTimes.indexOf(selectedTime);
      if (index !== -1) timeSwiperRef.current.swiper.slideToLoop(index, 0);
    }
  }, [selectedTime, availableTimes, availability]); // Rerun if availability changes

  return (
    <div className="flex flex-col space-y-6">
      {/* Calendar Section */}
      <div className="bg-white/5 rounded-xl shadow-md overflow-hidden border border-darkGold/30">
        <div className="flex items-center justify-between bg-oxfordBlue/30 p-3">
          <button onClick={() => onChangeMonth(-1)} className="text-white hover:text-darkGold p-1.5 rounded-full hover:bg-white/10 transition-all duration-200" aria-label="Previous month">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h3 className="text-xl text-white font-bold">{format(currentMonth, "MMMM yyyy")}</h3>
          <button onClick={() => onChangeMonth(1)} className="text-white hover:text-darkGold p-1.5 rounded-full hover:bg-white/10 transition-all duration-200" aria-label="Next month">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <div className="p-2 md:p-3">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center py-1 text-darkGold font-semibold text-xs">{day.charAt(0)}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendar.map((date, i) => {
              const inMonth = isSameMonth(date, currentMonth);
              const weekend = isWeekend(date);
              const tooSoon = isBefore(date, startOfDay(minDate)); // Compare with start of day
              const selected = selectedDate && isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              const disabled = !inMonth || weekend || tooSoon;
              return (
                <button
                  key={i} onClick={() => !disabled && onSelectDate(date)} disabled={disabled}
                  className={`relative h-8 w-8 md:h-9 md:w-9 aspect-square rounded-md flex items-center justify-center transition-all duration-200 text-xs ${
                    selected ? "bg-darkGold text-black font-bold shadow-md ring-2 ring-offset-1 ring-offset-oxfordBlue ring-darkGold" :
                    inMonth && !disabled ? "bg-white/10 text-white hover:bg-darkGold/40" : "bg-white/5 text-white/40"
                  } ${isToday && !selected ? "ring-1 ring-darkGold ring-opacity-70" : ""} ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                >
                  {format(date, "d")}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time & Duration Selection */}
      <div className="space-y-4">
        <div>
          <h4 className="text-white text-sm font-medium mb-2">{t('booking.duration_label', 'Duration')}</h4>
          {selectedDate ? (
            <div className="carousel-container"> {/* Ensure .carousel-container styles are in globals.css */}
              <Swiper
                ref={durationSwiperRef}
                modules={[Navigation, Pagination]} slidesPerView={3} spaceBetween={8} centeredSlides={true} loop={availableDurations.length > 3}
                navigation // Enable navigation arrows
                pagination={{ clickable: true, el: '.swiper-pagination-duration' }} // Custom class for pagination
                onSlideChange={(swiper) => {
                  if (availableDurations.length > 0 && swiper.realIndex < availableDurations.length) {
                    const centeredDuration = availableDurations[swiper.realIndex];
                    if (isDurationAvailable(centeredDuration) && centeredDuration !== selectedDuration) handleDurationSelect(centeredDuration);
                  }
                }}
                className="h-14" // Give Swiper explicit height
              >
                {availableDurations.map((duration) => (
                  <SwiperSlide key={duration}>
                    <button onClick={() => handleDurationSelect(duration)} disabled={!isDurationAvailable(duration)}
                      className={`w-full h-10 text-xs md:text-sm rounded-lg transition-colors duration-200 flex items-center justify-center ${selectedDuration === duration ? "bg-darkGold text-black font-bold" : isDurationAvailable(duration) ? "bg-white/10 text-white hover:bg-darkGold/40" : "bg-white/5 text-white/40 cursor-not-allowed opacity-50"}`}
                    >{formatDuration(duration)}</button>
                  </SwiperSlide>
                ))}
                 <div className="swiper-pagination-duration mt-2 flex justify-center"></div> {/* Pagination container */}
              </Swiper>
            </div>
          ) : <div className="empty-carousel-container"><p className="text-white/50 text-sm">{t('booking.select_date_first', 'Select a date first')}</p></div>}
        </div>
        <div>
          <h4 className="text-white text-sm font-medium mb-2">{t('booking.time_label', 'Time')}</h4>
          {selectedDate && availableTimes.length > 0 ? (
            <div className="carousel-container">
              <Swiper
                ref={timeSwiperRef}
                modules={[Navigation, Pagination]} slidesPerView={3} spaceBetween={8} centeredSlides={true} loop={availableTimes.length > 3}
                navigation
                pagination={{ clickable: true, el: '.swiper-pagination-time' }}
                onSlideChange={(swiper) => {
                  if (availableTimes.length > 0 && swiper.realIndex < availableTimes.length) {
                    const centeredTime = availableTimes[swiper.realIndex];
                    if (isTimeAvailable(centeredTime) && centeredTime !== selectedTime) handleTimeSelect(centeredTime);
                  }
                }}
                className="h-14"
              >
                {availableTimes.map((time) => (
                  <SwiperSlide key={time}>
                    <button onClick={() => handleTimeSelect(time)} disabled={!isTimeAvailable(time)}
                      className={`w-full h-10 text-xs md:text-sm rounded-lg transition-colors duration-200 flex items-center justify-center ${selectedTime === time ? "bg-darkGold text-black font-bold" : isTimeAvailable(time) ? "bg-white/10 text-white hover:bg-darkGold/40" : "bg-white/5 text-white/40 cursor-not-allowed opacity-50"}`}
                    >{time}</button>
                  </SwiperSlide>
                ))}
                <div className="swiper-pagination-time mt-2 flex justify-center"></div> {/* Pagination container */}
              </Swiper>
            </div>
          ) : <div className="empty-carousel-container"><p className="text-white/50 text-sm">{selectedDate ? t('booking.no_available_times', 'No available times') : t('booking.select_date_first', 'Select a date first')}</p></div>}
        </div>
      </div>

      {/* Booking Summary */}
      <div className="py-4 mt-2 flex flex-col items-center">
        <div className="mb-2">
          <div className="bg-white/10 rounded-lg px-4 py-1 text-white text-center text-sm">
            {selectedDate ? format(selectedDate, "EEE, MMM d") : t('booking.date_placeholder', 'Select Date')}
          </div>
        </div>
        <div className="flex w-full justify-center gap-6">
          <div className="flex flex-col items-center">
            <div className="text-white/80 text-xs mb-1">{t('booking.from_label', 'from')}</div>
            <div className="bg-white/10 rounded-lg px-2 py-1 text-white w-16 text-center text-sm">{selectedTime || "--:--"}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-white/80 text-xs mb-1">{t('booking.to_label', 'to')}</div>
            <div className="bg-white/10 rounded-lg px-2 py-1 text-white w-16 text-center text-sm">{calculateEndTime(selectedTime, selectedDuration)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
// Helper function to get start of day
const startOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};


function InfoStep({ formData, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 max-w-md mx-auto w-full">
      <div className="w-full flex flex-col gap-2">
        <label htmlFor="booking-name" className="block text-white text-sm sm:text-base md:text-lg">{t("booking.name_label")}</label>
        <input id="booking-name" name="name" placeholder={t("booking.name_placeholder")} value={formData.name} onChange={onChange} required
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-xs sm:text-sm md:text-base" />
      </div>
      <div className="w-full flex flex-col gap-2">
        <label htmlFor="booking-email" className="block text-white text-sm sm:text-base md:text-lg">{t("booking.email_label")}</label>
        <input id="booking-email" name="email" type="email" placeholder={t("booking.email_placeholder")} value={formData.email} onChange={onChange} required
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-darkGold text-xs sm:text-sm md:text-base" />
      </div>
    </div>
  );
}

function PaymentStep({ selectedDuration, bookingId, onPaymentConfirmed, formData }) {
  const { t } = useTranslation();
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentConfirmedLocal, setPaymentConfirmedLocal] = useState(false); // Local state for UI
  const [isTestBooking, setIsTestBooking] = useState(false); // Add state for test booking
  const [error, setError] = useState('');

  const DURATION_PRICES_CENTS = { 45: 0, 60: 9000, 75: 11250, 90: 13500, 105: 15750, 120: 18000 }; // Prices in cents

  // Handle Stripe Redirect
  const handleStripeRedirect = async () => {
    setError('');
    if (!bookingId || !selectedDuration || !formData.email) {
      setError(t('booking.payment_error_missing_details', "Missing booking details for payment."));
      return;
    }
    try {
      // ** API Call Change **
      // Replace Netlify function URL with your Next.js API route
      const { data } = await axios.post(
        "/api/stripe/checkout/booking", // Example Next.js API route
        { bookingId, duration: selectedDuration, email: formData.email, isTestBooking }
      );

      localStorage.setItem("pendingPaymentId", bookingId); // Keep for polling
      window.open(data.url, "_blank"); // Open Stripe in new tab
      setPaymentStarted(true);
    } catch (err) {
      console.error("Error creating Stripe session:", err);
      setError(err.response?.data?.error || t('booking.payment_error_stripe_session', "Could not initiate payment. Please try again."));
    }
  };

  // Poll for Payment Status
  useEffect(() => {
    if (!paymentStarted || !bookingId || paymentConfirmedLocal) return;
    const interval = setInterval(async () => {
      try {
        // ** API Call Change **
        // Replace Netlify function URL with your Next.js API route
        const response = await axios.get(`/api/status/booking/${bookingId}`);
        if (response.data.paymentStatus === "paid") {
          setPaymentConfirmedLocal(true);
          onPaymentConfirmed(true); // Notify parent
          clearInterval(interval);
          localStorage.removeItem("pendingPaymentId"); // Clean up
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
        // Optionally stop polling on repeated errors or notify user
      }
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [paymentStarted, bookingId, onPaymentConfirmed, paymentConfirmedLocal]);

  // Effect to check for pending payment on component mount (if user returns to tab)
  useEffect(() => {
    const pendingId = localStorage.getItem("pendingPaymentId");
    if (pendingId && pendingId === bookingId) {
      setPaymentStarted(true); // Resume polling if this is the pending payment
    }
  }, [bookingId]);


  const sessionPrice = isTestBooking ? 0 : (DURATION_PRICES_CENTS[selectedDuration] / 100).toFixed(2);

  return (
    <div className="max-w-md mx-auto">
      <div className="flex flex-col gap-5">
        {error && <div className="p-3 bg-red-500/20 text-red-300 border border-red-500/50 rounded-lg text-sm">{error}</div>}
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <div className="bg-white/5 p-3 border-b border-white/10">
            <h3 className="text-white font-medium">{t('booking.booking_details_title', 'Booking Details')}</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-white/60">{t('booking.duration_label_summary', 'Duration:')}</span><span className="text-white">{selectedDuration} {t('booking.minutes_short', 'min')}</span></div>
            <div className="flex justify-between text-sm"><span className="text-white/60">{t('booking.price_label_summary', 'Price:')}</span><span className="text-white font-medium">€{sessionPrice}</span></div>
            <div className="flex justify-between text-sm"><span className="text-white/60">{t('booking.email_label_summary', 'Email:')}</span><span className="text-white truncate max-w-[150px] sm:max-w-xs">{formData.email}</span></div>
          </div>
        </div>
        <div className={`p-4 rounded-lg border ${paymentConfirmedLocal ? "border-green-500/30 bg-green-500/10" : paymentStarted ? "border-yellow-500/30 bg-yellow-500/10" : "border-white/10 bg-white/5"}`}>
          <div className="flex items-center">
            {paymentConfirmedLocal ? <div className="flex items-center text-green-400"><div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div><span>{t('booking.payment_confirmed_status', 'Payment confirmed')}</span></div> :
             paymentStarted ? <div className="flex items-center text-yellow-400"><div className="w-2 h-2 rounded-full bg-yellow-400 mr-2 animate-pulse"></div><span>{t('booking.payment_awaiting_status', 'Awaiting payment')}</span></div> :
             <div className="flex items-center text-white/60"><div className="w-2 h-2 rounded-full bg-white/60 mr-2"></div><span>{t('booking.payment_ready_status', 'Ready for payment')}</span></div>}
          </div>
        </div>
        {!paymentConfirmedLocal && (
          <button onClick={handleStripeRedirect} disabled={paymentStarted && !paymentConfirmedLocal}
            className="mt-2 py-3 px-4 bg-gradient-to-r from-darkGold to-yellow-500 text-black font-semibold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-darkGold focus:ring-offset-oxfordBlue"
          >{paymentStarted ? t('booking.payment_processing_button', 'Processing...') : (isTestBooking ? t('booking.test_payment_button', 'Process Test Payment (€0.00)') : t('booking.complete_payment_button', `Complete Payment (€${sessionPrice})`))}</button>
        )}
        {/* Test Booking Toggle - For development/testing */}
        {process.env.NODE_ENV === 'development' && !paymentStarted && (
            <div className="mt-3 text-center">
                <label className="flex items-center justify-center text-xs text-white/70 cursor-pointer">
                    <input type="checkbox" checked={isTestBooking} onChange={() => setIsTestBooking(!isTestBooking)} className="mr-2 accent-darkGold"/>
                    {t('booking.test_booking_label', 'Make this a test booking (€0.00)')}
                </label>
            </div>
        )}
        <div className="mt-4 flex justify-center items-center gap-4">
          <Image src="/assets/icons/stripe.svg" alt="Secure payments powered by Stripe" width={100} height={32} className="h-8 opacity-90" />
          <Image src="/assets/icons/ssl-lock.svg" alt="SSL Secured" width={32} height={32} className="h-8 opacity-90" />
        </div>
        {paymentStarted && !paymentConfirmedLocal && <p className="text-center text-white/70 text-xs mt-2">{t('booking.payment_window_info', "The payment window may have opened in a new tab. We're checking for confirmation.")}</p>}
        {paymentConfirmedLocal && <p className="text-center text-green-400 text-sm mt-2">{t('booking.payment_success_info', 'Payment successful! You can proceed.')}</p>}
      </div>
    </div>
  );
}


export default function Booking({ onBackService }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedEvents, setBookedEvents] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [paymentDone, setPaymentDone] = useState(false);
  const [loading, setLoading] = useState(false); // For fetching bookings and submitting form
  const [bookingId, setBookingId] = useState(null);
  const formRef = useScrollToTopOnChange([step]); // Scroll to top when step changes

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handlePaymentConfirmed = (confirmed) => setPaymentDone(confirmed);
  const minDate = addDays(new Date(), 1); // Start scheduling from tomorrow

  // Load existing bookings
  useEffect(() => {
    async function loadBookings() {
      setLoading(true);
      try {
        const { data } = await fetchBookings(); // Assumes fetchBookings is adapted
        setBookedEvents(data || []);
      } catch (error) { console.error("Error loading bookings:", error); }
      finally { setLoading(false); }
    }
    loadBookings();
  }, []);

  const getBlockedTimes = () => bookedEvents.map(event => ({ from: addMinutes(new Date(event.start), -30), to: new Date(event.end) }));
  const blocked = getBlockedTimes();

  function isSlotFree(date, hourString, durationMinutes) {
    if (!date) return false;
    const [hour, minute] = hourString.split(":").map(Number);
    const consultationStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute);
    const prepStart = addMinutes(consultationStart, -30);
    const consultationEnd = addMinutes(consultationStart, durationMinutes);
    if (consultationEnd.getHours() >= 22 && consultationEnd.getMinutes() > 0) return false;
    for (const block of blocked) {
      if ((prepStart < block.to && consultationEnd > block.from) || (block.from < consultationEnd && block.to > prepStart)) return false;
    }
    return true;
  }

  const DURS = [45, 60, 75, 90, 105, 120];
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 10; hour <= 21; hour++) {
      ["00", "15", "30", "45"].forEach((minute) => {
        if (!(hour === 21 && (minute === "45" || minute === "30" || minute === "15"))) times.push(`${hour}:${minute}`);
      });
    }
    return times;
  };
  const timeOptions = generateTimeOptions();
  const availability = timeOptions.map(slot => ({ slot, allowed: DURS.filter(dur => isSlotFree(selectedDate, slot, dur)) }));

  const STEPS = [
    { title: t("booking.step_1_title", "1. Select Date & Time"), component: DateTimeStep },
    { title: t("booking.step_2_title", "2. Your Information"), component: InfoStep },
    { title: t("booking.step_3_title", "3. Payment"), component: PaymentStep },
    { title: t("booking.step_4_title", "4. Preparation Chat"), component: InlineChatbotStep },
  ];
  const CurrentStepComponent = STEPS[step - 1].component;
  const TOTAL_FORM_STEPS = STEPS.length; // Total steps in this form

  const canProceed = () => {
    if (step === 1) return selectedDate && selectedTime && selectedDuration;
    if (step === 2) return formData.name.trim() && formData.email.trim() && /\S+@\S+\.\S+/.test(formData.email); // Basic email validation
    if (step === 3) return paymentDone;
    return true; // For chatbot step, always allow proceeding (or handle its own "finish")
  };

  const handleNext = async () => {
    if (!canProceed()) return;
    setLoading(true); // Set loading before async operations

    if (step === 1) {
      setStep(2);
      setLoading(false);
    } else if (step === 2) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const appointment_date_obj = new Date(selectedDate);
      appointment_date_obj.setHours(hours, minutes, 0, 0); // Set time correctly
      const appointment_date_iso = appointment_date_obj.toISOString();

      try {
        let currentUserId = user?.id;
        if (!currentUserId && formData.email) { // If no logged-in user, try auto-create
          const accountResult = await autoCreateAccount(formData.name, formData.email, /* generate temp password */);
          if (accountResult.userId) {
            currentUserId = accountResult.userId;
            // Optionally: Log in the newly created user or prompt them to check email
            if (accountResult.success && !accountResult.userExists) {
              console.log("Temporary account created for booking.");
              // You might want to inform the user about the temporary account
            }
          } else if (accountResult.error) {
             console.error("Auto account creation failed:", accountResult.error);
             // Handle error: inform user they need to sign up or log in manually
             setLoading(false);
             return; // Stop booking process
          }
        }

        // **SECURITY NOTE:** Direct DB insert from client. Consider API Route.
        const { data, error } = await supabase.from("bookings").insert({
          user_id: currentUserId, // Use potentially newly created user ID
          appointment_date: appointment_date_iso,
          duration_minutes: selectedDuration,
          name: formData.name.trim(),
          email: formData.email.trim(),
          payment_status: "pending", // Payment handled in next step
        }).select("id").single();

        if (error || !data) throw error || new Error("Booking creation failed");
        setBookingId(data.id);
        setStep(3);
      } catch (error) { console.error("Error creating booking:", error.message); /* Handle error display */ }
      finally { setLoading(false); }
    } else if (step === 3) {
      setStep(4);
      setLoading(false);
    }
    // For step 4 (Chatbot), the "Next" button might become "Finish" or be handled by onBackService
  };

  const handleSelectTime = ({ slot, dur }) => { setSelectedTime(slot); setSelectedDuration(dur); };
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleStepClick = (clickedStepNum) => {
    if (clickedStepNum === 1 && step > 1) setStep(1); // Go back to step 1
    // Allow going back to previous completed steps
    else if (clickedStepNum < step) setStep(clickedStepNum);
    // Do not allow jumping forward via step indicator unless logic is added to CurrentStepComponent
  };

  // Dynamic Swiper CSS injection (remains client-side)
  useEffect(() => {
    const styleId = 'booking-swiper-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .carousel-container { height: 50px; overflow: hidden; margin-bottom: 0.5rem; }
      .carousel-swiper .swiper-slide { display: flex; justify-content: center; align-items: center; height: 40px; }
      .carousel-item { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; }
      .swiper-button-next, .swiper-button-prev { color: #BFA200 !important; /* darkGold */ transform: scale(0.6); top: 50% !important; }
      .swiper-button-next::after, .swiper-button-prev::after { font-size: 24px !important; }
      .swiper-pagination-bullet { background: #BFA200 !important; opacity: 0.5; }
      .swiper-pagination-bullet-active { opacity: 1; }
      .swiper-pagination-duration, .swiper-pagination-time { margin-top: 4px !important; position: static !important; }
    `;
    document.head.appendChild(style);
    return () => { const el = document.getElementById(styleId); if (el) el.remove(); };
  }, []);


  return (
    <section className="py-4 sm:py-6 md:py-8 px-2 sm:px-4" id="bookingForm" ref={formRef}>
      <div className="max-w-full sm:max-w-2xl md:max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 text-black">
          {t("booking.title")}
        </h2>
        <div className="bg-oxfordBlue rounded-xl p-3 sm:p-6 shadow-xl border border-darkGold/50">
          <h3 className="text-lg sm:text-xl md:text-2xl text-white mb-4 font-semibold">
            {STEPS[step - 1].title}
          </h3>

          {/* Step Indicator - Pass total steps for this form */}
          <StepIndicator stepCount={TOTAL_FORM_STEPS} currentStep={step} onStepClick={handleStepClick} />

          {loading && (step === 1 || step === 2) ? ( // Show loader for initial data load or booking creation
            <div className="flex justify-center py-6 sm:py-10 min-h-[300px] items-center">
              <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-t-2 border-b-2 border-darkGold"></div>
            </div>
          ) : (
            <div className="min-h-[300px]"> {/* Ensure consistent height for content area */}
              {step === 1 && <DateTimeStep selectedDate={selectedDate} onSelectDate={setSelectedDate} currentMonth={currentMonth} onChangeMonth={(inc) => setCurrentMonth(prev => addMonths(prev, inc))} minDate={minDate} availability={availability} selectedTime={selectedTime} selectedDuration={selectedDuration} onSelectTime={handleSelectTime} />}
              {step === 2 && <InfoStep formData={formData} onChange={handleChange} />}
              {step === 3 && <PaymentStep selectedDuration={selectedDuration} bookingId={bookingId} formData={formData} onPaymentConfirmed={handlePaymentConfirmed} />}
              {step === 4 && bookingId && <InlineChatbotStep requestId={bookingId} tableName="booking_chat_messages" onFinish={() => { /* Handle finish, e.g., show success message or redirect */ console.log("Chatbot finished for booking:", bookingId); onBackService(); /* Example: Go back to service selection */ }} />}
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : onBackService())}
              className="px-4 py-2 border-2 border-darkGold text-darkGold rounded-xl hover:bg-darkGold/10 transition-colors font-medium"
            >
              {t("booking.back_button", "Back")}
            </button>
            {step < TOTAL_FORM_STEPS && (
              <button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="px-4 py-2 bg-darkGold text-black rounded-xl font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading && step === 2 ? ( // Specific loading for booking creation step
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    {t("booking.processing_button", "Processing...")}
                  </>
                ) : (
                  t("booking.next_button", "Next") // Generic "Next"
                )}
              </button>
            )}
            {step === TOTAL_FORM_STEPS && ( // Show a "Finish" or "Done" button on the last step
                 <button
                    onClick={() => {
                        // Potentially call N8N webhook for booking completion
                        if (bookingId && process.env.NEXT_PUBLIC_N8N_BOOKING_COMPLETE_WEBHOOK) {
                            axios.post(process.env.NEXT_PUBLIC_N8N_BOOKING_COMPLETE_WEBHOOK, { session_id: bookingId })
                                .catch(err => console.error("Error calling N8N booking complete webhook:", err));
                        }
                        onBackService(); // Or navigate to a success page: router.push('/booking-confirmed')
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                 >
                    {t("booking.finish_button", "Finish")}
                 </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

