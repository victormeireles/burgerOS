create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  question_text text not null,
  answer_text text,
  status text not null check (status in ('success', 'error')),
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_sessions_updated_at on public.chat_sessions (updated_at desc);
create index if not exists idx_chat_messages_session_created_at on public.chat_messages (session_id, created_at desc);

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "Public read chat sessions" on public.chat_sessions;
create policy "Public read chat sessions"
on public.chat_sessions
for select
to anon, authenticated
using (true);

drop policy if exists "Public read chat messages" on public.chat_messages;
create policy "Public read chat messages"
on public.chat_messages
for select
to anon, authenticated
using (true);

create or replace function public.touch_chat_session_updated_at()
returns trigger
language plpgsql
as $$
begin
  update public.chat_sessions
  set updated_at = now()
  where id = new.session_id;
  return new;
end;
$$;

drop trigger if exists trg_touch_chat_session_updated_at on public.chat_messages;
create trigger trg_touch_chat_session_updated_at
after insert on public.chat_messages
for each row
execute function public.touch_chat_session_updated_at();
