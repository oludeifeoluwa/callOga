-- Additive migration: does not overwrite the legacy application tables.
begin;
create table if not exists public.hn_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '', phone text not null default '',
  role text not null default 'customer' check (role in ('customer','artisan','admin')),
  avatar_url text, area text not null default '', suspended boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.hn_artisans (
  id uuid primary key references public.hn_profiles(id) on delete cascade,
  display_name text not null, trade text not null, headline text not null,
  bio text not null default '', area text not null, experience_years integer not null check (experience_years between 0 and 80),
  base_fee numeric(12,2) not null check(base_fee >= 0), availability text not null default 'available' check(availability in ('available','busy','offline')),
  latitude double precision check(latitude between -90 and 90), longitude double precision check(longitude between -180 and 180),
  avatar_url text, verification_status text not null default 'not_started' check(verification_status in ('not_started','pending','manual_review','verified','failed')),
  published boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.hn_services (
  id uuid primary key default gen_random_uuid(), artisan_id uuid not null references public.hn_artisans(id) on delete cascade,
  title text not null, description text not null default '', price numeric(12,2) not null check(price>=0),
  pricing_type text not null check(pricing_type in ('fixed','from','hourly','inspection'))
);
create table if not exists public.hn_portfolio (
  id uuid primary key default gen_random_uuid(), artisan_id uuid not null references public.hn_artisans(id) on delete cascade,
  title text not null, image_url text not null, created_at timestamptz not null default now()
);
create table if not exists public.hn_jobs (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.hn_profiles(id), artisan_id uuid not null references public.hn_artisans(id),
  title text not null, description text not null, address text not null, scheduled_date date not null,
  budget numeric(12,2) not null check(budget>0), latitude double precision check(latitude between -90 and 90), longitude double precision check(longitude between -180 and 180),
  status text not null default 'requested' check(status in ('requested','accepted','declined','en_route','in_progress','awaiting_confirmation','completed','cancelled','disputed')),
  payment_status text not null default 'unpaid' check(payment_status in ('unpaid','paid','refunded')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(customer_id<>artisan_id)
);
create index if not exists hn_jobs_customer_idx on public.hn_jobs(customer_id);
create index if not exists hn_jobs_artisan_idx on public.hn_jobs(artisan_id);
create table if not exists public.hn_messages (
  id uuid primary key default gen_random_uuid(), job_id uuid not null references public.hn_jobs(id) on delete cascade,
  sender_id uuid not null references public.hn_profiles(id), body text not null check(length(body) between 1 and 4000), created_at timestamptz not null default now()
);
create index if not exists hn_messages_job_idx on public.hn_messages(job_id,created_at);
create table if not exists public.hn_reviews (
  id uuid primary key default gen_random_uuid(), job_id uuid unique not null references public.hn_jobs(id),
  customer_id uuid not null references public.hn_profiles(id), artisan_id uuid not null references public.hn_artisans(id),
  author_name text not null, rating integer not null check(rating between 1 and 5), body text not null, created_at timestamptz not null default now()
);
create table if not exists public.hn_notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.hn_profiles(id) on delete cascade,
  title text not null, body text not null, job_id uuid references public.hn_jobs(id), read_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.hn_verifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.hn_artisans(id),
  session_id text unique not null, status text not null default 'pending', url text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.hn_locations (
  job_id uuid primary key references public.hn_jobs(id) on delete cascade,
  user_id uuid not null references public.hn_profiles(id), latitude double precision not null check(latitude between -90 and 90),
  longitude double precision not null check(longitude between -180 and 180), accuracy double precision not null check(accuracy>=0),
  heading double precision, sharing boolean not null default true, updated_at timestamptz not null default now()
);
create table if not exists public.hn_reports (
  id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.hn_profiles(id), job_id uuid not null references public.hn_jobs(id),
  reason text not null, status text not null default 'open' check(status in ('open','investigating','resolved','dismissed')), admin_notes text,
  created_at timestamptz not null default now()
);
create table if not exists public.hn_audit (
  id uuid primary key default gen_random_uuid(), actor_id uuid references public.hn_profiles(id), action text not null,
  target_id uuid, created_at timestamptz not null default now()
);
-- Server-only writes. No browser can promote roles, self-verify, edit prices after booking, or forge payments.
do $$ declare t text; begin
  foreach t in array array['hn_profiles','hn_artisans','hn_services','hn_portfolio','hn_jobs','hn_messages','hn_reviews','hn_notifications','hn_verifications','hn_locations','hn_reports','hn_audit'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon, authenticated',t);
    execute format('grant select on public.%I to authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
end $$;
create policy hn_profile_owner on public.hn_profiles for select to authenticated using(id=auth.uid());
create policy hn_artisan_visible on public.hn_artisans for select to authenticated using(id=auth.uid() or (published and verification_status='verified'));
create policy hn_job_participant on public.hn_jobs for select to authenticated using(customer_id=auth.uid() or artisan_id=auth.uid());
create policy hn_message_participant on public.hn_messages for select to authenticated using(exists(select 1 from public.hn_jobs j where j.id=job_id and (j.customer_id=auth.uid() or j.artisan_id=auth.uid())));
create policy hn_notification_owner on public.hn_notifications for select to authenticated using(user_id=auth.uid());
create policy hn_verification_owner on public.hn_verifications for select to authenticated using(user_id=auth.uid());
create policy hn_location_participant on public.hn_locations for select to authenticated using(sharing and updated_at>now()-interval '2 minutes' and exists(select 1 from public.hn_jobs j where j.id=job_id and j.status in ('accepted','en_route','in_progress') and (j.customer_id=auth.uid() or j.artisan_id=auth.uid())));
create policy hn_report_owner on public.hn_reports for select to authenticated using(reporter_id=auth.uid());
-- Realtime may be unavailable on self-hosted environments; API polling remains a fallback.
do $$ declare t text; begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') then
    foreach t in array array['hn_jobs','hn_messages','hn_notifications','hn_artisans'] loop
      if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
        execute format('alter publication supabase_realtime add table public.%I',t);
      end if;
    end loop;
  end if;
end $$;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('handynaija-portfolio','handynaija-portfolio',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
-- Uploads use server-issued signed tokens after identity/ownership checks.
commit;
