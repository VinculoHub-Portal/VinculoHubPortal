# VinculoHub Portal — Detailed Project Research Report

## 1. Project Overview

**VinculoHub Portal** is a social-impact / ESG platform that connects **NGOs (ONGs/OSCIPs)** with **companies** running corporate social responsibility programs. The platform combines training ("capacitação") with day-to-day management tools for NGOs, and provides companies with project management, volunteering coordination, and ESG reporting capabilities.

The project is developed in **Portuguese (Brazil)** and follows an academic/institutional development workflow (AGES/PUCRS — indicated by the GitLab sync to `tools.ages.pucrs.br`).

---

## 2. Architecture

The repository is a **monorepo** with two main applications:

```
VinculoHubPortal/
├── frontend/          # React SPA (Vite + TypeScript)
├── backend/           # Spring Boot REST API (Java 17, Maven)
├── docs/              # Database model (DBML)
├── githooks/          # Pre-push linting hooks
├── .github/           # CI workflows, PR template
├── docker-compose.yml # Full-stack local environment
├── .env.example       # Environment variable template
└── README.md          # Setup instructions
```

**Infrastructure** is containerized via Docker Compose with four services: PostgreSQL 16, the Spring Boot backend, the Vite/Nginx frontend, and a Flyway migration runner.

---

## 3. Tech Stack

### 3.1 Frontend

| Area              | Technology                                          |
|-------------------|-----------------------------------------------------|
| Framework         | React 19 + TypeScript                               |
| Build Tool        | Vite 6                                              |
| UI Library        | MUI (Material UI) 7 + Emotion                       |
| CSS               | Tailwind CSS 4 (via `@tailwindcss/vite` plugin)     |
| Routing           | React Router DOM 7 (`BrowserRouter`)                |
| Authentication    | Auth0 React SDK (`@auth0/auth0-react`)              |
| Server State      | TanStack React Query + Axios                        |
| Testing           | Vitest + Testing Library + jsdom                    |
| Linting           | ESLint (flat config) + TypeScript-ESLint            |
| Git Hooks (FE)    | Husky                                               |

### 3.2 Backend

| Area              | Technology                                          |
|-------------------|-----------------------------------------------------|
| Framework         | Spring Boot 3.4.3 (Java 17, Maven)                 |
| Database          | PostgreSQL 16                                       |
| ORM               | Spring Data JPA (Hibernate, `ddl-auto=validate`)    |
| Migrations        | Flyway                                              |
| Security          | Spring Security + OAuth2 Resource Server (JWT)      |
| API Documentation | SpringDoc OpenAPI (Swagger UI)                      |
| External APIs     | ViaCEP (address lookup), OpenCNPJ (company lookup)  |
| Code Quality      | Spotless (Google Java Format), PMD, SpotBugs        |
| Test Coverage     | JaCoCo                                              |
| Testing           | JUnit + Spring Boot Test + Testcontainers (Postgres)|

### 3.3 Infrastructure

| Component         | Details                                             |
|-------------------|-----------------------------------------------------|
| Containers        | Docker Compose: `db`, `backend`, `frontend`, `flyway` |
| Database          | PostgreSQL 16 Alpine, persistent volume `db_data`   |
| Frontend Hosting  | Built with Node 22, served via Nginx on port 80     |
| Backend Port      | Configurable via `BACKEND_PORT` (default 8080)      |

---

## 4. Authentication & Authorization

### 4.1 Auth0 Integration

The platform uses **Auth0** as its identity provider with the following flow:

1. **Frontend** initializes `Auth0Provider` in `main.tsx` with domain, client ID, and audience from `VITE_*` env vars.
2. Users authenticate through Auth0's hosted Universal Login (`ui_locales: 'pt-BR'`).
3. On redirect callback, a `sessionStorage` flag `auth0-login-completed` is set.
4. **`AuthRoleRedirect`** (a global component rendering `null`) detects the login completion and:
   - Replays any signup drafts stored in `sessionStorage` (NPO or company)
   - Fetches `GET /api/me/profile` to load the user's DB-backed profile
   - Decodes roles from the JWT custom claim `https://vinculohub/roles`
   - Redirects to the appropriate dashboard based on role priority: **ADMIN > NPO > COMPANY**

