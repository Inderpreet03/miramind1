-- Run this once if your project already ran schema.sql before shared roster support was added.
-- Every signed-in MiraMind user can read and update this common family roster.

create table if not exists public.shared_family_members (
  id text primary key,
  name text not null,
  relation text not null default 'Family',
  emoji text not null default '👤',
  note text,
  birthday text,
  image text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shared_family_members enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'shared_family_members'
      and policyname = 'Signed-in users can view shared family'
  ) then
    create policy "Signed-in users can view shared family"
      on public.shared_family_members for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'shared_family_members'
      and policyname = 'Signed-in users can add shared family'
  ) then
    create policy "Signed-in users can add shared family"
      on public.shared_family_members for insert to authenticated
      with check (auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'shared_family_members'
      and policyname = 'Signed-in users can update shared family'
  ) then
    create policy "Signed-in users can update shared family"
      on public.shared_family_members for update to authenticated
      using (true) with check (auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'shared_family_members'
      and policyname = 'Signed-in users can remove shared family'
  ) then
    create policy "Signed-in users can remove shared family"
      on public.shared_family_members for delete to authenticated using (true);
  end if;
end
$$;
