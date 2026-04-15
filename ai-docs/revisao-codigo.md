# VinculoHub Portal — Revisão de Código e Análise

> **Escopo:** Fluxos de cadastro de ONG e Empresa (frontend + backend) e infraestrutura compartilhada.
> **Última atualização:** Abril 2026

---

## Legenda

| Severidade | Significado |
|------------|-------------|
| **CRÍTICO** | Quebrado ou explorável ativamente; bloqueia funcionalidade central |
| **ALTO** | Bug significativo, falha de segurança ou risco de integridade de dados |
| **MÉDIO** | Comportamento incorreto em casos de borda, risco de manutenção ou degradação de UX |
| **BAIXO** | Polimento, código morto ou inconsistência menor |

| Prioridade | Significado |
|------------|-------------|
| **P0** | Corrigir agora — usuários estão sendo afetados |
| **P1** | Corrigir nesta sprint — causará problemas em breve |
| **P2** | Corrigir na próxima sprint — melhora a qualidade |
| **P3** | Backlog — desejável |

---

## CRÍTICO

### 1. Pressionar Enter no campo de e-mail (step 4) reseta o wizard para o step 2 ✅ Corrigido

| | |
|---|---|
| **Arquivos** | `frontend/src/pages/company/registration/index.tsx` |
| **Severidade / Prioridade** | CRÍTICO / P0 |
| **Categoria** | Bug |

**Problema:** Os steps 3 e 4 do wizard de empresa usavam `<form>` sem `onSubmit`. Pressionar Enter no campo de e-mail acionava o submit padrão do navegador, recarregando a página e resetando todo o estado React para o step 2.

**Correção aplicada:** Adicionado `onSubmit={(e) => e.preventDefault()}` nos dois formulários.

---

### 2. Estado do wizard é perdido ao recarregar a página

| | |
|---|---|
| **Arquivos** | `frontend/src/pages/company/registration/index.tsx` |
| **Severidade / Prioridade** | CRÍTICO / P0 |
| **Categoria** | Bug / UX |

**Problema:** `currentStep` e todos os campos do formulário são estado React efêmero, inicializado do zero a cada montagem. O rascunho só é salvo no `sessionStorage` imediatamente antes do redirecionamento para o Auth0. Qualquer recarga, restauração de aba ou navegação apaga todo o progresso.

**Correção sugerida:** Persistir estado do wizard (step + dados do formulário) no `sessionStorage` a cada mudança e reidratar na montagem.

---

### 3. Overflow de VARCHAR(20) derruba os endpoints de cadastro com erro 500 ✅ Corrigido

| | |
|---|---|
| **Arquivos** | `frontend/src/components/ong/NpoStepFour.tsx`, `frontend/src/pages/company/registration/index.tsx` |
| **Severidade / Prioridade** | CRÍTICO / P0 |
| **Categoria** | Bug — overflow no banco |

**Problema:** O campo `complemento` do ViaCEP pode conter descritores postais longos (ex: `"de 1 a 499 - lado ímpar"`). Após ser mapeado para o campo `number`/`streetNumber`, o valor era salvo no estado React sem restrição de tamanho. O atributo HTML `maxLength={20}` só impede digitação do usuário — atualizações programáticas de estado o ignoram completamente. Ao chegar no banco, o PostgreSQL rejeitava com:

```
PSQLException: ERROR: value too long for type character varying(20)
```

Ambos `/api/npo-accounts` e `/api/company-accounts` retornavam 500. Nenhum registro era criado.

**Observado em teste:**
```
hasNpoDraft: true, hasCompanyDraft: true
POST /api/npo-accounts    → 500 (overflow em address.number)
POST /api/company-accounts → 500 (mesma causa)
GET  /api/me/profile      → registrationCompleted: false
→ redirecionado para /empresa/dashboard sem conta criada
```

**Correção aplicada:** Ambos os pontos de auto-preenchimento agora truncam para 20 caracteres antes de atualizar o estado:
```ts
number: (zipCodeData.complement ?? "").slice(0, 20) || prev.number,
```

**Lição:** `maxLength` em `<input>` não se aplica a atualizações programáticas de estado React. Qualquer auto-preenchimento de fonte externa deve impor restrições de tamanho explicitamente no código.

---

## ALTO

### 4. Empresa pode ser criada com CNPJ já utilizado por uma ONG

| | |
|---|---|
| **Arquivos** | `backend/.../service/CompanyService.java`, `backend/.../service/NpoDocumentService.java` |
| **Severidade / Prioridade** | ALTO / P1 |
| **Categoria** | Integridade de dados |

