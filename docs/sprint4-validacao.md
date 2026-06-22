# Relatório de Validação — Sprint 4

> Validação de código e critérios de aceite na branch `development`.
> Data: 2026-06-21. Legenda: ✅ atende · ⚠️ atende com ressalva · ❌ não atende.

## Resumo

| Task | Status | Observação |
|------|--------|------------|
| ADM-01 | ✅ | Endpoint real, dados dinâmicos, rotas e loading/erro implementados |
| ADM-03 | ⚠️ | Funcional, mas renderizado como **tabela** (não cards) e **sem logo** |
| ADM-04 | ✅ | Projetos no perfil público com nome, status, ODS, somente leitura |
| ADM-05 | ⚠️ | Export de vínculos OK, mas embutido no botão "Exportar Dados" (sem botão dedicado) |
| ADM-06 | ⚠️ | Lógica de SLA 7 dias OK, porém **on-demand** (sem disparo automático/cron) |
| EMP-01 | ✅ | Nome real, `mockData.ts` removido, tipo `EsgPillar` em arquivo dedicado |
| EMP-02 | ✅ | Card "Projetos Apoiados" com subdivisão, consumindo endpoint real |
| VNC-01 | ✅ | Painel "Meus Vínculos" com filtros por status |
| VNC-02 | ✅ | Botões de interesse / "Propor Parceria" + vitrine de empresas + e-mail |
| VNC-03 | ✅ | Aceitar/Recusar, revelação de contato, prazo de 7 dias (via ADM-06) |
| VNC-04 | ✅ | Confirmação bilateral → status `active`; só `active` alimenta ESG |
| DEBT-01 | ✅ | `npoId` real do perfil autenticado + teste de cobertura |
| DEBT-03 | ⚠️ | Rotas registradas; **rota `/admin/notificacoes` duplicada** no router |

---

## Épico: Administrador

### [ADM-01] Métricas reais do AdminDashboard — ✅
- **Endpoint:** `GET /api/admin/metrics` em `AdminMetricsController.java:30`; `AdminMetricsService.java` computa contagens reais (`npoRepository.count()`, `editalRepository.countActive`, `countByStatus(active)`, denúncias abertas + vínculos vencidos).
- **Consumo dinâmico:** `AdminDashboard/index.tsx:104-125` (`fetchAdminMetrics`); array hardcoded eliminado — cards usam `metrics.totalNpos/publishedEditais/activeVinculos/pendingNotifications`.
- **Rotas:** `/admin/ongs` e `/admin/vinculos` registradas em `router/index.tsx:54-73`.
- **Loading/erro:** skeleton (`metricsLoading`) e mensagem de erro (`metricsError`) em `index.tsx:286-307`.

### [ADM-03] Vitrine de ONGs no Painel do Administrador — ⚠️
- **Atende:** filtro por área e status, link para perfil público (`/ong/publico/:id`), paginação (`AdminOngsPage/index.tsx`, `AdminOngsList/index.tsx`), endpoint `GET /api/admin/ongs`.
- **Ressalva:** o critério pede **cards com logo, nome, área e status**, mas `AdminOngsList` renderiza uma **tabela**; o campo `logoUrl` existe no DTO (`AdminNpoCard`) porém **não é exibido**. Recomenda-se converter para layout em cards e renderizar a logo, ou ajustar o critério.

### [ADM-04] Projetos no Perfil Público da ONG — ✅
- `OngPublicProfilePage/index.tsx:131` renderiza `PublicProjectsSection`.
- Cada card exibe nome, status (chip) e ODS associados (`PublicProjectsSection.tsx:62-108`).
- Somente leitura: nenhuma ação de edição; paginação presente. Rota pública `/ong/publico/:id` sem `ProtectedRoute`.

### [ADM-05] Exportação de vínculos — ⚠️
- **Endpoint:** `GET /api/admin/export/vinculos` (`AdminExportController.java:23`) retorna empresa, ONG, projeto e status (`VinculoExportDTO`).
- **UI:** `handleExport` (`AdminDashboard/index.tsx:181-197`) baixa os 3 CSVs (ONGs, Empresas, Vínculos); comportamento de ONGs/Empresas preservado.
- **Ressalva:** o critério pede um **botão de exportação de vínculos**; a exportação foi agregada ao botão único "Exportar Dados" em vez de botão dedicado. Funcionalmente atendido.

