-- =============================================
-- PRODAJKUPI — Supabase SQL setup
-- Pokreni ovo u Supabase SQL Editor
-- =============================================

-- 1. KORISNICI
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  pass text not null,
  city text default '',
  phone text default '',
  created_at timestamptz default now()
);

-- 2. OGLASI
create table if not exists ads (
  id text primary key,
  ts bigint not null,
  active boolean default true,
  category text not null,
  subcategory text default '',
  title text not null,
  desc text not null,
  condition text default 'Polovno',
  price numeric default 0,
  is_free boolean default false,
  is_fixed boolean default false,
  swap text default 'Ne',
  city text default '',
  municipality text default '',
  contact_name text default '',
  phone text default '',
  phone2 text default '',
  show_email text default '',
  delivery text[] default '{}',
  availability text[] default '{}',
  mileage text default '',
  year text default '',
  size text default '',
  photos text[] default '{}',
  user_name text default '',
  user_email text not null,
  updated_at timestamptz default now()
);

-- 3. OCENE
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  from_email text not null,
  from_name text not null,
  to_email text not null,
  ad_id text default '',
  ad_title text default '',
  type text not null check (type in ('positive','negative')),
  role text not null check (role in ('prodavac','kupac')),
  payment boolean default true,
  communication boolean default true,
  deal boolean default true,
  comment text not null,
  ts bigint not null,
  created_at timestamptz default now()
);

-- 4. FAVORITI
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  ad_id text not null,
  created_at timestamptz default now(),
  unique(user_email, ad_id)
);

-- 5. DOZVOLI JAVNI PRISTUP (RLS off za početak)
alter table users     enable row level security;
alter table ads       enable row level security;
alter table reviews   enable row level security;
alter table favorites enable row level security;

-- Dozvoli sve operacije anon korisniku
create policy "public_all" on users     for all using (true) with check (true);
create policy "public_all" on ads       for all using (true) with check (true);
create policy "public_all" on reviews   for all using (true) with check (true);
create policy "public_all" on favorites for all using (true) with check (true);

-- 6. INDEX za brže pretrage
create index if not exists ads_user_email on ads(user_email);
create index if not exists ads_category   on ads(category);
create index if not exists ads_city       on ads(city);
create index if not exists ads_ts         on ads(ts desc);
create index if not exists reviews_to     on reviews(to_email);
create index if not exists favorites_user on favorites(user_email);
