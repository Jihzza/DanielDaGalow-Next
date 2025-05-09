// app/calendar/page.jsx
"use client"; // Essential for hooks, client-side data fetching, and interactions

import React, { useState, useEffect, useCallback } from "react";
// Import useRouter from Next.js for navigation
import { useRouter } from 'next/navigation';

// --- IMPORTANT: Adjust these import paths based on your new project structure ---
// Example: import { supabase } from '@/utils/supabaseClient';
import { supabase } from "../../utils/supabaseClient";
// Example: import { useAuth } from '@/contexts/AuthContext';
import { useAuth } from "../../contexts/AuthContext";
// --- End Adjust Paths ---

import { format, addDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday as dateFnsIsToday } from "date-fns";
import { useTranslation } from 'react-i18next';

// Note: The MainPage function from the original file, which used useLocation,
// is removed as its logic for opening the booking form will be handled by
// navigating with query params from the "Book Appointment" button.

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth(); // Get auth loading state
  const router = useRouter(); // Use Next.js router

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch events when user or currentMonth changes
  useEffect(() => {
    async function fetchEvents() {
      if (!user) {
        setLoading(false); // Ensure loading is false if no user
        return;
      }
      setLoading(true);
      try {
        // Fetch events for the current user
        const { data, error } = await supabase
          .from("bookings")
          .select("id, appointment_date, name, duration_minutes")
          .eq("user_id", user.id);
          // Optionally, filter by month on the server-side if performance becomes an issue
          // .gte('appointment_date', format(startOfMonth(currentMonth), 'yyyy-MM-dd'))
          // .lte('appointment_date', format(endOfMonth(currentMonth), 'yyyy-MM-dd'));

        if (error) throw error;

        const formattedEvents = (data || []).map(evt => ({
          id: evt.id,
          date: new Date(evt.appointment_date),
          title: evt.name || t('calendar.default_appointment_title', "Appointment"),
          duration: evt.duration_minutes || 60,
          time: format(new Date(evt.appointment_date), "p") // Localized time format
        }));
        setEvents(formattedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        // Handle error state if needed
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [user, currentMonth, t]); // Add t to dependencies if default_appointment_title uses it

  // Update selected events when selectedDate or events list changes
  useEffect(() => {
    if (selectedDate) {
      const dayEvents = events.filter(evt => isSameDay(evt.date, selectedDate));
      setSelectedEvents(dayEvents);
    } else {
      setSelectedEvents([]);
    }
  }, [selectedDate, events]);

  const hasEventOn = (date) => events.some(evt => isSameDay(evt.date, date));

  // Calendar grid calculation (remains largely the same)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay(); // 0 (Sun) - 6 (Sat)
  // Adjust for Monday start if your locale or preference is different.
  // For this example, assuming Sunday is 0.
  const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek -1; // For Monday start: firstDayOfWeek
  const prevMonthDays = [];
  for (let i = daysFromPrevMonth; i > 0; i--) {
    prevMonthDays.push(addDays(monthStart, -i));
  }

  const totalGridCells = 42; // 6 weeks * 7 days
  const daysFromNextMonth = totalGridCells - (prevMonthDays.length + daysInMonth.length);
  const nextMonthDays = [];
  const lastDayOfMonth = daysInMonth[daysInMonth.length - 1];
  for (let i = 1; i <= daysFromNextMonth; i++) {
    nextMonthDays.push(addDays(lastDayOfMonth, i));
  }
  const calendarDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays];

  const handleBookAppointmentClick = () => {
    // Navigate to the homepage and tell MergedServiceForm to open the booking section
    router.push("/?service=booking");
  };

  // Show loading spinner if auth state is loading or no user yet (and not redirected)
  if (authLoading || (!user && !authLoading)) { // Added !authLoading to prevent flicker if user is null briefly
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-oxfordBlue"></div>
      </div>
    );
  }

  return (
    // Use a main tag or div as the root page element
    <div className="min-h-screen bg-gradient-to-b from-oxfordBlue to-gentleGray py-6 md:py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 md:mb-8 text-white">
          {t('calendar.title', "My Calendar")}
        </h1>

        <div className="bg-gentleGray rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <button
              onClick={() => setCurrentMonth(prev => addMonths(prev, -1))}
              className="bg-oxfordBlue text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-darkGold"
              aria-label={t('calendar.previous_month', "Previous month")}
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-oxfordBlue">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
              className="bg-oxfordBlue text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-darkGold"
              aria-label={t('calendar.next_month', "Next month")}
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>

          {loading && !events.length ? ( // Show loader only if events haven't loaded yet
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-oxfordBlue"></div>
            </div>
          ) : (
            <div className="md:flex md:space-x-6 lg:space-x-8">
              {/* Calendar Grid */}
              <div className="md:flex-1 bg-white rounded-xl shadow-md p-3 md:p-4 mb-6 md:mb-0">
                <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-4">
                  {/* Weekday headers - ensure keys are stable */}
                  {[ "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                    <div key={d} className="text-center font-medium text-oxfordBlue py-2 text-xs md:text-sm">
                      {t(`calendar.weekdays_short.${d.toLowerCase()}`, d)}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                  {calendarDays.map((date, idx) => {
                    const isCurrentCalendarMonth = isSameMonth(date, currentMonth);
                    const isDayToday = dateFnsIsToday(date);
                    const isDateSelected = selectedDate && isSameDay(date, selectedDate);
                    const dayHasEvent = hasEventOn(date);

                    return (
                      <div
                        key={idx}
                        onClick={() => isCurrentCalendarMonth && setSelectedDate(date)}
                        className={`h-10 md:h-14 lg:h-16 p-1 border rounded-lg transition-all flex flex-col items-center justify-center relative ${ // Added relative for event dot
                          isCurrentCalendarMonth
                            ? "cursor-pointer hover:border-darkGold hover:shadow-sm"
                            : "text-gray-400 bg-gray-50 cursor-default"
                        } ${
                          isDateSelected
                            ? "border-darkGold bg-darkGold/10 shadow-md ring-2 ring-darkGold"
                            : "border-gray-200"
                        } ${
                          isDayToday && isCurrentCalendarMonth && !isDateSelected ? "ring-2 ring-oxfordBlue/70" : ""
                        }`}
                      >
                        <span className={`font-medium text-center text-xs md:text-sm ${isDayToday && isCurrentCalendarMonth ? 'text-oxfordBlue font-bold' : isDateSelected ? 'text-oxfordBlue' : isCurrentCalendarMonth ? 'text-gray-700' : 'text-gray-400'}`}>
                          {format(date, 'd')}
                        </span>
                        {dayHasEvent && isCurrentCalendarMonth && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-darkGold"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Date Events */}
              <div className={`md:w-1/3 lg:w-2/5 bg-white rounded-xl shadow-md p-4 md:p-6 transition-all duration-300 ${selectedDate ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 md:opacity-100 md:translate-y-0'}`}> {/* Conditional visibility for mobile */}
                {selectedDate ? (
                  <>
                    <h3 className="text-lg md:text-xl font-bold text-oxfordBlue mb-4">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </h3>
                    <div className="space-y-3 max-h-80 md:max-h-[calc(6*4rem)] overflow-y-auto pr-2 custom-scrollbar"> {/* Adjusted max-height */}
                      {selectedEvents.length > 0 ? (
                        selectedEvents.map(event => (
                          <div key={event.id} className="bg-gray-50 p-3 rounded-lg border-l-4 border-darkGold hover:shadow-sm transition-shadow">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold text-sm md:text-base text-oxfordBlue">{event.title}</h4>
                              <span className="bg-oxfordBlue text-white px-2 py-0.5 rounded-full text-xs">{event.time}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{t('calendar.duration_label', 'Duration:')} {event.duration} {t('calendar.minutes_short', 'min')}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                          <p className="text-sm md:text-base">{t('calendar.no_appointments_on_date', 'No appointments on this date.')}</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-center text-sm md:text-base">{t('calendar.select_date_prompt', 'Select a date to view appointments.')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action button area */}
          <div className="mt-6 md:mt-8 flex justify-center">
            <button
              onClick={handleBookAppointmentClick}
              className="bg-darkGold text-black py-2.5 px-6 rounded-lg hover:bg-opacity-90 transition-colors font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-darkGold focus:ring-offset-gentleGray"
            >
              {t('calendar.book_new_appointment_button', 'Book New Consultation')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