**Problema:** A verificação de duplicidade de CNPJ para empresas (`companyRepository.existsByCnpj`) só consulta a tabela `company`. A tabela `npo` tem sua própria coluna `cnpj`. Um CNPJ já cadastrado como ONG pode ser reutilizado no cadastro de uma empresa sem nenhum bloqueio.

**Correção sugerida:** Validar unicidade de CNPJ entre ambas as entidades (`npo` e `company`) antes de persistir.

---

### 5. `@Valid` ausente no `CompanyController` — Bean Validation ignorado

| | |
|---|---|
| **Arquivos** | `backend/.../controller/CompanyController.java`, `backend/.../dto/CompanyDTO.java` |
| **Severidade / Prioridade** | ALTO / P1 |
| **Categoria** | Validação / Segurança |

**Problema:** `CompanyDTO` possui `@NotEmpty`, `@Email` e outras anotações de Bean Validation, mas o parâmetro do controller é `@RequestBody CompanyDTO` **sem `@Valid`**. Todas as anotações são silenciosamente ignoradas.

**Correção sugerida:** Adicionar `@Valid` e tratar `MethodArgumentNotValidException` no `GlobalExceptionHandler`.

---

### 6. CNPJ não é normalizado antes da verificação de duplicidade

| | |
|---|---|
| **Arquivos** | `backend/.../service/CompanyService.java` |
| **Severidade / Prioridade** | ALTO / P1 |
| **Categoria** | Integridade de dados |

**Problema:** `existsByCnpj` compara a string bruta da requisição. O frontend envia CNPJs formatados (`12.345.678/0001-90`), mas não há normalização para apenas dígitos antes de verificar ou persistir. Formatos diferentes podem burlar a checagem de duplicidade.

**Correção sugerida:** Remover caracteres não numéricos do CNPJ antes da verificação e da persistência (como o `NpoDocumentService` já faz para ONG).

---

### 7. Sem enforcement de papéis (roles) nos endpoints do servidor

| | |
|---|---|
| **Arquivos** | `backend/.../config/SecurityConfig.java`, todos os controllers |
| **Severidade / Prioridade** | ALTO / P1 |
| **Categoria** | Segurança |

**Problema:** `@EnableMethodSecurity` está configurado e os roles do JWT são mapeados para `ROLE_*`, mas **nenhum controller usa `@PreAuthorize`**. Qualquer usuário autenticado pode chamar qualquer endpoint protegido. O controle baseado em papel é apenas uma preocupação do frontend.

**Correção sugerida:** Adicionar `@PreAuthorize` nos endpoints sensíveis. No mínimo, restringir rotas de admin e validar a intenção do caller nos endpoints de cadastro.

---

### 8. Entidades JPA duplicadas na tabela `users`

| | |
|---|---|
| **Arquivos** | `backend/.../model/User.java`, `backend/.../model/Users.java` |
| **Severidade / Prioridade** | ALTO / P1 |
| **Categoria** | Manutenibilidade / Integridade de dados |

**Problema:** Duas classes `@Entity` mapeiam a mesma tabela `users` com **configurações diferentes**: `User` tem `@SQLRestriction("deleted_at IS NULL")`, builders Lombok e `enums.UserType`; `Users` não tem nada disso. O Hibernate gera entradas de metamodelo conflitantes.

**Correção sugerida:** Deletar `Users.java`, `UsersRepository.java` e `UsersService.java` (nenhum usado por controller ou serviço ativo). Consolidar em `User.java`.

---

### 9. Enum `UserType` duplicado em dois pacotes

| | |
|---|---|
| **Arquivos** | `backend/.../model/UserType.java`, `backend/.../model/enums/UserType.java` |
| **Severidade / Prioridade** | ALTO / P1 |
| **Categoria** | Manutenibilidade |

**Problema:** Valores idênticos em dois pacotes. `User.java` e os serviços ativos usam `model.enums.UserType`; o código morto em `Users.java` usa `model.UserType`. Se um for atualizado e o outro não, os mapeamentos quebram silenciosamente.

**Correção sugerida:** Deletar `model/UserType.java` junto com a entidade `Users` duplicada.

---

### 10. Proteção de rotas baseada apenas em autenticação, sem verificação de papel

| | |
|---|---|
| **Arquivos** | `frontend/src/components/auth/ProtectedRoute.tsx`, `frontend/src/router/index.tsx` |
| **Severidade / Prioridade** | ALTO / P1 |
| **Categoria** | Segurança |

**Problema:** `ProtectedRoute` só verifica `isAuthenticated`. Qualquer usuário logado pode acessar `/admin/dashboard` digitando a URL. Não há verificação de papel no frontend ou backend para rotas de dashboard.

**Correção sugerida:** Criar um wrapper `RequireRole` que verifique o papel do usuário via JWT ou perfil, e aplicar em cada rota de dashboard.

---

