# VinculoHub Portal — Code Review & Analysis

> Scope: NPO and Company registration flows (frontend + backend), shared infrastructure.

---

## Legend

| Severity | Meaning |
|----------|---------|
| **CRITICAL** | Actively broken or exploitable; blocks core functionality |
| **HIGH** | Significant bug, security gap, or data integrity risk |
| **MEDIUM** | Incorrect behavior in edge cases, maintainability hazard, or UX degradation |
| **LOW** | Polish, dead code, or minor inconsistency |

| Priority | Meaning |
|----------|---------|
| **P0** | Fix now — users are hitting this |
| **P1** | Fix this sprint — will cause problems soon |
| **P2** | Fix next sprint — improves quality |
| **P3** | Backlog — nice to have |

---

## CRITICAL

### 1. Step 4 → Step 2 regression: implicit form submit on Enter key

| | |
|---|---|
| **Files** | `frontend/src/pages/company/registration/index.tsx` (lines 536–581, 397–533) |
| **Severity / Priority** | CRITICAL / P0 |
| **Category** | Bug |

**Problem:** Steps 3 and 4 of the company wizard use `<form>` elements with **no `onSubmit` handler**. When the user presses Enter in the email field (step 4), the browser performs a **default form submission**, which navigates/reloads the page. This remounts the component and resets `useState(2)` — sending the user back to step 2.

