# VinculoHub Portal — Revisão de Código

> **Escopo:** Análise completa de consistência, qualidade e prontidão para produção.
> **Última atualização:** Abril 2026 (sprint 1)

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
| **#1.1** Estado do wizard perdido ao recarregar | Hook `useWizardPersistence<T>` criado. Persiste `currentStep` + dados do formulário no `sessionStorage` a cada mudança e reidrata na montagem. Chaves: `vinculohub:npo-wizard-progress` e `vinculohub:company-wizard-progress`. `AuthRoleRedirect` limpa as chaves após submissão bem-sucedida. |
| **#1.2** Erros de cadastro engolidos — dashboard sem conta | `AuthRoleRedirect`: catch de falha no POST agora remove draft + progress do `sessionStorage`, exibe toast via `ToastContext` (MUI Snackbar) e redireciona para `/cadastro` com `return`. Usuário não chega ao dashboard sem conta no banco. |
| **#1.3** Sem validação cruzada de CPF/CNPJ entre ONG e Empresa | Backend: `DocumentCheckService` + `DocumentCheckController` (`GET /public/validate/cnpj`, `/cpf`, `/email`) consultam ambas as tabelas. `NpoDocumentService` e `CompanyService` atualizados para checar cross-table. Frontend: pré-validação antes do `loginWithRedirect` com toast e abort se documento/email já em uso. Dívida técnica de feedback inline por campo permanece como melhoria futura. |
| **#1.4** CNPJ não normalizado antes da verificação de duplicidade | `CompanyService` agora usa `DocumentValidator.sanitize()` antes do `existsByCnpj` e persiste o CNPJ sanitizado (só dígitos) na entidade. |
| **#3.6** Sem validação de email já em uso no cadastro de empresa | Verificação de email via `checkEmailAvailable()` adicionada antes do `loginWithRedirect` na empresa. Toast exibido e fluxo abortado se email já cadastrado. |
| **#2.1** Sem enforcement de roles nos endpoints do servidor | `@PreAuthorize("!hasRole('company') && !hasRole('admin')")` em `POST /api/npo-accounts`; `@PreAuthorize("!hasRole('npo') && !hasRole('admin')")` em `POST /api/company-accounts`; `@PreAuthorize("hasRole('admin')")` em `GET /api/me` (AuthTestController). |
| **#2.2** Proteção de rotas no frontend apenas auth, sem verificação de papel | `ProtectedRoute` ganhou prop `requiredRole?: "ADMIN" \| "NPO" \| "COMPANY"`. Lê roles do claim `https://vinculohub/roles` no objeto `user` do Auth0. Router atualizado: `/admin/dashboard` → `ADMIN`, `/ong/dashboard` → `NPO`, `/empresa/dashboard` → `COMPANY`. |

---

## 1. Bugs e Funcionalidade

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

> Itens 3.1, 3.2, 3.3, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10 foram **corrigidos** — ver "Problemas Já Corrigidos".

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

### 4.9 Tabelas com nomes singular vs plural

| Sev/Pri | BAIXO / P3 |
|---|---|

- `users` (plural), `address` (singular), `npo` (sigla), `company` (singular)

**Padrão:** Padronizar (plural é o mais comum com Spring Data).

---

### 4.11 Enums em lowercase (`admin`, `npo`) em vez de UPPERCASE

| Sev/Pri | BAIXO / P3 |
|---|---|
| **Arquivos** | `enums/UserType.java`, `enums/NpoSize.java` |

Convenção Java é `ADMIN`, `NPO`, `COMPANY`. Funciona com `@Enumerated(EnumType.STRING)` em lowercase, mas exige mapeamento se mudar.

---

### 4.13 `NpoInstitutionalSignupRequest` sem Bean Validation

| Sev/Pri | MÉDIO / P2 |
|---|---|
| **Arquivo** | `dto/NpoInstitutionalSignupRequest.java` |

Nenhuma anotação `@NotBlank`, `@Email`, `@Size`. Controller não usa `@Valid`. Inconsistente com o fluxo de empresa que já tem validação ativa.

---

## 5. Mensagens e Internacionalização

> Itens 5.1, 5.2 e 5.3 foram **corrigidos** — ver "Problemas Já Corrigidos".

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

### 8.1 Módulo `pages/Registering/` sem rota

| Sev/Pri | BAIXO / P3 |
|---|---|

| Arquivo | Situação |
|---|---|
| `pages/Registering/` (pasta completa) | Nenhuma rota em `router/index.tsx` aponta para este módulo |
| `pages/Registering/Steps/Step4.tsx` | `Enterprise_Registering_Step_4` é um export vazio |

> `OngCard.tsx`, `LoginButton.tsx`, `LogoutButton.tsx`, `validateCpf.ts` e código comentado (`LogoUpload`, `entityIcon`) já foram removidos — ver "Problemas Já Corrigidos".

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

> Atualizado após sprint 1 — #1.1, #1.2, #1.3, #1.4 e #3.6 corrigidos. Seções 4.5, 4.8, 4.10, 4.12, 5.1, 5.2, 5.3, 8.2, 8.3 removidas (já corrigidos).

| Categoria | Crítico | Alto | Médio | Baixo |
|---|---|---|---|---|
| Bugs / Funcionalidade | — | — | 1 | 1 |
| Segurança | — | 2 | 3 | 1 |
| Padrões Frontend | — | — | 1 | — |
| Padrões Backend | — | 1 | 3 | 3 |
| Mensagens / i18n | — | — | — | — |
| Acessibilidade | — | — | — | 4 |
| Infra / Config | — | 2 | — | 2 |
| Código Morto | — | — | — | 1 |
| Styling | — | — | — | 3 |
| **Total** | **—** | **5** | **8** | **15** |

---

## Ordem de Correção Recomendada

1. ~~**P0:** Persistir estado do wizard (#1.1)~~ ✅
2. ~~**P1:** Feedback de erros e validação cruzada CPF/CNPJ (#1.2, #1.3); normalizar CNPJ (#1.4)~~ ✅
3. ~~**P1:** Validação de email no cadastro de empresa (#3.6)~~ ✅
4. ~~**P1:** Roles no servidor (#2.1) e frontend (#2.2)~~ ✅
5. **P2:** Quick wins de backend e frontend (ver tabelas acima); padronizar wizards (#3.4); formato de erro da API (#4.3); validação NPO DTO (#4.13)
6. **P3:** Limpeza de código morto (#8.*); acessibilidade (#6.*); infraestrutura (#7.*); polimento de styling (#9.*)
