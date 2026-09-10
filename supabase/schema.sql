-- Run this once in the Supabase SQL editor.
-- The app stores each person's complete activity state as JSONB so the
-- existing local model and cloud model stay in sync while the pilot grows.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Resident',
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_states enable row level security;

-- MiraMind is a shared care-team workspace: signed-in users can see the
-- resident roster and activity needed by the Staff page.
create policy "Signed-in users can view profiles"
  on public.profiles for select to authenticated using (true);

create policy "Users can create their own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "Signed-in users can view activity"
  on public.user_states for select to authenticated using (true);

create policy "Users can create their own activity"
  on public.user_states for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own activity"
  on public.user_states for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Keep a profile row in sync for accounts created outside the MiraMind form.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), 'Resident'),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(nullif(excluded.display_name, ''), public.profiles.display_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
