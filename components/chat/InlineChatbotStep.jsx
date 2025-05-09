      // components/chat/InlineChatbotStep.jsx
      "use client";

      import React, { useState, useEffect, useRef } from "react";
      import Image from 'next/image'; // Import next/image
      import { useTranslation } from "react-i18next";
      import { format } from "date-fns"; // Keep date-fns

      // --- Adjust import paths as needed ---
      import { supabase } from "../../utils/supabaseClient"; // e.g., ../../utils/supabaseClient or @/utils/supabaseClient
      import TypingMessage from "../common/TypingMessage"; // e.g., ../common/TypingMessage or @/components/common/TypingMessage
      import { useAuth } from "../../contexts/AuthContext"; // e.g., ../../contexts/AuthContext or @/contexts/AuthContext
      // --- End Adjust Paths ---

      // Webhook URL logic remains the same
      const getWebhookUrl = (tableName) => {
        if (tableName === 'analysis_chat_messages') return "https://rafaello.app.n8n.cloud/webhook/analysis-chat";
        if (tableName === 'pitchdeck_chat_messages') return "https://rafaello.app.n8n.cloud/webhook/pitchdeck-chat";
        if (tableName === 'coaching_chat_messages') return "https://rafaello.app.n8n.cloud/webhook/coaching-chat";
        if (tableName === 'booking_chat_messages') return "https://rafaello.app.n8n.cloud/webhook/booking-chat";
        return "https://rafaello.app.n8n.cloud/webhook/chat"; // Default
      };

      // Props: requestId (UUID), tableName (string), onFinish (function)
      export default function InlineChatbotStep({ requestId, tableName, onFinish }) {
        const { t } = useTranslation();
        const { user } = useAuth();
        const userId = user?.id;
        const [msgs, setMsgs] = useState([]);
        const [text, setText] = useState("");
        const [busy, setBusy] = useState(false); // Renamed from 'loading' for clarity vs ChatbotWindow
        const [isTypingAnimationActive, setIsTypingAnimationActive] = useState(false);
        const listRef = useRef(null);
        const [isNewChat, setIsNewChat] = useState(true); // Assume new until messages are loaded
        const didInit = useRef(false); // Prevent multiple initializations

        const checkTypingAnimations = () => {
          const anyStillTyping = msgs.some((msg) => msg.from === "bot" && msg.isTyping);
          setIsTypingAnimationActive(anyStillTyping);
        };

        useEffect(() => {
          checkTypingAnimations();
        }, [msgs]);

        // --- Generate Welcome Message ---
        // Using useCallback to memoize the async function
        const getWelcomeMessage = React.useCallback(async () => {
          try {
            // Default welcome message
            let welcomeKey = "inline_chatbot.welcome_message";
            let welcomeParams = {};

            // Customize based on table name (service type)
            if (tableName === "booking_chat_messages") {
              const { data, error } = await supabase.from("bookings").select("appointment_date, duration_minutes").eq("id", requestId).maybeSingle();
              if (!error && data) {
                const appointmentDate = new Date(data.appointment_date);
                welcomeKey = "inline_chatbot.booking_welcome_with_date";
                welcomeParams = { date: format(appointmentDate, "MMMM do, yyyy 'at' h:mm a"), duration: data.duration_minutes };
              } else {
                welcomeKey = "inline_chatbot.booking_welcome";
              }
            } else if (tableName === "coaching_chat_messages") {
              const { data, error } = await supabase.from("coaching_requests").select("service_type").eq("id", requestId).maybeSingle();
              const tier = !error && data ? ({ Weekly: "Basic", Daily: "Standard", Priority: "Premium" }[data.service_type] || "coaching") : "coaching";
              welcomeKey = "inline_chatbot.coaching_welcome";
              welcomeParams = { tier };
            } else if (tableName === "analysis_chat_messages") {
              const { data, error } = await supabase.from("analysis_requests").select("service_type").eq("id", requestId).maybeSingle();
              const analysisType = !error && data ? (data.service_type || "analysis") : "analysis";
              welcomeKey = "inline_chatbot.analysis_welcome";
              welcomeParams = { type: analysisType };
            } else if (tableName === "pitchdeck_chat_messages") {
              const { data, error } = await supabase.from("pitch_requests").select("project").eq("id", requestId).maybeSingle();
              const project = !error && data ? (data.project || "your project") : "your project";
              welcomeKey = "inline_chatbot.pitch_deck_welcome";
              welcomeParams = { project };
            }

            return t(welcomeKey, welcomeParams);

          } catch (err) {
            console.error("Error generating welcome message:", err);
            return t("inline_chatbot.welcome_message"); // Fallback
          }
        }, [requestId, tableName, t]); // Dependencies for the callback

        // --- Load existing messages or initialize ---
        useEffect(() => {
          if (!requestId || !tableName) return;
          let isMounted = true;

          (async () => {
            try {
              // Determine the correct column name for the foreign key
              const idColumn = tableName === 'booking_chat_messages' ||
                               tableName === 'coaching_chat_messages' ||
                               tableName === 'analysis_chat_messages' ||
                               tableName === 'pitchdeck_chat_messages'
                               ? 'session_id'
                               : 'request_id'; // Fallback or for other tables

              const { data, error } = await supabase
                .from(tableName)
                .select("*")
                .eq(idColumn, requestId)
                .order("created_at", { ascending: true });

              if (!isMounted) return;
              if (error) throw error;

              const messagesList = data.map(d => ({
                from: d.role === 'user' ? 'user' : 'bot', // Standardize based on 'role' if present
                text: d.content || d.message, // Use 'content' or fallback to 'message'
                isTyping: false, // Existing messages are not typing
              }));

              if (messagesList.length > 0) {
                setMsgs(messagesList);
                setIsNewChat(false); // Mark as not new if messages loaded
              } else {
                // Only initialize if it's marked as new and hasn't been initialized
                if (isNewChat && !didInit.current) {
                   didInit.current = true; // Mark as initialized
                   const welcomeText = await getWelcomeMessage();
                   const welcomeMessage = { from: "bot", text: welcomeText, isTyping: true };
                   setMsgs([welcomeMessage]);
                   setIsTypingAnimationActive(true);
                   setIsNewChat(false); // Explicitly set to false after init

                   // *** Consider saving welcome message to DB here or in backend ***
                   // await supabase.from(tableName).insert({ [idColumn]: requestId, role: 'assistant', content: welcomeText, user_id: userId });
                }
              }
            } catch (err) {
               console.error("Error fetching/initializing chat messages:", err);
               // Optionally set an error state or message
            }
          })();

          return () => { isMounted = false; }; // Cleanup flag

        }, [requestId, tableName, isNewChat, getWelcomeMessage, userId]); // Add dependencies


        // Auto-scroll effect remains the same
        useEffect(() => {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        }, [msgs, busy]);

        // Send message function
        async function send() {
          if (!text.trim() || isTypingAnimationActive || busy) return;

          const textToSend = text.trim();
          const userMessage = { from: "user", text: textToSend, isTyping: false };

          // Update UI
          setMsgs((m) => [...m, userMessage]);
          setText("");
          setBusy(true);

          try {
            // *** POTENTIAL REFACTOR POINT (Phase 3) ***
            // Save user message (consider moving to backend)
            const idColumn = tableName.includes('_chat_messages') ? 'session_id' : 'request_id';
            const userMsgPayload = {
               [idColumn]: requestId,
               role: "user",
               content: textToSend, // Assuming 'content' column
               user_id: userId
            };
            // Adjust payload based on actual table schema if needed
            // if (!tableName.includes('_chat_messages')) {
            //    userMsgPayload.sender = 'user';
            //    userMsgPayload.message = textToSend;
            //    delete userMsgPayload.role;
            //    delete userMsgPayload.content;
            // }
            const { error: userMsgError } = await supabase.from(tableName).insert(userMsgPayload).select();
            if (userMsgError) throw new Error(`DB Error (User Msg): ${userMsgError.message}`);


            // Call appropriate N8N webhook
            const workflowUrl = getWebhookUrl(tableName);
            const res = await fetch(workflowUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                 session_id: requestId, // Use consistent naming if possible
                 chatInput: textToSend,
                 service_type: tableName.replace('_chat_messages', ''), // Pass context
                 user_id: userId
              }),
            });

            if (!res.ok) throw new Error(`Webhook Error: ${res.status} ${res.statusText}`);

            // Handle potential non-JSON or empty responses
            const responseText = await res.text();
            let data;
            try {
               data = responseText ? JSON.parse(responseText) : { output: "Received empty response." };
            } catch (e) {
               data = { output: responseText || "Received non-JSON response." };
            }
            const botOutput = data.output || "Sorry, I couldn't process that.";
            const botMessage = { from: "bot", text: botOutput, isTyping: true };

            // Update UI
            setMsgs((m) => [...m, botMessage]);
            setIsTypingAnimationActive(true);

            // Save bot message (consider moving to backend)
            const botMsgPayload = { ...userMsgPayload, role: 'assistant', content: botOutput };
            // Adjust payload based on actual table schema if needed
            // if (!tableName.includes('_chat_messages')) {
            //    botMsgPayload.sender = 'bot';
            //    botMsgPayload.message = botOutput;
            //    delete botMsgPayload.role;
            //    delete botMsgPayload.content;
            // }
            const { error: botMsgError } = await supabase.from(tableName).insert(botMsgPayload).select();
            if (botMsgError) console.error(`DB Error (Bot Msg): ${botMsgError.message}`);


          } catch (err) {
            console.error("Inline Chatbot send/receive error:", err);
            const errorText = "An error occurred. Please try again.";
            setMsgs((m) => [...m, { from: "bot", text: errorText, isTyping: true }]);
            setIsTypingAnimationActive(true);
             // Optionally save error message to DB
            try {
               const idColumn = tableName.includes('_chat_messages') ? 'session_id' : 'request_id';
               const errorPayload = { [idColumn]: requestId, role: 'assistant', content: `[Error]: ${err.message}`, user_id: userId };
               // Adjust schema if needed
               await supabase.from(tableName).insert(errorPayload).select();
            } catch (dbError) { console.error("DB Error (Saving Error Msg):", dbError); }
          } finally {
            setBusy(false);
          }
        }

        return (
          // Main container with fixed height and layout
          <div className="bg-oxfordBlue rounded-2xl h-[350px] md:h-[400px] p-4 space-y-3 flex flex-col border border-darkGold/50 shadow-inner">
            {/* Message List Area */}
            <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 pr-2"> {/* Added padding-right */}
              {msgs.map((m, i) => (
                 <div
                    key={i}
                    className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
                 >
                    <div
                       className={`max-w-[85%] px-3 py-2 rounded-lg whitespace-pre-wrap text-sm md:text-base ${ // Adjusted padding/text size
                       m.from === 'user'
                          ? 'bg-darkGold text-black rounded-br-none' // User message style
                          : 'bg-gray-700 text-white rounded-bl-none' // Bot message style
                       }`}
                    >
                       {m.from === "bot" ? (
                          <TypingMessage
                             text={m.text}
                             isComplete={!m.isTyping}
                             typingSpeed={2}
                             startDelay={10}
                             onComplete={() => {
                                setMsgs((prevMsgs) =>
                                   prevMsgs.map((msg, idx) =>
                                      idx === i ? { ...msg, isTyping: false } : msg
                                   )
                                );
                             }}
                          />
                       ) : (
                          m.text
                       )}
                    </div>
                 </div>
              ))}
              {/* Show subtle indicator when bot is processing */}
              {busy && !isTypingAnimationActive && (
                 <div className="flex justify-start">
                    <div className="px-3 py-2 rounded-lg bg-gray-700 text-white rounded-bl-none inline-flex items-center space-x-2">
                       <div className="animate-pulse h-2 w-2 bg-gray-400 rounded-full"></div>
                       <div className="animate-pulse h-2 w-2 bg-gray-400 rounded-full animation-delay-200"></div>
                       <div className="animate-pulse h-2 w-2 bg-gray-400 rounded-full animation-delay-400"></div>
                    </div>
                 </div>
              )}
            </div>

            {/* Input Area */}
            <div className="relative flex items-center space-x-2">
               {/* Attach Button - Placeholder */}
              <button className="p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-darkGold rounded-full" aria-label="Attach file (feature not implemented)">
                 <Image src="/assets/icons/Anexar.svg" alt="attach" width={20} height={20} className="w-5 h-5" />
              </button>
              {/* Text Input */}
              <input
                className="flex-1 h-10 bg-white/10 border-2 border-darkGold rounded-full px-4 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-darkGold" // Adjusted padding
                placeholder={ isTypingAnimationActive ? t("inline_chatbot.input_placeholder_waiting") : t("inline_chatbot.input_placeholder") }
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => !isTypingAnimationActive && !busy && e.key === 'Enter' && send()} // Send on Enter
                disabled={busy || isTypingAnimationActive}
                aria-label="Chat message input"
              />
              {/* Send Button */}
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 focus:outline-none focus:ring-2 focus:ring-darkGold rounded-full disabled:opacity-50"
                onClick={send}
                disabled={busy || isTypingAnimationActive || !text.trim()} // Disable if no text
                aria-label="Send message"
              >
                <Image
                  src="/assets/icons/Send.svg" // Direct path
                  alt="send"
                  width={24} height={24}
                  className={`w-5 h-5 transition-opacity ${ busy || isTypingAnimationActive || !text.trim() ? "opacity-50" : "opacity-100 hover:opacity-80" }`}
                />
              </button>
            </div>

            {/* Finish Button */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                className="bg-darkGold text-black px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-darkGold focus:ring-offset-oxfordBlue" // Added focus style
                onClick={onFinish}
                disabled={busy || isTypingAnimationActive} // Disable while bot is busy/typing
              >
                {t("inline_chatbot.finish_button") || "Finish"}
              </button>
            </div>
          </div>
        );
      }

      