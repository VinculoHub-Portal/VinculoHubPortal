# Design — Endpoint de listagem de projetos com filtro por status

**Issue:** [#132](https://github.com/VinculoHub-Portal/VinculoHubPortal/issues/132) — *BE - fornecer dados da listagem com suporte a filtragem e tratamento de cenários sem resultado*
**Branch:** `feature/132-listagem-projetos-filtros`
**Data:** 2026-04-27
**Stack:** Spring Boot + JPA/Hibernate + PostgreSQL + Flyway + Testcontainers

---

## 1. Contexto

A tabela `project` já existe em `V1__init.sql` com schema completo (id, npo_id, title, description, status, budget_needed, invested_amount, start_date, end_date, timestamps). O enum DB `project_status` possui os valores `active`, `completed`, `cancelled`.

Não existe ainda **nenhuma camada Java** para Project (entity, repository, service, controller, DTO). Toda a infraestrutura precisa ser criada.

A issue originalmente menciona "Em Captação" como filtro, mas isso foi escrito errado e descartado. Os filtros válidos são: **TODOS, ATIVOS, COMPLETADOS, CANCELADOS** — mapeando 1:1 com o enum DB (mais o sentinela `TODOS`).

## 2. Consumidores

Dois tipos de usuário autenticado (Auth0 JWT) consomem o endpoint:

- **ONG** (`user_type = 'npo'`) → vê seus próprios projetos (resolve `npo_id` pelo JWT).
- **Empresa** (`user_type = 'company'`) → vê projetos vinculados via `company_project` (resolve `company_id` pelo JWT).

Em ambos os casos, o filtro de status se aplica ao status **do projeto**, não da relação.

## 3. Contrato HTTP

### Request

```
GET /api/projects?status={ATIVOS|COMPLETADOS|CANCELADOS|TODOS}
Authorization: Bearer <jwt>
```

- `status` é opcional. Ausente ou `TODOS` → não filtra.
- Comparação case-sensitive (segue padrão dos outros enums do projeto).

### Response 200 OK

```json
[
  {
    "id": 1,
    "title": "Projeto Saúde Mental",
    "description": "Atendimento psicológico gratuito",
    "status": "active",
    "budgetNeeded": 50000.00,
    "investedAmount": 15000.00,
    "startDate": "2026-01-01",
    "endDate": "2026-12-31"
  }
]
```

Lista vazia (`[]`) sempre que: banco vazio, filtro sem match, user sem NPO/Company associado. **Nunca 404.**

### Response 400 (filtro inválido)

```json
{
  "status": 400,
  "message": "Filtro de status inválido: 'FOO'. Valores aceitos: ATIVOS, COMPLETADOS, CANCELADOS, TODOS",
  "timestamp": "2026-04-27T12:34:56"
}
```

### Response 401

Sem JWT — comportamento padrão da `SecurityConfig` (`/api/**` exige auth).

### Response 500 (falha de infra)

```json
{
  "status": 500,
  "message": "Erro interno do servidor",
  "timestamp": "2026-04-27T12:34:56"
}
```

Payload estruturado e consistente, sem stack trace. Frontend pode acionar retry.

## 4. Camadas e arquivos a criar

### Main — `backend/src/main/java/com/vinculohub/backend/`

| Arquivo | Responsabilidade |
|---|---|
| `model/enums/ProjectStatus.java` | Enum espelho do enum DB: `active`, `completed`, `cancelled` |
| `model/enums/ProjectStatusFilter.java` | Enum de filtro: `ATIVOS`, `COMPLETADOS`, `CANCELADOS`, `TODOS`. Métodos `Optional<ProjectStatus> toProjectStatus()` (vazio para TODOS) e `static ProjectStatusFilter fromString(String)` que lança `BadRequestException` com mensagem clara |
| `model/Project.java` | Entity da tabela `project`. Usa `@SQLRestriction("deleted_at IS NULL")`, `@JdbcType(PostgreSQLEnumJdbcType.class)` no campo status, `@CreationTimestamp`/`@UpdateTimestamp` |
| `dto/ProjectSummaryDTO.java` | `record` com `@Builder` e fábrica `from(Project)` |
| `repository/ProjectRepository.java` | `JpaRepository<Project, Integer>` com: `findByNpoId`, `findByNpoIdAndStatus`, e métodos `@Query` nativos para join com `company_project` (`findAllByCompanyId`, `findAllByCompanyIdAndStatus`) |
| `service/ProjectListingService.java` | Orquestra: busca `User` por auth0Id, identifica tipo, resolve npoId/companyId, chama repository com/sem filtro, mapeia para DTOs |
| `controller/ProjectController.java` | `@GetMapping("/api/projects")`, recebe `@RequestParam(required = false) String status`, converte via `ProjectStatusFilter.fromString` e delega ao service |

### Test — `backend/src/test/java/com/vinculohub/backend/`

| Arquivo | Tipo | Cenários |
|---|---|---|
| `model/enums/ProjectStatusFilterTest.java` | JUnit puro | 6 casos (ver §5) |
| `service/ProjectListingServiceTest.java` | Mockito | 11 casos (ver §5) |
| `controller/ProjectControllerIntegrationTest.java` | `@SpringBootTest` + Testcontainers + MockMvc + JWT post-processor | 7 casos (ver §5) |

### Modificar arquivos existentes

**Nenhum.** Endpoint inteiramente novo. Não há mudanças em migrations, security config, exception handlers, ou qualquer outra classe.

## 5. Lista de testes (TDD)

Os testes são escritos **antes** do código de produção. Cada bloco abaixo é uma classe de teste; cada item é um caso/`@Test`.

### `ProjectStatusFilterTest`

1. `fromString("ATIVOS")` retorna `ATIVOS`
2. `fromString` aceita `COMPLETADOS`, `CANCELADOS`, `TODOS`
3. `fromString(null)` retorna `TODOS` (default)
4. `fromString("foo")` lança `BadRequestException` cuja mensagem contém os 4 valores aceitos
5. `toProjectStatus()` retorna `Optional.empty()` para `TODOS`
6. `toProjectStatus()` retorna `ProjectStatus` correto para os demais

### `ProjectListingServiceTest` (Mockito)

1. NPO autenticado, filtro `TODOS` → `findByNpoId` chamado, retorna todos os projetos
2. NPO autenticado, filtro `ATIVOS` → `findByNpoIdAndStatus` chamado com `ProjectStatus.active`
3. NPO autenticado, filtro `COMPLETADOS` → repository chamado com `ProjectStatus.completed`
4. NPO autenticado, filtro `CANCELADOS` → repository chamado com `ProjectStatus.cancelled`
5. NPO autenticado mas sem ONG associada (NpoRepository vazio) → retorna `[]` sem chamar ProjectRepository
6. NPO autenticado com ONG mas sem projetos → retorna `[]`
7. NPO autenticado, filtro sem match → retorna `[]`
8. Company autenticada, filtro `TODOS` → `findAllByCompanyId` chamado
9. Company autenticada, filtro `ATIVOS` → `findAllByCompanyIdAndStatus` chamado com `"active"`
10. User existente sem NPO **nem** Company → retorna `[]`
11. Mapeamento `Project → ProjectSummaryDTO` preserva todos os campos (id, title, description, status, budgetNeeded, investedAmount, startDate, endDate)

### `ProjectControllerIntegrationTest` (Testcontainers)

1. `GET /api/projects` sem JWT → 401
2. `GET /api/projects` com JWT de NPO + projetos seedados → 200 + lista correta
3. `GET /api/projects?status=ATIVOS` → 200 + somente projetos com status `active`
4. `GET /api/projects?status=FOO` → 400 com payload `{status, message, timestamp}` e mensagem listando valores aceitos
5. `GET /api/projects` com JWT de user sem NPO/Company → 200 + `[]`
6. `GET /api/projects` com JWT de Company com vínculo em projetos → 200 + projetos vinculados
7. Falha de DB simulada (`@MockBean ProjectRepository` lançando `DataAccessException`) → 500 com payload estruturado, sem stack trace

Seed via `JdbcTemplate` antes de cada teste (alinhado com `SchemaValidationTest`).

## 6. Tratamento de erros

| Cenário | Mecanismo | HTTP |
|---|---|---|
| Filtro inválido | `ProjectStatusFilter.fromString` lança `BadRequestException`; `GlobalExceptionHandler.handleBadRequest` | 400 |
| Sem JWT | `SecurityConfig` (Spring Security) | 401 |
| User sem NPO/Company | Service retorna `List.of()` | 200 |
| Sem dados / sem match | Service retorna `List.of()` | 200 |
| Falha DB / unexpected | `GlobalExceptionHandler.handleUnexpected` (catch-all `Exception.class`), payload `{status:500, message:"Erro interno do servidor", timestamp}`, sem stack trace | 500 |

Todas as respostas de erro reusam o `ErrorResponse` record já existente — payload consistente para o frontend tratar retry.

## 7. Decisões de design e justificativa

- **Sem paginação.** Nenhum endpoint do projeto usa `Pageable` ainda e a issue não pede. Volume esperado de projetos por ONG é baixo. Anotar como débito técnico para issue futura quando necessário.
- **Sem entity para `company_project`.** Tabela de junção pura, sem outros consumidores. Mapear via `@Query` nativo no `ProjectRepository` é mais leve que criar uma entidade `@IdClass`/`@EmbeddedId`.
- **`ProjectStatusFilter` separado de `ProjectStatus`.** O filtro inclui o sentinela `TODOS` que não pertence ao domínio do banco. Misturar quebraria o mapeamento JPA do enum.
- **`fromString` lança `BadRequestException` direto.** O `GlobalExceptionHandler` já mapeia para 400 com payload consistente; evita try/catch no controller.
- **Nomes em inglês** (classes, métodos, rota, campos JSON) seguindo o padrão do projeto. `@DisplayName` dos testes em PT-BR (idem `NpoServiceTest`).
- **Soft delete via `@SQLRestriction("deleted_at IS NULL")`.** Padrão do projeto — queries automaticamente excluem registros deletados, sem precisar repetir a cláusula em cada método.
- **DTO com fábrica `from(Project)`.** Mantém o mapeamento próximo do DTO; service só orquestra.

## 8. Checklist da issue #132

| Requisito | Endereçado por |
|---|---|
| Endpoint novo de listagem de projetos da ONG | `ProjectController` + rota `GET /api/projects` |
| Filtro Todos / Ativos | `ProjectStatusFilter.TODOS` / `ATIVOS` |
| Filtros adicionais (Completados, Cancelados) | `COMPLETADOS`, `CANCELADOS` |
| Lista vazia (não 404) quando sem projetos ou sem match | Service retorna `List.of()` em todos os cenários sem dados |
| Tratamento de falha permitindo retry no frontend | `GlobalExceptionHandler` retorna 500 com `ErrorResponse` estruturado, sem stack trace |

## 9. Fora de escopo

- Criação/edição/exclusão de projetos.
- Detalhe (`GET /api/projects/{id}`).
- Filtros adicionais (por SDG, por intervalo de datas, busca textual).
- Paginação.
- Listagem para usuário tipo `admin`.

## 10. Mensagem de commit (sugestão Conventional Commits)

```
feat(projects): add GET /api/projects listing endpoint with status filter

Implements #132. Adds Project entity, repository, listing service and
REST endpoint for authenticated NPO/Company users to list their projects
with optional filter (TODOS, ATIVOS, COMPLETADOS, CANCELADOS).
Returns 200 + empty list when no results, 400 for invalid filter,
500 with structured payload on infra failure (frontend retry-friendly).
```
