alter table public.audio_files
add column path text;

--  If path is empty but url exists, try to extract path from url
-- (works if url format is like: .../object/public/bucket/path)
update public.audio_files
set path = regexp_replace(url, '^.*/object/[^/]+/', '')
where path is null
and url is not null;


-- every file must have a path (run only after backfilling existing rows)
alter table public.audio_files
alter column path set not null;

-- index for faster lookup
create index if not exists idx_audio_files_path
on public.audio_files(path);

-- a unique constraint:
create unique index if not exists idx_audio_files_user_path_unique
on public.audio_files(user_id, path);