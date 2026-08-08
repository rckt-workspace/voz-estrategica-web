import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Public connection data. These values identify the public Data API and are
// intentionally safe to ship to the browser; table access remains enforced by RLS.
const PUBLIC_BACKEND_URL = "https://eyebjcvagagztrfsllir.supabase.co";
const PUBLIC_BACKEND_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImV5ZWJqY3ZhZ2FnenRyZnNsbGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODY3ODQsImV4cCI6MjA5NDg2Mjc4NH0.YAO2LXxP-D8rSLzpA1NKvvOBDUIyOfC0QpVpFseDSwo";

export const publicBackend = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL || PUBLIC_BACKEND_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || PUBLIC_BACKEND_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);
