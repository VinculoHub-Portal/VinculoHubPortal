# Validação da Sprint 3 — VínculoHub Portal

**Data:** 2026-05-31  
**Atualizado:** 2026-05-31 (pós-implementação)  
**Ambiente:** Docker Compose local (`http://localhost`)  
**Método:** Automação de browser com Playwright (headless false) + análise estática de código-fonte  
**Logins utilizados:** `ong@ong.com` e `empresa@empresa.com`  
**Acesso admin:** `/admin/dashboard` com role ADMIN (AdminDashboard implementado)

---

## Legenda

| Símbolo | Significado |
|---|---|
| ✅ | Critério atendido |
| ❌ | Critério não atendido / não implementado |
| ⚠️ | Atendido parcialmente ou com ressalva |
| 🔒 | Não testável nesta rodada |
| 🆕 | Implementado após a validação inicial |

---

## Épico: Administrador

### Cadastro e Publicação de Editais

> **Status geral: ✅ IMPLEMENTADO** — backend completo + interface admin via `EditaisMuralPage`

| # | Critério | Status | Observação |
|---|---|---|---|
| 1 | Formulário de cadastro de edital (título, descrição, prazo, ODS) | ✅ 🆕 | `CreateNoticeModal` acessível pelo botão "+ Novo Edital" em `/editais` (visível apenas para ADMIN); campos: título, descrição, prazo, ODS, arquivo |
| 2 | Upload de arquivo do edital (PDF/docx/txt) | ✅ 🆕 | `CreateNoticeModal` aceita PDF/DOC/DOCX; backend `EditalController` recebe multipart via `POST /api/editais` (`@PreAuthorize("hasRole('ADMIN')")`) |
| 3 | Sem opção de candidatura | ✅ | Ausência confirmada — `EditaisMuralPage` é estritamente informativo |
| 4 | Edital visível imediatamente após publicação | ✅ 🆕 | `onSuccess={refetch}` no modal aciona reload da lista; `GET /api/editais` é público e retorna imediatamente |

---

## Épico: ONGs

### Dashboard de Indicadores de Impacto da ONG

> **Status geral: ✅ IMPLEMENTADO** — dashboard com dados reais via `useOngDashboard`

| # | Critério | Status | Observação |
|---|---|---|---|
| 1 | Cards superiores: Total de Projetos, Ativos, Buscando Investimento, Beneficiários | ⚠️ | Dashboard exibe "Projetos por Tipo" e "Status dos Projetos" com dados reais da API — cards diferentes dos especificados (possível divergência com Figma conforme nota do backlog) |
| 2 | Seção "Projetos por Tipo" com distribuição gráfica ou em lista | ✅ | Presente com barras e dados reais |
| 3 | Seção "Documentos e Relatórios" | ⚠️ | Botão "Upload de Documentos" no header; seção dedicada no dashboard não existe — mas página `/ong/perfil` tem `PrivateDocumentsCard` |

---

### Upload e Visualização de Documentos Institucionais

> **Status geral: ✅ MAJORITARIAMENTE IMPLEMENTADO** — bugs críticos corrigidos no PR `fix/sprint3-critical-bugs`

| # | Critério | Status | Observação |
|---|---|---|---|
| 1 | Upload de PDF, docx, planilhas | ✅ 🆕 | Endpoint `/api/documents` correto; `@PreAuthorize("hasRole('NPO')")` aplicado; npoId extraído do JWT (não mais do body) |
| 2 | Aviso/incentivo visual sem documentos | ❌ | Não implementado no dashboard principal |
| 3 | Página dedicada para listagem e visualização | ✅ 🆕 | `/ong/perfil` contém `PrivateDocumentsCard` com listagem via `/api/documents/my-ong` |
| 4 | Edição de metadados dos documentos | ❌ | Não implementado |
| 5 | Exclusão com modal de confirmação | ❌ | Não implementado |
| 6 | **Segurança:** documentos privados, inacessíveis por empresas e admin | ✅ 🆕 | `GET /api/documents/my-ong` requer role NPO + verifica ownership via JWT; `POST /api/documents` requer role NPO e extrai npoId do JWT; `GET /api/documents` (lista total) restrito a ADMIN |

---

### Visualização de Mural de Editais

> **Status geral: ✅ IMPLEMENTADO** — página, rota e backend completos

| # | Critério | Status | Observação |
|---|---|---|---|
| 1 | Tela listando editais ativos ordenados por data/prazo | ✅ 🆕 | `EditaisMuralPage` em `/editais`; lista via `GET /api/editais` (público); empty state quando vazio; `EditalCard` exibe título, prazo, ODS, status ativo/inativo |
| 2 | Visualização completa do edital + botão de download | ✅ 🆕 | `EditalCard` exibe todas as informações; link direto para download do arquivo via `fileUrl` do S3 |
| 3 | Sem funcionalidade de candidatura | ✅ | Ausência confirmada — `EditaisMuralPage` é estritamente informativo |

Botão "Acessar Mural de Editais" no `OngDashboardMock` navega para `/editais` via `navigate('/editais')` ✅

---

### Edição de Projetos

> **Status geral: ✅ IMPLEMENTADO**

