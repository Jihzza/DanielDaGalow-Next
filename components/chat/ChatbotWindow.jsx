      // components/chat/ChatbotWindow.jsx
      "use client";

      import React, { useState, useRef, useEffect } from "react";
      import Image from 'next/image'; // Import next/image
      import { motion } from "framer-motion";

      // --- Adjust import paths as needed ---
      import { useAuth } from "../../contexts/AuthContext"; // e.g., ../../contexts/AuthContext or @/contexts/AuthContext
      import { supabase } from "../../utils/supabaseClient"; // e.g., ../../utils/supabaseClient or @/utils/supabaseClient
      import TypingMessage from "../common/TypingMessage"; // e.g., ../common/TypingMessage or @/components/common/TypingMessage
      // --- End Adjust Paths ---

      import { useTranslation } from "react-i18next";

      // Fallback UUID generator (remains the same)
      function generateUUID() {
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
          return window.crypto.randomUUID();
        }
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }

      export default function ChatbotWindow({ onClose, sessionId: propSessionId }) {
        const [messages, setMessages] = useState([]);
        const [userText, setUserText] = useState("");
        const [loading, setLoading] = useState(false);
        const [isTypingAnimationActive, setIsTypingAnimationActive] = useState(false);
        const panelRef = useRef(null);
        const listRef = useRef(null);
        const headerRef = useRef(null);
        // Guard against window being undefined during SSR/build for default height
        const DEFAULT_HEIGHT = typeof window !== 'undefined' ? window.innerHeight - 45 : 600; // Default height or a fallback
        const initialHeight = useRef(DEFAULT_HEIGHT);
        const [height, setHeight] = useState(DEFAULT_HEIGHT);
        const [resizing, setResizing] = useState(false);
        const lastTap = useRef(0);
        const dragging = useRef(false);
        const [sessionId] = useState(() => propSessionId || generateUUID());
        const { user } = useAuth();
        const userId = user?.id;
        const [isNewChat, setIsNewChat] = useState(!propSessionId); // Assume new if no propSessionId passed
        const { t } = useTranslation();

        const checkTypingAnimations = () => {
          const anyStillTyping = messages.some((msg) => msg.from === "bot" && msg.isTyping);
          setIsTypingAnimationActive(anyStillTyping);
        };

        // Pointer handlers remain the same (client-side)
        const onPointerDown = (e) => {
           // Guard against non-existent headerRef
           if (!headerRef.current) return;
           e.preventDefault();
           setResizing(true);
           dragging.current = false;
           headerRef.current.setPointerCapture(e.pointerId);
        };

        const onPointerMove = (e) => {
           if (!resizing || typeof window === 'undefined') return;
           dragging.current = true;
           // Ensure window.innerHeight is accessed only client-side
           const newHeight = window.innerHeight - e.clientY - 56;
           setHeight(Math.max(100, Math.min(newHeight, window.innerHeight - 100)));
        };

        const onPointerUp = (e) => {
           // Guard against non-existent headerRef
           if (!headerRef.current) return;
           headerRef.current.releasePointerCapture(e.pointerId);
           setResizing(false);
           if (!dragging.current) {
             const now = Date.now();
             if (now - lastTap.current < 300) { onClose(); lastTap.current = 0; }
             else { lastTap.current = now; }
           }
           dragging.current = false;
        };

        // Fetch initial messages
        useEffect(() => {
          if (!sessionId || !userId) return; // Also wait for userId

          let isMounted = true; // Prevent state updates if unmounted

          (async () => {
            try {
              // Check if session exists
              const { data: sessionData, error: sessionError } = await supabase
                .from("chat_sessions")
                .select("id, title")
                .eq("id", sessionId)
                .maybeSingle(); // Use maybeSingle to handle not found gracefully

              if (sessionError) {
                 console.error("Error checking session:", sessionError);
                 // Handle error appropriately, maybe show an error message
                 return;
              }

              // Fetch existing messages
              const { data: messageData, error: messageError } = await supabase
                .from("messages")
                .select("role, content, created_at")
                .eq("session_id", sessionId)
                .order("created_at", { ascending: true });

              if (messageError) {
                 console.error("Error fetching messages:", messageError);
                 // Handle error
                 return;
              }

              if (!isMounted) return; // Check if component is still mounted

              if (messageData && messageData.length > 0) {
                // Existing chat
                setMessages(
                  messageData.map((row) => ({
                    from: row.role === "user" ? "user" : "bot",
                    text: row.content,
                    isTyping: false, // Mark existing as complete
                  }))
                );
                setIsNewChat(false);

                // Ensure session record exists (optional, defensive check)
                if (!sessionData && userId) {
                   await supabase.from("chat_sessions").insert({
                     id: sessionId,
                     user_id: userId,
                     title: "Recovered Chat", // Indicate it might be an older chat
                   }).select(); // Added select to potentially check for errors
                }
              } else {
                // New chat
                const welcomeMessageText = t("window_chatbot.welcome_message");
                const welcomeMessage = { from: "bot", text: welcomeMessageText, isTyping: true };

                setMessages([welcomeMessage]);
                setIsTypingAnimationActive(true);
                setIsNewChat(false); // Mark as initialized

                // Create session record and save welcome message
                if (userId) {
                   const { error: sessionInsertError } = await supabase.from("chat_sessions").insert({
                     id: sessionId,
                     user_id: userId,
                     title: "New Chat",
                   }).select();

                   if (sessionInsertError) console.error("Error creating session record:", sessionInsertError);

                   const { error: messageInsertError } = await supabase.from("messages").insert({
                     session_id: sessionId, role: "assistant", content: welcomeMessageText, user_id: userId,
                   }).select();

                   if (messageInsertError) console.error("Error saving welcome message:", messageInsertError);
                }
              }
            } catch (err) {
               console.error("Error during chat initialization:", err);
               // Handle initialization error state if needed
            }
          })();

          return () => { isMounted = false; }; // Cleanup flag

        }, [sessionId, userId, t]); // Add userId and t as dependencies

        // Scroll effect remains the same
        useEffect(() => {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        }, [messages, loading]);

        // Check typing animations effect remains the same
        useEffect(() => {
          checkTypingAnimations();
        }, [messages]);

        // Send message function
        const sendMessage = async () => {
          if (!userText.trim() || isTypingAnimationActive || loading) return; // Added loading check

          const textToSend = userText.trim();
          const userMessage = { from: "user", text: textToSend, isTyping: false };

          // Update UI immediately
          setMessages((msgs) => [...msgs, userMessage]);
          setUserText("");
          setLoading(true); // Set loading true

          try {
            // *** POTENTIAL REFACTOR POINT (Phase 3) ***
            // Consider moving Supabase inserts to the backend API route
            // that handles the N8N call for better security/atomicity.
            // Save user message to DB
            const { error: userMsgError } = await supabase.from("messages").insert({
              session_id: sessionId, role: "user", content: textToSend, user_id: userId,
            }).select();
            if (userMsgError) throw new Error(`DB Error (User Msg): ${userMsgError.message}`);

            // Call N8N webhook
            const res = await fetch("https://rafaello.app.n8n.cloud/webhook/chat", { // Ensure URL is correct
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ session_id: sessionId, chatInput: textToSend, user_id: userId }),
            });

            if (!res.ok) throw new Error(`Webhook Error: ${res.status} ${res.statusText}`);

            const data = await res.json();
            const botOutput = data.output || "Sorry, I encountered an issue.";
            const botMessage = { from: "bot", text: botOutput, isTyping: true };

            // Update UI with bot message (typing)
            setMessages((msgs) => [...msgs, botMessage]);
            setIsTypingAnimationActive(true);

            // Save bot message to DB
            const { error: botMsgError } = await supabase.from("messages").insert({
              session_id: sessionId, role: "assistant", content: botOutput, user_id: userId,
            }).select();
            if (botMsgError) console.error(`DB Error (Bot Msg): ${botMsgError.message}`); // Log but maybe don't throw

            // Update chat title logic (remains the same, consider moving to backend)
            // ... (keep existing title update logic) ...

          } catch (error) {
            console.error("Chatbot send/receive error:", error);
            const errorText = "Sorry, there was an error. Please try again.";
            setMessages((msgs) => [...msgs, { from: "bot", text: errorText, isTyping: true }]);
            setIsTypingAnimationActive(true);
            // Optionally save error message to DB
            try {
               await supabase.from("messages").insert({
                 session_id: sessionId, role: "assistant", content: `[Error]: ${error.message}`, user_id: userId,
               }).select();
            } catch (dbError) { console.error("DB Error (Saving Error Msg):", dbError); }
          } finally {
            setLoading(false); // Set loading false
          }
        };

        return (
          <motion.div
            ref={panelRef}
            // Adjusted styling: increased bottom offset, added max-height
            className="fixed bottom-[56px] lg:bottom-[60px] left-0 w-full bg-oxfordBlue shadow-2xl rounded-t-2xl overflow-hidden border-t-2 border-darkGold flex flex-col z-40 touch-none overscroll-contain max-h-[80vh]"
            style={{ height: `${height}px` }} // Height is still dynamic
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            aria-label="Chatbot Window" // Accessibility
          >
            {/* Header */}
            <div
              ref={headerRef}
              className={`relative w-full flex items-center justify-center py-3 md:py-4 px-4 cursor-grab touch-none bg-oxfordBlue/80 backdrop-blur-sm border-b border-darkGold/50 ${resizing ? "bg-opacity-50 cursor-grabbing" : ""}`} // Adjusted padding, added background/border
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              title="Drag to resize, double-tap to close" // Tooltip
            >
              <div className="w-10 h-1 bg-darkGold rounded-full"></div>
              <button
                onClick={onClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-darkGold hover:text-white text-2xl md:text-3xl leading-none focus:outline-none p-1 rounded-full focus:ring-2 focus:ring-darkGold" // Added focus style
                aria-label="Close chat" // Accessibility
              >
                &times; {/* Use HTML entity for close icon */}
              </button>
            </div>

            {/* Message list */}
            <div
              ref={listRef}
              className="flex-1 w-full text-white overflow-y-auto space-y-3 p-4" // Added padding
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`} // Align messages
                >
                   <div
                      className={`max-w-[80%] px-3 py-2 rounded-lg whitespace-pre-wrap md:text-lg ${ // Adjusted padding/text size
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
                            setMessages((prevMsgs) =>
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

              {loading && !isTypingAnimationActive && ( // Show loading indicator only if not already showing typing animation
                <div className="flex justify-start">
                   <div className="max-w-[80%] px-3 py-2 rounded-lg bg-gray-700 text-white rounded-bl-none inline-flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span className="text-sm">Thinking...</span>
                   </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-2 md:p-4 border-t border-darkGold/50 bg-oxfordBlue">
              <div className="relative w-full flex items-center">
                {/* Attach Button - Consider implementing functionality */}
                <button className="p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-darkGold rounded-full mr-2" aria-label="Attach file (feature not implemented)">
                  <Image src="/assets/icons/Anexar.svg" alt="Attach" width={24} height={24} className="w-5 h-5 md:w-6 md:h-6"/>
                </button>
                {/* Text Input */}
                <input
                  className="flex-1 h-10 md:h-12 border-2 border-darkGold bg-white/10 text-white md:text-lg rounded-full p-2 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-darkGold placeholder-gray-400" // Adjusted padding
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  onKeyDown={(e) => !isTypingAnimationActive && !loading && e.key === "Enter" && sendMessage()}
                  placeholder={ isTypingAnimationActive ? "Wait..." : t("window_chatbot.input_placeholder") }
                  disabled={loading || isTypingAnimationActive}
                  aria-label="Chat message input" // Accessibility
                />
                {/* Send Button */}
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 focus:outline-none focus:ring-2 focus:ring-darkGold rounded-full disabled:opacity-50"
                  onClick={sendMessage}
                  disabled={loading || isTypingAnimationActive || !userText.trim()} // Disable if no text
                  aria-label="Send message" // Accessibility
                >
                  <Image
                    src="/assets/icons/Send.svg" // Direct path from public
                    alt="Send"
                    width={24} // Adjust size
                    height={24} // Adjust size
                    className={`w-5 h-5 md:w-6 md:h-6 ${ loading || isTypingAnimationActive || !userText.trim() ? "opacity-50" : "opacity-100 hover:opacity-80" } transition-opacity`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        );
      }
      