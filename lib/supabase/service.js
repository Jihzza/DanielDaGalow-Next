// lib/supabase/service.js
import { createClient } from '@supabase/supabase-js';

// Ensure this is ONLY used on the server for admin tasks
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);