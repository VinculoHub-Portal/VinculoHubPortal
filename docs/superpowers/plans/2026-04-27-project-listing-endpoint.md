# Project Listing Endpoint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `GET /api/projects?status=...` — a Spring Boot endpoint that lets authenticated NPO/Company users list their projects, filtered by status, with the contracts defined in [the design spec](../specs/2026-04-27-project-listing-endpoint-design.md).

**Architecture:** Layered (controller → service → repository → JPA entity). Single endpoint with scope derived from JWT (`user_type`). `ProjectStatusFilter` enum encapsulates filter parsing; `BadRequestException` flows through the existing `GlobalExceptionHandler`. Repository combines JPA-derived methods (NPO scope) and native `@Query` (Company scope via `company_project` join). No new tables — `project` already exists in `V1__init.sql`.

**Tech Stack:** Java 17+, Spring Boot 3.4.3, Spring Data JPA, PostgreSQL (Flyway migrations), Lombok, JUnit 5, Mockito, AssertJ, Spring Security OAuth2 Resource Server, Testcontainers (PostgreSQL).

**Working directory:** All `mvnw` commands run from `backend/`. All paths in this plan are relative to repo root unless prefixed with `backend/`.

**Reference patterns** (read before starting):
- Entity with PG enum: [backend/src/main/java/com/vinculohub/backend/model/Npo.java](../../../backend/src/main/java/com/vinculohub/backend/model/Npo.java)
- Repository: [backend/src/main/java/com/vinculohub/backend/repository/NpoRepository.java](../../../backend/src/main/java/com/vinculohub/backend/repository/NpoRepository.java)
- Service unit test (Mockito): [backend/src/test/java/com/vinculohub/backend/service/NpoServiceTest.java](../../../backend/src/test/java/com/vinculohub/backend/service/NpoServiceTest.java)
- Integration test pattern: [backend/src/test/java/com/vinculohub/backend/security/SecurityIntegrationTest.java](../../../backend/src/test/java/com/vinculohub/backend/security/SecurityIntegrationTest.java) (extends `AbstractIntegrationTest`, uses `jwt()` post-processor)
- Controller pattern: [backend/src/main/java/com/vinculohub/backend/controller/MeController.java](../../../backend/src/main/java/com/vinculohub/backend/controller/MeController.java)
- Global error handler: [backend/src/main/java/com/vinculohub/backend/exception/GlobalExceptionHandler.java](../../../backend/src/main/java/com/vinculohub/backend/exception/GlobalExceptionHandler.java)

**File map (everything created, nothing modified):**

| Path | Purpose |
|---|---|
| `backend/src/main/java/com/vinculohub/backend/model/enums/ProjectStatus.java` | Enum mirror of PG `project_status` |
| `backend/src/main/java/com/vinculohub/backend/model/enums/ProjectStatusFilter.java` | Filter enum with `TODOS` sentinel, parsing, mapping |
| `backend/src/main/java/com/vinculohub/backend/model/Project.java` | JPA entity for `project` table |
| `backend/src/main/java/com/vinculohub/backend/dto/ProjectSummaryDTO.java` | Response record + factory `from(Project)` |
| `backend/src/main/java/com/vinculohub/backend/repository/ProjectRepository.java` | JpaRepository + native @Query for company scope |
| `backend/src/main/java/com/vinculohub/backend/service/ProjectListingService.java` | Orchestrates user → scope → repository → DTO |
| `backend/src/main/java/com/vinculohub/backend/controller/ProjectController.java` | `GET /api/projects` |
| `backend/src/test/java/com/vinculohub/backend/model/enums/ProjectStatusFilterTest.java` | Filter parsing unit tests |
| `backend/src/test/java/com/vinculohub/backend/dto/ProjectSummaryDTOTest.java` | Mapping unit test |
| `backend/src/test/java/com/vinculohub/backend/service/ProjectListingServiceTest.java` | Service Mockito tests |
| `backend/src/test/java/com/vinculohub/backend/controller/ProjectControllerIntegrationTest.java` | MockMvc + Testcontainers happy/4xx tests |
| `backend/src/test/java/com/vinculohub/backend/controller/ProjectControllerErrorIntegrationTest.java` | 500 error test with `@MockitoBean` |

---

## Task 1: Scaffold Project domain (entity, status enum, repository)

This task creates the value-type pieces needed by everything else. No tests in this task — `Project` and `ProjectStatus` are pure JPA mappings; `ProjectRepository` is exercised by the integration test in Task 5. The point is to get a compile-clean foundation.

**Files:**
- Create: `backend/src/main/java/com/vinculohub/backend/model/enums/ProjectStatus.java`
- Create: `backend/src/main/java/com/vinculohub/backend/model/Project.java`
- Create: `backend/src/main/java/com/vinculohub/backend/repository/ProjectRepository.java`

- [ ] **Step 1: Create `ProjectStatus.java`**

```java
/* (C)2026 */
package com.vinculohub.backend.model.enums;

public enum ProjectStatus {
    active,
    completed,
    cancelled
}
```

