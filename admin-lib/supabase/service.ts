import "server-only";

import { createClient } from "@supabase/supabase-js";

function readRequiredEnvironment(name: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SECRET_KEY") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

export function isSupabaseServiceConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY,
  );
}

/**
 * This client bypasses RLS, so it must only be imported by server-side code
 * that performs its own validation and authorization.
 */
export function createSupabaseServiceClient() {
  return createClient(
    readRequiredEnvironment("NEXT_PUBLIC_SUPABASE_URL"),
    readRequiredEnvironment("SUPABASE_SECRET_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
