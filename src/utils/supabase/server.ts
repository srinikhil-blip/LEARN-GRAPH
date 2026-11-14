import { createServerClient } from "@supabase/ssr";

const supabaseUrl =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  "https://edflqigvwdfzftpxxgqc.supabase.co";

const supabaseKey =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  "sb_publishable_HkKOmYXf0cqH5XefulPorw_ZOow3b2g";

export const createClient = (cookieStore?: any) => {
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore?.getAll ? cookieStore.getAll() : [];
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore?.set ? cookieStore.set(name, value, options) : null
            );
          } catch {
            // Ignored in server component rendering
          }
        },
      },
    },
  );
};