The enum constant names are lowercase to match the PostgreSQL enum literals (`active`, `completed`, `cancelled`) — Hibernate uses `EnumType.STRING` mapping (see [NpoSize.java](../../../backend/src/main/java/com/vinculohub/backend/model/enums/NpoSize.java) for the same pattern).

- [ ] **Step 2: Create `Project.java`**

```java
/* (C)2026 */
package com.vinculohub.backend.model;

import com.vinculohub.backend.model.enums.ProjectStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

@Entity
@Table(name = "project")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "npo_id")
    private Integer npoId;

    @Column(length = 255)
    private String title;

    @Column(length = 3000)
    private String description;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(columnDefinition = "project_status")
    private ProjectStatus status;

    @Column(name = "budget_needed", precision = 15, scale = 2)
    private BigDecimal budgetNeeded;

    @Column(name = "invested_amount", precision = 15, scale = 2)
    private BigDecimal investedAmount;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
```

- [ ] **Step 3: Create `ProjectRepository.java`**

```java
/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.ProjectStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Integer> {

    List<Project> findByNpoId(Integer npoId);

    List<Project> findByNpoIdAndStatus(Integer npoId, ProjectStatus status);

    @Query(
            value =
                    """
                    SELECT p.* FROM project p
                    JOIN company_project cp ON cp.project_id = p.id
                    WHERE cp.company_id = :companyId
                      AND cp.deleted_at IS NULL
                      AND p.deleted_at IS NULL
                    """,
            nativeQuery = true)
    List<Project> findAllByCompanyId(@Param("companyId") Integer companyId);

    @Query(
            value =
                    """
                    SELECT p.* FROM project p
                    JOIN company_project cp ON cp.project_id = p.id
                    WHERE cp.company_id = :companyId
                      AND cp.deleted_at IS NULL
                      AND p.deleted_at IS NULL
                      AND p.status = CAST(:status AS project_status)
                    """,
            nativeQuery = true)
    List<Project> findAllByCompanyIdAndStatus(
            @Param("companyId") Integer companyId, @Param("status") String status);
}
```

The native queries explicitly check `deleted_at IS NULL` because `@SQLRestriction` does **not** apply to native queries. The `CAST(:status AS project_status)` is required because PostgreSQL won't implicitly convert a `text` parameter to the `project_status` enum.

- [ ] **Step 4: Verify the project still compiles**

Run from `backend/`:
```bash
./mvnw -q compile
```
Expected: BUILD SUCCESS, no errors. (Tests are not run in this step.)

- [ ] **Step 5: Apply Spotless formatting**

```bash
./mvnw -q spotless:apply
```
Expected: BUILD SUCCESS. (Adjusts whitespace/imports if needed.)

- [ ] **Step 6: Commit**

```bash
git add backend/src/main/java/com/vinculohub/backend/model/enums/ProjectStatus.java \
        backend/src/main/java/com/vinculohub/backend/model/Project.java \
        backend/src/main/java/com/vinculohub/backend/repository/ProjectRepository.java
git commit -m "feat(projects): scaffold Project entity, status enum, repository (#132)"
```

---

## Task 2: ProjectStatusFilter (TDD, 6 cases)

Filter enum with `TODOS` sentinel, parsing helper that throws `BadRequestException`, and mapping to `ProjectStatus`. Pure unit test, no Spring context.

**Files:**
- Test: `backend/src/test/java/com/vinculohub/backend/model/enums/ProjectStatusFilterTest.java`
- Create: `backend/src/main/java/com/vinculohub/backend/model/enums/ProjectStatusFilter.java`

- [ ] **Step 1: Write the failing test**

Create `backend/src/test/java/com/vinculohub/backend/model/enums/ProjectStatusFilterTest.java`:

```java
/* (C)2026 */
package com.vinculohub.backend.model.enums;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.vinculohub.backend.exception.BadRequestException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ProjectStatusFilterTest {

    @Test
    @DisplayName("fromString aceita ATIVOS")
    void fromStringAcceptsAtivos() {
        assertThat(ProjectStatusFilter.fromString("ATIVOS"))
                .isEqualTo(ProjectStatusFilter.ATIVOS);
    }

    @Test
    @DisplayName("fromString aceita COMPLETADOS, CANCELADOS e TODOS")
    void fromStringAcceptsAllValidValues() {
        assertThat(ProjectStatusFilter.fromString("COMPLETADOS"))
                .isEqualTo(ProjectStatusFilter.COMPLETADOS);
        assertThat(ProjectStatusFilter.fromString("CANCELADOS"))
                .isEqualTo(ProjectStatusFilter.CANCELADOS);
        assertThat(ProjectStatusFilter.fromString("TODOS"))
                .isEqualTo(ProjectStatusFilter.TODOS);
    }

    @Test
    @DisplayName("fromString com null retorna TODOS por default")
    void fromStringNullReturnsTodos() {
        assertThat(ProjectStatusFilter.fromString(null)).isEqualTo(ProjectStatusFilter.TODOS);
    }

    @Test
    @DisplayName("fromString com valor inválido lança BadRequestException listando aceitos")
    void fromStringInvalidThrows() {
        BadRequestException ex =
                assertThrows(
                        BadRequestException.class,
                        () -> ProjectStatusFilter.fromString("FOO"));
        assertThat(ex.getMessage())
                .contains("FOO")
                .contains("ATIVOS")
                .contains("COMPLETADOS")
                .contains("CANCELADOS")
                .contains("TODOS");
    }

    @Test
    @DisplayName("toProjectStatus retorna empty para TODOS")
    void toProjectStatusEmptyForTodos() {
        assertThat(ProjectStatusFilter.TODOS.toProjectStatus()).isEmpty();
    }

    @Test
    @DisplayName("toProjectStatus retorna o ProjectStatus correto para ATIVOS, COMPLETADOS, CANCELADOS")
    void toProjectStatusReturnsCorrectStatus() {
        assertThat(ProjectStatusFilter.ATIVOS.toProjectStatus()).contains(ProjectStatus.active);
        assertThat(ProjectStatusFilter.COMPLETADOS.toProjectStatus())
                .contains(ProjectStatus.completed);
        assertThat(ProjectStatusFilter.CANCELADOS.toProjectStatus())
                .contains(ProjectStatus.cancelled);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
./mvnw -q test -Dtest=ProjectStatusFilterTest
```
Expected: BUILD FAILURE — compile error "cannot find symbol class ProjectStatusFilter".