### 4.2 Backend Security

- **Spring Security OAuth2 Resource Server** validates JWTs from the Auth0 issuer.
- The custom claim (`app.auth0.roles-claim`) is mapped to Spring authorities with `ROLE_` prefix.
- **`@EnableMethodSecurity`** is configured but **no `@PreAuthorize` annotations** exist on controllers — authorization is currently binary (authenticated vs. public).
- **Public endpoints:** `/public/**`, `/cep/**`, `/cnpj/**`, and `OPTIONS /**`.
- **Protected endpoints:** Everything under `/api/**` requires a valid JWT.
- **CORS:** Configured for origins specified in `app.frontend.url` (comma-separated).

### 4.3 Role Model

Three roles exist: `admin`, `npo`, `company`. These are stored in the JWT custom claim and mapped to the `user_type` PostgreSQL enum. Frontend routing uses these roles to direct users to `/admin/dashboard`, `/ong/dashboard`, or `/empresa/dashboard`.

---

## 5. Database Schema

The database is defined via Flyway migrations and documented in `docs/db/vinculo_hub.dbml`.

### 5.1 PostgreSQL Enums

| Enum                  | Values                                                |
|-----------------------|-------------------------------------------------------|
| `npo_size`            | `large`, `medium`, `small`                            |
| `user_type`           | `admin`, `npo`, `company`                             |
| `project_status`      | `active`, `completed`, `cancelled`                    |
| `relationship_status` | `pending`, `active`, `inactive`, `negotiation`        |
| `project_type`        | `social_investment_law`, `tax_incentive_law`          |

### 5.2 Tables

| Table             | Purpose                                       | Key Relationships                              |
|-------------------|-----------------------------------------------|------------------------------------------------|
| `users`           | Core identity (Auth0 subject, email, type)    | Referenced by `npo` and `company`              |
| `address`         | Reusable address rows                         | Referenced by `npo` and `company`              |
| `npo`             | NGO profile (name, docs, ESG, size, etc.)     | FK to `users` (1:1), FK to `address`           |
| `company`         | Company profile (legal/social name, CNPJ)     | FK to `users` (1:1), FK to `address`           |
| `sdg`             | UN Sustainable Development Goals lookup       | Referenced by `project_sdg`                    |
| `project`         | Social projects belonging to an NPO           | FK to `npo`, indexed on `npo_id`               |
| `document`        | File metadata and URLs                        | FK to `npo` and `project`                      |
| `edital`          | Public notices / calls for proposals          | Standalone (no FK)                             |
| `project_sdg`     | Many-to-many: projects ↔ SDGs                 | Composite PK `(project_id, sdg_id)`            |
| `company_project` | Many-to-many: companies ↔ projects            | Composite PK, `relationship_status`, timestamps|

All tables use `created_at`, `updated_at` timestamps and soft delete via `deleted_at`. The `users` entity has `@SQLRestriction("deleted_at IS NULL")` in JPA.

### 5.3 Flyway Migrations

| Version | Description                                      |
|---------|--------------------------------------------------|
| V1      | Full initial schema (all tables, enums, indexes) |
| V1.1    | Rename `user` → `users`, reattach FKs            |
| V1.2    | Add nullable unique `auth0_id` column to `users` |

### 5.4 Schema vs. Application Code Gap

The database schema defines tables for `project`, `sdg`, `document`, `edital`, `project_sdg`, and `company_project`, but **none of these have corresponding JPA entities, repositories, services, or controllers** in the current codebase. Only `users`, `npo`, `company`, and `address` are implemented in the Java layer.

---

## 6. Backend — API Surface

