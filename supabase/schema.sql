-- Enable extensions
create extension if not exists "uuid-ossp";

-- Admin allowlist
create table if not exists admin_users (
  user_id uuid primary key
);

-- Team members
create table if not exists team_members (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  role text not null,
  bio text not null,
  image_url text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

-- Careers
create table if not exists careers (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  department text not null,
  location text not null,
  type text not null,
  description text not null,
  requirements text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Portfolio items
create table if not exists portfolio_items (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  image_url text,
  project_url text,
  category text not null,
  technologies text[] not null default '{}',
  is_featured boolean not null default false,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

-- Clients
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  logo_url text,
  website_url text,
  is_featured boolean not null default false,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table admin_users enable row level security;
alter table team_members enable row level security;
alter table careers enable row level security;
alter table portfolio_items enable row level security;
alter table clients enable row level security;

-- Admin table policy: user can read own row
create policy if not exists "read own admin row"
  on admin_users
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Public read policies
create policy if not exists "public read team"
  on team_members
  for select
  using (true);

create policy if not exists "public read careers"
  on careers
  for select
  using (true);

create policy if not exists "public read portfolio"
  on portfolio_items
  for select
  using (true);

create policy if not exists "public read clients"
  on clients
  for select
  using (true);

-- Admin write policies (insert/update/delete) for allowlisted users
create policy if not exists "admin write team"
  on team_members
  for all
  to authenticated
  using (exists (select 1 from admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from admin_users a where a.user_id = auth.uid()));

create policy if not exists "admin write careers"
  on careers
  for all
  to authenticated
  using (exists (select 1 from admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from admin_users a where a.user_id = auth.uid()));

create policy if not exists "admin write portfolio"
  on portfolio_items
  for all
  to authenticated
  using (exists (select 1 from admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from admin_users a where a.user_id = auth.uid()));

create policy if not exists "admin write clients"
  on clients
  for all
  to authenticated
  using (exists (select 1 from admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from admin_users a where a.user_id = auth.uid()));

-- Helper: Seed the first admin (replace with your auth UID)
-- insert into admin_users (user_id) values ('00000000-0000-0000-0000-000000000000');