- [ ] **Step 3: Create `ProjectStatusFilter.java`**

```java
/* (C)2026 */
package com.vinculohub.backend.model.enums;

import com.vinculohub.backend.exception.BadRequestException;
import java.util.Optional;

public enum ProjectStatusFilter {
    TODOS(null),
    ATIVOS(ProjectStatus.active),
    COMPLETADOS(ProjectStatus.completed),
    CANCELADOS(ProjectStatus.cancelled);

    private final ProjectStatus projectStatus;

    ProjectStatusFilter(ProjectStatus projectStatus) {
        this.projectStatus = projectStatus;
    }

    public Optional<ProjectStatus> toProjectStatus() {
        return Optional.ofNullable(projectStatus);
    }

    public static ProjectStatusFilter fromString(String value) {
        if (value == null) {
            return TODOS;
        }
        for (ProjectStatusFilter filter : values()) {
            if (filter.name().equals(value)) {
                return filter;
            }
        }
        throw new BadRequestException(
                "Filtro de status inválido: '"
                        + value
                        + "'. Valores aceitos: ATIVOS, COMPLETADOS, CANCELADOS, TODOS");
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
./mvnw -q test -Dtest=ProjectStatusFilterTest
```
Expected: BUILD SUCCESS, 6 tests passing.

- [ ] **Step 5: Apply Spotless and commit**

```bash
./mvnw -q spotless:apply
git add backend/src/main/java/com/vinculohub/backend/model/enums/ProjectStatusFilter.java \
        backend/src/test/java/com/vinculohub/backend/model/enums/ProjectStatusFilterTest.java
git commit -m "feat(projects): add ProjectStatusFilter enum with parsing and mapping (#132)"
```

---

## Task 3: ProjectSummaryDTO (TDD, 1 mapping test)

Response record with a `from(Project)` factory. Single test verifies all fields propagate.

**Files:**
- Test: `backend/src/test/java/com/vinculohub/backend/dto/ProjectSummaryDTOTest.java`
- Create: `backend/src/main/java/com/vinculohub/backend/dto/ProjectSummaryDTO.java`

- [ ] **Step 1: Write the failing test**

Create `backend/src/test/java/com/vinculohub/backend/dto/ProjectSummaryDTOTest.java`:

```java
/* (C)2026 */
package com.vinculohub.backend.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.ProjectStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ProjectSummaryDTOTest {

    @Test
    @DisplayName("from(Project) preserva todos os campos do projeto")
    void fromPreservesAllFields() {
        Project project =
                Project.builder()
                        .id(42)
                        .npoId(7)
                        .title("Projeto X")
                        .description("descricao")
                        .status(ProjectStatus.active)
                        .budgetNeeded(new BigDecimal("50000.00"))
                        .investedAmount(new BigDecimal("15000.00"))
                        .startDate(LocalDate.of(2026, 1, 1))
                        .endDate(LocalDate.of(2026, 12, 31))
                        .build();

        ProjectSummaryDTO dto = ProjectSummaryDTO.from(project);

        assertThat(dto.id()).isEqualTo(42);
        assertThat(dto.title()).isEqualTo("Projeto X");
        assertThat(dto.description()).isEqualTo("descricao");
        assertThat(dto.status()).isEqualTo(ProjectStatus.active);
        assertThat(dto.budgetNeeded()).isEqualByComparingTo("50000.00");
        assertThat(dto.investedAmount()).isEqualByComparingTo("15000.00");
        assertThat(dto.startDate()).isEqualTo(LocalDate.of(2026, 1, 1));
        assertThat(dto.endDate()).isEqualTo(LocalDate.of(2026, 12, 31));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
./mvnw -q test -Dtest=ProjectSummaryDTOTest
```
Expected: BUILD FAILURE — "cannot find symbol class ProjectSummaryDTO".