### 11. `CompanyAlreadyExistsException` usa a mesma mensagem para 3 causas diferentes

| | |
|---|---|
| **Arquivos** | `backend/.../service/CompanyService.java`, `backend/.../exception/CompanyAlreadyExistsException.java` |
| **Severidade / Prioridade** | ALTO / P2 |
| **Categoria** | UX / Depuração |

**Problema:** CNPJ duplicado, Auth0 ID duplicado e e-mail duplicado lançam a mesma `CompanyAlreadyExistsException` com uma mensagem sobre "CNPJ" (e com typo: "comany"). Usuário e desenvolvedor não conseguem distinguir a causa.

**Correção sugerida:** Usar mensagens parametrizadas ou tipos de exceção distintos para cada cenário de duplicidade.

---

### 12. `IllegalArgumentException` no `CompanyService` retorna HTTP 500

| | |
|---|---|
| **Arquivos** | `backend/.../service/CompanyService.java`, `backend/.../exception/GlobalExceptionHandler.java` |
| **Severidade / Prioridade** | ALTO / P2 |
| **Categoria** | Tratamento de erros |

**Problema:** `CompanyService` lança `IllegalArgumentException` para Auth0 ID em branco e e-mail ausente. O `GlobalExceptionHandler` não trata essa exceção — ela cai no handler genérico de `Exception`, retornando HTTP 500 com "Erro interno do servidor".

**Correção sugerida:** Adicionar `@ExceptionHandler(IllegalArgumentException.class)` → 400, ou substituir por `BadRequestException`.

---

### 13. Variáveis de ambiente do Auth0 falham silenciosamente

| | |
|---|---|
| **Arquivos** | `frontend/src/main.tsx`, `backend/.../application.properties` |
| **Severidade / Prioridade** | ALTO / P2 |
| **Categoria** | Configuração |

**Problema:** O frontend apenas faz `console.error` quando as variáveis `VITE_AUTH0_*` estão ausentes — o app ainda monta `Auth0Provider` com `undefined`. No backend, `AUTH0_ISSUER_URI` e `AUTH0_AUDIENCE` não têm padrões — valores em branco causam falhas de inicialização crípticas.

**Correção sugerida:** Falhar rapidamente: lançar erro antes de renderizar no frontend; adicionar validação de startup no backend.

---

### 14. Docker Compose: backend pode iniciar antes do Flyway terminar

| | |
|---|---|
| **Arquivos** | `docker-compose.yml` |
| **Severidade / Prioridade** | ALTO / P2 |
| **Categoria** | Infraestrutura |

**Problema:** `backend` depende de `db` (healthy), mas o Flyway roda como serviço separado. Com `ddl-auto=validate`, o backend pode falhar na inicialização se as migrações não tiverem terminado.

**Correção sugerida:** Fazer `backend` depender de `flyway` com condição, ou executar o Flyway como parte do startup do backend (o Spring Boot já tem auto-config do Flyway habilitado).

---

## MÉDIO

### 15. Erros de cadastro são ignorados — usuário vai para o dashboard sem conta criada

| | |
|---|---|
| **Arquivos** | `frontend/src/components/auth/AuthRoleRedirect.tsx` |
| **Severidade / Prioridade** | MÉDIO / P1 |
| **Categoria** | UX / Tratamento de erros |

**Problema:** Quando `submitNpoSignupDraft` ou `submitCompanySignupDraft` falha, o erro é apenas logado e o fluxo continua silenciosamente. Observado em produção:

```
POST /api/npo-accounts → 409 "Já existe uma instituição cadastrada com este CPF."
GET  /api/me/profile   → 200 { registrationCompleted: false, npoId: null }
→ Role do JWT = "NPO" → navigate("/ong/dashboard")
```

O usuário é enviado para `/ong/dashboard` mesmo sem que o registro de ONG tenha sido criado. O JWT já tem o papel NPO (definido pelo Auth0 no momento do signup), então `resolvePrimaryRole` retorna `"NPO"` e roteia para o dashboard — independentemente de o backend ter ou não criado um registro. O rascunho permanece no `sessionStorage` e será reenviado a cada login subsequente.

**Cenários que disparam isso:**
- CPF/CNPJ já cadastrado (409 duplicado) — **ONG e Empresa**
- Documento inválido (400)
- Falha de rede durante o POST do rascunho

**Correção sugerida:** Em caso de falha no envio do rascunho, não navegar para o dashboard. Redirecionar para `/cadastro` e exibir a mensagem de erro específica da API para que o usuário possa corrigir os dados e tentar novamente.

---

### 16. Sem validação de e-mail já em uso no cadastro de empresa (frontend)

