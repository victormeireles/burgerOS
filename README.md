# BurgerOS V1

MVP com chat sem login + gestão de bases de conhecimento com geração automática de resumo e perguntas sugeridas.

## 1) Instalação

```bash
npm install
```

## 2) Variáveis de ambiente

1. Copie `.env.example` para `.env.local`
2. Preencha os valores de Supabase e OpenAI

## 3) Banco de dados no Supabase

1. Abra o SQL Editor do Supabase
2. Execute o conteúdo de `supabase/schema.sql`

## 4) Rodar local

```bash
npm run dev
```

## Rotas principais

- `/` chat inicial
- `/knowledge` cadastro de base de conhecimento
