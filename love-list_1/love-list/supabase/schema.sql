-- =========================================================================
-- LOVE LIST — Database Schema & Row Level Security
-- Run this entire file once in: Supabase Dashboard -> SQL Editor -> New query
-- =========================================================================

-- -------------------------------------------------------------------------
-- Extensions
-- -------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gives us gen_random_uuid()

-- -------------------------------------------------------------------------
-- 1. PROFILES
-- One row per allowed person. This table is the "guest list" for the whole
-- app — if you're not in here, RLS will lock you out of everything else,
-- even if you have a valid Supabase Auth account.
-- -------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text not null,
  avatar_emoji  text default '💛',
  created_at    timestamptz not null default now()
);

comment on table public.profiles is 'The two allowed members of this shared space. Populated manually after each partner signs up.';

-- -------------------------------------------------------------------------
-- 2. BUCKET LIST ITEMS
-- Shared goals/memories. Doubles as the scrapbook once completed.
-- -------------------------------------------------------------------------
create table if not exists public.bucket_list_items (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  category        text not null default 'general',
  target_date     date,
  is_priority     boolean not null default false,

  location_name   text,
  latitude        double precision,
  longitude       double precision,

  status          text not null default 'pending' check (status in ('pending', 'completed')),
  created_by      uuid references public.profiles (id) on delete set null,
  completed_by    uuid references public.profiles (id) on delete set null,
  completed_at    timestamptz,

  image_url       text,
  journal_entry   text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.bucket_list_items is 'Shared bucket list goals. Completed items with an image_url become scrapbook memories.';

-- keep updated_at fresh on every edit
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_bucket_list_items_updated_at on public.bucket_list_items;
create trigger trg_bucket_list_items_updated_at
  before update on public.bucket_list_items
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------------------
-- 3. PET STATE
-- A singleton row representing your shared "growing love pet".
-- The check(id) trick guarantees only one row can ever exist.
-- -------------------------------------------------------------------------
create table if not exists public.pet_state (
  id          boolean primary key default true check (id),
  name        text not null default 'Pip',
  xp          integer not null default 0,
  level       integer not null default 1,
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_pet_state_updated_at on public.pet_state;
create trigger trg_pet_state_updated_at
  before update on public.pet_state
  for each row execute function public.set_updated_at();

-- seed the single pet row
insert into public.pet_state (id, name, xp, level)
values (true, 'Pip', 0, 1)
on conflict (id) do nothing;

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.bucket_list_items enable row level security;
alter table public.pet_state enable row level security;

-- Helper: is the currently authenticated user one of the two allowed people?
-- SECURITY DEFINER lets this bypass RLS on profiles internally so it doesn't
-- recurse into the very policy it's used by.
create or replace function public.is_couple_member()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid()
  );
$$;

-- ---------------------------
-- profiles policies
-- ---------------------------
-- Both partners can see both profiles (needed for avatars/names in the UI),
-- but nobody can see profiles unless they are already one of the two.
drop policy if exists "profiles_select_couple_only" on public.profiles;
create policy "profiles_select_couple_only"
  on public.profiles for select
  using (public.is_couple_member());

-- No insert/update/delete policies are defined on purpose — profile rows are
-- added once, manually, by you via the SQL editor (see instructions below).
-- This means even a signed-in couple member can never add a third profile
-- through the app itself.

-- ---------------------------
-- bucket_list_items policies
-- ---------------------------
drop policy if exists "items_select_couple_only" on public.bucket_list_items;
create policy "items_select_couple_only"
  on public.bucket_list_items for select
  using (public.is_couple_member());

drop policy if exists "items_insert_couple_only" on public.bucket_list_items;
create policy "items_insert_couple_only"
  on public.bucket_list_items for insert
  with check (public.is_couple_member());

drop policy if exists "items_update_couple_only" on public.bucket_list_items;
create policy "items_update_couple_only"
  on public.bucket_list_items for update
  using (public.is_couple_member())
  with check (public.is_couple_member());

drop policy if exists "items_delete_couple_only" on public.bucket_list_items;
create policy "items_delete_couple_only"
  on public.bucket_list_items for delete
  using (public.is_couple_member());

-- ---------------------------
-- pet_state policies
-- ---------------------------
drop policy if exists "pet_select_couple_only" on public.pet_state;
create policy "pet_select_couple_only"
  on public.pet_state for select
  using (public.is_couple_member());

drop policy if exists "pet_update_couple_only" on public.pet_state;
create policy "pet_update_couple_only"
  on public.pet_state for update
  using (public.is_couple_member())
  with check (public.is_couple_member());

-- No insert/delete policy on pet_state — it's a singleton seeded above and
-- should never be created or removed by the app itself.

-- =========================================================================
-- REALTIME
-- Add the tables we want live updates for to the supabase_realtime publication.
-- =========================================================================
alter publication supabase_realtime add table public.bucket_list_items;
alter publication supabase_realtime add table public.pet_state;

-- =========================================================================
-- INDEXES
-- =========================================================================
create index if not exists idx_bucket_list_items_status on public.bucket_list_items (status);
create index if not exists idx_bucket_list_items_target_date on public.bucket_list_items (target_date);
create index if not exists idx_bucket_list_items_priority on public.bucket_list_items (is_priority) where is_priority = true;

-- =========================================================================
-- STORAGE — scrapbook photo bucket
-- Bundled in here so the whole app is one trip to the SQL editor.
-- The bucket is marked "public" so completed-memory photos can be displayed
-- via a plain public URL in the gallery (no signed URLs needed client-side).
-- Public here only means "readable by URL" — it does NOT mean anyone can
-- upload, overwrite, or delete: those are still locked to the two of you
-- below via storage.objects RLS policies.
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('bucket-list-memories', 'bucket-list-memories', true)
on conflict (id) do nothing;

-- storage.objects already ships with RLS enabled by Supabase; we just add
-- policies scoped to this one bucket.

drop policy if exists "memories_select_couple_only" on storage.objects;
create policy "memories_select_couple_only"
  on storage.objects for select
  using (bucket_id = 'bucket-list-memories' and public.is_couple_member());

drop policy if exists "memories_insert_couple_only" on storage.objects;
create policy "memories_insert_couple_only"
  on storage.objects for insert
  with check (bucket_id = 'bucket-list-memories' and public.is_couple_member());

drop policy if exists "memories_update_couple_only" on storage.objects;
create policy "memories_update_couple_only"
  on storage.objects for update
  using (bucket_id = 'bucket-list-memories' and public.is_couple_member())
  with check (bucket_id = 'bucket-list-memories' and public.is_couple_member());

drop policy if exists "memories_delete_couple_only" on storage.objects;
create policy "memories_delete_couple_only"
  on storage.objects for delete
  using (bucket_id = 'bucket-list-memories' and public.is_couple_member());