### 6.1 Controllers & Endpoints

| Method | Path                   | Auth     | Controller              | Purpose                            |
|--------|------------------------|----------|-------------------------|------------------------------------|
| GET    | `/public/ping`         | No       | `AuthTestController`    | Health check / public test         |
| GET    | `/cep/{cep}`           | No       | `CepController`         | Brazilian ZIP code lookup (ViaCEP) |
| GET    | `/cnpj/{cnpj}`         | No       | `CnpjController`        | CNPJ validation (OpenCNPJ API)     |
| POST   | `/api/npo-accounts`    | JWT      | `NpoAccountController`  | NPO institutional signup           |
| POST   | `/api/company-accounts`| JWT      | `CompanyController`     | Company account creation           |
| GET    | `/api/me/profile`      | JWT      | `MeController`          | Current user profile (DB-backed)   |
| GET    | `/api/me`              | JWT      | `AuthTestController`    | JWT claims debug/inspection        |

### 6.2 Services

| Service                | Responsibility                                               |
|------------------------|--------------------------------------------------------------|
| `NpoAccountService`    | Transactional NPO + User registration (validates docs, ESG) |
| `NpoService`           | Persists NPO with optional address                           |
| `NpoDocumentService`   | CPF/CNPJ validation rules and uniqueness checks              |
| `NpoEsgService`        | Enforces at least one ESG pillar selection                   |
| `CompanyService`       | Company creation with user and address, CNPJ uniqueness      |
| `AddressService`       | Address persistence and DTO mapping                          |
| `CepValidationService` | ViaCEP external API integration                              |
| `CnpjValidationService`| OpenCNPJ external API integration                           |
| `UsersService`         | **Unused** — legacy/alternate user path                      |

### 6.3 DTOs

| DTO                                 | Purpose                                           |
|--------------------------------------|---------------------------------------------------|
| `NpoInstitutionalSignupRequest`      | NPO signup payload (name, docs, ESG, address)     |
| `NpoInstitutionalSignupResponse`     | Returns userId, npoId, email, accessReleased      |
| `AddressSignupRequest`               | Optional nested address for NPO signup            |
| `CompanyDTO`                         | Company + nested UserDTO + AddressDTO             |
| `UserDTO`                            | Simple name + email                               |
| `AddressDTO`                         | Full address fields with optional id              |
| `AuthenticatedProfileResponse`       | Profile: auth0Id, email, userType, IDs, completed |
| `CepResponseDTO` / `CepRawResponseDTO` | ViaCEP normalized and raw formats              |
| `CnpjResponseDTO`                   | OpenCNPJ response mapping                         |

### 6.4 Exception Handling

A `GlobalExceptionHandler` maps custom exceptions to HTTP status codes:

| Exception                    | HTTP Status | Trigger                                |
|------------------------------|-------------|----------------------------------------|
| `NotFoundException` family   | 404         | CEP/CNPJ/User/Address not found        |
| `BadRequestException` family | 400         | Company already exists, invalid input  |
| `UnprocessableEntityException`| 422        | CNPJ inactive                          |
| `DuplicateLoginException`    | 409         | Auth0 ID already registered (NPO)     |
| `DuplicateDocumentException` | 409         | CPF/CNPJ already in use (NPO)         |
| `InvalidDocumentException`   | 400         | CPF/CNPJ checksum failure              |
| `EsgSelectionException`      | 400         | No ESG pillar selected                 |

### 6.5 Utilities

`DocumentValidator` provides static methods for Brazilian CPF and CNPJ checksum validation and digit sanitization.

---

## 7. Frontend — Application Structure

### 7.1 Entry Point & Providers

`main.tsx` wraps the app with:
1. **`Auth0Provider`** — configured from `VITE_AUTH0_*` env vars; sets `auth0-login-completed` in `sessionStorage` on redirect.
2. **`QueryClientProvider`** — TanStack React Query client.
3. **`AppRouter`** — the route tree.

### 7.2 Routing

