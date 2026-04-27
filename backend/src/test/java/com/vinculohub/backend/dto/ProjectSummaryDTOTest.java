/* (C)2026 */
package com.vinculohub.backend.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.vinculohub.backend.model.Npo;
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
                        .id(42L)
                        .npo(Npo.builder().id(7).build())
                        .title("Projeto X")
                        .description("descricao")
                        .status(ProjectStatus.ACTIVE)
                        .budgetNeeded(new BigDecimal("50000.00"))
                        .investedAmount(new BigDecimal("15000.00"))
                        .startDate(LocalDate.of(2026, 1, 1))
                        .endDate(LocalDate.of(2026, 12, 31))
                        .build();

        ProjectSummaryDTO dto = ProjectSummaryDTO.from(project);

        assertThat(dto.id()).isEqualTo(42L);
        assertThat(dto.title()).isEqualTo("Projeto X");
        assertThat(dto.description()).isEqualTo("descricao");
        assertThat(dto.status()).isEqualTo(ProjectStatus.ACTIVE);
        assertThat(dto.budgetNeeded()).isEqualByComparingTo("50000.00");
        assertThat(dto.investedAmount()).isEqualByComparingTo("15000.00");
        assertThat(dto.startDate()).isEqualTo(LocalDate.of(2026, 1, 1));
        assertThat(dto.endDate()).isEqualTo(LocalDate.of(2026, 12, 31));
    }
}
