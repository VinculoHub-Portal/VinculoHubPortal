# QA Report — VinculoHubPortal

Testado em: 2026-05-31  
Ambiente: Docker Compose local (`http://localhost`)  
Logins testados: ONG (`ong@ong.com`) e Empresa (`empresa@empresa.com`)

---

## Bugs Encontrados

### BUG-01 — Ícone 👁 na tabela do dashboard ONG não navega para detalhes do projeto

**Página:** `/ong/dashboard`  
**Seção:** "Status dos Projetos" — coluna "Ações"  
**Comportamento atual:** Clicar no ícone de olho (👁) não faz nada visível. A URL permanece em `/ong/dashboard`.  
**Comportamento esperado:** Navegar para `/projeto/:id` com os detalhes do projeto correspondente.  
**Severidade:** Média — a funcionalidade existe via `/ong/projetos`, mas o atalho direto do dashboard está quebrado.

---

### BUG-02 — Botão "Ver Linha do Tempo" não abre nada

**Página:** `/ong/projetos`  
**Comportamento atual:** Clicar em "Ver Linha do Tempo" em qualquer card de projeto não abre modal, não navega, e não produz nenhuma ação visível. A página fica exatamente como estava.  
**Comportamento esperado:** Abrir um modal ou navegar para uma página com a linha do tempo do projeto.  
**Severidade:** Alta — feature inacessível.

---

### BUG-03 — Botão "Editar Projeto" não abre nada

**Página:** `/ong/projetos`  
**Comportamento atual:** Clicar em "Editar Projeto" em qualquer card de projeto não abre modal, não navega, e não produz nenhuma ação visível.  
**Comportamento esperado:** Abrir um formulário (modal ou página) para editar os dados do projeto.  
**Severidade:** Alta — feature inacessível.

---

### BUG-04 — Título da aba do browser é "frontend"

**Páginas:** Todas  
**Comportamento atual:** O `<title>` da página é literalmente `"frontend"` (nome do pacote npm), exibido na aba do browser.  
**Comportamento esperado:** Um título descritivo como `"VinculoHub Portal"` ou `"VinculoHub | Dashboard"`.  
**Severidade:** Baixa — cosmético, mas visível ao usuário final.

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
| `/projeto/:id` — tipo, valor, descrição, ODS tags, barra de progresso | ✅ |
| Dashboard Empresa — investimento disponível, projetos apoiados, ESG, métricas | ✅ |
| `/empresa/leis-de-incentivo` — listagem de projetos com progresso de captação | ✅ |
| `/empresa/investimento-social-privado` — listagem + seção "Como funciona" | ✅ |