Defined in `src/router/index.tsx` using `BrowserRouter`:

| Path                     | Component                | Auth Required |
|--------------------------|--------------------------|---------------|
| `/`                      | `LandingPage`            | No            |
| `/components`            | `ComponentsPage`         | No            |
| `/cadastro`              | `RegisterPage`           | No            |
| `/cadastro/instituicao`  | `RegisterPage`           | No            |
| `/company/register`      | `CompanyRegistrationPage`| No            |
| `/admin/dashboard`       | `RoleHomePage` (Admin)   | Yes           |
| `/ong/dashboard`         | `RoleHomePage` (ONG)     | Yes           |
| `/empresa/dashboard`     | `RoleHomePage` (Empresa) | Yes           |

Protected routes use `ProtectedRoute` which triggers `loginWithRedirect` if unauthenticated. `AuthRoleRedirect` runs globally to handle post-login navigation.

### 7.3 Pages

#### Landing Page (`/`)
Marketing page with three sections:
- **Hero** — headline, tagline, CTA button that scrolls to "Sobre nós".
- **InfoTab** — two-column feature cards (ONG features vs. Company features).
- **Header** — navigation bar with brand, registration link, login/logout.

#### Register Page (`/cadastro`)
Multi-step registration wizard:
- **Step 1:** Choose organization type (ONG vs. Empresa). Enterprise selection redirects to `/company/register`.
- **Steps 2–4 (ONG):** Institution data (name, CPF/CNPJ, size, ESG pillars), address/contact (CEP auto-fill), placeholder project step.
- **Final step:** Opens `AuthRedirectModal`, then triggers Auth0 `loginWithRedirect` with `role: "NPO"`. The wizard draft is saved to `sessionStorage` key `vinculohub:npo-signup-draft`.

#### Company Registration Page (`/company/register`)
Separate multi-step flow (steps 2–5, since step 1 was the org type selection):
- **Step 2:** CNPJ lookup (auto-fills razão social / nome fantasia via `useCnpj` hook), description.
- **Step 3:** Contact info and address (CEP auto-fill via `useZipCode` hook).
- **Step 4:** Email validation.
- **Step 5:** `RegistrationSummary` — review all data, progress indicator, then Auth0 redirect with company draft in `sessionStorage` key `vinculohub:company-signup-draft`.

#### Role Home Page (Dashboards)
Thin placeholder shell — displays `Header` + title + description per role. No rich dashboard functionality implemented yet.

#### Components Page (`/components`)
Development-only style showcase for `WizardSteps`, `Input` fields, and `BaseButton` variants.

### 7.4 Components

#### Auth Components (`src/components/auth/`)

| Component             | Purpose                                                    |
|-----------------------|------------------------------------------------------------|
| `AuthRoleRedirect`    | Post-login orchestrator: replays drafts, loads profile, routes by role |
| `AuthRedirectModal`   | Full-screen overlay confirming redirect to Auth0           |
| `ProtectedRoute`      | Triggers Auth0 login for unauthenticated users             |
| `LoginButton`         | Auth0 login trigger                                        |
| `LogoutButton`        | Auth0 logout trigger                                       |
| `WizardSteps`         | Horizontal step indicator with circles and connecting lines|

#### General Components (`src/components/general/`)

| Component         | Purpose                                                    |
|-------------------|------------------------------------------------------------|
| `SimpleTextInput` | Labeled text input with optional icon, error state         |
| `SimpleTextArea`  | Labeled textarea with optional icon and character counter  |
| `LogoUpload`      | Image file picker with preview, type/size validation       |
| `InfoBox`         | Yellow-border callout with title and message               |
| `BaseButton`      | Styled button with variants (primary/secondary/outline/ghost) |
| `BackLink`        | Back navigation with arrow icon                            |
| `Header`          | Top navigation bar with auth-aware menu                    |

#### ONG Components (`src/components/ong/`)

