# Checklist de Testes E2E — VinculoHub Portal

> Roteiro de validação manual/automatizada com a **plataforma rodando**, cobrindo todos os fluxos das 3 personas (Empresa, ONG, Admin), do cadastro aos vínculos.
> Defeitos confirmados aqui devem ser registrados no backlog único [`code-review-consolidado.md`](./code-review-consolidado.md) (com `file:line` quando possível).
>
> Convenção de marcação por item: `[ ]` a testar · `[x]` passou · `[!]` falhou (abrir item no backlog) · `[~]` parcial/observação.

---

## 0. Pré-requisitos do ambiente

| Item | Valor |
|------|-------|
| Subir stack | `docker compose up -d --build` |
| Frontend | `http://localhost` (Playwright `baseURL`) / dev `http://localhost:5173` |
| Backend | `http://localhost:8080` |
| Swagger | `http://localhost:8080/swagger-ui.html` |
| Cenários seedados | `APP_TEST_SCENARIOS_ENABLED=true` no `.env` (default é `false`) |
| Rodar E2E automatizado | `cd frontend && npm.cmd run test:e2e` |

- [x] Stack sobe sem erros (`docker compose ps` todos `healthy`).
- [ ] Seeder rodou: log "Development and E2E test scenarios loaded." (ou "already loaded").
- [ ] Auth0 configurado (`AUTH0_*`, `VITE_AUTH0_*`) — sem isso o login falha (bloqueio ambiental, não funcional).

---

## 1. Credenciais dos usuários (cenário seedado)

> Os usuários são criados no banco pelo seeder (`TestScenarioSeeder` → `01_scenario_definitions.sql`). As **senhas vivem no Auth0 / cofre de segredos**, não no repositório. Preencha a coluna *Senha* a partir do cofre da equipe e **não commite senhas reais** neste arquivo (use um `.env` local ou gerenciador de segredos).

| Persona | Cenário | Login (e-mail) | `auth0_id` | Senha |
|---------|---------|----------------|------------|-------|
| **Empresa** | sem vínculos | `e2e.company.empty@vinculohub.test` | `auth0\|6a3080b7cd92f499f988ff9e` | Teste123! |
| **Empresa** | 1 vínculo ativo | `e2e.company.active@vinculohub.test` | `auth0\|6a3080a930e31f8544d1008c` | Teste123! |
| **Empresa** | vários vínculos | `e2e.company.multiple@vinculohub.test` | `auth0\|6a308099cd92f499f988ff8b` | Teste123! |
| **ONG** | com projetos | `e2e.npo.projects@vinculohub.test` | `auth0\|6a308086cd92f499f988ff7b` | Teste123! |
| **ONG** | com denúncias | `e2e.npo.reported@vinculohub.test` | `auth0\|6a308065bf0afb7fc359689c` | Teste123! |
| **Admin** | — | `e2e.admin@vinculohub.test` | `auth0\|6a331bda1c18d613abf56327` | Teste123! |

### Estado seedado (o que esperar em cada conta)

> **Nota sobre `project_type`:** é a **modalidade de captação** (`TAX_INCENTIVE_LAW` = "Lei de Incentivo", `SOCIAL_INVESTMENT_LAW` = "Investimento Social Privado") — é por isso que o dashboard da empresa conta "Leis de incentivo"/"Investimento privado" e a ONG vê "Projetos por Tipo". A área/tema ESG do projeto vem do `focus_area` + ODS + flags da ONG, separadamente.

**ONGs**
- `Instituto Projetos Vivos` (npo_projects): 3 projetos ATIVOS — **Educacao para Todos** (`TAX_INCENTIVE_LAW`), **Clima em Acao** (`SOCIAL_INVESTMENT_LAW`), **Bairros Sustentaveis** (`TAX_INCENTIVE_LAW`). Áreas ESG: ambiental+social.
- `Instituto Cidadania` (npo_reported): 1 projeto ATIVO — **Renda e Autonomia** (`SOCIAL_INVESTMENT_LAW`). Possui denúncias; áreas social+governança.

**Empresas / vínculos**
- `Empresa Horizonte` (company_empty): **nenhum** vínculo.
- `Empresa Alianca` (company_active): 1 vínculo **ATIVO** com *Educacao para Todos* (iniciado pela empresa).
- `Empresa Multipla` (company_multiple): 3 vínculos —
  - *Clima em Acao*: **negotiation** (iniciado pela empresa);
  - *Bairros Sustentaveis*: **pending**, iniciado pela **ONG** → a empresa é **receptora** (pode Aceitar/Recusar);
  - *Renda e Autonomia*: **ATIVO** (iniciado pela ONG).