- [ ] **Step 3: Create `ProjectSummaryDTO.java`**

```java
/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.ProjectStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Builder;

@Builder
public record ProjectSummaryDTO(
        Integer id,
        String title,
        String description,
        ProjectStatus status,
        BigDecimal budgetNeeded,
        BigDecimal investedAmount,
        LocalDate startDate,
        LocalDate endDate) {

    public static ProjectSummaryDTO from(Project project) {
        return ProjectSummaryDTO.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .status(project.getStatus())
                .budgetNeeded(project.getBudgetNeeded())
                .investedAmount(project.getInvestedAmount())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .build();
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
./mvnw -q test -Dtest=ProjectSummaryDTOTest
```
Expected: BUILD SUCCESS, 1 test passing.

- [ ] **Step 5: Apply Spotless and commit**

```bash
./mvnw -q spotless:apply
git add backend/src/main/java/com/vinculohub/backend/dto/ProjectSummaryDTO.java \
        backend/src/test/java/com/vinculohub/backend/dto/ProjectSummaryDTOTest.java
git commit -m "feat(projects): add ProjectSummaryDTO with from(Project) factory (#132)"
```

---

## Task 4: ProjectListingService (TDD, 11 cases, Mockito)

Service orchestrates user lookup → scope (NPO or Company) → repository call → DTO mapping. All dependencies mocked.

**Files:**
- Test: `backend/src/test/java/com/vinculohub/backend/service/ProjectListingServiceTest.java`
- Create: `backend/src/main/java/com/vinculohub/backend/service/ProjectListingService.java`

- [ ] **Step 1: Write the failing test**

Create `backend/src/test/java/com/vinculohub/backend/service/ProjectListingServiceTest.java`:

```java
/* (C)2026 */
package com.vinculohub.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.dto.ProjectSummaryDTO;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectStatusFilter;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProjectListingServiceTest {

    private static final String AUTH0_ID = "auth0|user-123";

    @Mock private UserRepository userRepository;
    @Mock private NpoRepository npoRepository;
    @Mock private CompanyRepository companyRepository;
    @Mock private ProjectRepository projectRepository;

    @InjectMocks private ProjectListingService service;

    private User npoUser(Integer userId) {
        return User.builder().id(userId).auth0Id(AUTH0_ID).userType(UserType.npo).build();
    }

    private User companyUser(Integer userId) {
        return User.builder().id(userId).auth0Id(AUTH0_ID).userType(UserType.company).build();
    }

    private Project sampleProject(Integer id, ProjectStatus status) {
        return Project.builder()
                .id(id)
                .npoId(10)
                .title("p" + id)
                .description("d")
                .status(status)
                .budgetNeeded(new BigDecimal("100.00"))
                .investedAmount(new BigDecimal("0.00"))
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(30))
                .build();
    }

    @Test
    @DisplayName("NPO autenticado com filtro TODOS retorna todos os projetos da ONG")
    void npoListsAllProjectsWhenFilterTodos() {
        User user = npoUser(1);
        Npo npo = Npo.builder().id(10).userId(1).build();
        Project p1 = sampleProject(1, ProjectStatus.active);
        Project p2 = sampleProject(2, ProjectStatus.completed);

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(1)).thenReturn(Optional.of(npo));
        when(projectRepository.findByNpoId(10)).thenReturn(List.of(p1, p2));

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.TODOS);

        assertThat(result).extracting(ProjectSummaryDTO::id).containsExactly(1, 2);
        verify(projectRepository).findByNpoId(10);
        verify(projectRepository, never()).findByNpoIdAndStatus(anyInt(), any());
    }

    @Test
    @DisplayName("NPO autenticado com filtro ATIVOS chama repository com ProjectStatus.active")
    void npoListsActiveOnly() {
        User user = npoUser(1);
        Npo npo = Npo.builder().id(10).userId(1).build();

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(1)).thenReturn(Optional.of(npo));
        when(projectRepository.findByNpoIdAndStatus(10, ProjectStatus.active))
                .thenReturn(List.of(sampleProject(1, ProjectStatus.active)));

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.ATIVOS);

        assertThat(result).hasSize(1);
        verify(projectRepository).findByNpoIdAndStatus(10, ProjectStatus.active);
    }

    @Test
    @DisplayName("NPO autenticado com filtro COMPLETADOS chama repository com ProjectStatus.completed")
    void npoListsCompletedOnly() {
        User user = npoUser(1);
        Npo npo = Npo.builder().id(10).userId(1).build();

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(1)).thenReturn(Optional.of(npo));
        when(projectRepository.findByNpoIdAndStatus(10, ProjectStatus.completed))
                .thenReturn(List.of());

        service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.COMPLETADOS);

        verify(projectRepository).findByNpoIdAndStatus(10, ProjectStatus.completed);
    }

    @Test
    @DisplayName("NPO autenticado com filtro CANCELADOS chama repository com ProjectStatus.cancelled")
    void npoListsCancelledOnly() {
        User user = npoUser(1);
        Npo npo = Npo.builder().id(10).userId(1).build();

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(1)).thenReturn(Optional.of(npo));
        when(projectRepository.findByNpoIdAndStatus(10, ProjectStatus.cancelled))
                .thenReturn(List.of());

        service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.CANCELADOS);

        verify(projectRepository).findByNpoIdAndStatus(10, ProjectStatus.cancelled);
    }

    @Test
    @DisplayName("NPO autenticado sem ONG associada retorna lista vazia sem chamar ProjectRepository")
    void npoUserWithoutNpoReturnsEmpty() {
        User user = npoUser(1);

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(1)).thenReturn(Optional.empty());

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.TODOS);

        assertThat(result).isEmpty();
        verifyNoInteractions(projectRepository);
    }

    @Test
    @DisplayName("NPO autenticado com ONG mas sem projetos retorna lista vazia")
    void npoWithNoProjectsReturnsEmpty() {
        User user = npoUser(1);
        Npo npo = Npo.builder().id(10).userId(1).build();

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(1)).thenReturn(Optional.of(npo));
        when(projectRepository.findByNpoId(10)).thenReturn(List.of());

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.TODOS);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Filtro sem match retorna lista vazia")
    void filterWithNoMatchReturnsEmpty() {
        User user = npoUser(1);
        Npo npo = Npo.builder().id(10).userId(1).build();

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(1)).thenReturn(Optional.of(npo));
        when(projectRepository.findByNpoIdAndStatus(10, ProjectStatus.cancelled))
                .thenReturn(List.of());

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.CANCELADOS);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Company autenticada com filtro TODOS retorna projetos vinculados")
    void companyListsAllLinkedProjects() {
        User user = companyUser(2);
        Company company = Company.builder().id(20).build();

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(2)).thenReturn(Optional.of(company));
        when(projectRepository.findAllByCompanyId(20))
                .thenReturn(List.of(sampleProject(5, ProjectStatus.active)));

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.TODOS);

        assertThat(result).extracting(ProjectSummaryDTO::id).containsExactly(5);
        verify(projectRepository).findAllByCompanyId(20);
        verify(projectRepository, never()).findAllByCompanyIdAndStatus(anyInt(), anyString());
    }

    @Test
    @DisplayName("Company autenticada com filtro ATIVOS chama findAllByCompanyIdAndStatus com 'active'")
    void companyListsActiveOnly() {
        User user = companyUser(2);
        Company company = Company.builder().id(20).build();

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(2)).thenReturn(Optional.of(company));
        when(projectRepository.findAllByCompanyIdAndStatus(20, "active"))
                .thenReturn(List.of(sampleProject(5, ProjectStatus.active)));

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.ATIVOS);

        assertThat(result).hasSize(1);
        verify(projectRepository).findAllByCompanyIdAndStatus(20, "active");
    }

    @Test
    @DisplayName("Company sem registro Company associado retorna lista vazia")
    void companyUserWithoutCompanyReturnsEmpty() {
        User user = companyUser(2);

        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(2)).thenReturn(Optional.empty());

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.TODOS);

        assertThat(result).isEmpty();
        verifyNoInteractions(projectRepository);
    }

    @Test
    @DisplayName("User não encontrado por auth0Id retorna lista vazia")
    void unknownUserReturnsEmpty() {
        when(userRepository.findByAuth0Id(AUTH0_ID)).thenReturn(Optional.empty());

        List<ProjectSummaryDTO> result =
                service.listProjectsForCurrentUser(AUTH0_ID, ProjectStatusFilter.TODOS);

        assertThat(result).isEmpty();
        verifyNoInteractions(npoRepository, companyRepository, projectRepository);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
./mvnw -q test -Dtest=ProjectListingServiceTest
```
Expected: BUILD FAILURE — "cannot find symbol class ProjectListingService".

- [ ] **Step 3: Create `ProjectListingService.java`**

```java
/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.ProjectSummaryDTO;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectStatusFilter;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class ProjectListingService {

    private final UserRepository userRepository;
    private final NpoRepository npoRepository;
    private final CompanyRepository companyRepository;
    private final ProjectRepository projectRepository;

    public ProjectListingService(
            UserRepository userRepository,
            NpoRepository npoRepository,
            CompanyRepository companyRepository,
            ProjectRepository projectRepository) {
        this.userRepository = userRepository;
        this.npoRepository = npoRepository;
        this.companyRepository = companyRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjectSummaryDTO> listProjectsForCurrentUser(
            String auth0Id, ProjectStatusFilter filter) {
        Optional<User> userOpt = userRepository.findByAuth0Id(auth0Id);
        if (userOpt.isEmpty()) {
            log.info("Listagem | usuário auth0Id={} não encontrado, retornando lista vazia", auth0Id);
            return List.of();
        }

        User user = userOpt.get();
        Optional<ProjectStatus> statusFilter = filter.toProjectStatus();
        List<Project> projects = resolveProjects(user, statusFilter);
        return projects.stream().map(ProjectSummaryDTO::from).toList();
    }

    private List<Project> resolveProjects(User user, Optional<ProjectStatus> statusFilter) {
        if (user.getUserType() == UserType.npo) {
            Optional<Npo> npoOpt = npoRepository.findByUserId(user.getId());
            if (npoOpt.isEmpty()) {
                return List.of();
            }
            Integer npoId = npoOpt.get().getId();
            return statusFilter
                    .map(status -> projectRepository.findByNpoIdAndStatus(npoId, status))
                    .orElseGet(() -> projectRepository.findByNpoId(npoId));
        }

        if (user.getUserType() == UserType.company) {
            Optional<Company> companyOpt = companyRepository.findByUserId(user.getId());
            if (companyOpt.isEmpty()) {
                return List.of();
            }
            Integer companyId = companyOpt.get().getId();
            return statusFilter
                    .map(
                            status ->
                                    projectRepository.findAllByCompanyIdAndStatus(
                                            companyId, status.name()))
                    .orElseGet(() -> projectRepository.findAllByCompanyId(companyId));
        }

        return List.of();
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
./mvnw -q test -Dtest=ProjectListingServiceTest
```
Expected: BUILD SUCCESS, 11 tests passing.