| | |
|---|---|
| **Arquivos** | `frontend/src/pages/company/registration/index.tsx` |
| **Severidade / Prioridade** | MÉDIO / P1 |
| **Categoria** | UX / Validação |

**Problema:** O frontend não valida se o e-mail digitado no step 4 já está em uso antes de redirecionar para o Auth0. O erro de e-mail duplicado só aparece na tela do Auth0 (que valida isso internamente) — o usuário completa o wizard inteiro, é redirecionado, e só então descobre que o e-mail não pode ser usado, sem nenhum contexto ou orientação sobre o que fazer.

**Correção sugerida:** Não há como verificar unicidade de e-mail no frontend antes do Auth0. A solução correta é, após o retorno do Auth0 com erro, exibir uma mensagem clara orientando o usuário a usar outro e-mail ou fazer login com o existente.

---

### 17. Formulário exibe mensagens de erro genéricas e sem contexto

| | |
|---|---|
| **Arquivos** | `frontend/src/components/ong/NpoStepFour.tsx`, `frontend/src/pages/company/registration/index.tsx` |
| **Severidade / Prioridade** | MÉDIO / P1 |
| **Categoria** | UX |

**Problema:** Quando a consulta de CEP ou CNPJ falha com 404 (endereço/empresa não encontrado), o frontend exibe o erro técnico do Axios diretamente: `"Request failed with status code 404"`. O código usa `(error as Error).message` como fallback primário, mas o `.message` do erro Axios já é preenchido com essa string técnica — a mensagem amigável nunca é exibida.

```tsx
// padrão atual — fallback nunca é atingido quando .message existe
{(zipCodeQueryError as Error).message || "Erro ao consultar o CEP. Tente novamente."}
```

**Correção sugerida:** Verificar o status HTTP do erro Axios e mapear para mensagens amigáveis:
```tsx
// CEP não encontrado → "CEP não encontrado. Verifique e tente novamente."
// Erro de rede → "Não foi possível consultar o CEP. Verifique sua conexão."
```

---

### 18. Wizard permite avançar do step 3 sem preencher o campo "Número" (marcado com \*)

| | |
|---|---|
| **Arquivos** | `frontend/src/pages/company/registration/index.tsx` |
| **Severidade / Prioridade** | MÉDIO / P1 |
| **Categoria** | Validação / UX |

**Problema:** O botão "Próximo" no step 3 da empresa chama `setCurrentStep(4)` diretamente, sem nenhuma validação. O campo "Número" está marcado com `isRequired` (exibe asterisco) mas não há validação que impeça o avanço com ele vazio. O usuário pode chegar ao resumo com endereço incompleto.

**Correção sugerida:** Validar campos obrigatórios do endereço (no mínimo CEP, logradouro e número) antes de avançar para o step 4.

---

### 19. Falta de padronização entre os wizards de cadastro de ONG e Empresa

| | |
|---|---|
| **Arquivos** | `frontend/src/pages/RegisterPage/index.tsx`, `frontend/src/pages/company/registration/index.tsx` |
| **Severidade / Prioridade** | MÉDIO / P2 |
| **Categoria** | UX / Manutenibilidade |

**Problema:** Os dois wizards foram desenvolvidos de formas distintas e apresentam inconsistências visuais e de comportamento:
- ONG usa estado centralizado em `RegisterPage` com steps como componentes no array; Empresa usa um único componente gigante com renderização condicional por `currentStep`
- ONG tem validação por `stepValidators` configurados em `wizard.config.ts`; Empresa tem validação inline e incompleta
- ONG usa `useMemo` para os steps; Empresa usa `if/else` no JSX
- Navegação de "Voltar" difere entre os dois fluxos
- ONG não tem step de resumo; Empresa tem `RegistrationSummary`

**Correção sugerida:** Extrair um componente genérico de wizard reutilizável entre os dois fluxos, padronizando navegação, validação e estilos.

---

### 20. Flag `npoDraftSubmitted || hasNpoDraft` induz lógica de redirecionamento incorreta

| | |
|---|---|
| **Arquivos** | `frontend/src/components/auth/AuthRoleRedirect.tsx` |
| **Severidade / Prioridade** | MÉDIO / P2 |
| **Categoria** | Erro de lógica |

**Problema:** `redirectPathAfterSignupDraft` recebe `npoDraftSubmitted: npoDraftSubmitted || hasNpoDraft`. Se o envio falhou mas o rascunho existia, o flag ainda é `true` — pode disparar redirecionamento incorreto para o dashboard.

**Correção sugerida:** Passar apenas o flag de sucesso real.

---

### 21. Falha no CEP trava campos de endereço permanentemente

| | |
|---|---|
| **Arquivos** | `frontend/src/components/ong/NpoStepFour.tsx`, `frontend/src/pages/company/registration/index.tsx` |
| **Severidade / Prioridade** | MÉDIO / P2 |
| **Categoria** | UX |

