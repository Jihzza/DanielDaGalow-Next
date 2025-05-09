import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { format, addDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useLocation } from "react-router-dom";


function MainPage() {
  const location = useLocation();
  const [showBookingForm, setShowBookingForm] = useState(false);
  
  useEffect(() => {
    // Check if we navigated here with the openBooking state
    if (location.state?.openBooking) {
      setShowBookingForm(true);
    }
  }, [location]);
}
export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const { t } = useTranslation();

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    async function fetchEvents() {
      // Only fetch events if user is logged in
      if (!user) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("id, appointment_date, name, duration_minutes")
        .eq("user_id", user.id); // Filter by current user's ID
        
      if (error) {
        console.error("Error fetching events:", error);
      } else {
        // Transform data for better display
        const formattedEvents = data.map(evt => ({
          id: evt.id,
          date: new Date(evt.appointment_date),
          title: evt.name || "Appointment",
          duration: evt.duration_minutes || 60,
          time: format(new Date(evt.appointment_date), "h:mm a")
        }));
        setEvents(formattedEvents);
      }
      setLoading(false);
    }
    
    fetchEvents();
  }, [user]); // Add user as a dependency so query re-runs when user changes

  useEffect(() => {
    if (selectedDate) {
      const dayEvents = events.filter(evt => isSameDay(evt.date, selectedDate));
      setSelectedEvents(dayEvents);
    } else {
      setSelectedEvents([]);
    }
  }, [selectedDate, events]);

  const hasEventOn = (date) => {
    return events.some(evt => isSameDay(evt.date, date));
  };

  const countEventsOn = (date) => {
    return events.filter(evt => isSameDay(evt.date, date)).length;
  };

  // Build calendar grid for display: show 42 days (6 weeks)
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay(); // 0 (Sun) - 6
  const daysFromPrev = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const prevDays = [];
  for (let i = daysFromPrev; i > 0; i--) {
    prevDays.push(addDays(monthStart, -i));
  }

  const totalCells = 42;
  const daysFromNext = totalCells - (prevDays.length + days.length);
  const nextDays = [];
  const lastDay = days[days.length - 1];
  for (let i = 1; i <= daysFromNext; i++) {
    nextDays.push(addDays(lastDay, i));
  }

  const calendar = [...prevDays, ...days, ...nextDays];

  if (!user) {
    return (
      <main className="mt-14 md:mt-24 lg:mt-20">
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-oxfordBlue"></div>
      </div>
      </main>
    );
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-b from-oxfordBlue to-gentleGray py-6 md:py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 md:mb-8 text-white">
          {t('calendar.title')}
        </h1>
        
        <div className="bg-gentleGray rounded-xl shadow-lg p-4 md:p-6 lg:p-8">
          {/* Calendar Header with improved responsive design */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <button 
              onClick={() => setCurrentMonth(prev => addMonths(prev, -1))} 
              className="bg-oxfordBlue text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors shadow-md"
              aria-label="Previous month"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-oxfordBlue">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button 
              onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} 
              className="bg-oxfordBlue text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors shadow-md"
              aria-label="Next month"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-oxfordBlue"></div>
            </div>
          ) : (
            <div className="md:flex md:space-x-6 lg:space-x-8">
              {/* Calendar Grid - optimized for tablets and desktops */}
              <div className="md:flex-1 bg-white rounded-xl shadow-md p-4 mb-6 md:mb-0">
                {/* Weekday Headers with improved styling */}
                <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-4">
                  {[
                    t('calendar.weekdays.monday'),
                    t('calendar.weekdays.tuesday'),
                    t('calendar.weekdays.wednesday'),
                    t('calendar.weekdays.thursday'),
                    t('calendar.weekdays.friday'),
                    t('calendar.weekdays.saturday'),
                    t('calendar.weekdays.sunday')
                  ].map(d => (
                    <div key={d} className="text-center font-medium text-oxfordBlue py-2 text-xs md:text-sm lg:text-base">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Days - Responsive grid that scales well */}
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                  {calendar.map((date, idx) => {
                    const isCurrentMonth = isSameMonth(date, currentMonth);
                    const isCurrentDay = isToday(date);
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const hasEvent = hasEventOn(date);
                    
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedDate(date)}
                        className={`
                          h-10 md:h-14 lg:h-16 p-1 border rounded-lg transition-all cursor-pointer 
                          flex flex-col items-center justify-between
                          ${isCurrentMonth ? 'hover:border-darkGold hover:shadow-md' : 'text-gray-400 bg-gray-50'}
                          ${isSelected ? 'border-darkGold bg-darkGold/10 shadow-md' : 'border-gray-200'}
                          ${isCurrentDay ? 'ring-2 ring-oxfordBlue' : ''}
                        `}
                      >
                        {/* Day Number - Positioned better for all screen sizes */}
                        <div className="w-full flex-1 flex items-center justify-center">
                          <span className={`
                            font-medium text-center text-sm md:text-base
                            ${isCurrentDay ? 'text-oxfordBlue font-bold' : ''}
                            ${isSelected ? 'text-oxfordBlue' : ''}
                          `}>
                            {format(date, 'd')}
                          </span>
                        </div>
                        
                        {/* Event Indicator - Enhanced for better visibility */}
                        {hasEvent && (
                          <div className="w-full flex justify-center items-center h-2 md:h-3">
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-darkGold"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Selected Date Events - Now side by side on larger screens */}
              {selectedDate && (
                <div className="md:flex-1 bg-white rounded-xl shadow-md p-4 md:p-6">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-oxfordBlue mb-4">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </h3>
                  
                  <div className="space-y-3 max-h-80 md:max-h-96 overflow-auto pr-2">
                    {selectedEvents.length > 0 ? (
                      selectedEvents.map(event => (
                        <div 
                          key={event.id} 
                          className="bg-gentleGray p-4 rounded-lg border-l-4 border-darkGold hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-oxfordBlue">{event.title}</h4>
                            <span className="bg-oxfordBlue text-white px-2 py-1 rounded text-xs md:text-sm">{event.time}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Duration: {event.duration} minutes</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-600 border-2 border-dashed border-gray-300 rounded-lg">
                        <p>{t('calendar.no_appointments')}</p>
                        <button 
  onClick={() => navigate('/', { state: { openBooking: true }})}
  className="bg-darkGold text-black py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors font-medium shadow-md"
>
  {t('calendar.book_appointment')}
</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Empty state when no date is selected */}
              {!selectedDate && (
                <div className="md:flex-1 hidden md:block bg-white rounded-xl shadow-md p-6">
                  <div className="h-full flex flex-col items-center justify-center">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 text-center">Select a date to view appointments</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Action button area */}
          <div className="mt-6 flex justify-center md:justify-end">
            <button 
              className="bg-darkGold text-black py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors font-medium shadow-md"
            >
              {t('calendar.book_appointment')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}