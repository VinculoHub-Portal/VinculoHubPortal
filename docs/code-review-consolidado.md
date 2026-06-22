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
7. [Decisões de produto pendentes](#7-decisões-de-produto-pendentes)
8. [Itens que exigem validação em runtime](#8-itens-que-exigem-validação-em-runtime)
9. [Sequência sugerida de execução](#9-sequência-sugerida-de-execução)
10. [Achados da automação E2E (Playwright)](#10-achados-da-automação-e2e-playwright)

---

## 1. Saúde geral da codebase

**Pontos fortes:**
- **Frontend:** `tsc --noEmit` ✅ e `eslint` ✅ sem erros; **nenhum uso de `any`**; `console.*` quase eliminado (resta só em `logger.ts`/`main.tsx`).
- **Backend:** arquitetura em camadas limpa (controller → service → repository → dto), `GlobalExceptionHandler` centralizado, segurança stateless JWT + roles (`SecurityConfig`), Bean Validation nos DTOs.
- **Cobertura:** 72 arquivos de teste no frontend, 35 no backend.
- **Boas práticas presentes:** interceptors HTTP com logging, `NotificationService` abstrato (impl `Resend` real + `Logging` em dev), `JOIN FETCH` evitando N+1 em vínculos.

**Contexto importante:** este documento lista **apenas itens em aberto**. Defeitos já resolvidos foram removidos; o histórico de correções fica no git/PRs. O backlog de QA E2E original (base `0bf4dcc`, 19/06) é anterior a vários merges — ao reconciliá-lo, considere que muito do que o QA marcou `ABERTA` já não consta aqui por já estar resolvido.

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
| 7 | Padrões de data-fetching inconsistentes | Consistência | P1 | alto | vários (ver §4.6) |
| 8 | Teste desabilitado (freeze) | Qualidade | P1 | baixo | `AdminNotificationsPage/index.test.tsx:76` |
| 9 | ADM-06 sem disparo automático (sem `@Scheduled`) | Produto/Débito | P1 | médio | backend (decisão) |
| 10 | Endpoint/cliente de vínculos admin morto | Dead code | P2 | baixo | `fetchAdminVinculos`, `/api/admin/vinculos` |
| 11 | `GET /api/admin/vinculos` no controller errado | Smell | P2 | baixo | `AdminMetricsController.java:36` |
| 13 | Edital/doc abrem em nova guia em vez de download | Bug | P2 | baixo | `EditalCard.tsx:35,116`, `PrivateDocumentsCard.tsx:75` |
| 14 | Projetos não aparecem no perfil **privado** da ONG | Feature gap | P2 | médio | `OngProfilePage` |
| 15 | Componentes "god" (>500 linhas) | Smell | P2 | alto | ver §5.5 |
| 16 | Duplicação de helpers de display | DRY | P2 | baixo | `RelationshipService`/`AdminRelationshipService` |
| 17 | Mapeamento de status de vínculo espalhado | Consistência | P2 | baixo | `MyRelationshipsPage/vinculo.ts` |
| 18 | ADM-03 tabela em vez de cards + logo | Sprint 4 | P2 | médio | `AdminOngsList` |
| 19 | Sem reset de scroll entre etapas do cadastro | UX | P3 | trivial | `CompanyRegistration` |
| 20 | Mistura de sistemas de UI (MUI + Tailwind) | Consistência | P3 | alto | global |
| 21 | ADM-05 sem botão dedicado de export | Sprint 4 | P3 | baixo | `AdminDashboard` |
| 22 | Excluir projeto atrelado a vínculo "some" com o vínculo (sem safeguard/aviso) | Bug/Integridade | P1 | médio | exclusão de projeto + `MyRelationshipsPage` |
| 23 | Notificação de vínculo: falha silenciosa + `companyEmail` sem fallback + sem teste no fluxo ONG→empresa | Robustez/Observabilidade | P2 | baixo | `RelationshipService.java:191,414`, `ResendNotificationService.java:79` |
| 24 | Botão "Ver Denúncias" no dashboard admin é redundante (scroll sem efeito perceptível) | UX/Dead UI | P3 | trivial | `AdminDashboard/index.tsx:258-269` |
| 25 | `ReportNpoModal` (denunciar ONG) destoa do padrão dos demais modais (MUI + hex hardcoded) | UX/Consistência | P3 | baixo | `ReportNpoModal.tsx` |
| 26 | Pós-cadastro: ONG e Empresa são devolvidas ao formulário em vez do dashboard | Bug | P1 | médio | `RegisterPage/index.tsx:250`, `CompanyRegistration/registration/index.tsx`, `AuthRoleRedirect` |
| 27 | Cadastro trava se o e-mail já existe no Auth0 mas não no banco local | Bug | P1 | médio | fluxo de signup (front + `AuthRoleRedirect`); ver decisão §7.2 |
| 28 | Impacto ESG: pilares/projetos aparecem como 100% do total (soma > 100%) | Bug/Cálculo | P2 | médio | `ProjectService.java:296-320`, `ProjectRepository.java:46-96` |
| 29 | Ícones de modalidade do card "Projetos Apoiados" muito pequenos | UX | P3 | trivial | `CompanyDashboard` (card Projetos Apoiados) |

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

### 4.9 [#22] Excluir projeto atrelado a um vínculo faz o vínculo desaparecer
Ao **excluir um projeto** que está vinculado a um relacionamento (empresa↔ONG), o vínculo correspondente **deixa de ser exibido** (some de `/meus-vinculos`), sem qualquer safeguard ou aviso. Hoje a exclusão é silenciosa e leva embora o histórico do relacionamento.

- **Impacto:** perda de visibilidade/histórico do vínculo — pior se o vínculo já estava `active` (parceria efetivada). Pode confundir tanto a empresa quanto a ONG, que veem o vínculo "evaporar".
- **A confirmar em código:** se a exclusão é física (DELETE com `ON DELETE CASCADE` / órfão removido) ou apenas a query de listagem filtra projetos inativos/excluídos (vínculo persiste no banco, mas não aparece). Isso muda a gravidade e o fix.

**Decisões a tomar (produto + técnico):**
1. **Bloquear** a exclusão de projeto que tenha vínculos (especialmente `negotiation`/`active`), exigindo desfazer/encerrar o vínculo antes; ou
2. **Soft-delete** do projeto (arquivar) preservando o vínculo e exibindo "projeto arquivado/removido" no card do vínculo; ou
3. **Permitir** a exclusão, mas com **aviso explícito** ("este projeto possui N vínculos; eles serão encerrados/ocultados") e registro do encerramento.

**Fix mínimo enquanto não há decisão:** confirmação clara antes de excluir + não ocultar o vínculo silenciosamente (manter o card com o projeto marcado como removido). Ver também a decisão de produto em §7.6.

### 4.10 [#26] Pós-cadastro devolve o usuário ao formulário em vez do dashboard
Confirmado em teste manual (E2E-REG-01 ONG e E2E-REG-02 Empresa): ao concluir o cadastro, em vez de cair no dashboard do papel, o usuário é **devolvido ao formulário de cadastro**.
- **ONG:** `RegisterPage.handleNpoSignup` grava um draft em `sessionStorage` e chama `loginWithRedirect({ appState: { returnTo: "/ong/dashboard" } })` (`RegisterPage/index.tsx:245-259`). No retorno do Auth0, o `returnTo`/draft não está levando ao dashboard — a sessão volta para `/cadastro`.
- **Empresa:** mesmo sintoma no fluxo `CompanyRegistration/registration/index.tsx`.
- **Provável origem:** a resolução de papel pós-login em `AuthRoleRedirect` (vide #27) e/ou o consumo do draft de signup não concluem a criação/roteamento antes da guarda redirecionar de volta.
- **Fix:** garantir que, após o callback do Auth0 com draft de signup válido, o backend conclua o cadastro e o roteamento leve ao dashboard do papel; cobrir com E2E de cadastro feliz (hoje só há login das personas já criadas).

### 4.11 [#27] Cadastro trava quando o e-mail já existe no Auth0 mas não no banco local
Confirmado em teste manual (E2E-REG-02/09): se o e-mail já tem conta no **Auth0** porém **não** há usuário correspondente no banco local, o cadastro **não conclui** (loop/retorno ao formulário, sem mensagem clara). É a materialização funcional da decisão pendente §7.2 (sessão Auth0 residual): hoje não há caminho para "conta Auth0 existe, registro local não".
- **Fix (depende de §7.2):** detectar o estado (Auth0 ok + sem usuário local) e ou (a) concluir o cadastro local reaproveitando a identidade Auth0, ou (b) exibir mensagem clara orientando login/contato. Em qualquer caso, **não** voltar silenciosamente ao formulário.

---

## 5. P2 — Redundância, validações e estrutura

### 5.1 [#10] Endpoint + cliente de vínculos admin morto
- `fetchAdminVinculos` (`api/admin.ts:266`) só é referenciado pelo próprio teste; o app usa `fetchAdminRelationships` → `/api/admin/vinculos/search`.
- Par morto no backend: `GET /api/admin/vinculos` (`AdminMetricsController.java:36`) + `CompanyProjectRepository.findAllForAdmin` + DTO `AdminVinculoListItemResponse`.
- **Fix:** remover endpoint, repo method, DTO, função de API e tipos `AdminVinculoItem`/`AdminVinculoPage`.

### 5.2 [#11] Endpoint de listagem no controller de métricas
Mesmo que #10 não seja removido, `GET /api/admin/vinculos` está em `AdminMetricsController` — responsabilidade fora do lugar. Mover para `AdminController`/`AdminRelationshipController`.

### 5.3 [#13] Edital/documento abrem em nova guia em vez de baixar (AN-33)
`EditalCard.tsx:35` `window.open(fileUrl, "_blank")` e `:116` `target="_blank"`; mesmo padrão em `PrivateDocumentsCard.tsx:75`. **Fix:** download via `Content-Disposition: attachment` (backend) + âncora `download`, sem `window.open`; tratar erro sem navegar.

### 5.4 [#14] Projetos não aparecem no perfil privado da ONG (AN-21)
`OngProfilePage` não referencia projetos (sem `ProjectsSection`/`fetchNpoProfileProjects`). O perfil **público** mostra (`PublicProjectsSection`), o **privado** não. **Fix:** reusar o componente público no perfil privado.

### 5.5 [#15] Componentes "god" (>500 linhas)

| Arquivo | Linhas |
|---------|--------|
| `MyRelationshipsPage/index.tsx` | 850 |
| `CompanyRegistration/registration/index.tsx` | 714 |
| `EditProjectPage/index.tsx` | 644 |
| `announcement/CreateAnnouncementModal.tsx` | 535 |
| `AdminDashboard/index.tsx` | 525 |

Extrair subcomponentes e hooks de dados. Prioridade interna: `MyRelationshipsPage` (já contém `SummaryCard`, `VinculoCard`, `ActionButton`, etc. no mesmo arquivo).

### 5.6 [#16] Duplicação de helpers de display
`companyDisplayName`/`npoName`/`companyName` (lógica "socialName senão legalName") duplicados em `RelationshipService.java` e `AdminRelationshipService.java`. Extrair para helper compartilhado.

### 5.7 [#17] Mapeamento de status de vínculo espalhado
Backend usa enum lowercase (`pending`/`negotiation`/`active`/`inactive`); o frontend remapeia para `pending_interest`/`pending_waiting`/etc. em `MyRelationshipsPage/vinculo.ts`. Centralizar para evitar divergência entre as páginas de vínculo.

### 5.8 [#18] ADM-03 tabela em vez de cards + logo
`AdminOngsList` renderiza tabela; o critério pedia cards com logo (`logoUrl` existe no DTO mas não é exibido). Converter para cards ou alinhar o critério. (Detalhe em `sprint4-validacao.md`.)

---

### 5.9 [#23] Robustez/observabilidade das notificações de vínculo (fluxo ONG→empresa)
O envio de e-mail quando a **ONG propõe parceria** com uma empresa **funciona** (`RelationshipService.java:191-193` chama `interestReceived(companyEmail(company), ...)`; frontend envia `companyId` corretamente). Mas o fluxo tem pontos frágeis que tornam qualquer falha **invisível** e o tornam propenso a regressão:

1. **Falha de envio é engolida silenciosamente (por design).** `ResendNotificationService.send` captura qualquer erro e só loga (`ResendNotificationService.java:79-88`) — para não estourar a transação do `@Transactional`. Efeito colateral: o vínculo é criado, a UI mostra "Proposta enviada com sucesso!", mas se o e-mail falhou (destinatário nulo, endereço inválido, erro da API) **ninguém percebe**. É a explicação mais provável para a sensação de "não está enviando".
2. **`companyEmail` não tem fallback — assimetria com `npoEmail`.** `companyEmail(company)` (`RelationshipService.java:414-417`) faz `company.getUser().getEmail()` direto e devolve `null` se o `user` vier nulo/não carregado. Já `npoEmail` (`:419-429`) tem fallback via `userRepository`. No fluxo ONG→empresa o destinatário é a empresa (sem rede de proteção); no fluxo empresa→ONG é a ONG (com fallback).
3. **Cobertura de teste assimétrica.** Existe teste só para empresa-inicia (`RelationshipServiceTest.java:167` verifica `interestReceived` para a ONG). O caso ONG-inicia→empresa só tem o teste de *rejeição* de projeto alheio (`:170-185`); a **notificação para a empresa não é coberta** → regressão passa despercebida.
4. **Envio depende de config de ambiente.** Com `RESEND_API_KEY` vazio (`application.properties:31`) cai no `LoggingNotificationService` e **nenhum e-mail real sai** (vale para todos os fluxos, não só ONG→empresa).

**Fix sugerido (esforço baixo):**
- Dar a `companyEmail` o mesmo fallback de `npoEmail` (resolver via `userRepository` quando `user` vier nulo).
- Logar em **warn/error** quando o destinatário resolver para `null` *antes* de chamar `send` (hoje o nulo só falha lá no Resend, sem contexto do vínculo).
- Adicionar teste `createByNpoNotifiesCompany` espelhando o de empresa.
- (Opcional) Métrica/contador de falhas de envio para dar observabilidade ao item 1 sem quebrar a transação.

### 5.10 [#28] Impacto ESG: pilares somam mais de 100% (cada um pode dar 100%)
Confirmado em teste manual (E2E-EMP-04): na seção de Impacto ESG do dashboard da empresa os pilares aparecem com percentuais inflados — **cada pilar pode mostrar 100%** e a soma ultrapassa 100%.
- **Raiz:** o pilar ESG é derivado das **flags da ONG** (`npo.environmental`/`social`/`governance`), não do projeto. A query `ProjectRepository.sumByEsgPillarForCompany` (`ProjectRepository.java:46-96`) soma `invested_amount` por pilar via três blocos `UNION ALL` filtrando por `n.<flag> IS TRUE`. Uma ONG marcada como **ambiental+social** faz o investimento **inteiro** do projeto entrar nos **dois** pilares.
- O denominador `totalInvested` (`sumPortfolioTotalsByCompanyId`) conta **cada projeto uma vez**. Já o numerador por pilar (`pillarInvested`) **duplica** projetos de ONGs multi-flag. Logo `investmentPercentage = pillarInvested / totalInvested` (`ProjectService.java:332-340`) não é uma partição do total: cada pilar pode chegar a 100% e a soma estoura.
- **Evidência no seed:** `Instituto Projetos Vivos` é ambiental+social → um único vínculo ativo com um projeto seu aparece como Ambiental 100% **e** Social 100%.
- **Bônus (DRY):** os três blocos `UNION ALL` são quase idênticos (diferem só na coluna de flag) — candidatos a refatorar.
- **Fix (requer decisão de produto sobre a semântica):** ou (a) o percentual de cada pilar passa a ser sobre a **soma dos investimentos por pilar** (somando 100% no conjunto), ou (b) o investimento do projeto é **rateado** entre os pilares da ONG, ou (c) o pilar passa a ser uma classificação **por projeto** (um pilar dominante) em vez das flags da ONG. Hoje o teste unitário (`ProjectServiceTest`) usa dados sem sobreposição de pilar, por isso não pega o caso.

---

## 6. P3 — Refino e consistência

### 6.1 [#19] Sem reset de scroll entre etapas do cadastro (AN-10)
Nenhum `window.scrollTo` no fluxo `CompanyRegistration`. Ao avançar etapa (inclusive ODS), a rolagem não volta ao topo. **Fix:** `scrollTo({top:0})` na troca de `currentStep`. ⚠️ **Não reproduzido** em teste manual (E2E-REG-05) — confirmar se ainda ocorre antes de priorizar; pode já não acontecer dependendo da altura da etapa/viewport.

### 6.2 [#24] Botão "Ver Denúncias" no dashboard admin é redundante
O botão "Ver Denúncias" (`AdminDashboard/index.tsx:258-269`) só faz `document.getElementById("denuncias")?.scrollIntoView(...)` para a seção de denúncias que **já está na mesma página** (alvo em `:348`). Quando a seção já está visível ou a página é curta, o scroll não tem efeito perceptível — passa a impressão de que o botão "não faz nada". É **redundante** com a seção presente no próprio dashboard. **Fix:** remover o botão (provável) ou, se mantido, transformá-lo em algo útil (ex.: filtrar/abrir só denúncias pendentes). Confirmar com produto antes de remover.

### 6.3 [#25] Modal de denúncia da ONG (`ReportNpoModal`) destoa do padrão dos modais
Instância concreta de #20 (dois sistemas de UI). O `ReportNpoModal.tsx` é **MUI puro** (`Dialog`/`DialogContent`/`Button`/`TextField`/`Typography`/`Box`) com **cores hex hardcoded**, enquanto todos os outros modais (`DemonstrarInteresseModal`, `ConfirmDeleteProjectModal`, `ProporParceriaModal`) seguem o mesmo padrão Tailwind. Divergências:

| Aspecto | Padrão dos demais modais | `ReportNpoModal` |
|---------|--------------------------|------------------|
| Container | `<div>` overlay Tailwind (`fixed inset-0 z-[100] bg-slate-950/65`) + card `rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl` | MUI `<Dialog>`/`<DialogContent>`, `borderRadius: "10px"` |
| Botões | `BaseButton` (variants `ghost`/`secondary`/`outline`) | MUI `<Button>` `outlined`/`contained`, `height: 52` |
| Cores | tokens (`text-vinculo-dark`, `vinculo-red`, `vinculo-green`) | hex hardcoded (`#00467F`, `#E7000B`/`#C70009`, `#EFF6FF`, `#FFE2E2`, `#364153`, `#6A7282`) |
| Comportamento | `data-testid="modal-overlay"`, `Escape`/click-outside próprios | `onClose` do MUI |

**Efeito:** raio de borda, paleta, tipografia e botões diferentes dos demais diálogos — daí a sensação de "styling inconsistente". As cores hex inclusive **divergem dos tokens**: `#00467F` ≠ `vinculo-dark`, `#E7000B` ≠ `vinculo-red`. **Fix:** reescrever o modal no mesmo padrão Tailwind + `BaseButton` dos outros (ou, no mínimo, trocar os hex pelos tokens do tema). Bom candidato para padronizar junto de #20.

### 6.4 [#20] Dois sistemas de UI
Convivem MUI (`Button`/`Card`/`Chip`), Tailwind puro e componentes próprios (`FlexibleButton`, `MetricCard`). Definir sistema primário e encapsular o outro.

### 6.5 [#21] ADM-05 sem botão dedicado de export
Export de vínculos embutido no botão único "Exportar Dados". Funcional; separar só se o critério exigir literalmente.

### 6.6 [#29] Ícones de modalidade do card "Projetos Apoiados" muito pequenos
No dashboard da empresa (E2E-EMP-02), os ícones de modalidade ("documento" para Lei de Incentivo e "dinheiro" para Investimento Social) ficam **pequenos demais** ao lado dos contadores, prejudicando a leitura. **Fix:** aumentar o tamanho/`fontSize` dos ícones no card de Projetos Apoiados (`CompanyDashboard`).

---

## 7. Decisões de produto pendentes

1. **Posicionamento do acesso a vínculos** (QA-NAV-01.2): só no header, só nos dashboards, ou ambos — antes de remover botões.
2. **Sessão Auth0 residual** (QA-AUTH-01.3, AN-14): forçar login, selecionar conta ou exigir logout quando há sessão sem usuário no banco. ⚠️ Já causa bug funcional confirmado — ver #27 (cadastro trava com e-mail Auth0 órfão).
3. **Admin — mediações/notificações** (QA-ADM-01.2/01.3/01.6/01.7): o time implementou uma **página** `/admin/notificacoes`, enquanto o QA pedia uma **seção** no dashboard e a **remoção** dessa rota — caminhos opostos. Além disso, o card "Notificações Pendentes" hoje soma denúncias + vínculos vencidos (`AdminMetricsService.java:37`); o QA pedia renomear para "Denúncias Pendentes". Alinhar.
4. **Destino da própria ONG no detalhe do seu projeto** (QA-ONG-02.5, AN-24): perfil privado, dashboard ou ambos.
5. **Destaque visual do mural de editais** (QA-ONG-01.7, AN-20): intencional? quando some?
6. **Exclusão de projeto com vínculos** (#22): definir a política — bloquear exclusão, soft-delete/arquivamento preservando o vínculo, ou permitir com aviso e encerramento explícito do vínculo. Decide o comportamento esperado e o fix de §4.9.

Nenhuma decisão acima deve ser assumida silenciosamente na implementação.

---

## 8. Itens que exigem validação em runtime

Não verificáveis por inspeção estática — exigem E2E/observabilidade:

- **AN-01/02** (QA-DOC-01.6): contaminação de estado após erro (upload → consulta CNPJ).
- **AN-14** (QA-AUTH-01.3/01.4): sessão Auth0 residual sem usuário no banco.
- **AN-31** (QA-ADM-01.4): lentidão do dashboard admin (medir por request; hoje são 3 fetches independentes).
- **AN-23** (QA-ONG-02.3/02.4): lentidão do perfil público (evitar carregamento duplicado).
- **AN-16/17/19** (QA-ONG-01.*): transições bruscas, cache de projetos e atualização imediata após criação — mitigáveis pela padronização React Query (#7).

---

## 9. Sequência sugerida de execução

1. **Hotfix de segurança (1 PR):** #1 (P0) — backend do upload de documentos.
2. **Bugs de cadastro (1 PR):** #26, #27 — pós-cadastro volta ao formulário + e-mail Auth0 órfão (P1; depende de decisão §7.2).
3. **Quick wins (1 PR):** #2, #3, #6, #8 — correções triviais de bug/teste/validação.
4. **Validações de formulário (1 PR):** #5, #19 — edital (data) e scroll (confirmar #19 antes).
5. **Cálculo ESG (1 PR, requer decisão de semântica):** #28 — corrigir percentuais de pilar.
6. **Download correto (1 PR):** #13 — editais e documentos privados.
7. **Limpeza de dead code (1 PR):** #10, #11 — baixo risco.
8. **Consolidação de vínculos (1 PR, requer decisão §7.1):** #4, #17.
9. **Feature gap (1 PR):** #14 — projetos no perfil privado.
10. **Padronização incremental:** #7 (React Query) — resolve junto AN-16/17/19.
11. **Refino contínuo:** #15, #16, #18, #20, #21, #24, #25, #29 conforme tocar nas áreas.
12. **Decisões de produto:** §7 + #9 + #22.

---

## 10. Achados da automação E2E (Playwright)

> Achados **em aberto** levantados ao implementar a suíte E2E (`frontend/e2e/`). A cobertura Playwright vs. teste manual está consolidada em [`e2e-checklist.md`](./e2e-checklist.md) §11.

### 10.1 Contrato de `GET /api/editais` mudou para paginado — **P3 (doc/contrato)**
O endpoint passou a retornar um `Page` do Spring (`{ content: [...], totalElements, ... }`) em vez de um array puro. É **intencional** (o cliente `api/editais.ts:143` lê `paged.content`), mas pode surpreender outros consumidores. Registrar a mudança de contrato para quem integra.

### 10.2 Nome de exibição do parceiro empresa diverge do da ONG nos vínculos — **P3**
Em `/meus-vinculos`, a **empresa** aparece pelo nome fantasia (ex.: "Horizonte", "Alianca", "Multipla") enquanto a **ONG** aparece com o nome completo ("Instituto Projetos Vivos"). Provém da regra `socialName` senão `legalName` (ver #16). Confirmar se a assimetria é intencional; se não, padronizar a exibição.

### 10.3 Atraso read-after-write no botão "Demonstrar Interesse" — **P3**
Logo após a empresa enviar interesse e **recarregar** a página do projeto, `useExistingRelationship` (`hooks/useExistingRelationship.ts`) às vezes ainda não enxerga o vínculo recém-criado, mantendo o botão como "Demonstrar Interesse" por alguns segundos. Em sessão (sem reload) o estado é imediato via `sentInThisSession`. Mesma família de AN-16/17/19 (atualização imediata). **Fix:** invalidar/refetch da lista de relationships após `createRelationship` (ou usar React Query com invalidação), em vez de depender de novo fetch no mount.

---

### Referências
- [`sprint4-validacao.md`](./sprint4-validacao.md) — validação detalhada de aceite do Sprint 4.
- [`e2e-checklist.md`](./e2e-checklist.md) — roteiro de testes E2E + cobertura Playwright vs. manual (§11).
- Suíte E2E: `frontend/e2e/` — `auth.setup.ts` (login das 6 personas via Auth0 + storageState), specs por persona + `mutating.spec.ts`. Rodar: `cd frontend && npm.cmd run test:e2e` (headless).