**Problema:** Logradouro, cidade, estado e UF são `disabled` em ambos os fluxos. São preenchidos apenas pela API de CEP. Se a consulta falha ou retorna dados incompletos, o usuário não consegue inserir o endereço manualmente e fica travado.

**Correção sugerida:** Habilitar edição quando a consulta falhar; permitir sobrescrita manual com indicador visual claro.

---

### 22. Incompatibilidade de contrato nos campos `phone` e `logoUrl`

| | |
|---|---|
| **Arquivos** | `backend/.../dto/CompanyDTO.java`, `frontend/src/api/company.ts` |
| **Severidade / Prioridade** | MÉDIO / P2 |
| **Categoria** | Contrato de API |

**Problema:** `CompanyDTO` tem `@NotEmpty` em `phone` e `logoUrl`. O frontend não exige telefone e sempre envia `logoUrl: ""`. Quando `@Valid` for adicionado (issue #5), esses campos falharão com 400.

**Correção sugerida:** Marcar `phone` e `logoUrl` como `@Nullable`/opcionais no DTO, ou exigi-los na UI.

---

### 23. Parse de JWT sem tratamento de erros

| | |
|---|---|
| **Arquivos** | `frontend/src/components/auth/AuthRoleRedirect.tsx` |
| **Severidade / Prioridade** | MÉDIO / P2 |
| **Categoria** | Robustez |

**Problema:** `getRolesFromToken` divide e faz parse do payload do JWT sem try/catch. Um token malformado lança exceção e envia o usuário para `/cadastro`.

**Correção sugerida:** Envolver em try/catch, retornar array vazio em caso de falha.

---

### 24. Exceções de conflito tratadas apenas no `NpoAccountController`

| | |
|---|---|
| **Arquivos** | `backend/.../controller/NpoAccountController.java`, `backend/.../exception/GlobalExceptionHandler.java` |
| **Severidade / Prioridade** | MÉDIO / P2 |
| **Categoria** | Tratamento de erros |

**Problema:** `DuplicateLoginException` e `DuplicateDocumentException` têm `@ExceptionHandler` local apenas no `NpoAccountController`. Se lançadas em outro controller, caem no handler genérico e retornam 500.

**Correção sugerida:** Mover para `GlobalExceptionHandler` para respostas 409 consistentes.

---

### 25. `AuthTestController` expõe internos do JWT em produção

| | |
|---|---|
| **Arquivos** | `backend/.../controller/AuthTestController.java` |
| **Severidade / Prioridade** | MÉDIO / P2 |
| **Categoria** | Segurança / Divulgação de informação |

**Problema:** `GET /api/me` retorna subject, e-mail, issuer, audience, escopos e roles do JWT — útil para depuração, mas sensível em produção.

**Correção sugerida:** Restringir a um perfil de dev, somente admin, ou remover.

---

### 26. Roles claim hardcoded no frontend, configurável no backend

| | |
|---|---|
| **Arquivos** | `frontend/src/components/auth/AuthRoleRedirect.tsx`, `backend/.../application.properties` |
| **Severidade / Prioridade** | MÉDIO / P2 |
| **Categoria** | Drift de configuração |

**Problema:** O frontend hardcoda `rolesClaim = "https://vinculohub/roles"`. O backend lê de `AUTH0_ROLES_CLAIM` via env var. Se a var mudar, frontend e backend discordam sobre onde os roles estão no JWT.

**Correção sugerida:** Usar `import.meta.env.VITE_AUTH0_ROLES_CLAIM` no frontend, ou documentar o valor como imutável.

---

### 27. Endereço parcial aceito pelo backend da ONG

| | |
|---|---|
| **Arquivos** | `backend/.../service/NpoAccountService.java` |
| **Severidade / Prioridade** | MÉDIO / P2 |
| **Categoria** | Integridade de dados |

**Problema:** `isBlankAddress` retorna false se *qualquer* campo for não-nulo. Uma requisição com apenas `zipCode` preenchido (sem logradouro, cidade, estado) passa e é persistida como endereço incompleto.

**Correção sugerida:** Exigir um conjunto mínimo coerente (ex: se `zipCode` presente, exigir cidade + estado).

---

### 28. E-mail de cadastro da ONG pode vir do body da requisição

| | |
|---|---|
| **Arquivos** | `backend/.../service/NpoAccountService.java` |
| **Severidade / Prioridade** | MÉDIO / P2 |
| **Categoria** | Segurança / Fronteira de confiança |

**Problema:** Se o JWT não tem a claim `email`, o serviço usa `request.email()` como fallback. Um cliente poderia enviar um e-mail arbitrário que não corresponde à identidade Auth0.

**Correção sugerida:** Exigir a claim de e-mail do Auth0 para o cadastro; rejeitar se ausente.

---

### 29. Sem Bean Validation no `NpoInstitutionalSignupRequest`

| | |
|---|---|
| **Arquivos** | `backend/.../dto/NpoInstitutionalSignupRequest.java` |
| **Severidade / Prioridade** | MÉDIO / P2 |
| **Categoria** | Validação |

**Problema:** Todos os campos são opcionais na camada de DTO. A validação é manual no serviço. Sem `@Size`, `@Email` ou `@NotBlank` — fácil esquecer checagens ao adicionar campos.

**Correção sugerida:** Adicionar anotações de Bean Validation para restrições por campo; manter regras de lógica cruzada no serviço.

---

### 30. Queries de CNPJ/CEP executam em todos os steps do wizard

| | |
|---|---|
| **Arquivos** | `frontend/src/pages/company/registration/index.tsx` |
| **Severidade / Prioridade** | MÉDIO / P3 |
| **Categoria** | Performance |

**Problema:** `useCnpj` e `useZipCode` ficam habilitados sempre que os dígitos têm o tamanho correto, mesmo nos steps 4–5. Refetches desnecessários podem ocorrer ao focar a aba ou remontar.

**Correção sugerida:** Adicionar `enabled: currentStep === 2` (CNPJ) e `enabled: currentStep === 3` (CEP).

---

### 31. Dados obsoletos de CNPJ/CEP podem sobrescrever campos editados pelo usuário

| | |
|---|---|
| **Arquivos** | `frontend/src/pages/company/registration/index.tsx` |
| **Severidade / Prioridade** | MÉDIO / P3 |
| **Categoria** | Race condition |

**Problema:** O `useEffect` para dados de CNPJ e CEP dispara sempre que a referência dos dados da query muda. Se dados cacheados de uma query anterior forem brevemente servidos, podem sobrescrever os campos atuais do formulário.

**Correção sugerida:** Guardar o efeito comparando os dígitos atuais do input com o resultado da query.

---

### 32. `useAuthenticatedApi` hook não é utilizado

| | |
|---|---|
| **Arquivos** | `frontend/src/services/api.tsx` |
| **Severidade / Prioridade** | MÉDIO / P3 |
| **Categoria** | Código morto |

**Problema:** Definido mas nunca importado em nenhum lugar. Chamadas autenticadas anexam o header Bearer manualmente.

**Correção sugerida:** Adotar consistentemente ou remover.

---

## BAIXO

### 33. CEP preenchia campo "Complemento" incorretamente — agora mapeado para "Número" ✅ Corrigido

| | |
|---|---|
| **Arquivos** | `frontend/src/components/ong/NpoStepFour.tsx`, `frontend/src/pages/company/registration/index.tsx` |
| **Severidade / Prioridade** | BAIXO / P0 |
| **Categoria** | Bug / UX |

**Problema:** O campo `complemento` do ViaCEP era mapeado diretamente para o input "Complemento" (destinado a "Apto, Sala..."), preenchendo-o com dados postais sem sentido para o usuário. O campo "Número" na empresa não estava marcado como obrigatório.

**Correção aplicada:**
- `NpoStepFour.tsx`: `complement` do ViaCEP agora mapeia para `streetNumber` ("Número"), truncado para 20 chars.
- `CompanyRegistrationPage`: `complement` do ViaCEP agora mapeia para `number` ("Número"), truncado para 20 chars; input marcado com `isRequired`.
- O campo "Complemento" em ambos os fluxos fica em branco para preenchimento manual.

---

### 34. Link "Já tenho login" quebrado ✅ Corrigido

| | |
|---|---|
| **Arquivos** | `frontend/src/components/wizard/WizardSignUp.tsx` |
| **Severidade / Prioridade** | BAIXO / P2 |
| **Categoria** | Bug / UX |

**Problema:** `Link` do React Router envolvia outro `<a>` — HTML aninhado inválido. O destino `/Login` não tinha rota correspondente — usuários viam uma página em branco.

**Correção aplicada:** Substituído por `<button>` que chama `loginWithRedirect()` diretamente.

---

### 35. Typo no nome do componente `WizardSingUp` ✅ Corrigido

| | |
|---|---|
| **Arquivos** | `frontend/src/components/wizard/WizardSignUp.tsx` |
| **Severidade / Prioridade** | BAIXO / P3 |
| **Categoria** | Manutenibilidade |

**Problema:** Export era `WizardSingUp` ("Sing" em vez de "Sign").

**Correção aplicada:** Renomeado para `WizardSignUp`.

---

### 36. Step 5 da ONG era um placeholder vazio ✅ Corrigido

| | |
|---|---|
| **Arquivos** | `frontend/src/pages/RegisterPage/index.tsx` |
| **Severidade / Prioridade** | BAIXO / P3 |
| **Categoria** | UX |

**Problema:** O step 5 exibia apenas o texto `"Passo 5 - ONG - Cadastro de Projeto"` sem conteúdo. O usuário precisava avançar por uma tela vazia para chegar ao "Finalizar".

**Correção aplicada:** Step removido do array. O wizard da ONG agora vai direto do endereço para o "Finalizar".

---

### 37. Cadastro de projeto não existe (funcionalidade planejada)

| | |
|---|---|
| **Arquivos** | `backend/src/main/resources/db/migration/V1__init.sql`, backend em geral |
| **Severidade / Prioridade** | BAIXO / P3 |
| **Categoria** | Funcionalidade ausente |

**Problema:** O banco de dados já possui as tabelas `project`, `sdg`, `document`, `edital`, `project_sdg` e `company_project`. Nenhuma dessas tabelas tem entidade JPA, repositório, serviço ou controller correspondentes no backend. No frontend, o wizard da ONG tinha um step de "Cadastro de Projeto" que foi removido por ser placeholder. A funcionalidade central da plataforma (projetos sociais e conexão empresa-ONG) não está implementada.

**Correção sugerida:** Implementar o CRUD de projetos e a funcionalidade de vinculação empresa-ONG, que é o propósito central da plataforma.

---

### 38. Permite cadastrar ONGs com nomes duplicados

| | |
|---|---|
| **Arquivos** | `backend/.../service/NpoAccountService.java`, `backend/.../repository/NpoRepository.java` |
| **Severidade / Prioridade** | BAIXO / P2 |
| **Categoria** | Integridade de dados / UX |

**Problema:** Não existe nenhuma validação de nome duplicado para ONGs. O sistema permite criar múltiplas ONGs com o mesmo nome, o que degrada a qualidade dos dados e confunde usuários que buscam organizações.

**Correção sugerida:** Adicionar verificação de nome único (case-insensitive) antes de persistir, ou ao menos um aviso quando um nome similar já existe.

---

### 39. Duplicação de validações de CPF/CNPJ no frontend

| | |
|---|---|
| **Arquivos** | `frontend/src/utils/validation.ts`, `frontend/src/utils/validateCpf.ts`, `frontend/src/utils/validateCnpj.ts` |
| **Severidade / Prioridade** | BAIXO / P3 |
| **Categoria** | Duplicação de código |

**Problema:** Duas implementações independentes de validação de checksum de CPF e CNPJ. `validation.ts` tem `isValidCpf`/`isValidCnpj` privados; os arquivos standalone exportam versões separadas.

**Correção sugerida:** Fonte única — fazer `validation.ts` importar dos arquivos standalone, ou deletar os standalone.

---

### 40. Código morto espalhado no projeto

| | |
|---|---|
| **Arquivos** | Múltiplos |
| **Severidade / Prioridade** | BAIXO / P3 |
| **Categoria** | Manutenibilidade |

Arquivos e exports não utilizados:
- `frontend/src/hooks/useAuth.ts` — nunca importado (todos usam `useAuth0` diretamente)
- `frontend/src/types/index.ts` — tipo `User` nunca referenciado
- `frontend/src/utils/formatter.ts` — `formatDate` nunca importado
- `frontend/src/styles/theme.ts` — tema MUI definido mas sem `ThemeProvider`
- `backend/.../service/UsersService.java` — nenhum controller referencia
- `backend/.../repository/UsersRepository.java` — só usado pelo `UsersService` morto
- `frontend/src/hooks/useCompany.ts` — busca `/company/${id}`, endpoint inexistente no backend
- `LogoUpload` comentado no cadastro de empresa

**Correção sugerida:** Remover o código morto para reduzir confusão.

---

### 41. `ProtectedRoute` não passa `audience` no redirecionamento de login

| | |
|---|---|
| **Arquivos** | `frontend/src/components/auth/ProtectedRoute.tsx` |
| **Severidade / Prioridade** | BAIXO / P3 |
| **Categoria** | Consistência de autenticação |

**Problema:** `loginWithRedirect` aqui passa apenas `ui_locales`, sem `audience`. Dependendo da configuração do Auth0 SPA, o token resultante pode não ter o audience da API.

**Correção sugerida:** Passar `audience: auth0Audience` consistentemente.

---

### 42. `accessReleased` na resposta da ONG é sempre `true`

| | |
|---|---|
| **Arquivos** | `backend/.../service/NpoAccountService.java` |
| **Severidade / Prioridade** | BAIXO / P3 |
| **Categoria** | API enganosa |

**Problema:** O quarto campo de `NpoInstitutionalSignupResponse` é hardcoded como `true`.

**Correção sugerida:** Derivar de lógica de negócio ou remover até ser definido.

---

### 43. Inconsistências de texto em português

| | |
|---|---|
| **Arquivos** | `frontend/src/utils/validation.ts`, `frontend/src/pages/company/registration/index.tsx` |
| **Severidade / Prioridade** | BAIXO / P3 |
| **Categoria** | Polimento de UX |

**Problema:** Textos misturados com e sem acento ("CNPJ invalido" vs "CNPJ inválido"), "instituicao" sem acento nas mensagens de validação.

**Correção sugerida:** Normalizar todas as strings visíveis ao usuário para português correto.

---

### 44. `AuthRedirectModal` sem semântica de dialog acessível

| | |
|---|---|
| **Arquivos** | `frontend/src/components/auth/AuthRedirectModal.tsx` |
| **Severidade / Prioridade** | BAIXO / P3 |
| **Categoria** | Acessibilidade |

**Problema:** Sem `role="dialog"`, `aria-modal`, `aria-labelledby`, armadilha de foco ou tratamento da tecla Escape.

**Correção sugerida:** Usar padrão adequado de dialog (MUI `Dialog` está disponível nas dependências).

---

### 45. `WizardSteps` sem alternativas textuais

| | |
|---|---|
| **Arquivos** | `frontend/src/components/auth/WizardSteps.tsx` |
| **Severidade / Prioridade** | BAIXO / P3 |
| **Categoria** | Acessibilidade |

**Problema:** Indicadores de step são apenas visuais (números/checkmarks). Sem `aria-label`, `aria-current` ou contexto para leitores de tela.

**Correção sugerida:** Adicionar `aria-current="step"` e labels ("Passo 1 de 5").

---

### 46. Dados sensíveis (PII) nos logs de frontend e backend

| | |
|---|---|
| **Arquivos** | `CompanyController`, `CompanyService`, `NpoAccountController`, página de cadastro de empresa, `api/company.ts` |
| **Severidade / Prioridade** | BAIXO / P3 |
| **Categoria** | Privacidade / LGPD |

**Problema:** E-mail e CNPJ são logados em nível INFO tanto no console do frontend quanto nos logs Docker do backend.

**Correção sugerida:** Mascarar dados sensíveis nos logs de produção (ex: `k***@gmail.com`, `12.345.***/**01-90`).

---

## Resumo de Vitórias Rápidas

| # | Problema | Esforço | Status |
|---|----------|---------|--------|
| 1 | Enter no step 4 reseta wizard para step 2 | 2 min | ✅ Concluído |
| 3 | ViaCEP complement > 20 chars derruba endpoints com 500 | 2 min | ✅ Concluído |
| 33 | CEP preenchia campo "Complemento" errado; "Número" não obrigatório na empresa | 5 min | ✅ Concluído |
| 34 | Link "Já tenho login" levava a página em branco | 5 min | ✅ Concluído |
| 35 | Typo `WizardSingUp` → `WizardSignUp` | 2 min | ✅ Concluído |
| 36 | Step 5 da ONG era placeholder vazio | 1 min | ✅ Concluído |
| 5 | Adicionar `@Valid` no `CompanyController.createCompany` | 1 min | Pendente |
| 8–9 | Deletar `Users.java`, `UsersRepository.java`, `UsersService.java`, `model/UserType.java` | 5 min | Pendente |
| 12 | Substituir `IllegalArgumentException` por `BadRequestException` no `CompanyService` | 5 min | Pendente |
| 17 | Validação de campos obrigatórios no step 3 da empresa | 15 min | Pendente |
| 40 | Remover código morto (8 arquivos/exports não utilizados) | 10 min | Pendente |

---

## Ordem de Correção Recomendada

1. **P0 (imediato):** Persistir estado do wizard em sessionStorage (#2)
2. **P1 (esta sprint):** Feedback de erros de cadastro para o usuário (#15, #16, #17, #18); CNPJ cross-entidade (#4); adicionar `@Valid` (#5); normalizar CNPJ (#6)
3. **P1 (esta sprint):** Enforcement de roles nas rotas (#10) e endpoints (#7); deletar entidades duplicadas (#8, #9)
4. **P2 (próxima sprint):** Padronizar wizards (#19); tratamento de exceções (#11, #12, #24); gaps de validação (#21, #22, #29); validação de ambiente (#13)
5. **P2 (próxima sprint):** Itens de segurança (#25, #26, #28) e infraestrutura (#14)
6. **P3 (backlog):** Implementar cadastro de projetos (#37); limpeza de código morto (#40); polimento de UX, acessibilidade e logs
