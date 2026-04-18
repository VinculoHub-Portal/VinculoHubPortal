# VinculoHub Portal — Revisão de Código

> **Escopo:** Análise completa de consistência, qualidade e prontidão para produção.
> **Última atualização:** Abril 2026

---

## Legenda

| Severidade | Significado |
|------------|-------------|
| **CRÍTICO** | Quebrado ou explorável; bloqueia funcionalidade central |
| **ALTO** | Bug significativo, falha de segurança ou risco de integridade de dados |
| **MÉDIO** | Comportamento incorreto em edge cases, inconsistência ou degradação de UX |
| **BAIXO** | Polimento, código morto ou inconsistência menor |

| Prioridade | Significado |
|------------|-------------|
| **P0** | Corrigir agora |
| **P1** | Corrigir nesta sprint |
| **P2** | Corrigir na próxima sprint |
| **P3** | Backlog |

---

## Problemas Já Corrigidos

| Item | Descrição |
|------|-----------|
| Enter no step 4 resetava wizard para step 2 | Forms sem `onSubmit` causavam submit nativo. Adicionado `preventDefault`. |
| Step 5 da ONG era placeholder vazio | Step removido do array; wizard vai direto ao "Finalizar". |
| Link "Já tenho login" levava a página em branco | Substituído por `<button>` com `loginWithRedirect()`. |
| Typo "CNPJ invalido" sem acento | Corrigido para "CNPJ inválido". |
| CEP preenchia "Complemento" em vez de "Número" | ViaCEP `complemento` redirecionado para `number`/`streetNumber` + truncamento `.slice(0, 20)`. |
| ViaCEP complemento > 20 chars causava 500 | Truncamento adicionado antes de atualizar estado React. |
| `@Valid` ausente no `CompanyController` | Adicionado `@Valid` + `spring-boot-starter-validation` + handler `MethodArgumentNotValidException`. |
| Entidades JPA duplicadas (`User` vs `Users`) | Deletados `Users.java`, `UsersRepository.java`, `UsersService.java`. |
| `UserType` enum duplicado | Deletado `model/UserType.java`; consolidado em `model/enums/UserType.java`. |
| `IllegalArgumentException` retornava 500 | Substituído por `BadRequestException` + handler global. |
| `CompanyDTO` — `phone` e `logoUrl` obrigatórios | Corrigidos para opcionais; `user`/`address` usam `@NotNull @Valid`. |
| Wizard empresa avançava sem "Número" | Validação no step 3: CEP + Número obrigatórios. |
| `CompanyAlreadyExistsException` — typo "comany" | Mensagens distintas por cenário (CNPJ, Auth0 ID, email). |
| `@Slf4j` ausente em serviços críticos | Adicionado em 7 serviços (`NpoAccountService`, `NpoService`, `NpoDocumentService`, `NpoEsgService`, `AddressService`, `CepValidationService`, `CnpjValidationService`). |
| `Company.java` sem `@SQLRestriction` | Adicionado `@SQLRestriction("deleted_at IS NULL")`. |
| `@Temporal` desnecessário no `Company.java` | Removidos 3 `@Temporal` redundantes. |
| Dependências duplicadas no `pom.xml` | Removidos `springdoc-openapi` duplicado e `thymeleaf-extras` não utilizado. |
| Mensagens de erro backend em inglês/sem acento | Padronizado para PT-BR com acentos em todas as exceções e serviços. |
| Erros genéricos do Axios (ex: "Request failed with status code 404") | Criado `getApiErrorMessage()` com fallbacks amigáveis. Aplicado em CEP e CNPJ. |
| `api.tsx` com extensão `.tsx` sem JSX | Renomeado para `api.ts`. |
| Strings de validação sem acento no frontend | Corrigidos acentos em `validation.ts` e `company/registration/index.tsx`. |
| Código morto no frontend | Removidos: `useAuth.ts`, `useCompany.ts`, `formatter.ts`, `theme.ts`, `types/index.ts`, `OngCard.tsx`, `LoginButton.tsx`, `LogoutButton.tsx`, `validateCpf.ts` + código comentado (`LogoUpload`, `entityIcon`). |
| Validadores desalinhados com steps da ONG | Array em `wizard.config.ts` alinhado com os 3 steps reais. |
| Gramática incorreta em `NpoStepThree` | "pilares que a ONG atua" → "pilares em que a ONG atua". |
| `WizardSingUp` — typo no nome | Export, props type e imports renomeados para `WizardSignUp` em todos os arquivos. |
| Pastas inconsistentes (camelCase/lowercase) | `pages/company/` → `CompanyRegistration/`; `assets/landingPage/` → `LandingPage/`. Imports atualizados. |
| Nomes de arquivo não batem com exports | `SimpleTextInput.tsx` → `Input.tsx`; `SimpleTextArea.tsx` → `TextArea.tsx`. Imports atualizados em 4 arquivos. |
| Exports mistos (default vs named) | Todos os pages e componentes padronizados para named exports. `HeroIcon`, `InfoTab` inclusos. Router atualizado. |
| Falha no CEP travava campos permanentemente | Campos de endereço agora editáveis quando CEP não retornou dados (`disabled={!!zipCodeData}`). Ambos os fluxos. |
| Queries CNPJ/CEP em todos os steps | Queries agora limitadas ao step relevante (CNPJ no step 2, CEP no step 3). |
| `useAuthenticatedApi` nunca importado | Removido de `api.ts`. Imports desnecessários de `useAuth0` e `useMemo` limpos. |

