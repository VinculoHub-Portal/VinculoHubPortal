# QA Report — VinculoHubPortal

Testado em: 2026-05-31  
Ambiente: Docker Compose local (`http://localhost`)  
Logins testados: ONG (`ong@ong.com`) e Empresa (`empresa@empresa.com`)

---

## Bugs em aberto

### BUG-01 — Ícone 👁 na tabela do dashboard ONG não navega para detalhes do projeto

**Página:** `/ong/dashboard`  
**Seção:** "Status dos Projetos" — coluna "Ações"  
**Comportamento atual:** Clicar no ícone de olho (👁) não faz nada visível. A URL permanece em `/ong/dashboard`.  
**Comportamento esperado:** Navegar para `/projeto/:id` com os detalhes do projeto correspondente.  
**Severidade:** Média — a funcionalidade existe via `/ong/projetos`, mas o atalho direto do dashboard está quebrado.

---

## O que foi testado e está funcionando

| Fluxo | Status |
|---|---|
| Landing page | ✅ |
| Login ONG (Auth0 → `/ong/dashboard`) | ✅ |
| Login Empresa (Auth0 → `/empresa/dashboard`) | ✅ |
| Logout via botão "Sair" | ✅ |
| Dashboard ONG — stats, tabela, filtros (Todos/Ativos/Em Captação), banner | ✅ |
| Modal "Cadastrar Novo Projeto" — campos, validação obrigatória, erro "Selecione ao menos um ODS" | ✅ |
| `/ong/projetos` — listagem, contadores (Total/Leis de Incentivo/Investimento Privado) | ✅ |
| Botão "Detalhes do Projeto" → `/projeto/:id` | ✅ |
| Botão "Editar Projeto" → `/ong/projetos/:id/editar` | ✅ |
| `/projeto/:id` — tipo, valor, descrição, ODS tags, barra de progresso | ✅ |
| Dashboard Empresa — investimento disponível, projetos apoiados, ESG, métricas | ✅ |
| `/empresa/leis-de-incentivo` — listagem de projetos com progresso de captação | ✅ |
| `/empresa/investimento-social-privado` — listagem + seção "Como funciona" | ✅ |
| Título da aba do browser — "VinculoHub Portal" | ✅ |