Step 3 has the same vulnerability (multiple inputs reduce the likelihood but don't eliminate it).

**Fix:** Add `onSubmit={(e) => e.preventDefault()}` to both forms, or wire Enter to trigger the "Próximo" action.

---

### 2. Wizard state lost on any page reload

| | |
|---|---|
| **Files** | `frontend/src/pages/company/registration/index.tsx` (line 31) |
| **Severity / Priority** | CRITICAL / P0 |
| **Category** | Bug / UX |

**Problem:** `currentStep` and all form fields (`basicInfo`, `contactInfo`, `credentials`) are ephemeral React state initialized to defaults on every mount. The draft is only written to `sessionStorage` right before Auth0 redirect. Any reload, tab restore, or navigation wipes all progress back to step 2.

**Fix:** Persist wizard state (step + form data) to `sessionStorage` on every change and rehydrate on mount.

---

## HIGH

### 3. `@Valid` missing on `CompanyController` — Bean Validation is bypassed

| | |
|---|---|
| **Files** | `backend/.../controller/CompanyController.java` (line 20), `backend/.../dto/CompanyDTO.java` |
| **Severity / Priority** | HIGH / P1 |
| **Category** | Validation / Security |

**Problem:** `CompanyDTO` has `@NotEmpty`, `@Email`, and other Bean Validation annotations, but the controller parameter is `@RequestBody CompanyDTO` **without `@Valid`**. All validation annotations are silently ignored.

**Fix:** Add `@Valid` and handle `MethodArgumentNotValidException` in `GlobalExceptionHandler`.

---

### 4. CNPJ not normalized before uniqueness check

| | |
|---|---|
| **Files** | `backend/.../service/CompanyService.java` (line 35) |
| **Severity / Priority** | HIGH / P1 |
| **Category** | Data integrity |

**Problem:** `existsByCnpj` compares the raw string from the request. The frontend sends formatted CNPJs (`12.345.678/0001-90`), but there's no normalization to digits-only before checking or storing. If the format varies between requests, duplicates can slip through.

**Fix:** Strip non-digits from CNPJ before both the uniqueness check and persistence (as `NpoDocumentService` already does for NPO).

---

### 5. No server-side role enforcement on any endpoint

| | |
|---|---|
| **Files** | `backend/.../config/SecurityConfig.java` (lines 52–61), all controllers |
| **Severity / Priority** | HIGH / P1 |
| **Category** | Security |

**Problem:** `@EnableMethodSecurity` is configured and JWT roles are mapped to `ROLE_*` authorities, but **no controller uses `@PreAuthorize`**. Any authenticated user can call any protected endpoint (`POST /api/npo-accounts`, `POST /api/company-accounts`, `GET /api/me/profile`, `GET /api/me`). Role-based access is purely a frontend routing concern.

**Fix:** Add `@PreAuthorize` to sensitive endpoints. At minimum, restrict admin routes and ensure signup endpoints validate the caller's role/intent.

---

### 6. Duplicate JPA entities on `users` table

| | |
|---|---|
| **Files** | `backend/.../model/User.java`, `backend/.../model/Users.java` |
| **Severity / Priority** | HIGH / P1 |
| **Category** | Maintainability / Data integrity |

**Problem:** Two `@Entity` classes map to the same `users` table with **different configurations**: `User` has `@SQLRestriction("deleted_at IS NULL")`, Lombok builders, and `enums.UserType`; `Users` has none of these and uses `model.UserType`. Hibernate generates conflicting metamodel entries.

**Fix:** Delete `Users.java`, `UsersRepository.java`, and `UsersService.java` (all unused by any controller or active service). Consolidate on `User.java`.

---

### 7. Duplicate `UserType` enum in two packages

| | |
|---|---|
| **Files** | `backend/.../model/UserType.java`, `backend/.../model/enums/UserType.java` |
| **Severity / Priority** | HIGH / P1 |
| **Category** | Maintainability |

**Problem:** Identical enum values in two packages. `User.java` and active services use `model.enums.UserType`; dead `Users.java` uses `model.UserType`. If one is updated and the other isn't, mappings break silently.

**Fix:** Delete `model/UserType.java` along with the dead `Users` entity.

---

### 8. Route protection is auth-only, not role-based

| | |
|---|---|
| **Files** | `frontend/src/components/auth/ProtectedRoute.tsx`, `frontend/src/router/index.tsx` |
| **Severity / Priority** | HIGH / P1 |
| **Category** | Security |

**Problem:** `ProtectedRoute` only checks `isAuthenticated`. Any logged-in user can access `/admin/dashboard` by typing the URL. There's no role check on the frontend or backend for dashboard routes.

**Fix:** Create a `RequireRole` wrapper that checks the user's role from JWT or profile, and apply it to each dashboard route.

---

### 9. `CompanyAlreadyExistsException` uses same message for 3 different causes

| | |
|---|---|
| **Files** | `backend/.../service/CompanyService.java` (lines 35–49), `backend/.../exception/CompanyAlreadyExistsException.java` |
| **Severity / Priority** | HIGH / P2 |
| **Category** | UX / Debugging |

**Problem:** Duplicate CNPJ, duplicate Auth0 ID, and duplicate email all throw the same `CompanyAlreadyExistsException` with a message about "CNPJ" (and a typo: "comany"). The user and developer cannot distinguish the cause.

**Fix:** Use parameterized messages or distinct exception types for each duplication scenario.

---

### 10. `IllegalArgumentException` in `CompanyService` returns 500

| | |
|---|---|
| **Files** | `backend/.../service/CompanyService.java` (lines 31, 50), `backend/.../exception/GlobalExceptionHandler.java` |
| **Severity / Priority** | HIGH / P2 |
| **Category** | Error handling |

**Problem:** `CompanyService` throws `IllegalArgumentException` for blank Auth0 ID and missing email. `GlobalExceptionHandler` does not handle this exception — it falls through to the generic `Exception` handler, returning HTTP 500 with "Erro interno do servidor".

**Fix:** Add `@ExceptionHandler(IllegalArgumentException.class)` → 400, or replace with `BadRequestException`.

---

### 11. Auth0 environment variables fail silently

| | |
|---|---|
| **Files** | `frontend/src/main.tsx` (lines 8–17), `backend/.../application.properties` (lines 23–24) |
| **Severity / Priority** | HIGH / P2 |
| **Category** | Configuration |

**Problem:** Frontend only `console.error`s when `VITE_AUTH0_*` vars are missing — the app still mounts `Auth0Provider` with `undefined`. Backend `AUTH0_ISSUER_URI` and `AUTH0_AUDIENCE` have no defaults — blank values cause cryptic startup failures.

**Fix:** Fail fast: throw before render on frontend, add `@Value` with validation or startup checks on backend.

---

### 12. Docker Compose: backend can start before Flyway finishes

| | |
|---|---|
| **Files** | `docker-compose.yml` |
| **Severity / Priority** | HIGH / P2 |
| **Category** | Infrastructure |

**Problem:** `backend` depends on `db` (healthy), but Flyway runs as a separate service. With `ddl-auto=validate`, the backend can fail on startup if migrations haven't completed yet.

**Fix:** Make `backend` depend on `flyway` with a condition, or run Flyway as part of the backend's startup (Spring Boot already has Flyway auto-config enabled).

---

## MEDIUM

### 13. NPO/Company signup errors are swallowed — user lands on dashboard with no account created

| | |
|---|---|
| **Files** | `frontend/src/components/auth/AuthRoleRedirect.tsx` (lines 67–86) |
| **Severity / Priority** | MEDIUM / P1 |
| **Category** | UX / Error handling |

**Problem:** When `submitNpoSignupDraft` or `submitCompanySignupDraft` fails, the error is only logged and the flow continues silently. Observed in production:

```
POST /api/npo-accounts → 409 "Já existe uma instituição cadastrada com este CPF."
GET  /api/me/profile   → 200 { registrationCompleted: false, npoId: null }
→ Role from JWT = "NPO" → navigate("/ong/dashboard")
```

The user is sent to `/ong/dashboard` even though their NPO record was **never created** (or was rejected). The JWT has an NPO role from Auth0 (set during signup), so `resolvePrimaryRole` returns `"NPO"` and routes to the dashboard — regardless of whether the backend actually has a record. The stale draft remains in `sessionStorage` and will be replayed on every subsequent login until it either succeeds or the user clears storage.

**Scenarios that trigger this:**
- CPF/CNPJ already registered (409 duplicate)
- Invalid document (400)
- Network failure during draft POST

**Fix:** On draft submission failure, do not navigate to the dashboard. Redirect to `/cadastro` and surface the specific API error message to the user so they can correct their data and retry.

---

### 14. `npoDraftSubmitted || hasNpoDraft` misleads redirect logic

| | |
|---|---|
| **Files** | `frontend/src/components/auth/AuthRoleRedirect.tsx` (lines 96–101) |
| **Severity / Priority** | MEDIUM / P2 |
| **Category** | Logic error |

**Problem:** `redirectPathAfterSignupDraft` receives `npoDraftSubmitted: npoDraftSubmitted || hasNpoDraft`. If submission failed but the draft existed, the flag is still `true` — can trigger an incorrect dashboard redirect.

**Fix:** Pass only the actual success flag.

---

### 15. CEP failure locks address fields permanently

| | |
|---|---|
| **Files** | `frontend/src/components/ong/NpoStepFour.tsx` (lines 86–160), `frontend/src/pages/company/registration/index.tsx` (steps 3) |
| **Severity / Priority** | MEDIUM / P2 |
| **Category** | UX |

**Problem:** Street, city, state, and UF fields are `disabled` in both NPO and company flows. They're only populated by the CEP API. If the lookup fails or returns incomplete data, users cannot manually enter their address and are stuck.

**Fix:** Enable editing when lookup fails; allow manual override with a clear indicator.

---

### 16. Company step 3 has no validation before advancing

| | |
|---|---|
| **Files** | `frontend/src/pages/company/registration/index.tsx` (lines 540–557) |
| **Severity / Priority** | MEDIUM / P2 |
| **Category** | Validation |

**Problem:** The "Próximo" button on step 3 calls `setCurrentStep(4)` directly with no validation. Users can reach the summary with empty address fields, leading to a backend rejection or incomplete data.

**Fix:** Validate required address fields (at minimum CEP, street, city) before advancing.

---

### 17. Phone and `logoUrl` DTO mismatches

| | |
|---|---|
| **Files** | `backend/.../dto/CompanyDTO.java`, `frontend/src/api/company.ts` (line 107) |
| **Severity / Priority** | MEDIUM / P2 |
| **Category** | API contract |

**Problem:** `CompanyDTO` has `@NotEmpty` on `phone` and `logoUrl`. Frontend doesn't require phone and always sends `logoUrl: ""`. Once `@Valid` is added (issue #3), these will fail with 400.

**Fix:** Make `phone` and `logoUrl` `@Nullable`/optional in the DTO, or require them in the UI.

---

### 18. Client-side JWT parsing has no error handling

| | |
|---|---|
| **Files** | `frontend/src/components/auth/AuthRoleRedirect.tsx` (lines 240–248) |
| **Severity / Priority** | MEDIUM / P2 |
| **Category** | Robustness |

**Problem:** `getRolesFromToken` splits and parses the JWT payload without try/catch. A malformed token (e.g. from a corrupt Auth0 response) throws and sends the user to `/cadastro`.

**Fix:** Wrap in try/catch, return empty array on failure.

---

### 19. `DuplicateLoginException` / `DuplicateDocumentException` only handled on `NpoAccountController`

| | |
|---|---|
| **Files** | `backend/.../controller/NpoAccountController.java` (lines 36–55), `backend/.../exception/GlobalExceptionHandler.java` |
| **Severity / Priority** | MEDIUM / P2 |
| **Category** | Error handling |

**Problem:** These exceptions have local `@ExceptionHandler` in `NpoAccountController` only. If thrown from another controller, they'd fall through to the generic 500 handler.

**Fix:** Move to `GlobalExceptionHandler` for consistent 409 responses.

---

### 20. `AuthTestController` exposes JWT internals in production

| | |
|---|---|
| **Files** | `backend/.../controller/AuthTestController.java` |
| **Severity / Priority** | MEDIUM / P2 |
| **Category** | Security / Information disclosure |

**Problem:** `GET /api/me` returns subject, email, issuer, audience, scopes, and roles from the JWT — useful for debugging but sensitive in production.

**Fix:** Restrict to a dev profile, admin-only, or remove.

---

### 21. Roles claim hardcoded on frontend, configurable on backend

| | |
|---|---|
| **Files** | `frontend/src/components/auth/AuthRoleRedirect.tsx` (line 37), `backend/.../application.properties` |
| **Severity / Priority** | MEDIUM / P2 |
| **Category** | Configuration drift |

**Problem:** Frontend hardcodes `rolesClaim = "https://vinculohub/roles"`. Backend reads it from `AUTH0_ROLES_CLAIM` env var. If the env var changes, frontend and backend disagree on where roles live in the JWT.

**Fix:** Use `import.meta.env.VITE_AUTH0_ROLES_CLAIM` on frontend, or document the value as immutable.

---

### 22. `useAuthenticatedApi` hook is unused

| | |
|---|---|
| **Files** | `frontend/src/services/api.tsx` (lines 11–27) |
| **Severity / Priority** | MEDIUM / P3 |
| **Category** | Dead code |

**Problem:** Defined but never imported anywhere. Authenticated calls manually attach Bearer headers instead.

**Fix:** Adopt it consistently or remove it.

---

### 23. Partial address accepted by NPO backend

| | |
|---|---|
| **Files** | `backend/.../service/NpoAccountService.java` (lines 127–151) |
| **Severity / Priority** | MEDIUM / P2 |
| **Category** | Data integrity |

**Problem:** `isBlankAddress` returns false if *any* single field is non-null. A request with only `zipCode` set (no street, city, state) passes and is persisted as an incomplete address.

**Fix:** Require a coherent minimum set (e.g., if zipCode is present, require city + state).

---

### 24. NPO signup email can come from request body

| | |
|---|---|
| **Files** | `backend/.../service/NpoAccountService.java` (lines 44–46, 93–96) |
| **Severity / Priority** | MEDIUM / P2 |
| **Category** | Security / Trust boundary |

**Problem:** If the JWT has no `email` claim, the service falls back to `request.email()`. A client could submit an arbitrary email that doesn't match their Auth0 identity.

**Fix:** Require the Auth0 email claim for signup; reject if absent.

---

### 25. CNPJ/CEP queries run on all wizard steps

| | |
|---|---|
| **Files** | `frontend/src/pages/company/registration/index.tsx` (lines 141–151) |
| **Severity / Priority** | MEDIUM / P3 |
| **Category** | Performance |

**Problem:** `useCnpj` and `useZipCode` are always enabled when digits match the required length, even on steps 4–5. Unnecessary refetches can occur on tab focus or remount.

**Fix:** Add `enabled: currentStep === 2` (CNPJ) and `enabled: currentStep === 3` (CEP).

---

### 26. Stale CNPJ/CEP data can overwrite fields after user edits

| | |
|---|---|
| **Files** | `frontend/src/pages/company/registration/index.tsx` (lines 153–182) |
| **Severity / Priority** | MEDIUM / P3 |
| **Category** | Race condition |

**Problem:** The `useEffect` for CNPJ and ZIP code data fires whenever the query data reference changes. If cached data from a previous query key is briefly served, it can overwrite the current form fields.

**Fix:** Guard the effect by comparing the current input digits against the query result's value.

---

### 27. No Bean Validation on `NpoInstitutionalSignupRequest`

| | |
|---|---|
| **Files** | `backend/.../dto/NpoInstitutionalSignupRequest.java` |
| **Severity / Priority** | MEDIUM / P2 |
| **Category** | Validation |

**Problem:** All fields are optional at the DTO layer. Validation is manual in the service. No `@Size`, `@Email`, or `@NotBlank` annotations — easy to miss checks when adding fields.

**Fix:** Add Bean Validation annotations for field-level constraints; keep service rules for cross-field logic.

---

## LOW

### 28. CEP lookup incorrectly fills the "Complemento" field — now maps to "Número" ✅ Fixed

| | |
|---|---|
| **Files** | `frontend/src/components/ong/NpoStepFour.tsx`, `frontend/src/pages/company/registration/index.tsx` |
| **Severity / Priority** | LOW / P0 (UX regression, immediately visible) |
| **Category** | Bug / UX |

**Problem:** ViaCEP's `complemento` field was being mapped into the user-facing "Complemento" input (meant for "Apto, Sala..."), incorrectly filling it with postal qualifier data. Additionally, the "Número" field in the company registration form was not marked as required.

**Fix applied:**
- `NpoStepFour.tsx`: ViaCEP `complement` now maps to `streetNumber` ("Número" field), truncated to 20 chars.
- `CompanyRegistrationPage`: ViaCEP `complement` now maps to `number` ("Número" field), truncated to 20 chars; the input is marked `isRequired`.
- The "Complemento" field in both flows is left blank for the user to fill manually.

**Follow-up bug (found during testing) — see issue #40.**

---

### 29. Broken "Já tenho login" link (nested `<a>` + missing route) ✅ Fixed

| | |
|---|---|
| **Files** | `frontend/src/components/wizard/WizardSignUp.tsx` (lines 88–94), `frontend/src/router/index.tsx` |
| **Severity / Priority** | LOW / P2 |
| **Category** | Bug / UX |

**Problem:** `Link` from React Router wraps another `<a>` — invalid nested interactive HTML. The target `/Login` has no matching route — users get a blank page.

**Fix applied:** Replaced with a `<button>` calling `loginWithRedirect()` directly.

---

### 30. `WizardSingUp` typo in component name ✅ Fixed

| | |
|---|---|
| **Files** | `frontend/src/components/wizard/WizardSignUp.tsx` (line 55), `frontend/src/pages/RegisterPage/index.tsx` (line 9) |
| **Severity / Priority** | LOW / P3 |
| **Category** | Maintainability |

**Problem:** Export is `WizardSingUp` ("Sing" instead of "Sign").

**Fix:** Rename to `WizardSignUp`.

---

### 31. NPO step 5 is a placeholder ✅ Fixed

| | |
|---|---|
| **Files** | `frontend/src/pages/RegisterPage/index.tsx` (lines 89–105, 187–190) |
| **Severity / Priority** | LOW / P3 |
| **Category** | UX |

**Problem:** Step 5 shows "Passo 5 - ONG - Cadastro de Projeto" with no content. Users must click through an empty step to reach "Finalizar".

**Fix:** Remove the placeholder step or implement it; align `totalSteps` and validators.

---

### 31. Duplicate CPF/CNPJ validation on frontend

| | |
|---|---|
| **Files** | `frontend/src/utils/validation.ts` (lines 28–74), `frontend/src/utils/validateCpf.ts`, `frontend/src/utils/validateCnpj.ts` |
| **Severity / Priority** | LOW / P3 |
| **Category** | Code duplication |

**Problem:** Two independent implementations of CPF and CNPJ checksum validation. `validation.ts` has private `isValidCpf`/`isValidCnpj`; standalone files export separate versions.

**Fix:** Single source — have `validation.ts` import from the standalone files, or delete the standalone files.

---

### 32. Dead code across the codebase

| | |
|---|---|
| **Files** | Multiple |
| **Severity / Priority** | LOW / P3 |
| **Category** | Maintainability |

Unused exports and files:
- `frontend/src/hooks/useAuth.ts` — never imported (all call sites use `useAuth0` directly)
- `frontend/src/types/index.ts` — `User` type never referenced
- `frontend/src/utils/formatter.ts` — `formatDate` never imported
- `frontend/src/styles/theme.ts` — MUI theme defined but no `ThemeProvider` wired
- `backend/.../service/UsersService.java` — no controller references it
- `backend/.../repository/UsersRepository.java` — only used by dead `UsersService`
- Commented `LogoUpload` in company registration

**Fix:** Remove dead code to reduce confusion.

---

### 33. `ProtectedRoute` login redirect omits `audience`

| | |
|---|---|
| **Files** | `frontend/src/components/auth/ProtectedRoute.tsx` (line 15) |
| **Severity / Priority** | LOW / P3 |
| **Category** | Auth consistency |

**Problem:** `loginWithRedirect` here only passes `ui_locales`, not `audience`. Other call sites pass the full `audience`. Depending on Auth0 SPA config, the resulting token might lack the API audience.

**Fix:** Pass `audience: auth0Audience` consistently.

---

### 34. `accessReleased` in NPO response is always `true`

| | |
|---|---|
| **Files** | `backend/.../service/NpoAccountService.java` (line 85) |
| **Severity / Priority** | LOW / P3 |
| **Category** | Misleading API |

**Problem:** Fourth field in `NpoInstitutionalSignupResponse` is hardcoded to `true`.

**Fix:** Derive from business logic or remove until defined.

---

### 35. Portuguese copy inconsistencies

| | |
|---|---|
| **Files** | `frontend/src/utils/validation.ts`, `frontend/src/pages/company/registration/index.tsx` (line 219 vs 189) |
| **Severity / Priority** | LOW / P3 |
| **Category** | UX polish |

**Problem:** Mixed accented/unaccented text ("CNPJ invalido" vs "CNPJ inválido"), "instituicao" without accent.

**Fix:** Normalize all user-facing strings to proper Portuguese.

---

### 36. `AuthRedirectModal` lacks dialog semantics

| | |
|---|---|
| **Files** | `frontend/src/components/auth/AuthRedirectModal.tsx` |
| **Severity / Priority** | LOW / P3 |
| **Category** | Accessibility |

**Problem:** No `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap, or Escape key handling.

**Fix:** Use a proper dialog pattern (MUI `Dialog` is available in deps).

---

### 37. `WizardSteps` has no text alternatives

| | |
|---|---|
| **Files** | `frontend/src/components/auth/WizardSteps.tsx` |
| **Severity / Priority** | LOW / P3 |
| **Category** | Accessibility |

**Problem:** Step indicators are visual-only (numbers/checkmarks). No `aria-label`, `aria-current`, or screen reader context.

**Fix:** Add `aria-current="step"` and labels ("Passo 1 de 5").

---

### 38. PII logged in frontend and backend

| | |
|---|---|
| **Files** | Multiple (`CompanyController`, `CompanyService`, `NpoAccountController`, company registration page, `api/company.ts`) |
| **Severity / Priority** | LOW / P3 |
| **Category** | Privacy / LGPD |

**Problem:** Email and CNPJ are logged at INFO level in both frontend console and backend Docker logs.

**Fix:** Mask sensitive data in production logs (e.g. `k***@gmail.com`, `12.345.***/**01-90`).

---

### 39. `useCompany` hook targets a non-existent endpoint

| | |
|---|---|
| **Files** | `frontend/src/hooks/useCompany.ts` |
| **Severity / Priority** | LOW / P3 |
| **Category** | Dead code |

**Problem:** Fetches `/company/${id}` — no backend endpoint exists at this path. Also uses `fetch` instead of the shared `api` axios instance.

**Fix:** Remove until a `GET /api/companies/{id}` endpoint exists, or implement the endpoint.

---

### 40. ViaCEP `complement` → `number` mapping causes 500 when value exceeds `VARCHAR(20)` ✅ Fixed

| | |
|---|---|
| **Files** | `frontend/src/components/ong/NpoStepFour.tsx`, `frontend/src/pages/company/registration/index.tsx` |
| **Severity / Priority** | CRITICAL / P0 |
| **Category** | Bug — DB overflow |

**Problem:** ViaCEP's `complemento` field can be a long postal descriptor (e.g. `"de 1 a 499 - lado ímpar"`). After issue #28's fix mapped it to the `number`/`streetNumber` fields, the raw string was written to React state without length enforcement. The `<Input maxLength={20}>` attribute only restricts keyboard input — programmatic state updates bypass it entirely. When the full string reached the backend, PostgreSQL rejected it with:

```
PSQLException: ERROR: value too long for type character varying(20)
```

Both `/api/npo-accounts` and `/api/company-accounts` returned 500. No user or registration record was created.

**Observed during testing:**
```
hasNpoDraft: true, hasCompanyDraft: true  ← both drafts present simultaneously
POST /api/npo-accounts    → 500 (VARCHAR overflow on address.number)
POST /api/company-accounts → 500 (same cause)
GET  /api/me/profile      → registrationCompleted: false
→ redirected to /empresa/dashboard with no account created
```

**DB state at time of failure:** No records written. Existing records (id=2 Microsoft/company, id=3 Ong/npo) were from prior successful registrations before the mapping was introduced.

**Fix applied:** Both auto-fill sites now truncate to 20 characters before setting state:
```ts
number: (zipCodeData.complement ?? "").slice(0, 20) || prev.number,
```

**Root cause:** `maxLength` on `<input>` does not apply to programmatic React state updates. Any auto-fill from an external source must enforce length constraints explicitly in code, not rely on HTML attributes.

---

## Quick Wins Summary

| # | Issue | Effort | Status |
|---|-------|--------|--------|
| 1 | Add `onSubmit={e => e.preventDefault()}` to step 3/4 forms | 2 min | ✅ Done |
| 2 | Remove empty NPO placeholder step | 1 min | ✅ Done |
| 4 | Fix "CNPJ inválido" typo | 30 sec | ✅ Done |
| 28 | CEP `complement` mapped to "Complemento" instead of "Número"; "Número" not required in company flow | 5 min | ✅ Done |
| 40 | ViaCEP complement > 20 chars crashes both registration endpoints with 500 | 2 min | ✅ Done |
| 29 | "Já tenho login" navigates to blank page | 5 min | ✅ Done |
| 30 | Rename `WizardSingUp` → `WizardSignUp` | 2 min | ✅ Done |
| 3 | Add `@Valid` to `CompanyController.createCompany` | 1 min | Pending |
| 6–7 | Delete `Users.java`, `UsersRepository.java`, `UsersService.java`, `model/UserType.java` | 5 min | Pending |
| 10 | Replace `IllegalArgumentException` with `BadRequestException` in `CompanyService` | 5 min | Pending |
| 32 | Delete dead code (5 unused files) | 5 min | Pending |

---

## Recommended Fix Order

1. **P0:** Fix step 3/4 form submission (#1) and persist wizard state (#2)
2. **P1:** Add `@Valid` (#3), normalize CNPJ (#4), delete duplicate entities (#6, #7)
3. **P1:** Add role enforcement on routes (#8) and endpoints (#5)
4. **P1:** Surface signup errors to users (#13)
5. **P2:** Fix exception handling (#9, #10, #19), validation gaps (#16, #17, #27), and environment validation (#11)
6. **P2:** Address security items (#20, #21, #24) and infrastructure (#12)
7. **P3:** Clean up dead code, polish UX, accessibility, and logging
