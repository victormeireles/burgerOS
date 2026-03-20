# 🚀 PRD + BUILD PROMPT — BURGEROS

## 🎯 CONTEXTO

Você está construindo o **BurgerOS**, um sistema com inteligência artificial focado exclusivamente em donos de hamburgueria.

O BurgerOS será um **“Sistema Operacional da Hamburgueria”**, combinando:

* IA conversacional (chat estilo ChatGPT)
* Base de dados proprietária do nicho
* Benchmarking de mercado
* Conteúdo estratégico
* Futuramente: automações e agentes

O objetivo é permitir que donos de hamburgueria tomem melhores decisões, aumentem lucro e operem melhor usando dados e IA.

---

## 🧠 PROBLEMA

Donos de hamburgueria hoje:

* Tomam decisões no feeling
* Não sabem se estão pagando caro em insumos
* Não têm benchmark de mercado
* Não sabem o que postar ou como crescer
* Não têm acesso fácil a conhecimento estruturado do nicho

---

## 💡 SOLUÇÃO (MVP)

Criar um sistema onde o usuário pode:

1. Fazer perguntas sobre sua operação
2. Receber respostas baseadas em:

   * dados reais do mercado
   * boas práticas
   * conteúdo estruturado
3. Ter recomendações práticas e acionáveis

---

## 👤 USUÁRIO

* Dono de hamburgueria
* Pequeno ou médio porte
* Não técnico
* Usa WhatsApp diariamente
* Quer ganhar mais dinheiro e ter clareza

---

## 🔥 PROPOSTA DE VALOR

“Pergunte qualquer coisa sobre sua hamburgueria e receba respostas baseadas em dados reais do mercado + IA”

---

## 🧱 FUNCIONALIDADES (MVP)

### 1. Chat principal (core do produto)

* Interface simples estilo ChatGPT
* Histórico de conversas
* Input de texto

---

### 2. Sistema de resposta com RAG (Retrieval-Augmented Generation)

O sistema deve:

1. Receber pergunta do usuário
2. Identificar intenção (classificação)
3. Buscar dados relevantes nas bases
4. Montar contexto
5. Gerar resposta com LLM

---

### 3. Tipos de perguntas suportadas

* Preço de insumos:

  * “Quanto estão pagando no pão brioche 65g em SP?”
* Operação:

  * “Qual margem ideal?”
* Marketing:

  * “O que postar essa semana?”
* Crescimento:

  * “Como aumentar ticket médio?”

---

### 4. Tipos de resposta

* Diretas e práticas
* Sempre com contexto de mercado
* Quando possível:

  * ranges (ex: preços)
  * sugestões acionáveis

---

## 📚 BASE DE CONHECIMENTO

### 1. Base estruturada (CRÍTICA)

Criar tabelas para:

* preços de insumos (por região)
* fornecedores
* volumes médios
* custos operacionais

Campos exemplo:

* produto
* gramatura
* preço_min
* preço_max
* região
* data

---

### 2. Base de conteúdo

* posts virais
* boas práticas
* playbooks

Formato:

* texto + embedding

---

### 3. Base de conhecimento manual

* insights do especialista
* aprendizados
* recomendações

---

## 🧠 LÓGICA DE RAG

Ao receber uma pergunta:

1. Classificar tipo:

   * preço
   * operação
   * marketing
   * geral

2. Buscar nas fontes relevantes:

   * structured DB
   * vector DB

3. Montar contexto

4. Enviar para LLM com prompt estruturado

---

## ✍️ PROMPT DO SISTEMA (LLM)

A IA deve:

* falar como especialista em hamburguerias
* ser prática e direta
* evitar respostas genéricas
* sempre priorizar dados reais quando disponíveis
* nunca inventar números
* usar ranges quando necessário
* sugerir ações claras

---

## 🏗️ STACK TECNOLÓGICO

* Frontend: Next.js
* Backend: Node.js (API routes)
* Banco:

  * Supabase (Postgres)
  * Vector DB (pgvector ou similar)
* LLM: OpenAI API (ou equivalente)
* Auth: Supabase Auth

---

## 📱 UI (simples e funcional)

Tela principal:

* Chat central
* Sidebar com histórico
* Input fixo embaixo

---

## 🔐 REGRAS IMPORTANTES

* Nunca expor dados individuais de clientes
* Sempre usar dados agregados
* Garantir anonimização
* Evitar respostas inventadas

---

## 🚀 ROADMAP FUTURO (não implementar agora)

* Integração com WhatsApp
* Agentes:

  * postar conteúdo
  * sugerir compras
* Dashboard de benchmarking
* Alertas automáticos

---

## 🎯 O QUE VOCÊ (CURSOR) DEVE FAZER

1. Propor arquitetura detalhada do sistema
2. Criar estrutura de banco de dados
3. Implementar backend com RAG
4. Criar frontend do chat
5. Integrar com LLM
6. Criar exemplos de seed de dados
7. Garantir código limpo e escalável
8. Sugerir melhorias incrementais

---

## ⚠️ PRIORIDADE

* Simplicidade > complexidade
* Entregar valor rápido
* Evitar overengineering

---

## 🎯 OBJETIVO FINAL

Ter um MVP funcional onde:

* usuário entra
* faz uma pergunta
* recebe uma resposta útil, baseada em dados
* percebe valor imediatamente

---

Construa isso passo a passo.
Explique decisões importantes.
Sempre priorize clareza e velocidade de execução.
