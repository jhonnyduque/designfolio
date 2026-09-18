-- Public anonymous engagement for Designfolio
-- Run this in Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.public_likes (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  visitor_id text not null,
  created_at timestamptz not null default now(),
  unique (work_id, visitor_id)
);

create index if not exists idx_public_likes_work_id
  on public.public_likes(work_id);

create table if not exists public.public_comments (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  visitor_id text not null,
  visitor_name text not null default 'Visitante',
  content text not null,
  categories text[] not null default '{}',
  is_valid boolean generated always as (char_length(trim(content)) >= 100) stored,
  created_at timestamptz not null default now(),
  constraint public_comments_content_min check (char_length(trim(content)) >= 4)
);

create index if not exists idx_public_comments_work_id
  on public.public_comments(work_id);

alter table public.public_likes enable row level security;
alter table public.public_comments enable row level security;

drop policy if exists "public read likes" on public.public_likes;
create policy "public read likes"
on public.public_likes
for select
to anon, authenticated
using (true);

drop policy if exists "public insert likes" on public.public_likes;
create policy "public insert likes"
on public.public_likes
for insert
to anon, authenticated
with check (char_length(trim(visitor_id)) >= 8);

drop policy if exists "public delete likes" on public.public_likes;
create policy "public delete likes"
on public.public_likes
for delete
to anon, authenticated
using (char_length(trim(visitor_id)) >= 8);

drop policy if exists "public read comments" on public.public_comments;
create policy "public read comments"
on public.public_comments
for select
to anon, authenticated
using (true);

drop policy if exists "public insert comments" on public.public_comments;
create policy "public insert comments"
on public.public_comments
for insert
to anon, authenticated
with check (
  char_length(trim(visitor_id)) >= 8
  and char_length(trim(content)) >= 4
);