| Component      | Purpose                                                       |
|----------------|---------------------------------------------------------------|
| `NpoStepThree` | Institution basics: name, CPF/CNPJ, size, description, ESG   |
| `NpoStepFour`  | Address and contact with CEP auto-fill                        |
| `OngCard`      | Minimal display card for an ONG name                          |

#### Other Components

| Component              | Location                    | Purpose                              |
|------------------------|-----------------------------|--------------------------------------|
| `WizardSignUp`         | `components/wizard/`        | Step 1: choose ONG vs. Empresa       |
| `RegistrationSummary`  | `components/register/`      | Final review screen with progress    |
| `HeroIcon`             | `assets/landingPage/`       | Inline SVG illustration for hero     |
| Icons barrel           | `components/icons/index.ts` | Re-exports MUI icons with aliases    |

### 7.5 Hooks

| Hook           | Purpose                                                        |
|----------------|----------------------------------------------------------------|
| `useAuth`      | Thin wrapper around `useAuth0()` exposing common auth state    |
| `useCnpj`      | TanStack Query for CNPJ lookup (enabled when 14 digits)       |
| `useZipCode`   | TanStack Query for CEP lookup (enabled when 8 digits)         |
| `useCompany`   | TanStack Query for fetching a company by ID (with Bearer)     |

### 7.6 API Layer

`src/services/api.tsx` creates a shared Axios instance with `VITE_API_URL` as base URL. It also exports `useAuthenticatedApi()` (currently unused elsewhere) which attaches a Bearer token interceptor.

Individual API modules in `src/api/`:

| Module       | Endpoint                          | Purpose                |
|--------------|-----------------------------------|------------------------|
| `cnpj.ts`    | `GET /cnpj/{digits}`              | CNPJ data fetch        |
| `zipCode.ts` | `GET /cep/{digits}`               | CEP data fetch         |
| `company.ts` | `POST /api/company-accounts`      | Company registration   |

### 7.7 Types

- **`types/index.ts`** — `User` type (id, name, email).
- **`types/wizard.types.ts`** — `OrganizationType`, `WizardEsgOption`, `WizardFormData` (full wizard state including address fields), `FieldErrors`, `StepValidator`, `StepValidatorContext`.

### 7.8 Validation & Utilities

| File              | Purpose                                                        |
|-------------------|----------------------------------------------------------------|
| `validation.ts`   | Wizard form validators (email regex, password regex, CPF/CNPJ checksums, step validators for NPO and enterprise flows) |
| `validateCpf.ts`  | Standalone CPF checksum validation                             |
| `validateCnpj.ts` | Standalone CNPJ checksum validation                            |
| `formatZipCode.ts`| Brazilian CEP formatting (99999-999)                           |
| `formatCnpj.ts`   | Brazilian CNPJ formatting (99.999.999/9999-99)                 |
| `formatter.ts`    | Date formatting with `Intl.DateTimeFormat('pt-BR')`            |

### 7.9 Configuration

`src/config/wizard.config.ts` maps `OrganizationType` to arrays of `StepValidator` functions, connecting each wizard step to its validation logic.

### 7.10 Styling

- **`styles/main.css`** — Imports Tailwind CSS with `@import "tailwindcss"` and defines `@theme` tokens (custom colors for primary, secondary, accent, neutral palettes; border radius; fonts using Inter).
- **`styles/theme.ts`** — MUI theme customization (likely palette/typography overrides).

---

## 8. State Management

The application uses a **lightweight state approach**:

- **React Query** (`QueryClientProvider` in `main.tsx`) for all server state (CEP, CNPJ, company data).
- **Auth0 React SDK** for authentication state (no custom Context).
- **Local `useState`** within page components for wizard form state and UI state.
- **`sessionStorage`** for cross-redirect persistence:
  - `auth0-login-completed` — login detection flag.
  - `vinculohub:npo-signup-draft` — serialized NPO wizard data.
  - `vinculohub:company-signup-draft` — serialized company wizard data.
