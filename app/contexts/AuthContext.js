// app/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client'; // Adjust path if using /src or a different /lib location

const AuthContext = createContext({ /* ... sane defaults ... */ });

export function AuthProvider({ children }) {
  const supabase = createClient(); // Create client instance here
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(error => {
      console.error("Error getting session:", error);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, [supabase]); // Add supabase as a dependency

  // Auth helpers using the 'supabase' instance
  const signUp = (email, password, options = {}) =>
    supabase.auth.signUp({ email, password, options });

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  const resetPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`, // Confirm this route exists
    });

  // ... other methods like updateProfile, getProfile

  const value = { user, loading, signUp, signIn, signOut, resetPassword /*, updateProfile, getProfile*/ };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);