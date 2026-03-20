create extension if not exists "pgcrypto";

create table if not exists public.knowledge_bases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  raw_text text not null,
  short_summary text not null,
  usage_guidance text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.suggested_questions (
  id uuid primary key default gen_random_uuid(),
  knowledge_base_id uuid not null references public.knowledge_bases (id) on delete cascade,
  question_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_suggested_questions_kb_id on public.suggested_questions (knowledge_base_id);
create index if not exists idx_knowledge_bases_created_at on public.knowledge_bases (created_at desc);

alter table public.knowledge_bases enable row level security;
alter table public.suggested_questions enable row level security;

drop policy if exists "Public read suggested questions" on public.suggested_questions;
create policy "Public read suggested questions"
on public.suggested_questions
for select
to anon, authenticated
using (true);
