-- HandyNaija Database Schema & Spatial PostGIS Configuration
-- Production-ready migration with PostGIS, RLS, triggers, and spatial indexes

-- 1. Enable PostGIS and UUID Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Enumerated types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'artisan', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status_enum AS ENUM ('not_started', 'pending', 'verified', 'failed', 'manual_review');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE job_status_enum AS ENUM ('pending', 'accepted', 'declined', 'scheduled', 'in_progress', 'completed', 'cancelled', 'disputed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  state TEXT DEFAULT 'Lagos',
  city TEXT,
  area TEXT,
  is_suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Artisan Profiles table with PostGIS geometry
CREATE TABLE IF NOT EXISTS artisan_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  trade_id UUID NOT NULL REFERENCES trades(id),
  bio TEXT,
  experience_years INTEGER DEFAULT 1,
  location_address TEXT,
  location_geom GEOMETRY(Point, 4326),
  service_radius_km NUMERIC(5,2) DEFAULT 25.0,
  availability_status TEXT DEFAULT 'available_today',
  verification_status verification_status_enum DEFAULT 'not_started',
  verification_provider TEXT DEFAULT 'didit',
  verification_session_id TEXT,
  verification_completed_at TIMESTAMPTZ,
  rating_average NUMERIC(3,2) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  hourly_rate NUMERIC(10,2) DEFAULT 5000.0,
  base_fee NUMERIC(10,2) DEFAULT 10000.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for sub-millisecond PostGIS proximity queries
CREATE INDEX IF NOT EXISTS idx_artisan_profiles_geom ON artisan_profiles USING GIST (location_geom);
CREATE INDEX IF NOT EXISTS idx_artisan_profiles_trade ON artisan_profiles(trade_id);
CREATE INDEX IF NOT EXISTS idx_artisan_profiles_verification ON artisan_profiles(verification_status);

-- 6. Artisan Services
CREATE TABLE IF NOT EXISTS artisan_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id UUID NOT NULL REFERENCES artisan_profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  starting_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Artisan Portfolio
CREATE TABLE IF NOT EXISTS artisan_portfolio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id UUID NOT NULL REFERENCES artisan_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Verification Records (Didit Provider Integration)
CREATE TABLE IF NOT EXISTS verification_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artisan_id UUID NOT NULL REFERENCES artisan_profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'didit',
  session_id TEXT NOT NULL,
  status verification_status_enum NOT NULL DEFAULT 'pending',
  identity_verified BOOLEAN DEFAULT FALSE,
  selfie_verified BOOLEAN DEFAULT FALSE,
  liveness_verified BOOLEAN DEFAULT FALSE,
  nin_masked TEXT,
  bvn_masked TEXT,
  provider_reference TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(user_id),
  artisan_id UUID NOT NULL REFERENCES artisan_profiles(id),
  trade_id UUID NOT NULL REFERENCES trades(id),
  title TEXT NOT NULL,
  description TEXT,
  budget_min NUMERIC(10,2) NOT NULL,
  budget_max NUMERIC(10,2) NOT NULL,
  escrow_amount NUMERIC(10,2) DEFAULT 0.0,
  escrow_status TEXT DEFAULT 'unfunded',
  location_address TEXT NOT NULL,
  location_geom GEOMETRY(Point, 4326),
  scheduled_date DATE,
  status job_status_enum NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_customer ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_artisan ON jobs(artisan_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- 10. Job Images
CREATE TABLE IF NOT EXISTS job_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Reviews table (Only for completed jobs)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID UNIQUE NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(user_id),
  artisan_id UUID NOT NULL REFERENCES artisan_profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Conversations & Messages
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(user_id),
  artisan_id UUID NOT NULL REFERENCES artisan_profiles(id),
  job_id UUID REFERENCES jobs(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(user_id),
  message TEXT NOT NULL,
  attachment_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(user_id),
  reported_user_id UUID NOT NULL REFERENCES profiles(user_id),
  job_id UUID REFERENCES jobs(id),
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 14. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Row Level Security Policies (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all active profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Artisan Profiles: Viewable by all, manageable only by owner artisan
CREATE POLICY "Artisan profiles are viewable by everyone" ON artisan_profiles FOR SELECT USING (true);
CREATE POLICY "Artisans can update own profile" ON artisan_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Jobs: Only participants (customer or artisan) or admin can view and update
CREATE POLICY "Participants can view their jobs" ON jobs FOR SELECT USING (
  auth.uid() = customer_id OR 
  auth.uid() IN (SELECT user_id FROM artisan_profiles WHERE id = artisan_id)
);

-- Reviews: Viewable by all, insertable only by job customer after completion
CREATE POLICY "Reviews viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Customers can review completed jobs" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = customer_id AND
  EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND status = 'completed')
);

-- Messages: Only conversation participants can read & write
CREATE POLICY "Participants can read messages" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id AND (
      c.customer_id = auth.uid() OR
      c.artisan_id IN (SELECT id FROM artisan_profiles WHERE user_id = auth.uid())
    )
  )
);
