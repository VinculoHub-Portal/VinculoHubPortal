# Project Details Endpoint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `GET /api/projects/{id}` that returns complete project data for any authenticated user, with proper 404 handling for missing or soft-deleted projects.

**Architecture:** A new `ProjectController` delegates to `ProjectService.findById(Long)`, which throws `NotFoundException` when no project is found (soft-deleted projects are invisible via `@SQLRestriction`). The entity is mapped to a `ProjectDetailsResponse` DTO before returning — `npoId` is intentionally excluded.

**Tech Stack:** Java 17, Spring Boot 3.4.3, Spring Security (JWT/Auth0), JPA/Hibernate, Lombok, JUnit 5 + Mockito, TestContainers (PostgreSQL), MockMvc

---

## File Map

| Action | File |
|--------|------|
| Create | `backend/src/main/java/com/vinculohub/backend/dto/ProjectDetailsResponse.java` |
| Modify | `backend/src/main/java/com/vinculohub/backend/service/ProjectService.java` |
| Create | `backend/src/main/java/com/vinculohub/backend/controller/ProjectController.java` |
| Modify | `backend/src/test/java/com/vinculohub/backend/service/ProjectServiceTest.java` |
| Create | `backend/src/test/java/com/vinculohub/backend/controller/ProjectControllerTest.java` |

`SecurityConfig.java` needs no changes — `anyRequest().authenticated()` already covers `/api/projects/**`.

---

## Task 1: Create `ProjectDetailsResponse` DTO

**Files:**
- Create: `backend/src/main/java/com/vinculohub/backend/dto/ProjectDetailsResponse.java`

- [ ] **Step 1: Create the DTO**

```java
/* (C)2026 */
package com.vinculohub.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

public record ProjectDetailsResponse(
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
        LocalDateTime updatedAt) {}
```

- [ ] **Step 2: Compile check**

Run: `cd backend && ./mvnw compile -q`
Expected: BUILD SUCCESS (no errors)

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/vinculohub/backend/dto/ProjectDetailsResponse.java
git commit -m "feat: add ProjectDetailsResponse DTO"
```

---

## Task 2: Add `findById` to `ProjectService` (TDD)

**Files:**
- Modify: `backend/src/main/java/com/vinculohub/backend/service/ProjectService.java`
- Modify: `backend/src/test/java/com/vinculohub/backend/service/ProjectServiceTest.java`

- [ ] **Step 1: Write the failing tests**

Add these two test methods inside the existing `ProjectServiceTest` class (after the existing test). Add the missing imports at the top of the file:

```java
import com.vinculohub.backend.exception.NotFoundException;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;
```

New test methods to add:

```java
@Test
void shouldReturnProjectWhenFoundById() {
    Project project = Project.builder()
            .npo(Npo.builder().id(1).build())
            .title("Projeto Teste")
            .description("Descrição teste")
            .build();
    project.setId(10L);

    when(projectRepository.findById(10L)).thenReturn(Optional.of(project));

    Project result = projectService.findById(10L);

    assertEquals(10L, result.getId());
    assertEquals("Projeto Teste", result.getTitle());
}

@Test
void shouldThrowNotFoundExceptionWhenProjectDoesNotExist() {
    when(projectRepository.findById(99L)).thenReturn(Optional.empty());

    assertThrows(NotFoundException.class, () -> projectService.findById(99L));
}
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `cd backend && ./mvnw test -pl . -Dtest=ProjectServiceTest -q 2>&1 | tail -20`
Expected: FAIL — `cannot find symbol: method findById(Long)` in `ProjectService`

- [ ] **Step 3: Add `findById` to `ProjectService`**

Add the import at the top of `ProjectService.java`:
```java
import com.vinculohub.backend.exception.NotFoundException;
import java.util.Optional;
```

Add this method to `ProjectService` (after the `createFirstProject` method):

```java
public Project findById(Long id) {
    return projectRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Projeto não encontrado."));
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `cd backend && ./mvnw test -pl . -Dtest=ProjectServiceTest -q 2>&1 | tail -10`
Expected: BUILD SUCCESS, Tests run: 3, Failures: 0, Errors: 0

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/vinculohub/backend/service/ProjectService.java \
        backend/src/test/java/com/vinculohub/backend/service/ProjectServiceTest.java
git commit -m "feat: add ProjectService.findById with NotFoundException on missing project"
```

---

## Task 3: Create `ProjectController` (TDD)