- **No Redux, Zustand, or other global state library.**

---

## 9. User Flows

### 9.1 ONG Registration Flow
1. User visits `/cadastro` → selects "ONG" in the wizard.
2. Fills institution data (name, CPF/CNPJ, size, ESG pillars, optional description).
3. Fills address and contact (CEP auto-lookup fills street/city/state).
4. Placeholder project step.
5. Confirmation modal → redirected to Auth0 for signup/login.
6. Auth0 returns → `AuthRoleRedirect` detects `auth0-login-completed`, reads the NPO draft from `sessionStorage`, POSTs to `/api/npo-accounts`.
7. Fetches `/api/me/profile` → navigates to `/ong/dashboard`.

### 9.2 Company Registration Flow
1. User visits `/cadastro` → selects "Empresa" → redirected to `/company/register`.
2. Enters CNPJ → auto-fills razão social and nome fantasia from backend CNPJ lookup.
3. Fills contact/address (CEP auto-fill) and email.
4. Reviews everything in `RegistrationSummary`.
5. Confirmation modal → redirected to Auth0 for signup/login.
6. Auth0 returns → `AuthRoleRedirect` reads the company draft from `sessionStorage`, POSTs to `/api/company-accounts`.
7. Fetches `/api/me/profile` → navigates to `/empresa/dashboard`.

### 9.3 Returning User Login
1. User clicks "Entrar" in the Header → Auth0 login.
2. `AuthRoleRedirect` loads profile from `/api/me/profile`.
3. Decodes role from JWT → navigates to the appropriate dashboard.
4. If no recognized role, redirects to `/cadastro`.

---

## 10. External Service Integrations

| Service    | Usage                                                     | Backend Endpoint |
|------------|-----------------------------------------------------------|------------------|
| **Auth0**  | Identity provider, JWT tokens, hosted login               | JWT validation   |
| **ViaCEP** | Brazilian postal code → address auto-fill                 | `/cep/{cep}`     |
| **OpenCNPJ** | CNPJ number → company legal data (validates "Ativa" status) | `/cnpj/{cnpj}` |
| **Discord** | PR opened notifications via webhook                      | CI workflow      |
| **GitLab** | Mirror sync to AGES/PUCRS institutional GitLab           | CI workflow      |

---

## 11. CI/CD & Development Workflow

### 11.1 GitHub Actions Workflows

| Workflow                     | Trigger                          | Purpose                                      |
|------------------------------|----------------------------------|----------------------------------------------|
| `validate-migrations.yml`   | PR (opened/sync/reopen)         | Validates Flyway migration version uniqueness |
| `discord_notifier.yml`      | PR opened                       | Sends Discord notification with PR details    |
| `sync-gitlab.yml`           | PR merged to main/dev or manual | Force-pushes to AGES/PUCRS GitLab mirror      |

### 11.2 Git Hooks

The `githooks/pre-push` hook (activated via `bash githooks/setup`):
- Detects changes under `backend/`.
- Runs **Spotless** (`spotless:apply`) for Google Java Format enforcement.
- Runs **PMD** static analysis.
- Fails the push if formatting changes were needed or PMD errors are found.

### 11.3 PR Template

Structured sections: Issue Link (`Closes #`), Description, Task Notes, Screenshots.

---

## 12. Testing

### 12.1 Frontend Tests

- **Framework:** Vitest + Testing Library + jsdom.
- **Setup:** `src/test/setup.ts`.
- **Test files:**
  - `utils/validation.test.ts` — NPO step validators, CPF/CNPJ field validation.
  - `pages/LandingPage/` — `index.test.tsx`, `Hero.test.tsx`, `InfoTab.test.tsx`, `FeatureCard.test.tsx`.

### 12.2 Backend Tests

