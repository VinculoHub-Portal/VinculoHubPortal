# Code Review — VinculoHub Portal

**Atualizado:** 2026-06-01  
**Base:** `fix/sprint3-critical-bugs` (Sprint 3 completa + correções de bugs)  
**Escopo:** Full-stack — React/TypeScript frontend + Spring Boot backend

---

## Stack

| Camada | Stack |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Auth0 SPA SDK |
| Backend | Spring Boot 3.4.3 + Java 17 + JPA/Hibernate + PostgreSQL 16 + AWS S3 |
| Auth | Auth0 (OAuth2/JWT) — custom claim `https://vinculohub/roles` |
| Infra | Docker Compose (nginx, Spring Boot, PostgreSQL 16, Flyway) |
| CI | GitHub Actions: lint → docker-build-check → test (Maven) |

---

## Segurança — itens em aberto

### `AuthTestController` expõe internals do JWT em `/api/me`

**Arquivo:** `backend/.../controller/AuthTestController.java`  
**Severidade:** INFO

Endpoint de debug (`GET /api/me`) que retorna subject, email, issuer, audience, escopos e roles do token. Está protegido por role ADMIN, mas deve ser removido ou condicionado ao profile `dev` antes de qualquer release público.

---

## Débito técnico

### CompanyDashboard parcialmente mockado

**Arquivo:** `frontend/src/pages/CompanyDashboard/mockData.ts`

`SupportedProjectsCard` já usa API real (`useSupportedProjectsSummary`). Os demais mocks ainda não têm endpoint:

| Mock | Endpoint necessário |
|---|---|
| `mockCompanyName` | Estender `GET /api/me/profile` com `companyName` |
| `mockBudget` | `GET /api/me/company/budget` — `Company` sem campo de orçamento |
| `mockEsgPillars` | `GET /api/me/company/esg-pillars` — flags ESG estão em `Npo`, não em `Project` |
| `mockEsgFooterStats` | `GET /api/me/company/impact-stats` — campos de impacto em `Project` inexistentes |

---

### Dashboard admin com métricas hardcoded

**Arquivo:** `frontend/src/pages/AdminDashboard/index.tsx` (linhas 23–56)

As 4 métricas (Total de ONGs: 87, Editais Publicados: 24, Vínculos Ativos: 156, Notificações Pendentes: 5) são valores fixos. Não há chamada de API.

**Fix:** Endpoint `GET /api/admin/metrics` no backend + estado dinâmico no componente.

---

### Rotas do dashboard admin sem página

**Arquivo:** `frontend/src/router/index.tsx`, `frontend/src/pages/AdminDashboard/index.tsx`

`MetricCard` linka para `/admin/ongs`, `/admin/vinculos` e `/admin/notificacoes`, mas nenhuma dessas rotas existe no router.

**Fix:** Começar por `/admin/ongs` — listagem de ONGs para admin e empresas.

---

### `ComponentsPage` pública em produção

**Arquivo:** `frontend/src/router/index.tsx`

```tsx
<Route path="/components" element={<ComponentsPage />} />
```

Página de dev tool acessível sem autenticação. Não é vulnerabilidade, mas polui o bundle de produção.

---

### Agenda de Apresentações não implementada

Componente de calendário interativo previsto no backlog do épico Empresa. Sem estimativa de implementação ainda.

---

### Aviso visual sem documentos no dashboard ONG

Banner no dashboard ONG quando a ONG ainda não enviou documentos. Não implementado.

---

### Edição e exclusão de documentos

CRUD completo em `OngProfilePage/PrivateDocumentsCard` — edição de metadados e exclusão com modal de confirmação não implementados.

---

### Vitrine de ONGs

Listagem e busca de ONGs para admin (`/admin/ongs`) e para empresas. Não há rota, página ou endpoint de listagem.

---

### Contradição interna no backlog — critérios 3 ↔ 4 do ESG

O backlog da Sprint 3 lista dois critérios opostos para o épico "Dashboard de Impacto ESG": o critério 3 pede a faixa completa, o critério 4 manda remover os mesmos campos. Isso deve ser documentado no backlog para evitar regressão futura.

---

### CI — Testes de frontend ausentes no pipeline

**Arquivo:** `.github/workflows/ci-pipeline.yml`

O pipeline roda lint, docker-build-check e testes Maven, mas não executa Vitest. Cobertura de frontend fica fora do gate de CI.

---

### JaCoCo sem coverage gate

JaCoCo está configurado no backend mas não há threshold mínimo definido no pipeline. Cobertura pode cair silenciosamente.

---

## Integração frontend↔backend

| Endpoint | Status | Observação |
|---|---|---|
| `GET /api/projects` | ✅ | Paginação + filtros funcionais |
| `GET /api/projects/:id` | ✅ | Página de detalhes |
| `POST /api/npo-accounts` | ✅ | Wizard de cadastro ONG |
| `POST /api/company-accounts` | ✅ | Cadastro empresa |
| `GET /api/me/profile` | ✅ | Redirecionamento por role |
| `GET /api/ods` | ✅ | Seleção de ODS no cadastro |
| `GET /cep/**`, `/cnpj/**` | ✅ | Validações públicas |
| `POST /api/documents` | ✅ | Upload com `@PreAuthorize("hasRole('NPO')")`, npoId via JWT |
| `GET /api/documents/my-ong` | ✅ | Listagem privada com ownership check |
| `GET /api/documents` | ✅ | Restrito a ADMIN |
| `GET /api/editais` | ✅ | Público; retorna presigned URL do S3 |
| `POST /api/editais` | ✅ | Criação restrita a ADMIN |
| `GET /api/npo-accounts` | ✅ | Export CSV; restrito a ADMIN |
| `GET /api/companies` | ✅ | Export CSV; restrito a ADMIN |
| `GET /api/me/company/*` | ❌ | Dashboard empresa parcialmente mock |
| `GET /api/admin/metrics` | ❌ | Não existe; dashboard admin hardcoded |

---

## CI/CD e infraestrutura

**Pipeline:** lint → docker-build-check → test (Maven unitário)

**Docker Compose:** Healthcheck no PostgreSQL antes do backend subir; Flyway antes do Spring. Credenciais padrão em `.env.example` aceitáveis para local — devem ser sobrescritas em produção.

---

## PR #245 — feat(admin): export NGO and company lists as CSV

**Branch:** `feat/data-exportation-admin` → `development`  
**Mergeado em:** 2026-05-31

### O que o PR faz

- **Backend:** 2 endpoints ADMIN-only (`GET /api/npo-accounts`, `GET /api/companies`) com `NpoExportDTO`, `CompanyExportDTO` e `findAllForExport()` transacional (read-only)
- **Frontend:** `api/admin.ts`, `utils/exportCsv.ts` com proteção contra formula injection e BOM UTF-8 para Excel, botão "Exportar Dados" no `AdminDashboard`

### Bug encontrado e corrigido antes do merge

O PR adicionava `export function AdminDashboard()` como uma **segunda declaração** dentro do componente existente, com 5 imports duplicados. Fix: imports consolidados, constantes movidas para escopo de módulo, estado/handlers fundidos no componente único (commit `ac73ccf`).

### Pontos de atenção (não bloqueadores)

- `NpoExportDTO` inclui `cpf` — dado sensível exposto apenas a ADMIN (aceitável)
- `companyRepository.findAll()` e `npoRepository.findAll()` carregam toda a tabela em memória — aceitável para volumes de startup, pode precisar de paginação no futuro
