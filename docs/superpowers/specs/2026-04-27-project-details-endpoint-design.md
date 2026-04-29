# Project Details Endpoint — Design Spec

**Date:** 2026-04-27
**Task:** BE-133 / US-04 Tela de Detalhes do Projeto
**Status:** Approved

---

## Context

The frontend needs a dedicated endpoint to fetch complete data for a specific project, to support the Project Details screen (US-04). Currently, projects are only created during NPO signup — no endpoint exists to retrieve a single project by ID.

**Problem:** No `GET /api/projects/{id}` endpoint exists.
**Goal:** Expose full project data securely, with proper error handling for invalid, deleted, or non-existent projects.

---

## Acceptance Criteria

- `GET /api/projects/{id}` accessible with a valid JWT (any authenticated role)
- Returns HTTP 404 with standard `ErrorResponse` for: non-existent ID, soft-deleted project
- Does not expose internal `npo_id` or sensitive fields in the response
- Soft-deleted projects are automatically excluded via `@SQLRestriction("deleted_at IS NULL")`

---

## Architecture

### Endpoint

```
GET /api/projects/{id}
Authorization: Bearer <JWT>
```

### Flow

1. `ProjectController.getProjectById(Long id)` receives path variable
2. Calls `ProjectService.findById(Long id)`
3. Repository query respects `@SQLRestriction("deleted_at IS NULL")` — soft-deleted projects are invisible
4. If not found → throws `NotFoundException` → `GlobalExceptionHandler` returns HTTP 404
5. If found → maps `Project` to `ProjectDetailsResponse` → returns HTTP 200

### Error Response (404)

```json
{
  "status": 404,
  "message": "Projeto não encontrado.",
  "timestamp": "2026-04-27T10:30:45.123456"
}
```

---

## Data Model

### Response DTO: `ProjectDetailsResponse`

```java
record ProjectDetailsResponse(
    Long id,
    String title,
    String description,
    String status,
    BigDecimal budgetNeeded,
    BigDecimal investedAmount,
    Set<Integer> odsCodes,
    LocalDate startDate,
    LocalDate endDate,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
)
```

**Intentionally excluded:** `npoId` (internal FK), `deletedAt`

---

## Files to Create / Modify

| Action | File |
|--------|------|
| Create | `controller/ProjectController.java` |
| Create | `dto/ProjectDetailsResponse.java` |
| Modify | `service/ProjectService.java` — add `findById(Long)` |
| Verify | `config/SecurityConfig.java` — `/api/projects/**` requires authentication |

---

## Security Notes

- `npo_id` is not included in the response body
- Soft delete handled transparently by `@SQLRestriction` — no leaking of deleted records
- No sensitive data logged in service layer
- Endpoint requires valid JWT (enforced by `SecurityConfig`)

---

## Testing

- Unit test: `ProjectServiceTest` — `findById` returns project; `findById` throws `NotFoundException` when missing
- Integration/controller test: `ProjectControllerTest` — HTTP 200 with valid ID; HTTP 404 with invalid/deleted ID; HTTP 401 without JWT
