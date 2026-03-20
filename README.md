# BurgerOS V1.1

MVP com chat sem login + gestão de bases de conhecimento com resumo/perguntas automáticas e RAG via chunks + embeddings.

## 1) Instalação

```bash
npm install
```

## 2) Variáveis de ambiente

1. Copie `.env.example` para `.env.local`
2. Preencha os valores de Supabase e OpenAI (incluindo `OPENAI_EMBEDDING_MODEL`)

## 3) Banco de dados no Supabase

1. Abra o SQL Editor do Supabase
2. Execute o conteúdo de `supabase/schema.sql` (base inicial)
3. Execute as migrations de `supabase/migrations/*.sql` para habilitar RAG

## 4) Rodar local

```bash
npm run dev
```

## Rotas principais

- `/` chat inicial
- `/knowledge` cadastro de base de conhecimento