**Files:**
- Create: `backend/src/main/java/com/vinculohub/backend/controller/ProjectController.java`
- Create: `backend/src/test/java/com/vinculohub/backend/controller/ProjectControllerTest.java`

- [ ] **Step 1: Write the failing integration tests**

Create the file `backend/src/test/java/com/vinculohub/backend/controller/ProjectControllerTest.java`:

```java
/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.database.AbstractIntegrationTest;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
class ProjectControllerTest extends AbstractIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private NpoRepository npoRepository;

    private Long projectId;

    @BeforeEach
    void setUp() {
        projectRepository.deleteAll();
        npoRepository.deleteAll();

        Npo npo = npoRepository.save(
                Npo.builder()
                        .name("ONG Exemplo")
                        .npoSize(NpoSize.small)
                        .environmental(true)
                        .build());

        Project project = projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Projeto Detalhes")
                        .description("Descrição completa do projeto.")
                        .budgetNeeded(new BigDecimal("5000.00"))
                        .odsCodes(new java.util.LinkedHashSet<>(List.of(1, 3)))
                        .build());

        projectId = project.getId();
    }

    @Test
    @DisplayName("GET /api/projects/{id} sem JWT deve retornar 401")
    void shouldReturn401WhenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/projects/" + projectId))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/projects/{id} com JWT válido deve retornar 200 com dados do projeto")
    void shouldReturn200WithProjectDataWhenAuthenticated() throws Exception {
        mockMvc.perform(
                        get("/api/projects/" + projectId)
                                .with(jwt().jwt(j -> j.subject("auth0|testuser"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(projectId))
                .andExpect(jsonPath("$.title").value("Projeto Detalhes"))
                .andExpect(jsonPath("$.description").value("Descrição completa do projeto."))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.budgetNeeded").value(5000.00))
                .andExpect(jsonPath("$.odsCodes").isArray())
                .andExpect(jsonPath("$.npoId").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/projects/{id} com ID inexistente deve retornar 404")
    void shouldReturn404WhenProjectDoesNotExist() throws Exception {
        mockMvc.perform(
                        get("/api/projects/999999")
                                .with(jwt().jwt(j -> j.subject("auth0|testuser"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Projeto não encontrado."));
    }
}
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `cd backend && ./mvnw test -pl . -Dtest=ProjectControllerTest -q 2>&1 | tail -20`
Expected: FAIL — 404 on all endpoints (no controller mapped yet)

- [ ] **Step 3: Create `ProjectController`**

Create `backend/src/main/java/com/vinculohub/backend/controller/ProjectController.java`:

```java
/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.ProjectDetailsResponse;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.service.ProjectService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping("/{id}")
    public ProjectDetailsResponse getProjectById(@PathVariable Long id) {
        log.info("GET /api/projects/{}", id);
        Project project = projectService.findById(id);
        return new ProjectDetailsResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getStatus().name(),
                project.getBudgetNeeded(),
                project.getInvestedAmount(),
                project.getOdsCodes(),
                project.getStartDate(),
                project.getEndDate(),
                project.getCreatedAt(),
                project.getUpdatedAt());
    }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `cd backend && ./mvnw test -pl . -Dtest=ProjectControllerTest -q 2>&1 | tail -10`
Expected: BUILD SUCCESS, Tests run: 3, Failures: 0, Errors: 0

- [ ] **Step 5: Run full test suite to confirm no regressions**

Run: `cd backend && ./mvnw test -q 2>&1 | tail -15`
Expected: BUILD SUCCESS, all tests pass

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/vinculohub/backend/controller/ProjectController.java \
        backend/src/test/java/com/vinculohub/backend/controller/ProjectControllerTest.java
git commit -m "feat: add GET /api/projects/{id} endpoint with 401/404 handling"
```

---

## Verification

After all tasks complete, verify the endpoint end-to-end:

**1. Start the application:**
```bash
cd backend && ./mvnw spring-boot:run
```

**2. Call without JWT (expect 401):**
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/projects/1
# Expected: 401
```

**3. Call with valid JWT (expect 200 or 404):**
```bash
curl -s -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/projects/1
# Expected: 200 with JSON body containing id, title, description, status, budgetNeeded, investedAmount, odsCodes, startDate, endDate, createdAt, updatedAt — no npoId field
```

**4. Call with non-existent ID (expect 404):**
```bash
curl -s -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/projects/999999
# Expected: {"status":404,"message":"Projeto não encontrado.","timestamp":"..."}
```