- **Framework:** JUnit 5 + Spring Boot Test + Testcontainers (PostgreSQL).
- **Test files:**
  - `NpoAccountServiceTest` — NPO registration service logic.
  - `SecurityIntegrationTest` — Auth security integration.
  - `SchemaValidationTest` — JPA schema validation.
  - `FlywayMigrationTest` — Migration execution.
  - `DocumentValidatorTest` — CPF/CNPJ validation logic.
  - `BackendApplicationTests` — Application context loading.

---

## 13. Environment Configuration

### Root `.env.example`

| Variable              | Purpose                                        |
|-----------------------|------------------------------------------------|
| `POSTGRES_USER`       | Database username                              |
| `POSTGRES_PASSWORD`   | Database password                              |
| `POSTGRES_DB`         | Database name                                  |
| `BACKEND_PORT`        | Spring Boot server port (default 8080)         |
| `FRONTEND_URL`        | Comma-separated CORS origins                   |
| `AUTH0_DOMAIN`        | Auth0 tenant domain                            |
| `AUTH0_AUDIENCE`      | Auth0 API audience                             |
| `AUTH0_ISSUER_URI`    | Auth0 JWT issuer URI                           |
| `AUTH0_ROLES_CLAIM`   | Custom JWT claim for roles                     |
| `VITE_API_URL`        | Backend API URL for frontend                   |
| `VITE_AUTH0_DOMAIN`   | Auth0 domain for frontend                      |
| `VITE_AUTH0_CLIENT_ID`| Auth0 SPA client ID                            |
| `VITE_AUTH0_AUDIENCE` | Auth0 audience for frontend                    |

### Frontend `.env.example`

Subset: `VITE_API_URL`, `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`.

---

## 14. Notable Design Observations

### 14.1 Strengths
- Clean separation of frontend and backend with Docker Compose for full-stack local dev.
- Proper use of Flyway for database migrations with CI validation of version uniqueness.
- Auth0 integration is well-structured with clear separation of concerns (provider → hooks → redirect handler).
- Code quality enforcement via Spotless, PMD, SpotBugs, and pre-push hooks.
- TanStack Query for server state avoids manual caching and refetching logic.
- Comprehensive Brazilian-specific validation (CPF/CNPJ checksums, CEP lookup).

### 14.2 Areas of Note
- **Schema-code gap:** Database has tables for projects, SDGs, documents, editais, and company-project relationships, but no Java entities or APIs exist for these yet — they represent planned future features.
- **Duplicate entities:** Two JPA entities (`User` and `Users`) map to the same `users` table, and the `UserType` enum is duplicated in two packages. `UsersService` is defined but unused.
- **No role-based authorization on endpoints:** `@EnableMethodSecurity` is configured but no `@PreAuthorize` annotations exist. Any authenticated user can call any protected endpoint.
- **`useAuthenticatedApi` hook is unused:** Defined in `services/api.tsx` but never imported anywhere.
- **Dashboard pages are placeholders:** `RoleHomePage` renders only a title and description — no functional dashboard content.
- **Hardcoded Portuguese:** All UI copy is hardcoded in components with no i18n framework.
- **No form library:** Form state is managed via raw `useState` calls rather than a form library like React Hook Form.
- **`/api/me` vs `/api/me/profile`:** Two different controllers handle similar-looking paths — the former is a JWT debug endpoint, the latter is the DB-backed profile.

### 14.3 Session Storage Strategy
The signup flow uses a "draft-and-replay" pattern where form data is serialized to `sessionStorage` before the Auth0 redirect, then automatically submitted to the API after authentication completes. This cleanly handles the OAuth redirect interruption during registration.

---

## 15. Summary

VinculoHub Portal is an **early-stage ESG platform** connecting NGOs and companies. The core infrastructure (auth, database, Docker, CI) is solid and well-configured. The implemented features focus on **organization onboarding** (ONG and company registration wizards with Brazilian document validation and address lookup). The database schema anticipates a richer feature set (projects, SDGs, documents, company-project relationships) that has not yet been built in the application layer. The dashboards are placeholder shells awaiting feature development.
