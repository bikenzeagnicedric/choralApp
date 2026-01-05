import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === "production") {
      console.warn("Supabase environment variables are missing. This might cause issues during build or runtime.");
    }
    // Return a dummy client or handle gracefully. 
    // During build, this prevents the 'URL and API key are required' crash.
    return createBrowserClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