- [ ] **Step 5: Apply Spotless and commit**

```bash
./mvnw -q spotless:apply
git add backend/src/main/java/com/vinculohub/backend/service/ProjectListingService.java \
        backend/src/test/java/com/vinculohub/backend/service/ProjectListingServiceTest.java
git commit -m "feat(projects): add ProjectListingService with NPO/Company scope (#132)"
```

---

## Task 5: ProjectController + happy/4xx integration tests (TDD, 6 cases)

End-to-end controller test against Testcontainers Postgres. Seeds `users`, `npo`, `company`, `project`, `company_project` directly via JdbcTemplate (cleanup `@BeforeEach` so tests don't interfere).

**Files:**
- Test: `backend/src/test/java/com/vinculohub/backend/controller/ProjectControllerIntegrationTest.java`
- Create: `backend/src/main/java/com/vinculohub/backend/controller/ProjectController.java`

- [ ] **Step 1: Write the failing integration test**

Create `backend/src/test/java/com/vinculohub/backend/controller/ProjectControllerIntegrationTest.java`:

```java
/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.database.AbstractIntegrationTest;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

class ProjectControllerIntegrationTest extends AbstractIntegrationTest {

    private static final String NPO_AUTH0 = "auth0|npo-1";
    private static final String COMPANY_AUTH0 = "auth0|company-1";
    private static final String LONELY_AUTH0 = "auth0|no-org";

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanAndSeed() {
        jdbcTemplate.update("DELETE FROM company_project");
        jdbcTemplate.update("DELETE FROM project");
        jdbcTemplate.update("DELETE FROM company");
        jdbcTemplate.update("DELETE FROM npo");
        jdbcTemplate.update("DELETE FROM users");

        // NPO user + NPO + 3 projects (active, completed, cancelled)
        Integer npoUserId =
                jdbcTemplate.queryForObject(
                        "INSERT INTO users (name, email, auth0_id, user_type) "
                                + "VALUES ('ONG User', 'ong@test.com', ?, 'npo'::user_type) RETURNING id",
                        Integer.class,
                        NPO_AUTH0);
        Integer npoId =
                jdbcTemplate.queryForObject(
                        "INSERT INTO npo (name, user_id, npo_size) "
                                + "VALUES ('ONG Teste', ?, 'small'::npo_size) RETURNING id",
                        Integer.class,
                        npoUserId);
        jdbcTemplate.update(
                "INSERT INTO project (npo_id, title, status) VALUES "
                        + "(?, 'P-Active', 'active'::project_status), "
                        + "(?, 'P-Completed', 'completed'::project_status), "
                        + "(?, 'P-Cancelled', 'cancelled'::project_status)",
                npoId,
                npoId,
                npoId);

        // Company user + Company linked to the active project
        Integer companyUserId =
                jdbcTemplate.queryForObject(
                        "INSERT INTO users (name, email, auth0_id, user_type) "
                                + "VALUES ('Empresa User', 'empresa@test.com', ?, 'company'::user_type) RETURNING id",
                        Integer.class,
                        COMPANY_AUTH0);
        Integer companyId =
                jdbcTemplate.queryForObject(
                        "INSERT INTO company (legal_name, social_name, user_id) "
                                + "VALUES ('Empresa LTDA', 'Empresa', ?) RETURNING id",
                        Integer.class,
                        companyUserId);
        Integer activeProjectId =
                jdbcTemplate.queryForObject(
                        "SELECT id FROM project WHERE title = 'P-Active'", Integer.class);
        jdbcTemplate.update(
                "INSERT INTO company_project (company_id, project_id, status) "
                        + "VALUES (?, ?, 'active'::relationship_status)",
                companyId,
                activeProjectId);

        // Lonely user (no NPO, no company)
        jdbcTemplate.update(
                "INSERT INTO users (name, email, auth0_id, user_type) "
                        + "VALUES ('Sem Org', 'lonely@test.com', ?, 'npo'::user_type)",
                LONELY_AUTH0);
    }

    @Test
    @DisplayName("GET /api/projects sem JWT retorna 401")
    void unauthorizedWithoutJwt() throws Exception {
        mockMvc.perform(get("/api/projects")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("NPO autenticado sem filtro retorna seus 3 projetos")
    void npoListsAllOwnProjects() throws Exception {
        mockMvc.perform(get("/api/projects").with(jwt().jwt(j -> j.subject(NPO_AUTH0))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", Matchers.hasSize(3)))
                .andExpect(
                        jsonPath(
                                "$[*].title",
                                Matchers.containsInAnyOrder(
                                        "P-Active", "P-Completed", "P-Cancelled")));
    }

    @Test
    @DisplayName("NPO autenticado com filtro ATIVOS retorna apenas ativos")
    void npoFiltersActive() throws Exception {
        mockMvc.perform(
                        get("/api/projects")
                                .param("status", "ATIVOS")
                                .with(jwt().jwt(j -> j.subject(NPO_AUTH0))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", Matchers.hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("P-Active"))
                .andExpect(jsonPath("$[0].status").value("active"));
    }

    @Test
    @DisplayName("Filtro inválido retorna 400 com payload listando aceitos")
    void invalidFilterReturns400() throws Exception {
        mockMvc.perform(
                        get("/api/projects")
                                .param("status", "FOO")
                                .with(jwt().jwt(j -> j.subject(NPO_AUTH0))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(
                        jsonPath(
                                "$.message",
                                Matchers.allOf(
                                        Matchers.containsString("FOO"),
                                        Matchers.containsString("ATIVOS"),
                                        Matchers.containsString("COMPLETADOS"),
                                        Matchers.containsString("CANCELADOS"),
                                        Matchers.containsString("TODOS"))))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("User sem ONG/Empresa associada retorna 200 + lista vazia")
    void lonelyUserGetsEmptyList() throws Exception {
        mockMvc.perform(get("/api/projects").with(jwt().jwt(j -> j.subject(LONELY_AUTH0))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", Matchers.hasSize(0)));
    }

    @Test
    @DisplayName("Company autenticada retorna projetos vinculados")
    void companyListsLinkedProjects() throws Exception {
        mockMvc.perform(get("/api/projects").with(jwt().jwt(j -> j.subject(COMPANY_AUTH0))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", Matchers.hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("P-Active"));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
./mvnw -q test -Dtest=ProjectControllerIntegrationTest
```
Expected: BUILD FAILURE — compile errors referencing `ProjectController` (not yet created), or runtime 401/404 when test hits `/api/projects`.

- [ ] **Step 3: Create `ProjectController.java`**

```java
/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.ProjectSummaryDTO;
import com.vinculohub.backend.model.enums.ProjectStatusFilter;
import com.vinculohub.backend.service.ProjectListingService;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectListingService projectListingService;

    public ProjectController(ProjectListingService projectListingService) {
        this.projectListingService = projectListingService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectSummaryDTO>> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String status) {
        log.info("GET /api/projects | sub={} status={}", jwt.getSubject(), status);
        ProjectStatusFilter filter = ProjectStatusFilter.fromString(status);
        List<ProjectSummaryDTO> result =
                projectListingService.listProjectsForCurrentUser(jwt.getSubject(), filter);
        log.info("GET /api/projects | sub={} returned {} items", jwt.getSubject(), result.size());
        return ResponseEntity.ok(result);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
./mvnw -q test -Dtest=ProjectControllerIntegrationTest
```
Expected: BUILD SUCCESS, 6 tests passing. (First run is slower because Testcontainers boots Postgres.)

- [ ] **Step 5: Apply Spotless and commit**

```bash
./mvnw -q spotless:apply
git add backend/src/main/java/com/vinculohub/backend/controller/ProjectController.java \
        backend/src/test/java/com/vinculohub/backend/controller/ProjectControllerIntegrationTest.java
git commit -m "feat(projects): add GET /api/projects controller with integration tests (#132)"
```

---

## Task 6: 500 error integration test (TDD, 1 case, @MockitoBean)

Verifies that an infra failure produces the structured 500 payload from `GlobalExceptionHandler` (no stack trace leaks). Lives in its own class because `@MockitoBean` triggers a separate Spring context.

**Files:**
- Test: `backend/src/test/java/com/vinculohub/backend/controller/ProjectControllerErrorIntegrationTest.java`

- [ ] **Step 1: Write the failing test**

Create `backend/src/test/java/com/vinculohub/backend/controller/ProjectControllerErrorIntegrationTest.java`:

```java
/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.database.AbstractIntegrationTest;
import com.vinculohub.backend.repository.ProjectRepository;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

class ProjectControllerErrorIntegrationTest extends AbstractIntegrationTest {

    private static final String NPO_AUTH0 = "auth0|npo-error";

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbcTemplate;

    @MockitoBean private ProjectRepository projectRepository;

    @BeforeEach
    void seed() {
        jdbcTemplate.update("DELETE FROM company_project");
        jdbcTemplate.update("DELETE FROM project");
        jdbcTemplate.update("DELETE FROM npo");
        jdbcTemplate.update("DELETE FROM users");

        Integer userId =
                jdbcTemplate.queryForObject(
                        "INSERT INTO users (name, email, auth0_id, user_type) "
                                + "VALUES ('ONG', 'ong-err@test.com', ?, 'npo'::user_type) RETURNING id",
                        Integer.class,
                        NPO_AUTH0);
        jdbcTemplate.update(
                "INSERT INTO npo (name, user_id, npo_size) "
                        + "VALUES ('ONG Erro', ?, 'small'::npo_size)",
                userId);

        when(projectRepository.findByNpoId(anyInt()))
                .thenThrow(new DataAccessResourceFailureException("DB indisponível"));
    }

    @Test
    @DisplayName("Falha no repository retorna 500 com payload estruturado e sem stack trace")
    void repositoryFailureReturns500WithStructuredPayload() throws Exception {
        mockMvc.perform(get("/api/projects").with(jwt().jwt(j -> j.subject(NPO_AUTH0))))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.message").value("Erro interno do servidor"))
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(
                        jsonPath(
                                "$.message",
                                Matchers.not(Matchers.containsString("DataAccess"))));
    }
}
```

- [ ] **Step 2: Run test to verify it passes**

The implementation already exists (controller + handler), so this test should already pass:

```bash
./mvnw -q test -Dtest=ProjectControllerErrorIntegrationTest
```
Expected: BUILD SUCCESS, 1 test passing.

If it fails because `@MockitoBean` is unavailable: project uses Spring Boot 3.4 which ships Spring Framework 6.2 — `@MockitoBean` is in `org.springframework.test.context.bean.override.mockito`. Confirm the import. If still unresolved, fall back to the deprecated `@MockBean` from `org.springframework.boot.test.mock.mockito.MockBean`.

- [ ] **Step 3: Commit**

```bash
./mvnw -q spotless:apply
git add backend/src/test/java/com/vinculohub/backend/controller/ProjectControllerErrorIntegrationTest.java
git commit -m "test(projects): cover 500 with structured payload on DB failure (#132)"
```

---

## Task 7: Final verification

- [ ] **Step 1: Run the full backend test suite**

```bash
./mvnw -q test
```
Expected: BUILD SUCCESS. All previously-passing tests remain green plus:
- `ProjectStatusFilterTest` (6)
- `ProjectSummaryDTOTest` (1)
- `ProjectListingServiceTest` (11)
- `ProjectControllerIntegrationTest` (6)
- `ProjectControllerErrorIntegrationTest` (1)

= **25 new tests added, zero pre-existing tests broken.**

- [ ] **Step 2: Run Spotless check (matches the pre-push hook)**

```bash
./mvnw -q spotless:check
```
Expected: BUILD SUCCESS. (If it fails, run `./mvnw spotless:apply` and re-check.)

- [ ] **Step 3: Confirm no lingering changes outside the planned files**

```bash
git status
git log --oneline origin/main..HEAD
```

Expected: Working tree clean. The branch should have **6 new commits** (one per Task 1-6, plus the spec commit `325141d` already present).

- [ ] **Step 4: Smoke-check coverage report**

```bash
./mvnw -q test
ls backend/target/site/jacoco/index.html
```

Expected: `index.html` exists. Open it locally and confirm `ProjectListingService`, `ProjectStatusFilter`, and `ProjectController` show high (>90%) coverage.

- [ ] **Step 5: Done — final summary**

Produce a short markdown report containing:
1. Final route + request/response examples (copy from spec §3).
2. List of files created (7 main + 5 test).
3. Issue #132 checklist (copy from spec §8) with ✅ marks.
4. Suggested commit log (already done — link to commits).
5. Anything noteworthy that came up during implementation (e.g., test flakiness, unexpected schema constraint, deviations from the plan).

**Do not push and do not open a PR.** The user explicitly asked for local commits only.

---

## Self-Review Checklist (run by the planner before handoff)

- [x] **Spec coverage** — every requirement in the spec maps to a task:
  - Endpoint + status filter → Tasks 2, 5
  - Lista vazia (não 404) → Tasks 4 (cases 5, 6, 7, 10), 5 (case 5)
  - 400 filtro inválido → Task 2 + Task 5 (case 4)
  - 500 com payload estruturado → Task 6
  - NPO + Company scope → Task 4 (cases 1-7 vs 8-10), Task 5 (cases 2-3 vs 6)
  - Sem paginação, sem entity para `company_project` → respeitado (não há tarefa de paginação; native @Query no repo)
- [x] **Placeholder scan** — every code block is concrete; no TBDs, no "similar to". Zero generic "add error handling" steps.
- [x] **Type consistency** — `ProjectStatusFilter`, `ProjectStatus`, `ProjectSummaryDTO`, repository method names (`findByNpoId`, `findByNpoIdAndStatus`, `findAllByCompanyId`, `findAllByCompanyIdAndStatus`) referenced consistently across all tasks.

---

## Out of scope (do not implement)

- Pagination (`Pageable`).
- `GET /api/projects/{id}` detail.
- Filters by SDG, date range, text search.
- Admin user listing.
- Frontend changes.
- Pushing to remote / opening PR.