### [ADM-06] Notificação de Mediação (SLA 7 dias) — ⚠️
- **Lógica:** `RelationshipService.listOverdueRelationshipsForAdmin()` filtra `pending` com `createdAt <= now - 7 dias`; endpoint `GET /api/admin/relationships/overdue` (`AdminRelationshipController.java:28`).
- **Conteúdo:** `OverduePartnershipAlertResponse` traz empresa, ONG, projeto e data do pedido (`requestedAt`) — todos os campos exigidos.
- **UI:** `AdminNotificationsPage` consome `fetchOverdueRelationshipAlerts` e a contagem entra em `pendingNotifications` das métricas.
- **Ressalva:** não há **disparo automático** (cron/job/e-mail); o alerta é **calculado sob demanda** quando o admin acessa o painel. O critério "dispara notificação no painel" é atendido como visualização, mas não como evento proativo.

---

## Épico: Empresas

### [EMP-01] Remover mocks do CompanyDashboard — ✅
- Nome real via `fetchAuthenticatedProfile` (`CompanyDashboard/index.tsx:26-38`, `companyName`); `mockCompanyName` eliminado.
- `mockData.ts` do CompanyDashboard **removido** (não existe mais no diretório).
- `EsgPillar` importado de `./types` (`index.tsx:12`), não mais de mock.

### [EMP-02] Card de Projetos Apoiados — ✅
- `SupportedProjectsCard.tsx` exibe total ativos + "Leis de incentivo" + "Investimento privado".
- Consome endpoint real via `useSupportedProjectsSummary` / `fetchCompanyEsgImpactDashboard` (`api/companyPortfolio`).

---

## Épico: Vínculos

### [VNC-01] Painel "Meus Vínculos" — ✅
- Rota `/meus-vinculos` para COMPANY e NPO (`router/index.tsx:159-166`).
- Endpoint `GET /api/relationships` (`RelationshipController.java:42`) lista pendentes/negociação/ativos.
- Filtros por status e exibição de projeto + instituição parceira + status (`MyRelationshipsPage/index.tsx`). Sem chat.

### [VNC-02] Iniciação do Vínculo (envio) — ✅
- Vínculo sempre atrelado a projeto (`createRelationship` exige `projectId`, `RelationshipService.java:124`).
- Empresa: `DemonstrarInteresseModal` na página do projeto (`ProjectDetailsPage/index.tsx:248`).
- ONG: `ProporParceriaModal` no perfil da empresa (`CompanyPublicProfilePage/index.tsx:176`), com seleção obrigatória de projeto ativo; **vitrine de empresas** via `CompanyShowcaseCard` no dashboard da ONG.
- Status → `pending` + notificação por e-mail ao receptor (`notificationService.interestReceived`). Sem chat.

### [VNC-03] Resposta e Liberação de Contato — ✅
- `accept`/`reject` (`RelationshipController.java:73-107`); somente receptor responde (`requireReceptor`).
- Aceite → `negotiation` e contatos revelados mutuamente (`CONTACT_VISIBLE_STATUSES`, `toCompanyViewerResponse`/`toNpoViewerResponse`).
- Recusa → `inactive` + e-mail à outra parte. Prazo de 7 dias coberto por ADM-06.

### [VNC-04] Efetivação da Parceria (2º aperto) — ✅
- `confirm` (`RelationshipController.java:109`); confirmação bilateral via `companyConfirmedAt`/`npoConfirmedAt`.
- Só após ambos → status `active` (`RelationshipService.java:281-286`) + e-mail aos dois.
- Apenas `active` alimenta o ESG (métrica `activeVinculos` e dashboard ESG dependem de `RelationshipStatus.active`).

---

## Débitos Técnicos

### [DEBT-01] npoId hardcoded no upload — ✅
- `OngDashboardMock.tsx` não existe mais; upload em `RoleHomePage/OngDashboard.tsx:62` usa `npoId` real obtido do perfil (`useOngDashboard.ts:131-133`, `profile.npoId`).
- Cenário coberto por teste: `RoleHomePage/index.test.tsx:211` ("envia documento com o npoId real") e `:241` (sem npoId vinculado).

### [DEBT-03] Rotas admin inexistentes — ⚠️
- `/admin/ongs`, `/admin/vinculos` e `/admin/notificacoes` agora registradas (`router/index.tsx:54-89`).
- **Ressalva:** a rota `/admin/notificacoes` está **duplicada** (`router/index.tsx:74-81` e `82-89`) — remover a repetição.

---

## Ações recomendadas
1. **ADM-03:** migrar a listagem para cards e exibir `logoUrl` (ou alinhar o critério à tabela atual).
2. **DEBT-03:** remover a rota `/admin/notificacoes` duplicada no router.
3. **ADM-06:** avaliar se um disparo proativo (job agendado/e-mail) é necessário, ou registrar que o alerta é sob demanda.
4. **ADM-05:** opcional — separar um botão dedicado de exportação de vínculos, se o critério exigir literalmente.
