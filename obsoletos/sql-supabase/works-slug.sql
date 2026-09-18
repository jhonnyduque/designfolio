-- Add unique slug support for public project URLs.
-- Run in Supabase SQL Editor.

create extension if not exists unaccent;

alter table public.works
  add column if not exists slug text;

-- Backfill existing rows from title.
with base as (
  select
    id,
    lower(regexp_replace(
      regexp_replace(
        unaccent(coalesce(title, '')),
        '[^a-zA-Z0-9\s-]', '',
        'g'
      ),
      '\s+',
      '-',
      'g'
    )) as base_slug
  from public.works
),
ranked as (
  select
    id,
    case
      when base_slug is null or base_slug = '' then 'proyecto'
      else trim(both '-' from regexp_replace(base_slug, '-{2,}', '-', 'g'))
    end as normalized_slug,
    row_number() over (
      partition by case
        when base_slug is null or base_slug = '' then 'proyecto'
        else trim(both '-' from regexp_replace(base_slug, '-{2,}', '-', 'g'))
      end
      order by id
    ) as rn
  from base
)
update public.works w
set slug = case
  when ranked.rn = 1 then ranked.normalized_slug
  else ranked.normalized_slug || '-' || substring(w.id::text, 1, 8)
end
from ranked
where w.id = ranked.id
  and (w.slug is null or w.slug = '');

-- Enforce slug rules
alter table public.works
  alter column slug set not null;

create unique index if not exists works_slug_key
  on public.works(slug);
