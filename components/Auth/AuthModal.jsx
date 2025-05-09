      // components/Auth/AuthModal.jsx
      "use client"; // Directive needed as it uses useState

      import React, { useState } from "react";
      // Import the adapted components
      import Login from "./Login";
      import Signup from "./Signup";
      import ForgotPassword from "./ForgotPassword";

      // Props: isOpen (boolean), onClose (function), initialView ('login' | 'signup' | 'forgot-password')
      const AuthModal = ({ isOpen, onClose, initialView = "login" }) => {
        const [view, setView] = useState(initialView);

        // Reset view when modal is opened, unless initialView is specified differently
        React.useEffect(() => {
          if (isOpen) {
            setView(initialView);
          }
        }, [isOpen, initialView]);


        if (!isOpen) return null;

        // Close modal if overlay is clicked
        const handleOverlayClick = (e) => {
           // Only close if the click is directly on the overlay div itself
           if (e.target === e.currentTarget) {
              onClose();
           }
        };

        return (
          <>
            {/* Modal overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" // Added padding and backdrop
              onClick={handleOverlayClick} // Use the overlay click handler
            >
              {/* Modal content - stop propagation */}
              <div
                className="bg-gentleGray rounded-lg w-full max-w-md mx-auto overflow-hidden shadow-xl relative" // Added relative positioning for close button
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside content
              >
                {/* Close button positioned inside the modal content area */}
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 z-10 p-1" // Adjusted position and added padding
                  onClick={onClose}
                  aria-label="Close authentication modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Tab navigation - Only show for login/signup */}
                {view !== "forgot-password" && view !== "reset-password" && ( // Also hide for reset-password if it were added here
                  <div className="flex border-b border-gray-300">
                    <button
                      className={`flex-1 py-3 text-center font-medium transition-colors duration-200 ${
                        view === "login"
                          ? "text-oxfordBlue border-b-2 border-oxfordBlue"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setView("login")}
                    >
                      Log In
                    </button>
                    <button
                      className={`flex-1 py-3 text-center font-medium transition-colors duration-200 ${
                        view === "signup"
                          ? "text-oxfordBlue border-b-2 border-oxfordBlue"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setView("signup")}
                    >
                      Sign Up
                    </button>
                  </div>
                )}

                {/* Auth form content */}
                <div className="p-6">
                  {view === "login" ? (
                    <Login
                      isModal={true}
                      onSuccess={onClose} // Close modal on successful login
                      onForgotPassword={() => setView("forgot-password")} // Switch view
                    />
                  ) : view === "signup" ? (
                    <Signup
                      isModal={true}
                      onSuccess={onClose} // Close modal on successful signup (or show message)
                      onSwitchToLogin={() => setView("login")} // Switch view
                    />
                  ) : ( // Assumes view === "forgot-password"
                    <ForgotPassword
                      isModal={true}
                      onSuccess={() => {
                         // Optionally keep modal open showing success message,
                         // or close after delay, or switch back to login
                         // For now, just close it like the others
                         // onClose();
                         // Or switch back to login after message display in ForgotPassword
                      }}
                      onBackToLogin={() => setView("login")} // Switch view
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        );
      };

      export default AuthModal;
      