-- Run in Supabase SQL editor or through Supabase CLI.

create table if not exists public.user_script_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  script_id text not null,
  progress jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id, script_id)
);

create index if not exists user_script_progress_user_id_idx
  on public.user_script_progress (user_id);

alter table public.user_script_progress enable row level security;

create policy "user_script_progress_select_own"
  on public.user_script_progress for select
  using (auth.uid() = user_id);

create policy "user_script_progress_insert_own"
  on public.user_script_progress for insert
  with check (auth.uid() = user_id);

create policy "user_script_progress_update_own"
  on public.user_script_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_script_progress_delete_own"
  on public.user_script_progress for delete
  using (auth.uid() = user_id);

create or replace function public.set_user_script_progress_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_user_script_progress_updated_at on public.user_script_progress;
create trigger trg_user_script_progress_updated_at
  before update on public.user_script_progress
  for each row
  execute function public.set_user_script_progress_updated_at();
