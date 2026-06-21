# Code Review Consolidado — VinculoHub Portal

> **Documento único** de análise da codebase e backlog de melhorias (frontend + backend).
> Branch: `development` · Atualizado em: 2026-06-21.
> Reúne: análise geral de código + re-validação do backlog de QA E2E + carry-over do Sprint 4.
> A validação detalhada de aceite do Sprint 4 fica em [`sprint4-validacao.md`](./sprint4-validacao.md).

---

## Sumário

1. [Saúde geral da codebase](#1-saúde-geral-da-codebase)
2. [Backlog priorizado (master)](#2-backlog-priorizado-master)
3. [P0 — Segurança](#3-p0--segurança)
4. [P1 — Bugs e dívidas prioritárias](#4-p1--bugs-e-dívidas-prioritárias)
5. [P2 — Redundância, validações e estrutura](#5-p2--redundância-validações-e-estrutura)
6. [P3 — Refino e consistência](#6-p3--refino-e-consistência)
7. [Já corrigido — não reabrir](#7-já-corrigido--não-reabrir)
8. [Decisões de produto pendentes](#8-decisões-de-produto-pendentes)
9. [Itens que exigem validação em runtime](#9-itens-que-exigem-validação-em-runtime)
10. [Sequência sugerida de execução](#10-sequência-sugerida-de-execução)

---

## 1. Saúde geral da codebase

**Pontos fortes:**
- **Frontend:** `tsc --noEmit` ✅ e `eslint` ✅ sem erros; **nenhum uso de `any`**; `console.*` quase eliminado (resta só em `logger.ts`/`main.tsx`).
- **Backend:** arquitetura em camadas limpa (controller → service → repository → dto), `GlobalExceptionHandler` centralizado, segurança stateless JWT + roles (`SecurityConfig`), Bean Validation nos DTOs.
- **Cobertura:** 72 arquivos de teste no frontend, 35 no backend.
- **Boas práticas presentes:** interceptors HTTP com logging, `NotificationService` abstrato (impl `Resend` real + `Logging` em dev), `JOIN FETCH` evitando N+1 em vínculos.

**Contexto importante:** o backlog de QA E2E foi escrito sobre a base `0bf4dcc` (19/06), **anterior** aos merges de VNC-02 (#318), vitrine admin (#286) e do fix do botão de vínculos (#319). Por isso muitos itens que o QA marcou `ABERTA` **já estão corrigidos** (ver §7).

A base é sólida. Os itens abaixo são incrementais, exceto o P0 de segurança.

---

## 2. Backlog priorizado (master)

| # | Item | Tipo | Sev. | Esforço | Local |
|---|------|------|------|---------|-------|
| 1 | Upload de documento confia em `npoId` do cliente | **Segurança** | **P0** | médio | `DocumentController.java:28` / `DocumentService.java:67` |
| 2 | Texto corrompido (mojibake) em erro 404 | Bug | P1 | trivial | `GlobalExceptionHandler.java:33` |
| 3 | Rota `/admin/notificacoes` duplicada | Bug | P1 | trivial | `router/index.tsx:74-89` |
| 4 | Três páginas/4 rotas/2 clientes de "Vínculos" redundantes | Dívida estrutural | P1 | médio | `MyRelationshipsPage`/`RelationshipsPage`/`VinculosPage` |
| 5 | Prazo de edital no passado aceito (front+back) | Bug | P1 | baixo | `CreateAnnouncementModal.tsx:348`, `EditalRequestDTO.java:12` |
| 6 | E-mail com TLD numérico aceito (`xx@xx.23`) | Bug | P1 | trivial | `CompanyRegistration/.../index.tsx:190` |
| 7 | Padrões de data-fetching inconsistentes | Consistência | P1 | alto | vários (ver §5.4) |
| 8 | Teste desabilitado (freeze) | Qualidade | P1 | baixo | `AdminNotificationsPage/index.test.tsx:76` |
| 9 | ADM-06 sem disparo automático (sem `@Scheduled`) | Produto/Débito | P1 | médio | backend (decisão) |
| 10 | Endpoint/cliente de vínculos admin morto | Dead code | P2 | baixo | `fetchAdminVinculos`, `/api/admin/vinculos` |
| 11 | `GET /api/admin/vinculos` no controller errado | Smell | P2 | baixo | `AdminMetricsController.java:36` |
| 12 | Número de endereço aceita letras/negativos | Bug | P2 | baixo | `CompanyRegistration/.../index.tsx:526` |
| 13 | Edital/doc abrem em nova guia em vez de download | Bug | P2 | baixo | `EditalCard.tsx:35,116`, `PrivateDocumentsCard.tsx:75` |
| 14 | Projetos não aparecem no perfil **privado** da ONG | Feature gap | P2 | médio | `OngProfilePage` |
| 15 | Componentes "god" (>500 linhas) | Smell | P2 | alto | ver §5.5 |
| 16 | Duplicação de helpers de display | DRY | P2 | baixo | `RelationshipService`/`AdminRelationshipService` |
| 17 | Mapeamento de status de vínculo espalhado | Consistência | P2 | baixo | `MyRelationshipsPage/vinculo.ts` |
| 18 | ADM-03 tabela em vez de cards + logo | Sprint 4 | P2 | médio | `AdminOngsList` |
| 19 | Sem reset de scroll entre etapas do cadastro | UX | P3 | trivial | `CompanyRegistration` |
| 20 | Mistura de sistemas de UI (MUI + Tailwind) | Consistência | P3 | alto | global |
| 21 | ADM-05 sem botão dedicado de export | Sprint 4 | P3 | baixo | `AdminDashboard` |

---

## 3. P0 — Segurança

### 3.1 [#1] Upload de documento confia em `npoId` enviado pelo cliente
`POST /api/documents` (`DocumentController.java:28`) **não tem `@PreAuthorize` e não lê o JWT**. O `DocumentService.upload` resolve a ONG dona por `docReq.getNpoId()` (`DocumentService.java:67,73`), valor vindo do payload. Resultado: **qualquer usuário autenticado pode anexar documento a qualquer `npoId`**.
- O fix do DEBT-01 corrigiu apenas o *cliente* (frontend passou a mandar o npoId real); o backend continua confiando no payload.
- Os endpoints `/my-ong` (listagem/download) já derivam a ONG do `auth0Id` corretamente — **só o upload** está vulnerável.
- **Bônus:** `GET /api/documents?npoId=` (`DocumentController.java:56`) é acessível a qualquer autenticado e permite listar documentos de outra ONG por id.

**Fix:** no upload, resolver a ONG pelo JWT (`@AuthenticationPrincipal Jwt`), remover `npoId` do `DocumentRequestDTO`, validar ownership do `projectId`; restringir/filtrar o `GET` por ONG autenticada. (Origem: AT-01 do QA; relaciona-se a DEBT-01.)

---

## 4. P1 — Bugs e dívidas prioritárias

### 4.1 [#2] Texto corrompido em resposta de erro
`GlobalExceptionHandler.java:33` retorna `"Recurso nÃ£o encontrado"` — mojibake (UTF-8 lido como Latin-1). É a **única** ocorrência em `src/main`. **Fix:** `"Recurso não encontrado"` e garantir arquivo em UTF-8.

### 4.2 [#3] Rota duplicada no router
`router/index.tsx:74-81` e `82-89` registram a mesma rota `/admin/notificacoes` → `AdminNotificationsPage`. A segunda é inalcançável. **Fix:** remover o bloco duplicado.

### 4.3 [#4] Domínio de "Vínculos" duplicado (AT-02)

| Página | Rota | Linkada no menu? |
|--------|------|------------------|
| `MyRelationshipsPage` | `/meus-vinculos` | ✅ (Header `:80,118` + Topbar + dashboards) |
| `RelationshipsPage` | `/vinculos` | ❌ órfã |
| `VinculosPage` | `/empresa/vinculos`, `/ong/vinculos` | ❌ órfãs |

- 2 clientes HTTP: `api/relationships.ts` (canônico, completo) e `api/vinculos.ts` (parcial, importado só por `VinculosPage`).
- As páginas órfãs já **divergem** da canônica → risco alto de manutenção.
- **Fix:** eleger `MyRelationshipsPage`, remover `RelationshipsPage`, `VinculosPage` e `api/vinculos.ts`, redirecionar rotas legadas → `/meus-vinculos`. ⚠️ Confirmar com produto antes de apagar (pode haver intenção de variação por papel).

### 4.4 [#5] Prazo de edital no passado é aceito (AN-34)
- **Frontend:** input `type="date"` **sem `min`** (`CreateAnnouncementModal.tsx:348-350`).
- **Backend:** `EditalRequestDTO.expiredAt` **sem `@Future`** (`EditalRequestDTO.java:12`); `EditalService` faz `setExpiredAt(dto.expiredAt())` direto.
- **Fix:** `min={hoje}` no input + `@Future`/validação no DTO/serviço (fixar timezone `America/Sao_Paulo` para fim do dia).

### 4.5 [#6] E-mail com TLD numérico aceito (AN-13)
Regex em `CompanyRegistration/.../index.tsx:190` é `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, que **aceita** `xx@xx.23` — depois rejeitado pelo Auth0. **Fix:** exigir TLD alfabético (`\.[A-Za-z]{2,}$`), centralizar a regra e replicar no backend.

### 4.6 [#7] Dois padrões de data-fetching coexistindo
- **TanStack Query:** `useMyRelationships`, `useAuthProfile` (cache, `isPending`, `refetch`).
- **`useEffect` + `useState` manual:** `AdminDashboard`, `AdminOngsPage`, `CompanyDashboard`, `OngPublicProfilePage`, `useNpoProfile`, `useOngDashboard` — cada um reimplementa loading/error/cleanup (`isMounted`/`cancelled`), com risco de races.
- **Fix:** padronizar em React Query (já é dependência), migração incremental por página. Resolve também itens de UX do QA (cache/atualização imediata — AN-17/19).

### 4.7 [#8] Reabilitar teste congelado
`AdminNotificationsPage/index.test.tsx:76` tem teste desabilitado com `// TODO(freeze): ... review dos superiores`. Reabilitar ou registrar como tarefa formal.

### 4.8 [#9] ADM-06 sem disparo automático
Não há `@Scheduled`/`@EnableScheduling`. Vínculos vencidos (SLA 7 dias) são **calculados sob demanda** quando o admin abre o painel — sem notificação proativa. Decidir com produto se basta sob demanda ou se requer job agendado.

---

## 5. P2 — Redundância, validações e estrutura

### 5.1 [#10] Endpoint + cliente de vínculos admin morto
- `fetchAdminVinculos` (`api/admin.ts:266`) só é referenciado pelo próprio teste; o app usa `fetchAdminRelationships` → `/api/admin/vinculos/search`.
- Par morto no backend: `GET /api/admin/vinculos` (`AdminMetricsController.java:36`) + `CompanyProjectRepository.findAllForAdmin` + DTO `AdminVinculoListItemResponse`.
- **Fix:** remover endpoint, repo method, DTO, função de API e tipos `AdminVinculoItem`/`AdminVinculoPage`.

### 5.2 [#11] Endpoint de listagem no controller de métricas
Mesmo que #10 não seja removido, `GET /api/admin/vinculos` está em `AdminMetricsController` — responsabilidade fora do lugar. Mover para `AdminController`/`AdminRelationshipController`.

### 5.3 [#12] Número de endereço aceita letras/negativos (AN-11/12)
Campo "Número" é texto livre (`CompanyRegistration/.../index.tsx:526-540`, `maxLength=20`); validação só checa não-vazio (`:176-177`). **Fix:** sanitizar para dígitos / validar inteiro não-negativo no front e no backend (DTO).

### 5.4 [#13] Edital/documento abrem em nova guia em vez de baixar (AN-33)
`EditalCard.tsx:35` `window.open(fileUrl, "_blank")` e `:116` `target="_blank"`; mesmo padrão em `PrivateDocumentsCard.tsx:75`. **Fix:** download via `Content-Disposition: attachment` (backend) + âncora `download`, sem `window.open`; tratar erro sem navegar.

### 5.5 [#14] Projetos não aparecem no perfil privado da ONG (AN-21)
`OngProfilePage` não referencia projetos (sem `ProjectsSection`/`fetchNpoProfileProjects`). O perfil **público** mostra (`PublicProjectsSection`), o **privado** não. **Fix:** reusar o componente público no perfil privado.

### 5.6 [#15] Componentes "god" (>500 linhas)

| Arquivo | Linhas |
|---------|--------|
| `MyRelationshipsPage/index.tsx` | 850 |
| `CompanyRegistration/registration/index.tsx` | 714 |
| `EditProjectPage/index.tsx` | 644 |
| `announcement/CreateAnnouncementModal.tsx` | 535 |
| `AdminDashboard/index.tsx` | 525 |

Extrair subcomponentes e hooks de dados. Prioridade interna: `MyRelationshipsPage` (já contém `SummaryCard`, `VinculoCard`, `ActionButton`, etc. no mesmo arquivo).

### 5.7 [#16] Duplicação de helpers de display
`companyDisplayName`/`npoName`/`companyName` (lógica "socialName senão legalName") duplicados em `RelationshipService.java` e `AdminRelationshipService.java`. Extrair para helper compartilhado.

### 5.8 [#17] Mapeamento de status de vínculo espalhado
Backend usa enum lowercase (`pending`/`negotiation`/`active`/`inactive`); o frontend remapeia para `pending_interest`/`pending_waiting`/etc. em `MyRelationshipsPage/vinculo.ts`. Centralizar para evitar divergência entre as páginas de vínculo.

### 5.9 [#18] ADM-03 tabela em vez de cards + logo
`AdminOngsList` renderiza tabela; o critério pedia cards com logo (`logoUrl` existe no DTO mas não é exibido). Converter para cards ou alinhar o critério. (Detalhe em `sprint4-validacao.md`.)

---

## 6. P3 — Refino e consistência

### 6.1 [#19] Sem reset de scroll entre etapas do cadastro (AN-10)
Nenhum `window.scrollTo` no fluxo `CompanyRegistration`. Ao avançar etapa (inclusive ODS), a rolagem não volta ao topo. **Fix:** `scrollTo({top:0})` na troca de `currentStep`.

### 6.2 [#20] Dois sistemas de UI
Convivem MUI (`Button`/`Card`/`Chip`), Tailwind puro e componentes próprios (`FlexibleButton`, `MetricCard`). Definir sistema primário e encapsular o outro.

### 6.3 [#21] ADM-05 sem botão dedicado de export
Export de vínculos embutido no botão único "Exportar Dados". Funcional; separar só se o critério exigir literalmente.

---

## 7. Já corrigido — não reabrir

Itens que o backlog de QA marca `ABERTA`/`A DEFINIR` mas **já estão resolvidos** em `development`. Atualizar o backlog de QA.

| QA | Anotação | Evidência no código |
|----|----------|---------------------|
| QA-NAV-01.1 | AN-03 | Admin não vê "Vínculos": `Header.tsx:25` `canSeeVinculos = isPlatformUser && userType !== "admin"` |
| QA-VINC-01.2 | AN-08/25 | `createRelationship` no cliente canônico `api/relationships.ts` |
| QA-VINC-01.3 | AN-25 | `DemonstrarInteresseModal` no detalhe do projeto (`ProjectDetailsPage/index.tsx:248`) |
| QA-VINC-01.4 | AN-08 | `ProporParceriaModal` no perfil da empresa, com seleção de projeto próprio |
| QA-VINC-01.6 | — | Confirmação bilateral em `/meus-vinculos` (`EfetivarParceriaModal` + `confirmRelationship`) |
| QA-ONG-01.5 | AN-18 | Endpoint público `GET /api/companies/{id}/public` (`CompanyController.java:88`) |
| QA-COMP-01.4 | AN-27 | `SupportedProjectsCard` linka `/meus-vinculos?filter=active` |
| QA-ADM-01.1 | AN-29 | `/admin/vinculos` registrada + card funcional |
| QA-AUTH-01.1/01.2 | AN-09/15 | Já marcados CORRIGIDA pelo QA; manter testes de `AuthRoleRedirect` |
| DEBT-01 (frontend) | AT-01 | `npoId` real do perfil no upload + testes (`RoleHomePage/index.test.tsx:211`) — **mas o backend segue vulnerável, ver #1** |

> Recomenda-se confirmar QA-VINC-01.3/01.4/01.6 em runtime (E2E); o código necessário existe.

---

## 8. Decisões de produto pendentes

1. **Posicionamento do acesso a vínculos** (QA-NAV-01.2): só no header, só nos dashboards, ou ambos — antes de remover botões.
2. **Sessão Auth0 residual** (QA-AUTH-01.3, AN-14): forçar login, selecionar conta ou exigir logout quando há sessão sem usuário no banco.
3. **Admin — mediações/notificações** (QA-ADM-01.2/01.3/01.6/01.7): o time implementou uma **página** `/admin/notificacoes`, enquanto o QA pedia uma **seção** no dashboard e a **remoção** dessa rota — caminhos opostos. Além disso, o card "Notificações Pendentes" hoje soma denúncias + vínculos vencidos (`AdminMetricsService.java:37`); o QA pedia renomear para "Denúncias Pendentes". Alinhar.
4. **Destino da própria ONG no detalhe do seu projeto** (QA-ONG-02.5, AN-24): perfil privado, dashboard ou ambos.
5. **Destaque visual do mural de editais** (QA-ONG-01.7, AN-20): intencional? quando some?

Nenhuma decisão acima deve ser assumida silenciosamente na implementação.

---

## 9. Itens que exigem validação em runtime

Não verificáveis por inspeção estática — exigem E2E/observabilidade:

- **AN-01/02** (QA-DOC-01.6): contaminação de estado após erro (upload → consulta CNPJ).
- **AN-14** (QA-AUTH-01.3/01.4): sessão Auth0 residual sem usuário no banco.
- **AN-31** (QA-ADM-01.4): lentidão do dashboard admin (medir por request; hoje são 3 fetches independentes).
- **AN-23** (QA-ONG-02.3/02.4): lentidão do perfil público (evitar carregamento duplicado).
- **AN-16/17/19** (QA-ONG-01.*): transições bruscas, cache de projetos e atualização imediata após criação — mitigáveis pela padronização React Query (#7).

---

## 10. Sequência sugerida de execução

1. **Hotfix de segurança (1 PR):** #1 (P0) — backend do upload de documentos.
2. **Quick wins (1 PR):** #2, #3, #6, #8 — correções triviais de bug/teste/validação.
3. **Validações de formulário (1 PR):** #5, #12, #19 — edital (data), número de endereço, scroll.
4. **Download correto (1 PR):** #13 — editais e documentos privados.
5. **Limpeza de dead code (1 PR):** #10, #11 — baixo risco.
6. **Consolidação de vínculos (1 PR, requer decisão §8.1):** #4, #17.
7. **Feature gap (1 PR):** #14 — projetos no perfil privado.
8. **Padronização incremental:** #7 (React Query) — resolve junto AN-16/17/19.
9. **Refino contínuo:** #15, #16, #18, #20, #21 conforme tocar nas áreas.
10. **Decisões de produto:** §8 + #9.

---

## 11. Achados da automação E2E (Playwright)

> Levantados ao implementar a suíte E2E (`frontend/e2e/`, junho/2026) com a stack rodando e os cenários seedados. A suíte de leitura/navegação (`auth`/`empresa`/`ong`/`admin`/`sprint3`) e a de fluxos mutantes (`mutating.spec.ts` — criação de projeto/edital + handshake completo) passam 100%.

### 11.1 [✅ corrigido no PR #320] Empresa não tinha caminho de UI para abrir um projeto e demonstrar interesse — **P2**
~~Os cards de projeto no perfil público da ONG não eram clicáveis e `/projeto/:id` era protegido.~~ **Resolvido pelo PR #320 (Bug 5):** `PublicProjectsSection.ProjectCard` agora é um `<Link to="/projeto/:id">` e a rota `/projeto/:projectId` saiu do `ProtectedRoute` (pública). A empresa percorre vitrine → "Ver perfil" → perfil público → card do projeto → detalhe → "Demonstrar Interesse". Coberto por E2E `empresa.spec` (EMP-06/07) e `mutating.spec` (handshake), além de `sprint3.spec` (rota `/projeto/1` pública).

### 11.2 [novo] Contrato de `GET /api/editais` mudou para paginado — **P3 (doc/contrato)**
O endpoint passou a retornar um `Page` do Spring (`{ content: [...], totalElements, ... }`) em vez de um array puro. É **intencional** (o cliente `api/editais.ts:143` lê `paged.content`), mas quebrava o teste de contrato antigo (que esperava array) e pode surpreender outros consumidores. Atualizado em `sprint3.spec.ts`; registrar a mudança de contrato para quem integra.

### 11.3 [novo] Nome de exibição do parceiro empresa diverge do da ONG nos vínculos — **P3**
Em `/meus-vinculos`, a **empresa** aparece pelo nome fantasia (ex.: "Horizonte", "Alianca", "Multipla") enquanto a **ONG** aparece com o nome completo ("Instituto Projetos Vivos"). Provém da regra `socialName` senão `legalName` (ver #16). Confirmar se a assimetria é intencional; se não, padronizar a exibição.

### 11.5 [novo] Atraso read-after-write no botão "Demonstrar Interesse" — **P3**
Logo após a empresa enviar interesse e **recarregar** a página do projeto, `useExistingRelationship` (`hooks/useExistingRelationship.ts`) às vezes ainda não enxerga o vínculo recém-criado, mantendo o botão como "Demonstrar Interesse" por alguns segundos (o teste E2E precisou de retry/reload para refletir). Em sessão (sem reload) o estado é imediato via `sentInThisSession`. Mesma família de AN-16/17/19 (atualização imediata). **Fix:** invalidar/refetch da lista de relationships após `createRelationship` (ou usar React Query com invalidação), em vez de depender de novo fetch no mount.

### 11.7 [corrigido] Seeder usava `project_type` errado (resolve QA-COMP-01.1) — **P2**
O seeder de cenários (`backend/.../db/test-scenarios/01_scenario_definitions.sql`) gravava `project_type` = `SOCIAL`/`ENVIRONMENTAL`/`GOVERNMENTAL` (constantes válidas do enum `ProjectType`, mas que representam **área/tema**, não **modalidade de captação**). A app trata `project_type` como modalidade: o resumo da empresa conta por `project_type IN ('TAX_INCENTIVE_LAW','SOCIAL_INVESTMENT_LAW')` (`CompanyProjectRepository.getSupportedProjectsSummaryByCompanyId`), o card "Projetos por Tipo" da ONG só itera essas duas (`DASHBOARD_PROJECT_TYPES`) e o cadastro de projeto só gera essas duas. **Efeito:** cards de modalidade da empresa e "Projetos por Tipo" da ONG vinham **vazios/zerados** para os dados seedados. **Fix aplicado:** Educacao→`TAX_INCENTIVE_LAW`, Clima→`SOCIAL_INVESTMENT_LAW`, Bairros→`TAX_INCENTIVE_LAW`, Renda→`SOCIAL_INVESTMENT_LAW` (área ESG segue em `focus_area`+ODS+flags da ONG). Requer **rebuild** da imagem do backend (`docker compose up -d --build`) pois o SQL é empacotado no JAR. Testes E2E reforçados para assertir os contadores reais (`empresa.spec` EMP-02/02b, `ong.spec` Projetos por Tipo).

### 11.6 Evidência positiva — handshake completo funciona em runtime
O fluxo `pending → negotiation → active` com revelação de contato após o aceite foi validado fim-a-fim por `mutating.spec.ts` (empresa demonstra interesse → ONG aceita → ambos efetivam). Isso **confirma em runtime** QA-VINC-01.3/01.4/01.6 (§7 pedia validação E2E) e E2E-FLOW-01/02. Observado: a efetivação é **sequencial** (cada parte confirma na sua vez); ambos os lados exibem "Efetivar Parceria" enquanto pendentes da própria confirmação.

> ⚠️ Nota operacional: `mutating.spec.ts` **altera o seed** (cria projetos/editais e ativa um vínculo de `company.empty`↔`Educacao para Todos`). É resiliente a reexecução, mas para um "happy path" limpo rode com seed fresco (`docker compose down -v && up`).

### 11.8 Validação do PR #320 (fix/ui) por E2E
Mudanças validadas e cobertas por testes (suíte verde 59 ✔ + mutante 11 ✔):
- **Bug 1/2 (redirect pós-signup / admin):** `AuthRoleRedirect` agora resolve papéis antes da guarda `userId === null` e redireciona por tipo de draft. Cobertura E2E indireta via login das personas (`auth.setup`) + GuestOnlyRoute.
- **Bug 3 (GuestOnlyRoute):** logado em `/cadastro*` → redireciona ao dashboard do papel. Novos testes `auth.spec` (ONG/empresa/admin).
- **Bug 5 (perfil público navegável + `/projeto/:id` público):** novos testes `empresa.spec` EMP-06/07, `sprint3.spec` rota pública. Resolve §11.1.
- **Bug 6 (Denunciar ONG no perfil público p/ empresa):** novo teste `empresa.spec` EMP-06b.
- **Melhoria (card clicável "Ver perfil"):** `OngRow`/`CompanyRow` deixaram de ser `<Link>` (ícone) e viraram `role="button"` + botão "Ver perfil" — seletores E2E ajustados de `link` para `button`.
- **Bug 4 (paginação de documentos da ONG):** sem dados seedados de documento; validar manualmente (perfil ONG com 6+ docs).
- ⚠️ **Lembrete reforçado:** o frontend é build estático servido por nginx — **toda** mudança de front exige `docker compose up -d --build frontend` para o container refletir o código (rodar testes contra container desatualizado dá falsos negativos).

---

### Referências
- [`sprint4-validacao.md`](./sprint4-validacao.md) — validação detalhada de aceite do Sprint 4.
- Backlog de QA E2E original — base `0bf4dcc`; usar §7 para atualizá-lo.
- Suíte E2E: `frontend/e2e/` — `auth.setup.ts` (login das 6 personas via Auth0 + storageState), specs por persona + `mutating.spec.ts`. Rodar: `cd frontend && npm.cmd run test:e2e` (headless).
