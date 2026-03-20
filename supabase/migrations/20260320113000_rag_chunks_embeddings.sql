create extension if not exists vector;

create table if not exists public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  knowledge_base_id uuid not null references public.knowledge_bases (id) on delete cascade,
  chunk_index integer not null,
  chunk_text text not null,
  embedding vector(1536) not null,
  created_at timestamptz not null default now(),
  unique (knowledge_base_id, chunk_index)
);

create index if not exists idx_knowledge_chunks_base_id on public.knowledge_chunks (knowledge_base_id);
create index if not exists idx_knowledge_chunks_embedding on public.knowledge_chunks using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

alter table public.knowledge_chunks enable row level security;

drop policy if exists "Public read knowledge chunks" on public.knowledge_chunks;
create policy "Public read knowledge chunks"
on public.knowledge_chunks
for select
to anon, authenticated
using (true);

create or replace function public.match_knowledge_chunks(
  query_embedding vector(1536),
  match_count int default 8,
  min_similarity float default 0.2
)
returns table (
  id uuid,
  knowledge_base_id uuid,
  chunk_index int,
  chunk_text text,
  similarity float
)
language sql
stable
as $$
  select
    kc.id,
    kc.knowledge_base_id,
    kc.chunk_index,
    kc.chunk_text,
    1 - (kc.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks kc
  where 1 - (kc.embedding <=> query_embedding) >= min_similarity
  order by kc.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;