---

## 1. Bugs e Funcionalidade

### 1.1 Estado do wizard perdido ao recarregar a página

| Sev/Pri | CRÍTICO / P0 |
|---|---|
| **Arquivos** | `frontend/src/pages/company/registration/index.tsx`, `frontend/src/pages/RegisterPage/index.tsx` |

Todos os campos do formulário e o `currentStep` são `useState` efêmero. O rascunho só é salvo no `sessionStorage` antes do redirect Auth0. Qualquer recarga, restauração de aba ou navegação acidental apaga todo o progresso. Afeta ambos os fluxos (ONG e Empresa).

**Correção:** Persistir step + dados do formulário no `sessionStorage` a cada mudança e reidratar na montagem.

---

### 1.2 Erros de cadastro são engolidos — usuário vai pro dashboard sem conta

| Sev/Pri | MÉDIO / P1 |
|---|---|
| **Arquivos** | `frontend/src/components/auth/AuthRoleRedirect.tsx` |

Quando o POST do rascunho falha (409 duplicado, 400 inválido, rede), o erro é logado e o fluxo continua. O JWT já tem o role atribuído pelo Auth0, então `resolvePrimaryRole` roteia pro dashboard sem conta no banco. O rascunho permanece no `sessionStorage` e será reenviado a cada login.

**Correção:** Em falha de envio, não navegar pro dashboard. Redirecionar para `/cadastro` com a mensagem de erro da API.

---

### 1.3 Sem validação cruzada de unicidade de CPF/CNPJ entre ONG e Empresa

| Sev/Pri | ALTO / P1 |
|---|---|
| **Arquivos** | `backend/.../service/CompanyService.java`, `backend/.../service/NpoDocumentService.java` |

O sistema não garante unicidade de CPF/CNPJ entre as entidades `npo` e `company`:
- `CompanyService.existsByCnpj` só consulta a tabela `company`
- `NpoDocumentService` só consulta a tabela `npo`
- Um CNPJ já utilizado por uma ONG pode ser cadastrado como empresa e vice-versa

Além disso, o **frontend não tem feedback** quando o backend rejeita por duplicidade. O erro 409 é logado e engolido pelo `AuthRoleRedirect`, e o usuário é redirecionado ao dashboard sem conta. Não há mecanismo para levar o usuário de volta ao step relevante do wizard para corrigir os dados.