**Denúncias (admin)**
- `Instituto Cidadania` denunciada por `Empresa Alianca` → **OPEN**.
- `Instituto Cidadania` denunciada por `Empresa Multipla` → **RESOLVED**.

> ℹ️ Vínculos **ativos** por modalidade (úteis para conferir contadores): `Empresa Alianca`→*Educacao* (Lei de Incentivo); `Empresa Multipla`→*Renda e Autonomia* (Investimento Social Privado).

---

## 2. Global / Autenticação

| ID | Fluxo | Passos | Esperado | ✔ |
|----|-------|--------|----------|---|
| E2E-AUTH-01 | Landing pública | Abrir `/` | Título "VinculoHub Portal"; conteúdo sem redirect a Auth0 | [x] |
| E2E-AUTH-02 | Rotas protegidas | Abrir `/ong/dashboard`, `/empresa/dashboard`, `/admin/dashboard`, `/editais` deslogado | Redireciona a Auth0 (ou loading), nunca renderiza conteúdo | [x] | Redirect admin/signup corrigido no PR #320 (Bugs 1/2); coberto por `sprint3.spec` |
| E2E-AUTH-03 | Rota pública de ONG | Abrir `/ong/publico/1` deslogado | Carrega sem redirect a Auth0 | [x] |
| E2E-AUTH-03b | Rota pública de projeto | Abrir `/projeto/1` deslogado | Carrega sem redirect a Auth0 (público após PR #320) | [x] | `sprint3.spec` |
| E2E-AUTH-10 | GuestOnlyRoute | Logado, abrir `/cadastro`/`/cadastro/instituicao` | Redireciona ao dashboard do papel (PR #320, Bug 3) | [x] | `auth.spec` (ONG/empresa/admin) |
| E2E-AUTH-04 | Login Empresa | Entrar com `company.multiple` | Redireciona para `/empresa/dashboard` | [x] |
| E2E-AUTH-05 | Login ONG | Entrar com `npo.projects` | Redireciona para `/ong/dashboard` | [x] |
| E2E-AUTH-06 | Login Admin | Entrar com `admin` | Redireciona para `/admin/dashboard` | [X] |
| E2E-AUTH-07 | Logout | Clicar "Sair" no header | Volta à landing; rotas protegidas voltam a redirecionar | [x] |
| E2E-AUTH-08 | Header por papel | Logado como admin | **NÃO** mostra botão "Vínculos"; ONG/Empresa mostram | [x] |
| E2E-AUTH-09 | Sessão Auth0 residual | Logar Auth0 com conta sem registro no banco | Não cadastra silenciosamente (ver decisão de produto §7.2 do backlog; bug relacionado #27) | [?] |

---

## 3. Cadastro (ONG e Empresa)

| ID | Fluxo | Passos | Esperado | ✔ |
|----|-------|--------|----------|---|
| E2E-REG-01 | Cadastro ONG — happy path | Percorrer wizard de `/cadastro/instituicao` até concluir | Cria conta e vai ao `/ong/dashboard` | [!] | **backlog #26** — ONG devolvida ao formulário de cadastro após registro (deveria ir ao dashboard)
| E2E-REG-02 | Cadastro Empresa — happy path | Percorrer `/company/register` até concluir | Cria conta e vai ao `/empresa/dashboard` | [!] | **backlog #26** (empresa devolvida ao formulário) + **#27** (não finaliza se e-mail já existe no Auth0 e não no banco local)
| E2E-REG-03 | Reinício após sucesso | Concluir um cadastro e iniciar outro | Novo cadastro começa **vazio** (sem draft antigo) | [x] |
| E2E-REG-04 | CEP autopreenche endereço | Informar CEP válido | Cidade/UF/rua preenchidos | [x] |
| E2E-REG-05 | Scroll entre etapas | Avançar etapas (incl. ODS) | Rolagem volta ao topo *(backlog #19)* | [?] | Não consegui replicar — backlog #19 marcado "não reproduzido"
| E2E-REG-06 | Número do endereço — alfanumérico | Digitar letras+números no "Número" (ex.: `123A`, `S/N`) | **Aceitar** letras e números (decisão de produto) | [x] | Comportamento correto; #12 removido do backlog
| E2E-REG-07 | Número do endereço — negativo | Digitar `-5` | — | [-] | Irrelevante (decisão de produto)
| E2E-REG-08 | E-mail TLD numérico | Usar `xx@xx.23` | Deve rejeitar antes do Auth0 *(hoje aceita — backlog #6)* | [!] | Confirmado — backlog #6
| E2E-REG-09 | E-mail já em uso | Cadastrar e-mail existente | Bloqueia com mensagem clara | [!] |
| E2E-REG-10 | CNPJ inválido | Informar CNPJ inválido | Validação impede avanço | [x] |
| E2E-REG-11 | Validações obrigatórias | Avançar com campos vazios | Mensagens por campo, sem avançar | [x] |

---

## 4. Persona: EMPRESA

| ID | Fluxo | Passos | Esperado | ✔ |
|----|-------|--------|----------|---|
| E2E-EMP-01 | Dashboard — nome real | Logar `company.multiple` | Cabeçalho "Bem-vindo de volta, Empresa Multipla" (sem mock) | [x] |
| E2E-EMP-02 | Card Projetos Apoiados | Ver dashboard | Total ativos + "Leis de incentivo" + "Investimento privado" com dados reais | [~] | Dados OK em `empresa.spec` EMP-02/02b (contadores reais). UI: ícones de modalidade muito pequenos → **backlog #29** |
| E2E-EMP-03 | "Ver todos os projetos" | Clicar no card | Vai a `/meus-vinculos?filter=active` com filtro "Ativos" | [x] |
| E2E-EMP-04 | Impacto ESG | Ver seção ESG | Pilares carregam (loading/erro tratados); só vínculos **ativos** contam | [!] | **backlog #28** — pilares aparecem como 100% (soma > 100%); pilar vem das flags da ONG e duplica investimento
| E2E-EMP-05 | Vitrine de ONGs | Seção de ONGs no dashboard | Lista ONGs; card clicável + botão "Ver perfil" abre perfil público | [x] | `empresa.spec` (card virou `button`, não mais ícone — PR #320) |
| E2E-EMP-06 | Perfil público da ONG | Abrir ONG da vitrine | Mostra dados + **projetos** (nome, status, ODS), somente leitura | [x] | ✅ PR #320: agora **dá** para abrir o detalhe do projeto pelos cards (eram estáticos). `empresa.spec` EMP-06 |
| E2E-EMP-06b | Denunciar ONG (perfil público) | Empresa logada abre perfil público | Botão "Denunciar ONG" visível (abre modal) | [x] | PR #320, Bug 6; `empresa.spec` EMP-06b |
| E2E-EMP-07 | Descobrir projeto | Card do projeto no perfil público → detalhe | Vai a `/projeto/:id`; botão de interesse visível | [x] | PR #320, Bug 5; `empresa.spec` EMP-07 |
| E2E-EMP-08 | Iniciar vínculo (interesse) | `company.empty` declara interesse em *Educacao* (navegando pela UI) | Status vira "Pendente"; e-mail à ONG; sem chat | [x] | `mutating.spec` (fluxo UI completo) |
| E2E-EMP-09 | Interesse duplicado | Repetir interesse no mesmo projeto | Bloqueia/desabilita ("Interesse já enviado") | [x] | `mutating.spec` (ver §11.5: pequeno atraso read-after-write) |
| E2E-EMP-10 | Interesse em projeto inativo | Tentar projeto não-ACTIVE | Bloqueado (400) | [ ] | Sem projeto inativo seedado |
| E2E-EMP-11 | Meus Vínculos — listagem | `company.multiple` abre `/meus-vinculos` | Vê pending/negotiation/active com filtros e contadores reais | [x] | `empresa.spec` EMP-11 |
| E2E-EMP-12 | Responder como receptor | Vínculo *Bairros Sustentaveis* (pending, iniciado pela ONG) | Botões "Aceitar"/"Recusar" visíveis; aceitar → negotiation + contato revelado | [x] | `empresa.spec` EMP-12 (visibilidade) + `mutating.spec` (aceite real) |
| E2E-EMP-13 | Efetivar parceria (2º aperto) | Vínculo em negotiation | "Efetivar Parceria"/"Aguardando confirmação"; após ambos → Ativo | [x] | `empresa.spec` EMP-13 + `mutating.spec` FLOW-01 |
| E2E-EMP-14 | Cancelar negociação | Em um vínculo negotiation | Encerra e notifica a outra parte | [ ] | Não automatizado (destrutivo) |
| E2E-EMP-15 | Contato oculto em pending | Vínculo pending | E-mail/telefone do parceiro **não** aparecem | [x] | `empresa.spec` EMP-15 |

---

## 5. Persona: ONG

| ID | Fluxo | Passos | Esperado | ✔ |
|----|-------|--------|----------|---|
| E2E-ONG-01 | Dashboard | Logar `npo.projects` | Mostra projetos e métricas reais | [x] | `ong.spec` ONG-01 + "Projetos por Tipo" (modalidades) |
| E2E-ONG-02 | "Ver Todos" projetos | Clicar | Abre `/ong/projetos` com feedback de transição | [x] | `ong.spec` ONG-02 |
| E2E-ONG-03 | Filtro por status | Trocar status no dashboard | Filtra sem tela vazia/recarga brusca *(ver backlog #7/AN-17)* | [x] | `ong.spec` ONG-03 |
| E2E-ONG-04 | Criar projeto | Criar via modal | Novo card aparece sem reload manual *(AN-19)* | [x] | `mutating.spec` ONG-04 |
| E2E-ONG-05 | Editar projeto | `/ong/projetos/:id/editar` | Salva e reflete na listagem | [ ] |
| E2E-ONG-06 | Vitrine de Empresas | Seção de empresas no dashboard | Lista empresas; card clicável + "Ver perfil" abre `/empresa/publico/:id` *(PR #320)* | [ ] | Mesma mudança card→button do EMP-05 |
| E2E-ONG-07 | Propor parceria | Abrir perfil de empresa → "Propor Parceria" | Exige selecionar **projeto próprio ativo**; cria pending + e-mail | [ ] |
| E2E-ONG-08 | Propor com projeto alheio/inativo | Tentar | Bloqueado | [ ] |
| E2E-ONG-09 | Responder interesse recebido | Vínculo pending iniciado pela empresa | Aceitar → negotiation + contatos; Recusar → encerra + e-mail | [x] | `mutating.spec` ONG-09 (aceite + contato revelado) |
| E2E-ONG-10 | Efetivar parceria | Vínculo negotiation | Confirma; ativa só após ambos | [x] | `mutating.spec` FLOW-01 |
| E2E-ONG-11 | Perfil privado | `/ong/perfil` | Dados editáveis **e projetos listados** *(hoje sem projetos — backlog #14)* | [x] | `ong.spec` ONG-11 (carrega; projetos = backlog #14) |
| E2E-ONG-12 | Editar perfil | Salvar alterações | Persiste e reflete | [ ] |
| E2E-ONG-13 | Perfil público | `/ong/publico/:id` | Carrega rápido; projetos visíveis e **clicáveis** (PR #320); sem dados privados | [x] | `empresa.spec` EMP-06/07 |
| E2E-ONG-14 | Upload de documento | Enviar documento privado | Sucesso; associado à **ONG logada** (não ao id 1) | [ ] |
| E2E-ONG-15 | Documento aparece na lista | Após upload | Aparece sem reload *(AN-22)* | [ ] |
| E2E-ONG-16 | Download de documento | Baixar documento privado | Inicia **download** (hoje abre nova guia — backlog #13) | [ ] |
| E2E-ONG-17 | Mural de editais | `/editais` | Lista editais ativos | [x] | `ong.spec` ONG-17 |
| E2E-ONG-18 | Paginação de documentos | Perfil ONG com 6+ docs | Pagina 5/pág sem scroll/colapso (PR #320, Bug 4) | [ ] | Sem documento seedado — validar manual |

---

## 6. Persona: ADMIN

| ID | Fluxo | Passos | Esperado | ✔ |
|----|-------|--------|----------|---|
| E2E-ADM-01 | Dashboard — métricas reais | Logar `admin` | 4 cards com contagens reais (ONGs, editais, vínculos ativos, pendências); skeleton/erro | [x] | `admin.spec` ADM-01 |
| E2E-ADM-02 | Card → /admin/ongs | Clicar "Total de ONGs" | Abre listagem de ONGs (sem 404) | [x] | `admin.spec` ADM-02 |
| E2E-ADM-03 | Card → /admin/vinculos | Clicar "Vínculos Ativos" | Abre listagem de vínculos (sem 404) | [x] | `admin.spec` ADM-03 |
| E2E-ADM-04 | Listagem de ONGs + filtros | `/admin/ongs` | Filtra por área e status; paginação; link p/ perfil público | [x] | `admin.spec` ADM-04 (abertura; filtros não exaustivos) |
| E2E-ADM-05 | Listagem de vínculos + filtros | `/admin/vinculos` | Filtra por empresa/ONG/projeto/status; paginação | [x] | `admin.spec` ADM-05 (abertura) |
| E2E-ADM-06 | Denúncias | Seção de denúncias | Lista (1 OPEN, 1 RESOLVED de *Instituto Cidadania*); trocar status funciona | [x] | `admin.spec` ADM-06 |
| E2E-ADM-07 | Filtro de denúncias | Tabs OPEN/RESOLVED/DISMISSED + nome | Filtra corretamente; contador "pendentes" | [x] | `admin.spec` ADM-07 |
| E2E-ADM-08 | Botão Mediações | Clicar "Mediações" | Abre `/admin/notificacoes` (ver divergência de design §7.3 do backlog) | [x] | `admin.spec` ADM-08 |
| E2E-ADM-09 | Notificações/Mediações | `/admin/notificacoes` | Lista vínculos vencidos (overdue 7d) + denúncias; campos empresa/ONG/projeto/data | [ ] |
| E2E-ADM-10 | Exportar dados | Clicar "Exportar Dados" | Baixa 3 CSVs (ONGs, Empresas, Vínculos) | [ ] |
| E2E-ADM-11 | Cadastrar Edital | Abrir modal e publicar | Cria edital; aparece no mural | [x] | `mutating.spec` ADM-11 |
| E2E-ADM-12 | Edital com prazo passado | Escolher data de ontem | Deve rejeitar *(hoje aceita — backlog #5)* | [ ] |
| E2E-ADM-13 | Carregamento independente | Forçar falha de uma seção | Demais seções continuam funcionando *(AN-31/ADM-01.5)* | [ ] |

---

## 7. Fluxo cross-persona (handshake completo)

| ID | Fluxo | Passos | Esperado | ✔ |
|----|-------|--------|----------|---|
| E2E-FLOW-01 | Aperto de mão completo | Empresa declara interesse → ONG aceita → empresa confirma → ONG confirma | Status percorre pending → negotiation → active | [x] | `mutating.spec` FLOW-01 |
| E2E-FLOW-02 | Contato revelado | Após aceite (negotiation) | E-mail/telefone de ambos visíveis mutuamente | [x] | `mutating.spec` ONG-09 / `empresa.spec` EMP-15 |
| E2E-FLOW-03 | ESG só com ativo | Após vínculo virar Ativo | Projeto passa a contar no Impacto ESG da empresa | [ ] |
| E2E-FLOW-04 | Recusa encerra | ONG recusa interesse | Vínculo inactive; empresa notificada | [ ] |
| E2E-FLOW-05 | SLA de mediação | Vínculo pending > 7 dias (*Bairros Sustentaveis* é pending) | Aparece nas mediações do admin | [ ] |
| E2E-FLOW-06 | Notificações por e-mail | Cada transição | E-mail disparado ao destinatário correto (verificar Resend/log) | [ ] |

---

## 8. Editais

| ID | Fluxo | Passos | Esperado | ✔ |
|----|-------|--------|----------|---|
| E2E-EDIT-01 | Download sem popup | Abrir arquivo de um edital | Inicia download, sem nova guia *(hoje abre guia — backlog #13)* | [ ] |
| E2E-EDIT-02 | Erro de download | Simular storage indisponível | Mensagem de erro sem navegar para fora | [ ] |
| E2E-EDIT-03 | Prazo válido | Publicar com data futura | Aceito | [ ] |
| E2E-EDIT-04 | Prazo no passado | Publicar com data passada | Rejeitado no front e no back *(backlog #5)* | [ ] |

---

## 9. Segurança (nível de API)

| ID | Fluxo | Passos | Esperado | ✔ |
|----|-------|--------|----------|---|
| E2E-SEC-01 | Sem token | `POST/GET /api/documents`, `PUT/DELETE /api/projects/1` sem Authorization | 401 | [ ] |
| E2E-SEC-02 | Upload com npoId alheio | Logado como ONG-A, `POST /api/documents` com `npoId` da ONG-B | **Deve recusar/ignorar e usar a ONG do token** *(hoje aceita — backlog #1, P0)* | [ ] |
| E2E-SEC-03 | Listagem cruzada | Logado como ONG-A, `GET /api/documents?npoId=<B>` | Não deve expor docs de outra ONG *(backlog #1)* | [ ] |
| E2E-SEC-04 | Endpoint admin sem role | Logado como empresa, chamar `/api/admin/*` | 403 | [ ] |
| E2E-SEC-05 | Responder vínculo alheio | Ator não-participante tenta accept/reject/confirm | 403 | [ ] |

---

## 10. Como registrar resultados

1. Marque cada item (`[x]`/`[!]`/`[~]`) e anote observações ao lado.
2. Para cada `[!]` (falha) confirmado, **abra/atualize um item no backlog** [`code-review-consolidado.md`](./code-review-consolidado.md), com persona, passos, comportamento observado vs esperado e `file:line` se conhecido.
3. Itens que já têm defeito mapeado citam o número do backlog (ex.: *backlog #1*) — basta confirmar e anexar evidência.
4. Bloqueios de ambiente (Docker/Testcontainers/Auth0) são registrados como **bloqueio ambiental**, não como falha funcional.

---

## 11. Cobertura: Playwright (automatizado) vs. teste manual

> Como cada item **que passou** foi verificado. `[ ]` (a testar), `[!]` (falha) e `[?]` (inconclusivo) **não** entram aqui — estão nas tabelas acima e, quando confirmados, no backlog.

### 11.1 Passaram por Playwright (automatizado)

Specs em `frontend/e2e/`. Login das 6 personas é feito por `auth.setup.ts` (Auth0 + `storageState`), então os logins/redirect por papel já são exercidos automaticamente.

| Spec | Itens cobertos |
|------|----------------|
| `auth.setup.ts` | E2E-AUTH-04, -05, -06 (login + redirect por papel) |
| `auth.spec.ts` | E2E-AUTH-10 (GuestOnlyRoute ONG/empresa/admin) |
| `sprint3.spec.ts` | E2E-AUTH-02 (rotas protegidas), E2E-AUTH-03b (`/projeto/1` pública) |
| `empresa.spec.ts` | E2E-EMP-05, -06, -06b, -07, -11, -12 (visibilidade), -13, -15; E2E-ONG-13 |
| `ong.spec.ts` | E2E-ONG-01, -02, -03, -11, -17 |
| `admin.spec.ts` | E2E-ADM-01, -02, -03, -04, -05, -06, -07, -08 |
| `mutating.spec.ts` | E2E-EMP-08, -09, -12 (aceite real), -13 (FLOW-01); E2E-ONG-04, -09, -10; E2E-ADM-11; E2E-FLOW-01, -02 |

### 11.2 Passaram por teste manual (sem cobertura automatizada)

- **Auth:** E2E-AUTH-01 (landing pública), -03 (rota pública de ONG deslogado), -07 (logout), -08 (header por papel).
- **Cadastro:** E2E-REG-03 (reinício sem draft), -04 (CEP autopreenche), -06 (número aceita alfanumérico — decisão de produto), -10 (CNPJ inválido), -11 (validações obrigatórias).
- **Empresa:** E2E-EMP-01 (nome real no dashboard), -02 (dados do card — *parcial*, ver #29), -03 ("Ver todos" → `/meus-vinculos?filter=active`).

### 11.3 Notas operacionais da suíte

- **`mutating.spec.ts` altera o seed** (cria projetos/editais e ativa um vínculo `company.empty`↔*Educacao para Todos*). É resiliente a reexecução, mas para um "happy path" limpo rode com seed fresco: `docker compose down -v && docker compose up -d --build`.
- **Frontend é build estático servido por nginx** — toda mudança de front exige `docker compose up -d --build frontend` para o container refletir o código (rodar testes contra container desatualizado dá falsos negativos).
- **Evidência positiva (handshake):** o fluxo `pending → negotiation → active` com revelação de contato após o aceite foi validado fim-a-fim por `mutating.spec.ts` (E2E-FLOW-01/02). A efetivação é **sequencial** — cada parte confirma na sua vez; ambos os lados exibem "Efetivar Parceria" enquanto pendentes da própria confirmação.