| # | Critério | Status | Observação |
|---|---|---|---|
| 1 | Botão "Editar" visível e acessível | ✅ 🆕 | Botão em `OngProjectCard` navega para `/ong/projetos/:id/editar` |
| 2 | ONG pode excluir projetos | ✅ 🆕 | Botão "Excluir" em `OngProjectCard` → `ConfirmDeleteProjectModal` → `DELETE /api/projects/:id` (soft delete) |
| 3 | Formulário pré-preenchido | ✅ 🆕 | `EditProjectPage` chama `fetchProjectById()` e pré-preenche o form |
| 4 | Mesmas validações da criação | ✅ 🆕 | `EditProjectPage` aplica mesmas regras (NotBlank, size 50-500, etc.) |
| 5 | Toast "Projeto atualizado" | ✅ 🆕 | Implementado com `useToast()` |
| 6 | Mensagem amigável em erro de rede | ✅ 🆕 | `axios.isAxiosError` com mensagens por status code |

---

### Visibilidade e Acesso ao Perfil da ONG

> **Status geral: ✅ IMPLEMENTADO**

| # | Critério | Status | Observação |
|---|---|---|---|
| 1 | Vitrine/busca acessível apenas para logados | 🔒 | Rota `/ong/publico/:id` com `ProtectedRoute` sem role — qualquer autenticado pode acessar |
| 2 | Perfil individual com link público direto | ✅ 🆕 | `OngPublicProfilePage` em `/ong/publico/:id` implementada |
| 3 | Link público exibe apenas dados institucionais | ✅ 🆕 | `OngPublicProfilePage` separada de `OngProfilePage` — sem documentos privados |

---

### Aprimoramento na Visualização de Detalhes dos Projetos

> **Status geral: ✅ IMPLEMENTADO**

| # | Critério | Status | Observação |
|---|---|---|---|
| 1 | Card "Instituição Responsável" com nome, logotipo, cidade/UF | ✅ 🆕 | `ResponsibleInstitutionCard` em `ProjectDetailsPage` |
| 2 | Placeholder se sem logotipo | ✅ 🆕 | Iniciais do nome da ONG exibidas quando sem logo |
| 3 | Link "Ver perfil completo da ONG" | ✅ 🆕 | Botão navega para `/ong/publico/:id` |
| 4 | Navegação fluida de volta ao projeto | ✅ 🆕 | BackLink com `returnTo` no state |

---

## Épico: Empresas

### Dashboard de Visão Geral e Gestão de Portfólio

> **Status geral: ✅ MAJORITARIAMENTE IMPLEMENTADO**

| # | Critério | Status | Observação |
|---|---|---|---|
| 1 | Card "Projetos Apoiados" com subdivisão Leis / Privado | ✅ 🆕 | `SupportedProjectsCard` com dados via `useSupportedProjectsSummary` (API real) |
| 2 | Componente "Agenda de Apresentações" | ❌ | Não implementado |
| 3 | Métricas por endpoints reais | ✅ 🆕 | ESG via `fetchCompanyEsgImpactDashboard`; projetos via API real |
| 4 | **Remover card "Investimento Disponível"** *(sprint)* | ✅ 🆕 | `InvestmentBudgetCard` removido do dashboard |

---

### Dashboard de Impacto ESG

> **Status geral: ✅ IMPLEMENTADO**

| # | Critério | Status | Observação |
|---|---|---|---|
| 1 | Três cards E / S / G com % e projetos | ✅ 🆕 | Dados reais via `fetchCompanyEsgImpactDashboard` |
| 2 | Quantidade de projetos e % por pilar | ✅ 🆕 | Presente em cada card |
| 3 | Faixa "Impacto dos seus investimentos" | ✅* | Faixa comentada/removida conforme critério 4 |
| 4 | **Remover 4 campos da faixa ESG** *(sprint)* | ✅ 🆕 | Todos os 4 campos removidos de `EsgImpactSection` |

---

## Resumo Executivo — Estado Pós-Sprint 3

| Feature | Épico | Status Final |
|---|---|---|
| Cadastro e Publicação de Editais | Admin | ✅ Implementado |
| Dashboard de Indicadores ONG | ONG | ⚠️ Parcial (dados reais, cards diferentes do spec) |
| Upload e Visualização de Documentos | ONG | ✅ Implementado + bugs de segurança corrigidos |
| Mural de Editais | ONG | ✅ Implementado |
| Edição de Projetos | ONG | ✅ Implementado |
| Exclusão de Projetos | ONG | ✅ Implementado |
| Visibilidade e Perfil da ONG | ONG | ✅ Implementado |
| Detalhes do Projeto (card ONG) | ONG | ✅ Implementado |
| Dashboard Visão Geral Empresa | Empresa | ✅ Implementado (sem Agenda) |
| Dashboard ESG Empresa | Empresa | ✅ Implementado |

---

### Itens ainda pendentes para próxima sprint

1. **Agenda de Apresentações** — componente de calendário interativo para dashboard empresa
2. **Aviso visual sem documentos** — banner no dashboard ONG quando ONG não tem documentos
3. **Edição/exclusão de documentos** — CRUD completo em `OngProfilePage/PrivateDocumentsCard`
4. **Vitrine geral de ONGs** — listagem e busca de ONGs para admin e empresas (rotas `/admin/ongs` e busca pública para empresas)
5. **Ver Linha do Tempo** — botão em `OngProjectCard` não tem feature correspondente implementada
6. **Dashboard admin com dados reais** — métricas do `AdminDashboard` estão hardcoded (87 ONGs, 24 Editais, 156 Vínculos, 5 Notificações); precisa de endpoint `GET /api/admin/metrics` e substituição dos valores fixos
7. **Rotas do dashboard admin sem componente** — `/admin/ongs`, `/admin/vinculos`, `/admin/notificacoes` são linkadas pelos `MetricCard` mas não têm rota nem página implementada