**Correção (backend):** Criar um serviço de validação de documentos compartilhado que consulte ambas as tabelas (`npo` e `company`) antes de permitir o cadastro.

**Correção (frontend — dívida técnica):** Quando o POST do rascunho falhar com 409 ou 400, o fluxo deveria:
1. Detectar o tipo de erro (documento duplicado, email em uso, etc.)
2. Redirecionar o usuário de volta ao step relevante do wizard (não ao dashboard)
3. Exibir a mensagem específica da API inline no campo problemático
4. Manter os dados preenchidos para que o usuário corrija apenas o campo com conflito

Isso requer persistência do estado do wizard (ver #1.1) e um mecanismo de "retorno com erro" após o redirect do Auth0, que hoje não existe.

---

### 1.4 CNPJ não normalizado antes da verificação de duplicidade

| Sev/Pri | ALTO / P1 |
|---|---|
| **Arquivos** | `backend/.../service/CompanyService.java` |

`existsByCnpj` compara a string bruta. O frontend envia CNPJs formatados (`12.345.678/0001-90`). Sem normalização para apenas dígitos, formatos diferentes podem burlar a checagem.

**Correção:** Remover caracteres não numéricos antes da verificação e persistência (como `NpoDocumentService` já faz).

---

### 1.5 ONGs com nomes duplicados são aceitas sem validação

| Sev/Pri | BAIXO / P2 |
|---|---|
| **Arquivos** | `backend/.../service/NpoAccountService.java` |

Nenhuma verificação de nome duplicado para ONGs.

---

### 1.6 Flag `npoDraftSubmitted || hasNpoDraft` induz redirect incorreto

| Sev/Pri | MÉDIO / P2 |
|---|---|
| **Arquivos** | `frontend/src/components/auth/AuthRoleRedirect.tsx` |

`redirectPathAfterSignupDraft` recebe `true` se o rascunho existia, mesmo que o envio tenha falhado. Pode disparar redirecionamento para dashboard sem conta criada.

**Correção:** Passar apenas o flag de sucesso real.

---

## 2. Segurança

### 2.1 Sem enforcement de roles nos endpoints do servidor

| Sev/Pri | ALTO / P1 |
|---|---|
| **Arquivos** | `backend/.../config/SecurityConfig.java`, todos os controllers |

`@EnableMethodSecurity` está habilitado e roles são mapeados para `ROLE_*`, mas nenhum controller usa `@PreAuthorize`. Qualquer token autenticado acessa qualquer endpoint protegido.

---

### 2.2 Proteção de rotas no frontend é apenas auth, sem verificação de papel

| Sev/Pri | ALTO / P1 |
|---|---|
| **Arquivos** | `frontend/src/components/auth/ProtectedRoute.tsx`, `frontend/src/router/index.tsx` |

`ProtectedRoute` só checa `isAuthenticated`. Qualquer usuário logado acessa `/admin/dashboard` pela URL.

---

### 2.3 `AuthTestController` expõe internos do JWT em produção

| Sev/Pri | MÉDIO / P2 |
|---|---|
| **Arquivos** | `backend/.../controller/AuthTestController.java` |

`GET /api/me` retorna subject, email, issuer, audience, escopos e roles. Útil para debug mas sensível em produção.

---

### 2.4 Email de cadastro da ONG pode vir do body da requisição

| Sev/Pri | MÉDIO / P2 |
|---|---|
| **Arquivos** | `backend/.../service/NpoAccountService.java` |

Se o JWT não tem claim `email`, o serviço usa `request.email()` como fallback. Um cliente poderia enviar email arbitrário.

---

### 2.5 Roles claim hardcoded no frontend, configurável no backend

| Sev/Pri | MÉDIO / P2 |
|---|---|
| **Arquivos** | `frontend/.../AuthRoleRedirect.tsx` (hardcoded), `backend/.../application.properties` (env var) |

Se a env var mudar, frontend e backend discordam sobre onde os roles estão no JWT.

---

### 2.6 PII logada em ambos os lados

| Sev/Pri | BAIXO / P3 |
|---|---|
| **Arquivos** | Múltiplos controllers e componentes frontend |

Email e CNPJ são logados em nível INFO. Mascarar dados sensíveis para LGPD.

---

## 3. Consistência de Padrões — Frontend

> Itens 3.1, 3.2, 3.3, 3.5, 3.7, 3.8, 3.9, 3.10 foram **corrigidos** — ver "Problemas Já Corrigidos".

### 3.4 Falta de padronização entre os wizards de ONG e Empresa

| Sev/Pri | MÉDIO / P2 |
|---|---|
| **Arquivos** | `RegisterPage/index.tsx`, `CompanyRegistration/registration/index.tsx` |

- ONG usa estado centralizado com steps como componentes num array + `stepValidators` em `wizard.config.ts`
- Empresa usa um componente monolítico com renderização condicional + validação inline
- Navegação de "Voltar" difere entre os fluxos
- ONG não tem step de resumo; Empresa tem `RegistrationSummary`

**Padrão:** Extrair wizard genérico reutilizável.

---

### 3.6 Sem validação de email já em uso no cadastro de empresa

| Sev/Pri | MÉDIO / P1 |
|---|---|
| **Arquivos** | `frontend/src/pages/CompanyRegistration/registration/index.tsx` |

O erro de email duplicado só aparece na tela do Auth0. O usuário completa o wizard inteiro, é redirecionado, e só então descobre que o email já está em uso.

---

## 4. Consistência de Padrões — Backend

### 4.1 Injeção de dependência misturada

| Sev/Pri | MÉDIO / P2 |
|---|---|

- **`@RequiredArgsConstructor`:** `CompanyController`, `CompanyService`, `AddressService`
- **Constructor manual:** `MeController`, `NpoAccountController`, `CepController`, `CnpjController`, `NpoAccountService`, `NpoService`, etc.

**Padrão:** Padronizar em `@RequiredArgsConstructor` com `final` fields em todos.

---

### 4.2 Nomenclatura de DTOs inconsistente

| Sev/Pri | BAIXO / P2 |
|---|---|

| Nome atual | Problema |
|---|---|
| `CompanyDTO`, `UserDTO`, `AddressDTO` | Sufixo `DTO` |
| `NpoInstitutionalSignupRequest` | Sufixo `Request` |
| `AuthenticatedProfileResponse` | Sufixo `Response` |
| `CepResponseDTO`, `CnpjResponseDTO` | `Response` + `DTO` |

**Padrão:** Usar `*Request` para entrada, `*Response` para saída, sem misturar `DTO` com `Request`/`Response`.

---

### 4.3 Formato de erro da API inconsistente entre controllers

| Sev/Pri | ALTO / P2 |
|---|---|

- **`GlobalExceptionHandler.ErrorResponse`:** `{ status, message, timestamp }`
- **`NpoAccountController.ApiError`:** `{ message }` apenas

Clientes recebem JSONs diferentes dependendo do endpoint.

**Correção:** Mover exception handlers do `NpoAccountController` para `GlobalExceptionHandler` e usar `ErrorResponse` único.

---

### 4.4 `CompanyAlreadyExistsException` com mensagem genérica e typo

| Sev/Pri | ALTO / P2 |
|---|---|
| **Arquivo** | `backend/.../exception/CompanyAlreadyExistsException.java` |

CNPJ duplicado, Auth0 ID duplicado e email duplicado lançam a mesma exceção com mensagem sobre "CNPJ" e typo "comany". A exception extends `BadRequestException` → 400, mas deveria ser 409 (como no fluxo de ONG).

**Correção:** Mensagens distintas por cenário, corrigir typo, e usar HTTP 409 para duplicidade.

---

### 4.5 `@Slf4j` ausente em serviços críticos

| Sev/Pri | MÉDIO / P2 |
|---|---|

Sem logging: `NpoAccountService`, `NpoDocumentService`, `NpoEsgService`, `NpoService`, `AddressService`, `CepValidationService`, `CnpjValidationService`, `AuthTestController`.

Serviços de integração externa (CEP, CNPJ) não logam sucesso nem falha de chamadas HTTP.

---

### 4.6 `@Transactional` inconsistente

| Sev/Pri | BAIXO / P3 |
|---|---|

`AddressService.createAddress` não tem `@Transactional`, sendo chamado de dentro da transação do `CompanyService`. Funciona, mas depende de ser chamado dentro de um contexto transacional.

---

### 4.7 `RestClient` criado inline em cada serviço de integração

| Sev/Pri | BAIXO / P3 |
|---|---|
| **Arquivos** | `CepValidationService.java`, `CnpjValidationService.java` |

Cada um cria `RestClient.create()` como field. Sem timeouts, métricas ou testabilidade.

**Padrão:** Bean compartilhado de `RestClient` com timeouts configurados.

---

### 4.8 Entity soft delete inconsistente

| Sev/Pri | MÉDIO / P2 |
|---|---|

- `User`, `Npo`, `Address`: têm `@SQLRestriction("deleted_at IS NULL")`
- `Company`: tem coluna `deletedAt` mas **sem** `@SQLRestriction`

Queries de `Company` retornam registros soft-deleted.

---

### 4.9 Tabelas com nomes singular vs plural

| Sev/Pri | BAIXO / P3 |
|---|---|

- `users` (plural), `address` (singular), `npo` (sigla), `company` (singular)

**Padrão:** Padronizar (plural é o mais comum com Spring Data).

---

### 4.10 `@Temporal` desnecessário no `Company.java`

| Sev/Pri | BAIXO / P3 |
|---|---|
| **Arquivo** | `backend/.../model/Company.java` |

`@Temporal(TemporalType.TIMESTAMP)` em `LocalDateTime` é redundante em JPA 2.2+. `User` e `Npo` não usam.

---

### 4.11 Enums em lowercase (`admin`, `npo`) em vez de UPPERCASE

| Sev/Pri | BAIXO / P3 |
|---|---|
| **Arquivos** | `enums/UserType.java`, `enums/NpoSize.java` |

Convenção Java é `ADMIN`, `NPO`, `COMPANY`. Funciona com `@Enumerated(EnumType.STRING)` em lowercase, mas exige mapeamento se mudar.

---

### 4.12 Dependência duplicada no `pom.xml`

| Sev/Pri | BAIXO / P3 |
|---|---|
| **Arquivo** | `pom.xml` |

`springdoc-openapi-starter-webmvc-ui` declarada duas vezes. `thymeleaf-extras-springsecurity6` presente sem camada Thymeleaf visível.

---

### 4.13 `NpoInstitutionalSignupRequest` sem Bean Validation

| Sev/Pri | MÉDIO / P2 |
|---|---|
| **Arquivo** | `dto/NpoInstitutionalSignupRequest.java` |

Nenhuma anotação `@NotBlank`, `@Email`, `@Size`. Controller não usa `@Valid`. Inconsistente com o fluxo de empresa que já tem validação ativa.

---

## 5. Mensagens e Internacionalização

### 5.1 Idioma misturado nas mensagens de erro da API

| Sev/Pri | MÉDIO / P2 |
|---|---|

| Arquivo | Mensagem | Idioma |
|---|---|---|
| `CompanyAlreadyExistsException` | "comany already exists" | EN (com typo) |
| `CompanyService` | "Auth0 ID é obrigatório" | PT |
| `NpoAccountService` | "sao obrigatorios", "e obrigatorio" | PT sem acento |
| `CepNotFoundException` | "Cep not found" | EN |
| `CnpjNotFoundException` | "CNPJ not found" | EN |
| `GlobalExceptionHandler` | "Erro interno do servidor" | PT |

**Padrão:** Escolher um idioma para mensagens de API. Se PT-BR, normalizar acentos em toda a base.

---

### 5.2 Strings do frontend sem acento ou gramaticalmente incorretas

| Sev/Pri | BAIXO / P2 |
|---|---|

| Arquivo | Exemplo | Correto |
|---|---|---|
| `validation.ts` (múltiplas linhas) | "instituicao", "valido", "minimo", "nao", "razao social" | "instituição", "válido", "mínimo", "não", "razão social" |
| `company/registration/index.tsx` L274 | "Informe um e-mail valido" | "Informe um e-mail válido" |
| `NpoStepThree.tsx` L130 | "Selecione os pilares que a ONG atua." | "Selecione os pilares em que a ONG atua." |

---

### 5.3 Botões Login/Logout em inglês

| Sev/Pri | BAIXO / P3 |
|---|---|
| **Arquivos** | `LoginButton.tsx`, `LogoutButton.tsx` |

Texto "Log in" / "Log out" enquanto o resto da UI é em português. Esses componentes não são importados em nenhum lugar atualmente (possivelmente dead code).

---

## 6. Acessibilidade

### 6.1 `AuthRedirectModal` sem semântica de dialog

| Sev/Pri | BAIXO / P3 |
|---|---|
| **Arquivo** | `frontend/.../AuthRedirectModal.tsx` |

Sem `role="dialog"`, `aria-modal`, `aria-labelledby`, armadilha de foco ou tecla Escape.

---

### 6.2 `WizardSteps` sem alternativas textuais

| Sev/Pri | BAIXO / P3 |
|---|---|
| **Arquivo** | `frontend/.../WizardSteps.tsx` |

Indicadores de step visuais apenas. Sem `aria-current="step"` ou labels para leitores de tela.

---

### 6.3 `TypeCard` sem `aria-pressed` para estado selecionado

| Sev/Pri | BAIXO / P3 |
|---|---|
| **Arquivo** | `frontend/.../WizardSignUp.tsx` |

Botões de seleção de tipo não comunicam estado para tecnologias assistivas.

---

### 6.4 Múltiplos `<h1>` na landing page

| Sev/Pri | BAIXO / P3 |
|---|---|
| **Arquivos** | `Hero.tsx`, `InfoTab.tsx` |

Dois `<h1>` na mesma página. `InfoTab` deveria usar `<h2>`.

---

## 7. Infraestrutura e Configuração

### 7.1 Variáveis de Auth0 falham silenciosamente

| Sev/Pri | ALTO / P2 |
|---|---|
| **Arquivos** | `frontend/src/main.tsx`, `backend/.../application.properties` |

Frontend só faz `console.error` e monta `Auth0Provider` com `undefined`. Backend não tem defaults para `AUTH0_ISSUER_URI` e `AUTH0_AUDIENCE`.

---

### 7.2 Docker Compose: backend pode iniciar antes do Flyway

| Sev/Pri | ALTO / P2 |
|---|---|
| **Arquivo** | `docker-compose.yml` |

`backend` depende de `db` (healthy) mas Flyway roda como serviço separado. Com `ddl-auto=validate`, o backend pode falhar se migrações não terminaram.

---

### 7.3 `ProtectedRoute` não passa `audience` no redirect de login

| Sev/Pri | BAIXO / P3 |
|---|---|
| **Arquivo** | `frontend/.../ProtectedRoute.tsx` |

Outros call sites passam `audience`. Token resultante pode não ter o audience da API.

---

### 7.4 `accessReleased` na resposta da ONG é sempre `true`

| Sev/Pri | BAIXO / P3 |
|---|---|
| **Arquivo** | `backend/.../service/NpoAccountService.java` |

Campo hardcoded sem lógica de negócio.

---

## 8. Código Morto

### 8.1 Componentes e arquivos nunca importados

| Sev/Pri | BAIXO / P3 |
|---|---|

| Arquivo | Situação |
|---|---|
| `components/ong/OngCard.tsx` | Nunca importado |
| `components/auth/LoginButton.tsx` | Nunca importado |
| `components/auth/LogoutButton.tsx` | Nunca importado |
| `utils/validateCpf.ts` | `validation.ts` duplica a lógica internamente; este nunca é importado |
| `pages/Registering/` (3 arquivos) | Nenhuma rota em `router/index.tsx` aponta para este módulo |
| `pages/Registering/Steps/Step4.tsx` | `Enterprise_Registering_Step_4` é um export vazio |

---

### 8.2 Código comentado em produção

| Sev/Pri | BAIXO / P3 |
|---|---|

| Arquivo | O que está comentado |
|---|---|
| `company/registration/index.tsx` | `LogoUpload` import, estado, JSX; `entityIcon` prop |
| `RegistrationSummary.tsx` | Bloco de ícone |
| `RegisterPage/index.tsx` | Enterprise steps 2–5 são `<div>` placeholder |

---

### 8.3 Validadores desalinhados com steps reais da ONG

| Sev/Pri | BAIXO / P3 |
|---|---|
| **Arquivo** | `frontend/src/config/wizard.config.ts` |

Array de validadores NPO tem 4 entradas (incluindo `() => ({})` placeholder) mas o wizard renderiza apenas 3 steps. Quarto validador nunca é executado.

---

### 8.4 Dependências desnecessárias no `pom.xml`

| Sev/Pri | BAIXO / P3 |
|---|---|

- `springdoc-openapi-starter-webmvc-ui` declarada duas vezes
- `thymeleaf-extras-springsecurity6` sem camada Thymeleaf visível
- Spotless `googleJavaFormat` com duas tags `<version>` (inválido)

---

## 9. Styling e Cores

### 9.1 Dois "azuis da marca" diferentes

| Sev/Pri | BAIXO / P2 |
|---|---|

- `main.css`: `--color-vinculo-dark: #004481`
- `Registering/register-page.tsx`: `text-[#00467F]`

**Padrão:** Usar token do tema (`text-vinculo-dark`).

---

### 9.2 Background de página inconsistente

| Sev/Pri | BAIXO / P3 |
|---|---|

- `company/registration/index.tsx`: `bg-stone-100`
- `RegisterPage/`, `RoleHomePage/`: `bg-slate-50`

**Padrão:** Um único token de superfície.

---

### 9.3 Inline styles misturados com Tailwind

| Sev/Pri | BAIXO / P3 |
|---|---|
| **Arquivos** | `InfoTab.tsx`, `WizardSteps.tsx` |

`style={{ fontSize: ... }}` em ícones MUI e width dinâmico no progresso. Preferir classes Tailwind onde possível.

---

## Resumo por Status

| Categoria | Crítico | Alto | Médio | Baixo |
|---|---|---|---|---|
| Bugs / Funcionalidade | 1 | 2 | 2 | 1 |
| Segurança | — | 2 | 3 | 1 |
| Padrões Frontend | — | — | 7 | 3 |
| Padrões Backend | — | 1 | 5 | 6 |
| Mensagens / i18n | — | — | 2 | 1 |
| Acessibilidade | — | — | — | 4 |
| Infra / Config | — | 2 | — | 2 |
| Código Morto | — | — | — | 4 |
| Styling | — | — | — | 3 |
| **Total** | **1** | **7** | **19** | **25** |

---

## Ordem de Correção Recomendada

1. **P0:** Persistir estado do wizard (#1.1)
2. **P1:** Feedback de erros e validação cruzada CPF/CNPJ (#1.2, #1.3, #3.5, #3.6); roles no servidor (#2.1) e frontend (#2.2); normalizar CNPJ (#1.4)
3. **P2:** Quick wins de backend e frontend (ver tabelas acima); padronizar wizards (#3.4); formato de erro da API (#4.3); soft delete Company (#4.8); validação NPO DTO (#4.13); mensagens PT-BR (#5.1, #5.2)
4. **P3:** Limpeza de código morto (#8.*); acessibilidade (#6.*); infraestrutura (#7.*); polimento de styling (#9.*)
