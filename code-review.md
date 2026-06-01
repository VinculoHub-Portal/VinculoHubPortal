# Code Review — VinculoHub Portal

**Data:** 2026-05-31 (atualizado após ciclo de implementação)  
**Branch:** `main` (commit `a3ab27c`) + `development` (Sprint 3 implementada) + PR `fix/sprint3-critical-bugs` (segurança)  
**Escopo:** Full-stack — React/TypeScript frontend + Spring Boot backend  
**Método:** Análise estática de código-fonte + validação dinâmica com Playwright (sprint3-validation.md)

---

## Índice

1. [Visão geral do projeto](#1-visão-geral-do-projeto)
2. [Segurança](#2-segurança)
3. [Bugs introduzidos](#3-bugs-introduzidos)
4. [Qualidade de código e débito técnico](#4-qualidade-de-código-e-débito-técnico)
5. [Integração frontend↔backend](#5-integração-frontendbackend)
6. [CI/CD e infraestrutura](#6-cicd-e-infraestrutura)
7. [Validação da Sprint 3](#7-validação-da-sprint-3)
8. [Resumo por severidade](#8-resumo-por-severidade)
9. [PR #245 — CSV export admin (revisado e mergeado)](#9-pr-245--featadmin-export-ngo-and-company-lists-as-csv)

---

## 1. Visão geral do projeto

| Camada | Stack |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Auth0 SPA SDK |
| Backend | Spring Boot 3.4.3 + Java 17 + JPA/Hibernate + PostgreSQL 16 + AWS S3 |
| Auth | Auth0 (OAuth2/JWT) — custom claim `https://vinculohub/roles` |
| Infra | Docker Compose (nginx, Spring Boot, PostgreSQL 16, Flyway) |
| CI | GitHub Actions: lint → docker-build-check → test |

**Pontos fortes:**
- Queries SQL seguras via JPA Criteria API (zero risco de SQL injection)
- CORS configurado corretamente com origens explícitas e `allowCredentials`
- ProtectedRoute + requiredRole funcionais para todas as rotas implementadas
- TODO comments em `mockData.ts` documentam contratos de endpoint futuros com clareza
- Hooks de pre-push com Spotless + PMD + SpotBugs

---

## 2. Segurança

### 2.1 [CRÍTICO] IDOR em `DocumentController` — documentos de qualquer ONG acessíveis por qualquer usuário autenticado

**Arquivo:** `backend/.../controller/DocumentController.java:27-35`  
**Arquivo:** `backend/.../service/DocumentService.java:86-99`

O critério de aceite do backlog da Sprint 3 é explícito:

> *"Os arquivos enviados devem ser estritamente privados; o acesso e download só podem ser realizados pela conta da própria ONG. Empresas investidoras e o Administrador da plataforma não devem ter acesso a esses documentos ou suas rotas em nenhuma tela."*

O que está implementado:

```java
// DocumentController.java:27-35
@GetMapping
public ResponseEntity<List<DocumentResponseDTO>> getDocuments(
        @RequestParam(required = false) Integer npoId,
        @RequestParam(required = false) Integer projectId) {
    List<DocumentResponseDTO> documents = documentService.findAll(npoId, projectId);
    return ResponseEntity.ok(documents);
}

// DocumentService.java:86-99
public List<DocumentResponseDTO> findAll(Integer npoId, Integer projectId) {
    if (npoId != null && projectId != null) {
        documents = documentRepository.findByNpo_IdAndProject_Id(npoId, projectId);
    } else if (npoId != null) {
        documents = documentRepository.findByNpo_Id(npoId);
    } else if (projectId != null) {
        documents = documentRepository.findByProject_Id(projectId);
    } else {
        documents = documentRepository.findAll();  // ← retorna TODOS os documentos
    }
```

**Dois vetores de exploração:**

1. **IDOR clássico:** Qualquer usuário autenticado (COMPANY, ADMIN) pode fazer `GET /documents?npoId=X` e ler todos os documentos da ONG X. Não há verificação de que o usuário logado é a ONG dona dos documentos.

2. **Dump total:** `GET /documents` sem parâmetros retorna todos os documentos de todas as ONGs do banco.

**Fix necessário:** O `DocumentController` deve extrair o `npoId` do JWT do usuário autenticado (via `SecurityContextHolder` ou `@AuthenticationPrincipal`), ignorar o parâmetro `npoId` da query string (ou validar que coincide com o do token), e bloquear o acesso por role se `requiredRole != NPO`.

---

### 2.2 [ALTO] Path mismatch no `DocumentController` — upload 100% quebrado em produção

**Arquivo:** `backend/.../controller/DocumentController.java:14`  
**Arquivo:** `frontend/src/api/document.ts:65`

```java
// Backend serve em:
@RequestMapping("/documents")            // → /documents

// SecurityConfig protege explicitamente:
.requestMatchers("/api/documents/**")    // → /api/documents/** (nunca bate em nada real)

// Frontend chama:
api.post<DocumentResponseDTO>("api/documents", ...)  // → {baseUrl}/api/documents
```

O frontend chama `/api/documents` → backend retorna 404. A regra explícita do SecurityConfig para `/api/documents/**` nunca bate em endpoint real (dead code de segurança). O endpoint `/documents` real é protegido apenas pelo catch-all `.anyRequest().authenticated()`, o que é seguro — mas a feature não funciona.

**Fix:** Alterar `@RequestMapping("/documents")` para `@RequestMapping("/api/documents")` em `DocumentController.java:14`.

---

### 2.3 [ALTO] `console.error` expõe stack trace no browser em produção

**Arquivo:** `frontend/src/pages/RoleHomePage/OngDashboardMock.tsx:85`

```typescript
} catch (error) {
  console.error("Upload Error:", error)  // stack trace visível em produção
```

O projeto já tem `src/utils/logger.ts` — usar `logger.error()` em vez de `console.error()` diretamente.

---

### 2.4 [INFO] `AuthTestController` faz dump de JWT em `/api/me`

**Arquivo:** `backend/.../controller/AuthTestController.java`

Endpoint de debug que expõe claims, scopes e audience do token. Protegido por role ADMIN, mas recomenda-se remover ou condicionar ao profile `dev` antes de release público.

---

## 3. Bugs introduzidos

### 3.1 [CRÍTICO] `NullPointerException` em `DocumentService.upload()` quando `projectId` é nulo

**Arquivo:** `backend/.../service/DocumentService.java:58`

```java
Project project = projectRepository
    .findById(docReq.getProjectId().longValue())  // ← NPE se projectId == null
    .orElseThrow(() -> new NotFoundException("Project not found"));
```

`DocumentRequestDTO.projectId` é `Integer` (nullable). O frontend envia a requisição **sem** `projectId`:

```typescript
// OngDashboardMock.tsx:72-79
await uploadDocument(file, {
  title,
  description,
  npoId: 1,   // projectId ausente — será null no DTO
}, token)
```

Resultado: mesmo que o path fosse correto (ver 2.2), o upload falharia com `NullPointerException` no backend ao chamar `.longValue()` em `null`.

**Fix:** Tornar `projectId` opcional na lógica de upload — criar documento sem projeto associado deve ser permitido. Substituir a linha 58 por verificação condicional antes de buscar o projeto.

---

### 3.2 [ALTO] `npoId: 1` hardcoded — documentos sempre associados à ONG #1

**Arquivo:** `frontend/src/pages/RoleHomePage/OngDashboardMock.tsx:77`

```typescript
npoId: 1,  // ID da ONG; idealmente recuperado do seu contexto de usuário
```

Em produção com múltiplas ONGs, todos os uploads associam à ONG de ID 1. Documentos de outras ONGs ficam sob ownership errado no banco.

**Fix:** Recuperar o `npoId` do perfil autenticado via `GET /api/me/profile` (endpoint já existe em `MeController`).

---

### 3.3 [MÉDIO] Tipos de arquivo aceitos divergem entre frontend e backend

**Arquivo (frontend):** `frontend/src/pages/RoleHomePage/UploadModal` — exibe JPG e PNG como aceitos  
**Arquivo (backend):** `DocumentService.java:35-40` — ALLOWED_TYPES não inclui `image/*`

```java
// Backend aceita APENAS:
private static final List<String> ALLOWED_TYPES = List.of(
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  // docx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",        // xlsx
    "application/vnd.ms-excel");                                                 // xls
```

O frontend exibe JPG e PNG como opções válidas no modal de upload. O backend rejeita ambos com `FileFormatValidationException`. O usuário seleciona uma imagem, clica em enviar, e recebe um erro sem explicação clara.

Além disso, o backlog do épico de Admin menciona `txt` como formato aceito para editais — não está na lista do backend (mas o contexto é diferente: documentos de ONG vs editais de Admin).

**Fix:** Alinhar a lista de tipos exibida no modal com `ALLOWED_TYPES` do backend.

---

### 3.4 [MÉDIO] Botões "Editar Projeto" e "Ver Linha do Tempo" silenciosamente inoperantes

**Arquivo:** `frontend/src/pages/OngProjectsPage/index.tsx:63-74`

```tsx
<OngProjectCard
  key={project.id}
  ...
  onDetails={openProjectDetails}
  // onEdit e onTimeline ausentes → optional chaining retorna undefined silenciosamente
/>
```

`OngProjectCard` define `onEdit?: (id: number) => void` e `onTimeline?: (id: number) => void`. Os botões existem na UI, são clicáveis, mas não fazem nada. Nenhum erro, nenhum feedback ao usuário.

---

## 4. Qualidade de código e débito técnico

### 4.1 [MÉDIO] `CompanyDashboard` 100% mockado — 5 endpoints backend inexistentes

**Arquivo:** `frontend/src/pages/CompanyDashboard/mockData.ts`

| Mock | Endpoint necessário | Bloqueio de modelo |
|---|---|---|
| `mockCompanyName` | Estender `GET /api/me/profile` com `companyName` | Endpoint retorna apenas `companyId` hoje |
| `mockBudget` | `GET /api/me/company/budget` | Entidade `Company` sem campo de orçamento |
| `mockSupportedProjects` | `GET /api/me/company/supported-projects/stats` | Relacionamento Empresa↔Projeto inexistente |
| `mockEsgPillars` | `GET /api/me/company/esg-pillars` | Flags ESG em `Npo`, não em `Project` |
| `mockEsgFooterStats` | `GET /api/me/company/impact-stats` | Campos de impacto em `Project` inexistentes |

### 4.2 [BAIXO] Rotas `/ong/documentos` e `/ong/perfil` não existem no router

**Arquivo:** `frontend/src/router/index.tsx`

O router define apenas `/ong/dashboard` e `/ong/projetos` para o role NPO. Navegar para `/ong/documentos` ou `/ong/perfil` não renderiza página em branco — simplesmente não há rota registrada (React Router ignora silenciosamente sem redirecionar para 404).

### 4.3 [BAIXO] `ComponentsPage` pública sem proteção

**Arquivo:** `frontend/src/router/index.tsx:20`

```tsx
<Route path="/components" element={<ComponentsPage />} />
```

Página de dev tool acessível publicamente em produção. Não é vulnerabilidade, mas polui o bundle.

### 4.4 [BAIXO] Contradição interna no backlog da Sprint 3 — ESG criterion 3 vs 4

O backlog lista para o épico "Dashboard de Impacto ESG":

- **Critério 3:** *"A interface deve conter uma faixa horizontal de 'Impacto dos seus investimentos' consolidando: Pessoas beneficiadas, Comunidades impactadas, ODS atendidos e Estados alcançados."*
- **Critério 4:** *"Para esta sprint, remover o número de beneficiados do dashboard (comentar o código, não apagar), Comunidades impactadas, ODS atendidos e Estados atendidos."*

Os critérios 3 e 4 são opostos. A interpretação correta é que o critério 3 descreve a feature completa (sprint anterior) e o critério 4 é a tarefa desta sprint (remoção temporária enquanto integração backend está pendente). Isso deve ser documentado no backlog para evitar regressão futura.

---

## 5. Integração frontend↔backend

| Endpoint | Status | Observação |
|---|---|---|
| `GET /api/projects` | ✅ Integrado | Paginação + filtros funcionais |
| `GET /api/projects/:id` | ✅ Integrado | Página de detalhes |
| `POST /api/npo-accounts` | ✅ Integrado | Wizard de cadastro ONG |
| `POST /api/company-accounts` | ✅ Integrado | Cadastro empresa |
| `GET /api/me/profile` | ✅ Integrado | Redirecionamento por role |
| `GET /api/ods` | ✅ Integrado | Seleção de ODS no cadastro |
| `GET /cep/**`, `/cnpj/**` | ✅ Integrado | Validações públicas |
| `POST /documents` | ❌ Quebrado | Frontend chama `/api/documents`; NPE quando projectId ausente |
| `GET /documents` | ❌ Inseguro | IDOR — sem verificação de ownership |
| `GET /api/npo-accounts` *(novo — PR #245)* | ✅ Integrado | Lista ONGs para export CSV; protegido por `ADMIN` |
| `GET /api/companies` *(novo — PR #245)* | ✅ Integrado | Lista empresas para export CSV; protegido por `ADMIN` |
| `GET /api/me/company/*` | ❌ Inexistente | Dashboard empresa 100% mock |
| `GET /api/documents` (ong) | ❌ Inexistente | Página de documentos não implementada |

---

## 6. CI/CD e infraestrutura

**Pipeline (`.github/workflows/ci-pipeline.yml`):**

**Jobs:** lint → docker-build-check → test (Maven unitário)

**Ausências relevantes:**
- Sem testes de frontend (Vitest ou similar)
- JaCoCo configurado mas sem coverage gate definido no pipeline (sem threshold mínimo)
- Sem testes de integração/e2e no pipeline

**Docker Compose:** Arquitetura correta. Healthcheck no PostgreSQL antes do backend subir, Flyway antes do Spring. Credenciais padrão em `.env.example` (`vinculohub/vinculohub`) aceitáveis para local — devem ser sobrescritas em produção.

---

## 7. Validação da Sprint 3

Esta seção cruza cada critério de aceite do backlog com o código atual.

---

### Épico: Administrador — Cadastro e Publicação de Editais

> **Status: 🔒 NÃO TESTADO**

`/admin/dashboard` existe no router com `requiredRole="ADMIN"`, mas nenhum painel funcional de gestão de editais está implementado. O backlog menciona: `TODO: Criar tarefa para autenticação e dashboard de admin` — confirmado como tarefa pendente de criação.

---

### Épico: ONGs

#### Dashboard de Indicadores de Impacto da ONG

> **Status: ⚠️ PARCIALMENTE IMPLEMENTADO** — nota: critérios marcados como possivelmente desatualizados em relação ao Figma

| # | Critério do backlog | Status | Causa raiz |
|---|---|---|---|
| 1 | Cards: Total de Projetos, Ativos, Buscando Investimento, Total de Beneficiários | ❌ | Dashboard exibe "Projetos por Tipo" (lista) e tabela de status — sem esses 4 cards |
| 2 | Seção "Projetos por Tipo" com distribuição gráfica ou em lista | ✅ | Presente com barras por categoria de financiamento |
| 3 | Seção "Documentos e Relatórios" com lista, data, download e botão Upload | ❌ | Botão "Upload de Documentos" existe no header, mas sem seção dedicada no dashboard |

---

#### Upload e Visualização de Documentos Institucionais

> **Status: ❌ MAJORITARIAMENTE NÃO IMPLEMENTADO + bugs de segurança e crash**

| # | Critério do backlog | Status | Causa raiz |
|---|---|---|---|
| 1 | Upload de PDF, docx, planilhas | ⚠️ | Modal existe; aceita JPG/PNG que backend rejeita (bug 3.3); upload quebrado por path mismatch (2.2) + NPE (3.1) |
| 2 | Aviso/incentivo visual permanente se sem documentos | ❌ | Não implementado |
| 3 | Página dedicada para listagem e visualização | ❌ | Rota `/ong/documentos` não existe no router (`router/index.tsx`) |
| 4 | Edição de metadados dos documentos | ❌ | Não testável — página inexistente |
| 5 | Exclusão com modal de confirmação | ❌ | Não testável — página inexistente |
| 6 | **Segurança:** documentos privados, inacessíveis por empresas e admin | ❌ | **IDOR confirmado (item 2.1):** `GET /documents?npoId=X` retorna documentos de qualquer ONG sem verificar ownership; `GET /documents` sem params retorna tudo |

---

#### Visualização de Mural de Editais

> **Status: ❌ NÃO IMPLEMENTADO**

| # | Critério do backlog | Status | Causa raiz |
|---|---|---|---|
| 1 | Tela listando editais ativos, ordenados por data/prazo | ❌ | Nenhuma rota de mural no router; nenhum endpoint no backend |
| 2 | Visualização completa do edital + botão de download | ❌ | Página não existe |
| 3 | Sem funcionalidade de candidatura | ✅ | Ausência confirmada em todo o codebase |

**Causa raiz no frontend:** Botão "Acessar Mural de Editais" em `OngDashboardMock.tsx:309-314` é um `<BaseButton>` sem `onClick` nem `href`. O contador "3 editais ativos" é valor hardcoded na linha 317.

---

#### Edição de Projetos

> **Status: ❌ NÃO IMPLEMENTADO**

| # | Critério do backlog | Status | Causa raiz |
|---|---|---|---|
| 1 | Botão "Editar" visível e acessível para a ONG proprietária | ⚠️ | Botão renderizado mas sem ação (bug 3.4) |
| 2 | ONG pode excluir projetos | ❌ | Não implementado em nenhum arquivo |
| 3 | Formulário pré-preenchido ao acionar edição | ❌ | Não testável — edição não abre |
| 4 | Mesmas validações da criação | ❌ | Não testável |
| 5 | Toast "Projeto atualizado" ao salvar | ❌ | Não testável |
| 6 | Mensagem amigável em erro de rede | ❌ | Não testável |

**Causa raiz confirmada em código (`OngProjectsPage/index.tsx:63-74`):**

```tsx
<OngProjectCard
  key={project.id}
  ...
  onDetails={openProjectDetails}
  // onEdit={...}    ← ausente → botão "Editar Projeto" não faz nada
  // onTimeline={...} ← ausente → botão "Ver Linha do Tempo" não faz nada
/>
```

---

#### Visibilidade e Acesso ao Perfil da ONG

> **Status: ❌ NÃO IMPLEMENTADO**

| # | Critério do backlog | Status | Causa raiz |
|---|---|---|---|
| 1 | Vitrine/busca de ONGs acessível apenas para logados | 🔒 | Nenhuma rota de vitrine no router ou backend |
| 2 | Perfil individual com link público direto | ❌ | Rota `/ong/perfil` não existe no router |
| 3 | Link público exibe apenas dados institucionais | ❌ | Não testável |

---

#### Aprimoramento na Visualização de Detalhes dos Projetos

> **Status: ❌ NÃO IMPLEMENTADO**

| # | Critério do backlog | Status | Causa raiz |
|---|---|---|---|
| 1 | Card "Instituição Responsável" com nome, logotipo, cidade/UF | ❌ | Não existe em `ProjectDetailsPage` |
| 2 | Placeholder se sem logotipo | ❌ | Campo inexistente |
| 3 | Link/botão "Ver perfil completo da ONG" | ❌ | Ausente |
| 4 | Navegação fluida de volta ao projeto | ❌ | Botão "Voltar" existe mas sem contexto de ONG |

---

### Épico: Empresas

#### Dashboard de Visão Geral e Gestão de Portfólio

> **Status: ⚠️ PARCIALMENTE IMPLEMENTADO — tarefa de remoção da sprint não concluída**

| # | Critério do backlog | Status | Causa raiz |
|---|---|---|---|
| 1 | Card "Projetos Apoiados" com subdivisão Leis / Privado | ✅ | Presente (mock: 5 ativos, 3 leis, 2 privado) |
| 2 | Componente "Agenda de Apresentações" com calendário | ❌ | Não implementado em nenhum arquivo |
| 3 | Métricas alimentadas por endpoints reais ou mocks estruturados | ⚠️ | Mocks com TODO comments; sem integração real |
| 4 | **Remover card "Investimento Disponível"** *(tarefa desta sprint)* | ❌ | `InvestmentBudgetCard` renderizado em `CompanyDashboard/index.tsx:29` |

**Localização exata do card a remover:**
- `frontend/src/pages/CompanyDashboard/index.tsx:3,7,29` — import e uso de `InvestmentBudgetCard` e `mockBudget`
- `frontend/src/pages/CompanyDashboard/InvestmentBudgetCard.tsx` — componente inteiro

---

#### Dashboard de Impacto ESG

> **Status: ⚠️ PARCIALMENTE IMPLEMENTADO — tarefa de remoção da sprint não concluída**

| # | Critério do backlog | Status | Causa raiz |
|---|---|---|---|
| 1 | Três cards E / S / G com % e projetos | ✅ | Ambiental 45%, Social 35%, Governança 20% |
| 2 | Quantidade de projetos e % por pilar em cada card | ✅ | Presente |
| 3 | Faixa "Impacto dos seus investimentos" com 4 métricas | ⚠️ | Presente — mas critério 4 desta sprint manda remover (ver nota 4.4) |
| 4 | **Remover/comentar os 4 campos da faixa** *(tarefa desta sprint)* | ❌ | Todos presentes em `EsgImpactSection.tsx:38-59` |

**Localização exata dos blocos a comentar** (`EsgImpactSection.tsx:38-59`):

```tsx
// Todo o bloco abaixo deve ser comentado (não apagado):
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
  <div>…{footerStats.beneficiaries}…Pessoas beneficiadas</div>     // linhas 39-43
  <div>…{footerStats.communities}…Comunidades impactadas</div>     // linhas 44-49
  <div>…{footerStats.sdgs}…ODS atendidos</div>                     // linhas 50-54
  <div>…{footerStats.states}…Estados alcançados</div>              // linhas 55-58
</div>
```

---

## 8. Resumo por severidade

### Segurança

| # | Issue | Severidade | Arquivo | Linha |
|---|---|---|---|---|
| S1 | IDOR: qualquer usuário autenticado lê documentos de qualquer ONG | CRÍTICO | `DocumentController.java` + `DocumentService.java` | 27-35 / 86-99 |
| S2 | Path mismatch `/documents` vs `/api/documents` — upload quebrado + regra de segurança letra morta | ALTO | `DocumentController.java` | 14 |
| S3 | `console.error` expõe stack trace em produção | BAIXO | `OngDashboardMock.tsx` | 85 |
| S4 | `AuthTestController` dump JWT em produção | INFO | `AuthTestController.java` | — |

### Bugs introduzidos

| # | Issue | Severidade | Arquivo | Linha |
|---|---|---|---|---|
| B1 | `NullPointerException` ao fazer upload sem `projectId` | CRÍTICO | `DocumentService.java` | 58 |
| B2 | `npoId: 1` hardcoded — documentos associados à ONG errada | ALTO | `OngDashboardMock.tsx` | 77 |
| B3 | Frontend aceita JPG/PNG mas backend rejeita — erro sem feedback | MÉDIO | `UploadModal` + `DocumentService.java` | 35-40 |
| B4 | Botões "Editar" e "Linha do Tempo" clicáveis mas silenciosamente inoperantes | MÉDIO | `OngProjectsPage/index.tsx` | 73 |

### Sprint 3 — tarefas não concluídas

| # | Tarefa | Status | Arquivo | Linha |
|---|---|---|---|---|
| T1 | Remover `InvestmentBudgetCard` do dashboard empresa | ❌ | `CompanyDashboard/index.tsx` | 3,7,29 |
| T2 | Comentar 4 campos da faixa ESG (Pessoas, Comunidades, ODS, Estados) | ❌ | `EsgImpactSection.tsx` | 38-59 |
| T3 | Implementar edição de projetos (`onEdit` + modal + API) | ❌ | `OngProjectsPage/index.tsx` | 73 |
| T4 | Implementar exclusão de projetos | ❌ | — | — |
| T5 | Implementar rota + página `/ong/documentos` | ❌ | `router/index.tsx` | — |
| T6 | Implementar rota + página `/ong/perfil` | ❌ | `router/index.tsx` | — |
| T7 | Implementar Mural de Editais + conectar botão | ❌ | `OngDashboardMock.tsx` | 309 |
| T8 | Corrigir path `/documents` → `/api/documents` no backend | ❌ | `DocumentController.java` | 14 |
| T9 | Corrigir NPE — tornar `projectId` opcional no upload | ❌ | `DocumentService.java` | 58 |
| T10 | Corrigir `npoId` hardcoded — usar perfil autenticado | ❌ | `OngDashboardMock.tsx` | 77 |
| T11 | Proteger rota de documentos contra outros roles (IDOR) | ❌ | `DocumentController.java` | — |

### Débito técnico

| # | Issue | Severidade | Arquivo |
|---|---|---|---|
| D1 | `CompanyDashboard` 100% mock — 5 endpoints backend a criar | MÉDIO | `mockData.ts` |
| D2 | Card "Agenda de Apresentações" não implementado | MÉDIO | — |
| D3 | `ComponentsPage` pública em produção | BAIXO | `router/index.tsx` |
| D4 | Sem testes de frontend no pipeline CI | BAIXO | `ci-pipeline.yml` |
| D5 | JaCoCo sem coverage gate no CI | BAIXO | `ci-pipeline.yml` |
| D6 | Contradição critérios 3↔4 do ESG no backlog | BAIXO | backlog |

---

---

## 9. PR #245 — feat(admin): export NGO and company lists as CSV

**Branch:** `feat/data-exportation-admin` → `development`  
**Mergeado em:** 2026-05-31  
**Status do review:** Aprovado após correção de bug crítico no frontend

### O que o PR faz

- **Backend:** 2 novos endpoints ADMIN-only (`GET /api/npo-accounts`, `GET /api/companies`) com DTOs de export (`NpoExportDTO`, `CompanyExportDTO`) e métodos `findAllForExport()` transacionais (read-only)
- **Frontend:** módulo `api/admin.ts`, utilitário `utils/exportCsv.ts` com proteção contra formula injection e BOM UTF-8 para Excel, e botão "Exportar Dados" funcional no `AdminDashboard`

### Bug encontrado e corrigido antes do merge

**Arquivo:** `frontend/src/pages/AdminDashboard/index.tsx`

O PR adicionou o estado `exporting` e a função `handleExport` como uma **segunda declaração `export function AdminDashboard()`** em vez de integrá-los ao componente existente. O resultado no branch original era:

```tsx
export function AdminDashboard() {   // ← 1ª declaração: abre mas nunca fecha
  const [exporting, setExporting] = useState(false)
  async function handleExport() { ... }

  // Tudo abaixo ficou dentro da 1ª declaração:
  const REPORT_STATUS_LABELS = {...}  // constante dentro de função
  export function AdminDashboard() {  // ← 2ª declaração (SYNTAX ERROR: export inside function)
    ...
  }
// 1ª declaração nunca fechada
```

Além disso, 5 imports duplicados (`useAuth0`, `useState`, `FlexibleButton`, `Header`, `MetricCard`).

**Fix aplicado (commit `ac73ccf`):** imports consolidados, constantes movidas para escopo de módulo, estado/handlers fundidos no componente único.

### Pontos de atenção (não bloqueadores para o merge)

- `NpoExportDTO` inclui `cpf` — dado sensível exposto apenas a ADMIN (aceitável)
- `companyRepository.findAll()` e `npoRepository.findAll()` carregam toda a tabela em memória; aceitável para volumes de startup, pode precisar de paginação/streaming no futuro
- O PR não fecha nenhum item do backlog da Sprint 3 (feature de exportação é extra-sprint)

---

## 10. Status pós-implementação — Sprint 3

Após o ciclo de implementação na branch `development` + PR `fix/sprint3-critical-bugs`, o estado dos itens críticos é:

### Resolvidos ✅

| Item original | Resolução |
|---|---|
| S1 — IDOR em `GET /api/documents` | `GET /api/documents/my-ong` com `@PreAuthorize("hasRole('NPO')")` + ownership via JWT; `GET /api/documents` restrito a ADMIN |
| S2 — Path mismatch `/documents` vs `/api/documents` | `@RequestMapping("/api/documents")` aplicado |
| B1 — NPE em `DocumentService.upload()` (projectId nulo) | `projectId` opcional com null-check; `mapToResponse()` NPE corrigido |
| B2 — `npoId: 1` hardcoded no upload | Backend extrai npoId do JWT; frontend removeu o valor do payload |
| B3 — Console.error em produção | Substituído por `logger.error()` |
| B4 — Botões "Editar" e "Excluir" inoperantes | `onEdit` → `EditProjectPage`; `onDelete` → `ConfirmDeleteProjectModal` → `DELETE /api/projects/:id` |
| T1 — InvestmentBudgetCard | Removido do `CompanyDashboard` |
| T2 — 4 campos ESG | Removidos de `EsgImpactSection` |
| T3/T4 — Edit + delete projetos | `EditProjectPage` + `PUT /api/projects/:id` + `deleteProject()` + `DELETE /api/projects/:id` implementados |
| T5 — `/ong/documentos` | Documentos acessíveis em `/ong/perfil` via `PrivateDocumentsCard` |
| T6 — `/ong/perfil` | `OngProfilePage` implementada com rotas protegidas |
| T7 — Mural de Editais | `EditaisMuralPage` em `/editais` com empty state; botão do dashboard conectado |
| T8/T9/T10/T11 — Document security | Ver S1/S2/B1/B2 acima |

### Ainda pendentes ❌

| Item | Onde consertar |
|---|---|
| D1 — Dashboard empresa sem `SupportedProjectsCard` com dados reais | ✅ Já resolvido com `useSupportedProjectsSummary` |
| D2 — Agenda de Apresentações | Próxima sprint |
| Cadastro de Editais (Admin) | Próxima sprint — sem backend de editais |
| Aviso visual sem documentos no dashboard | Próxima sprint |
| Edição/exclusão de documentos | Próxima sprint |

*Gerado por análise estática completa do código-fonte + validação dinâmica registrada em `sprint3-validation.md`.*
