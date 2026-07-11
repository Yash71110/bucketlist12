-- =========================================================================
-- LOVE LIST — Migration 002: reactions, relationship day-counter
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query
-- Safe to run on your EXISTING project — every statement is idempotent,
-- you do not need to re-run schema.sql first.
-- =========================================================================

-- -------------------------------------------------------------------------
-- Reactions on completed memories (tap-to-react in the gallery)
-- -------------------------------------------------------------------------
alter table public.bucket_list_items
  add column if not exists reactions jsonb not null default '{}'::jsonb;

-- Atomic increment via RPC so two rapid taps (one from each of you) can
-- never silently overwrite each other the way a plain read-modify-write
-- update from the client could.
create or replace function public.increment_reaction(item_id uuid, emoji text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_couple_member() then
    raise exception 'not authorized';
  end if;

  update public.bucket_list_items
  set reactions = jsonb_set(
    coalesce(reactions, '{}'::jsonb),
    array[emoji],
    to_jsonb(coalesce((reactions->>emoji)::int, 0) + 1)
  )
  where id = item_id;
end;
$$;

grant execute on function public.increment_reaction(uuid, text) to authenticated;

-- -------------------------------------------------------------------------
-- APP SETTINGS
-- Another singleton row (same check(id) trick as pet_state) for small
-- shared preferences — right now just the relationship start date, which
-- powers the "together for X days" widget.
-- -------------------------------------------------------------------------
create table if not exists public.app_settings (
  id                      boolean primary key default true check (id),
  relationship_start_date date,
  updated_at              timestamptz not null default now()
);

drop trigger if exists trg_app_settings_updated_at on public.app_settings;
create trigger trg_app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

insert into public.app_settings (id)
values (true)
on conflict (id) do nothing;

alter table public.app_settings enable row level security;

drop policy if exists "settings_select_couple_only" on public.app_settings;
create policy "settings_select_couple_only"
  on public.app_settings for select
  using (public.is_couple_member());

drop policy if exists "settings_update_couple_only" on public.app_settings;
create policy "settings_update_couple_only"
  on public.app_settings for update
  using (public.is_couple_member())
  with check (public.is_couple_member());

-- Add to realtime publication so both of you see date changes live.
-- Guarded because alter publication ... add table errors (rather than
-- no-ops) if the table is already a member.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'app_settings'
  ) then
    alter publication supabase_realtime add table public.app_settings;
  end if;
end $$;
