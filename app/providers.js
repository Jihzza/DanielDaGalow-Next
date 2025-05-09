// app/providers.js
// This file wraps the application with global context providers.
// It MUST be a Client Component because Context needs client-side React features.
"use client"; // Mark this component as a Client Component

import React, { useState, createContext } from 'react';

// 1. Import your existing context providers
//    Adjust the paths if you move your context files (e.g., into an `app/contexts` folder)
import { AuthProvider } from '../src/contexts/AuthContext';
import { ServiceProvider } from '../src/contexts/ServiceContext';

// 2. Import the AuthModal component if its state is managed globally here
import AuthModal from '../src/components/Auth/AuthModal'; // Adjust path

// 3. Recreate or import the AuthModalContext (originally defined in App.js)
//    It's often cleaner to define contexts in their own files, but recreating here is fine too.
export const AuthModalContext = createContext({
  openAuthModal: () => {}, // Default function does nothing
});

/**
 * Providers Component
 *
 * This component wraps the main application ({children}) with all necessary
 * global context providers (Auth, Service, AuthModal).
 * It also manages the state for the authentication modal.
 */
export function Providers({ children }) {
  // State to control the visibility of the authentication modal
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Function to open the modal, provided via context
  const openAuthModal = () => setAuthModalOpen(true);

  // Function to close the modal
  const closeAuthModal = () => setAuthModalOpen(false);

  return (
    // Provide the function to open the modal via AuthModalContext
    <AuthModalContext.Provider value={{ openAuthModal }}>
      {/* Provide authentication state and functions */}
      <AuthProvider>
        {/* Provide service selection state and functions */}
        <ServiceProvider>
          {/* Render the main application content */}
          {children}

          {/* Render the AuthModal, controlled by the state in this provider */}
          {/* This makes the modal globally accessible */}
          <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} />

          {/* Add other global providers here if needed (e.g., i18next) */}
          {/*
          import { I18nextProvider } from 'react-i18next';
          import i18n from '../src/i18n'; // Adjust path

          <I18nextProvider i18n={i18n}>
            {children}
            <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} />
          </I18nextProvider>
          */}

        </ServiceProvider>
      </AuthProvider>
    </AuthModalContext.Provider>
  );
}
