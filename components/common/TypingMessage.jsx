      // components/common/TypingMessage.jsx
      "use client"; // Directive needed for hooks and setTimeout

      import React, { useState, useEffect, useRef } from 'react';

      /**
       * TypingMessage component creates a realistic typing animation effect.
       * Assumes a corresponding .typing-cursor class is defined in global CSS.
       */
      const TypingMessage = ({
        text = "",
        typingSpeed = 50, // Adjusted default speed slightly
        startDelay = 100, // Adjusted default delay slightly
        isComplete = false, // Start fully typed if true
        onComplete = () => {}, // Callback when animation finishes
        className = "" // Allow passing extra classes
      }) => {
        const [visibleText, setVisibleText] = useState(isComplete ? text : "");
        const [isTyping, setIsTyping] = useState(!isComplete);
        const charIndexRef = useRef(0);
        const fullTextRef = useRef(text); // Store initial text
        const timerRef = useRef(null); // Ref for timeout ID

        // Effect to handle text prop changes or isComplete changes
        useEffect(() => {
          fullTextRef.current = text; // Update stored text if prop changes
          if (isComplete) {
            // If marked complete, ensure full text is shown and typing stops
            setVisibleText(text);
            setIsTyping(false);
            if (timerRef.current) clearTimeout(timerRef.current); // Clear any pending timer
            charIndexRef.current = text.length; // Ensure index is at the end
          } else if (text !== visibleText || charIndexRef.current > 0) { // Reset if text changes OR if partially typed
            // Reset animation if text changes or if it wasn't complete
            charIndexRef.current = 0;
            setVisibleText("");
            setIsTyping(true); // Start typing
            if (timerRef.current) clearTimeout(timerRef.current); // Clear previous timer
          }
        }, [text, isComplete, visibleText]); // Added visibleText dependency for reset logic


        // Effect for the typing animation interval
        useEffect(() => {
          if (!isTyping || !fullTextRef.current) return; // Exit if not typing or no text

          let localTimeoutId; // Use local variable for timeout ID in this effect instance

          const typeNextChar = () => {
            if (charIndexRef.current < fullTextRef.current.length) {
              const variance = Math.random() * 0.5 + 0.75; // Random speed variance (0.75x to 1.25x)
              const speed = typingSpeed * variance;
              let delay = speed;
              const currentChar = fullTextRef.current[charIndexRef.current];

              // Simulate natural pauses
              if (['.', '!', '?'].includes(currentChar)) delay = speed * 5;
              else if ([',', ';', ':'].includes(currentChar)) delay = speed * 3;

              localTimeoutId = setTimeout(() => {
                charIndexRef.current += 1;
                setVisibleText(fullTextRef.current.substring(0, charIndexRef.current));
                typeNextChar(); // Schedule next character
              }, delay);
              timerRef.current = localTimeoutId; // Store timeout ID in ref

            } else {
              // Typing complete
              setIsTyping(false);
              onComplete(); // Call completion callback
            }
          };

          // Start the typing after the initial delay
          localTimeoutId = setTimeout(typeNextChar, startDelay);
          timerRef.current = localTimeoutId; // Store timeout ID in ref

          // Cleanup function for this effect instance
          return () => {
            clearTimeout(localTimeoutId); // Clear the specific timeout for this effect run
            // Optional: Check if the ref holds the same ID before clearing,
            // though clearing might be safe anyway.
            // if (timerRef.current === localTimeoutId) {
            //   clearTimeout(timerRef.current);
            // }
          };
          // Dependencies: Re-run if typing state, speed, delay, or completion callback changes
        }, [isTyping, typingSpeed, startDelay, onComplete]);


        // Blinking cursor element (ensure .typing-cursor CSS is defined globally)
        const cursor = isTyping ? (
          <span className="typing-cursor" aria-hidden="true">|</span>
        ) : null;

        return (
          // Use a span or div based on context, add passed className
          <span className={`typing-message ${className}`}>
            {visibleText}
            {cursor}
          </span>
        );
      };

      export default TypingMessage;
      