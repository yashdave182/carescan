/**
 * Supabase client factory for Vite + React apps.
 *
 * This module exposes:
 *  - getSupabaseClient(): returns a singleton Supabase client (lazy-initialized)
 *  - createSupabaseClient(options): returns a new Supabase client (no singleton)
 *
 * Environment variables supported (priority order):
 *  - VITE_SUPABASE_URL
 *  - REACT_APP_SUPABASE_URL
 *  - VITE_SUPABASE_ANON_KEY
 *  - REACT_APP_SUPABASE_ANON_KEY
 *
 * Note: In Vite, only variables prefixed with VITE_ are automatically exposed to the client bundle.
 * If you currently use REACT_APP_* vars, consider duplicating them as VITE_* in your .env file:
 *   VITE_SUPABASE_URL=...
 *   VITE_SUPABASE_ANON_KEY=...
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Safely get a candidate value (first non-empty string) from a list.
 */
function pick(...candidates) {
  for (const v of candidates) {
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return undefined;
}

/**
 * Resolve environment variables across Vite, CRA-style, and fallbacks.
 */
function resolveEnv() {
  const ie = typeof import.meta !== "undefined" ? import.meta : undefined;
  const ieEnv = ie && ie.env ? ie.env : {};

  const pe =
    typeof process !== "undefined" && process.env ? process.env : undefined;

  const we = typeof window !== "undefined" ? window : undefined;

  const url = pick(
    ieEnv?.VITE_SUPABASE_URL,
    ieEnv?.REACT_APP_SUPABASE_URL,
    pe?.VITE_SUPABASE_URL,
    pe?.REACT_APP_SUPABASE_URL,
    we?.VITE_SUPABASE_URL,
    we?.REACT_APP_SUPABASE_URL,
  );

  const anonKey = pick(
    ieEnv?.VITE_SUPABASE_ANON_KEY,
    ieEnv?.REACT_APP_SUPABASE_ANON_KEY,
    pe?.VITE_SUPABASE_ANON_KEY,
    pe?.REACT_APP_SUPABASE_ANON_KEY,
    we?.VITE_SUPABASE_ANON_KEY,
    we?.REACT_APP_SUPABASE_ANON_KEY,
  );

  return { url, anonKey };
}

/**
 * Create a new Supabase client (no singleton).
 * @param {Object} [options]
 * @param {string} [options.url] - Supabase project URL
 * @param {string} [options.anonKey] - Supabase anon/public key
 * @param {boolean} [options.persistSession=true] - Persist session to storage
 * @param {boolean} [options.autoRefreshToken=true] - Auto refresh tokens
 * @param {string} [options.clientInfoHeader='CareScanWeb'] - Optional client info header value
 */
export function createSupabaseClient(options = {}) {
  const env = resolveEnv();

  const url = options.url ?? env.url;
  const anon = options.anonKey ?? env.anonKey;

  if (!url || !anon) {
    const missing = [];
    if (!url) missing.push("VITE_SUPABASE_URL (or REACT_APP_SUPABASE_URL)");
    if (!anon)
      missing.push("VITE_SUPABASE_ANON_KEY (or REACT_APP_SUPABASE_ANON_KEY)");
    throw new Error(
      `Missing Supabase configuration. Please set: ${missing.join(
        ", ",
      )}. You can define them in a .env file for Vite (VITE_*).`,
    );
  }

  const persistSession =
    options.persistSession === undefined ? true : !!options.persistSession;
  const autoRefreshToken =
    options.autoRefreshToken === undefined ? true : !!options.autoRefreshToken;
  const clientInfoHeader = options.clientInfoHeader || "CareScanWeb";

  return createClient(url, anon, {
    auth: {
      persistSession,
      autoRefreshToken,
    },
    global: {
      headers: {
        "X-Client-Info": clientInfoHeader,
      },
    },
  });
}

let _singleton;

/**
 * Get a singleton Supabase client (lazy).
 * @param {Object} [options] - same as createSupabaseClient options plus:
 * @param {boolean} [options.forceNew=false] - if true, creates and returns a new client and replaces the singleton
 */
export function getSupabaseClient(options = {}) {
  const { forceNew = false, ...rest } = options;

  if (_singleton && !forceNew) return _singleton;

  _singleton = createSupabaseClient(rest);
  return _singleton;
}

export default getSupabaseClient;
