import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type Config = {
  supabaseUrl: string;
  publicKey: string;
  configured: boolean;
  verification: boolean;
  payments: boolean;
  mapboxToken: string;
  hasGemini?: boolean;
};

export let supabase: SupabaseClient | null = null;

export async function initialize(): Promise<Config> {
  const config = await api<Config>('/config');
  if (config.supabaseUrl && config.publicKey && !supabase) {
    try {
      supabase = createClient(config.supabaseUrl, config.publicKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    } catch (e) {
      console.warn('[callOga] Failed to initialize Supabase client:', e);
    }
  }
  return config;
}

export async function api<T = any>(path: string, method = 'GET', body?: unknown): Promise<T> {
  let token: string | null = null;
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token || null;
    } catch {
      // Ignored if session fetch fails
    }
  }

  const response = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(25000)
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || 'The request could not be completed.') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return data;
}

export const trades = [
  'Carpenter',
  'Plumber',
  'Electrician',
  'Laptop repair',
  'Mason',
  'Painter',
  'Welder',
  'Tiler',
  'Mechanic',
  'Tailor',
  'AC technician',
  'Cleaner',
  'Solar installer'
];

export type Artisan = {
  id: string;
  display_name: string;
  trade: string;
  headline: string;
  bio: string;
  area: string;
  experience_years: number;
  base_fee: number;
  availability: 'available' | 'busy' | 'offline';
  latitude: number | null;
  longitude: number | null;
  avatar_url?: string;
  verification_status: 'not_started' | 'pending' | 'manual_review' | 'verified' | 'failed';
  published: boolean;
  hn_services: Service[];
  hn_portfolio: Portfolio[];
  hn_reviews?: Review[];
  phone?: string;
  whatsapp?: string;
  promoted?: boolean;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  price: number;
  pricing_type: 'fixed' | 'from' | 'hourly' | 'inspection';
};

export type Portfolio = {
  id: string;
  title: string;
  image_url: string;
};

export type Review = {
  id: string;
  author_name: string;
  rating: number;
  body: string;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  area: string;
  role: 'customer' | 'artisan' | 'admin';
  suspended?: boolean;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  job_id?: string;
  read_at?: string;
  created_at: string;
};

export type Me = {
  profile: Profile;
  artisan: Artisan | null;
  notifications: Notice[];
};

export type Job = {
  id: string;
  title: string;
  description: string;
  address: string;
  scheduled_date: string;
  budget: number;
  status:
    | 'requested'
    | 'accepted'
    | 'declined'
    | 'en_route'
    | 'in_progress'
    | 'awaiting_confirmation'
    | 'completed'
    | 'cancelled'
    | 'disputed';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  customer_id: string;
  artisan_id: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  artisan?: { display_name: string; trade: string };
  customer?: { full_name: string };
};

export type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type LiveLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  updated_at: string;
  job_id?: string;
  artisan_name?: string;
};

export type TelemetryFeed = {
  activeJobs: Job[];
  liveLocations: Record<string, LiveLocation>;
  activeArtisansCount: number;
  verifiedCount: number;
  timestamp: string;
};

export type AiMatchResponse = {
  trade: string;
  headline: string;
  explanation: string;
  estimatedBudget: { min: number; max: number };
  keyQuestions: string[];
  suggestedAction: string;
  recommendedArtisans: Artisan[];
};

export const currency = (value: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(value);

export const human = (value: string) => value.replaceAll('_', ' ');

export function distance(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
) {
  const r = Math.PI / 180;
  const dlat = (b.latitude - a.latitude) * r;
  const dlon = (b.longitude - a.longitude) * r;
  return (
    6371 *
    2 *
    Math.atan2(
      Math.sqrt(
        Math.sin(dlat / 2) ** 2 +
          Math.cos(a.latitude * r) * Math.cos(b.latitude * r) * Math.sin(dlon / 2) ** 2
      ),
      Math.sqrt(
        1 -
          (Math.sin(dlat / 2) ** 2 +
            Math.cos(a.latitude * r) * Math.cos(b.latitude * r) * Math.sin(dlon / 2) ** 2)
      )
    )
  );
}
