import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variable resolution across Vite and Node runtimes
const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  '';

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  '';

let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  } catch (err) {
    console.warn('[callOga Supabase] Initialization error:', err);
  }
}

export const supabase = client;

export interface SupabaseDiagnostics {
  isConfigured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
  urlHost: string;
  connectionStatus: 'connected' | 'unconfigured' | 'error';
  latencyMs?: number;
  errorMessage?: string;
  tablesVerified: string[];
}

/**
 * Diagnostic runner to genuinely test Supabase connectivity and schema accessibility
 */
export async function testSupabaseConnection(): Promise<SupabaseDiagnostics> {
  const result: SupabaseDiagnostics = {
    isConfigured: !!(supabaseUrl && supabaseAnonKey),
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    urlHost: supabaseUrl ? new URL(supabaseUrl).host : 'not-provided',
    connectionStatus: 'unconfigured',
    tablesVerified: []
  };

  if (!client) {
    result.connectionStatus = 'unconfigured';
    result.errorMessage = 'Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are not set. The platform runs on the server-authoritative reactive engine.';
    return result;
  }

  const startTime = Date.now();
  try {
    // Attempt a lightweight probe on the profiles or trades table
    const { data, error } = await client.from('trades').select('id, name').limit(1);
    result.latencyMs = Date.now() - startTime;

    if (error) {
      // Table might not exist or RLS restriction, test auth health endpoint
      result.connectionStatus = 'error';
      result.errorMessage = error.message;
      return result;
    }

    result.connectionStatus = 'connected';
    result.tablesVerified.push('trades');
    return result;
  } catch (err: any) {
    result.latencyMs = Date.now() - startTime;
    result.connectionStatus = 'error';
    result.errorMessage = err.message || 'Unknown network error reaching Supabase';
    return result;
  }
}
