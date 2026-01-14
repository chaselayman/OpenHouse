import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Return a mock client if credentials aren't configured (demo mode)
  if (!supabaseUrl || !supabaseKey) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ error: { message: "Demo mode - Please configure Supabase" } }),
        signUp: async () => ({ error: { message: "Demo mode - Please configure Supabase" } }),
        signInWithOAuth: async () => ({ error: { message: "Demo mode - Please configure Supabase" } }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ data: [], error: null, single: () => ({ data: null, error: null }) }),
        insert: () => ({ data: null, error: null, select: () => ({ single: () => ({ data: null, error: null }) }) }),
        update: () => ({ data: null, error: null, eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
        delete: () => ({ error: null, eq: () => ({ error: null }) }),
      }),
    } as unknown as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}

export function isSupabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
