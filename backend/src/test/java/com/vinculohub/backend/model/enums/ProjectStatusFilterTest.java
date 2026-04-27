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
        assertThat(ProjectStatusFilter.fromString("ATIVOS")).isEqualTo(ProjectStatusFilter.ATIVOS);
    }

    @Test
    @DisplayName("fromString aceita COMPLETADOS, CANCELADOS e TODOS")
    void fromStringAcceptsAllValidValues() {
        assertThat(ProjectStatusFilter.fromString("COMPLETADOS"))
                .isEqualTo(ProjectStatusFilter.COMPLETADOS);
        assertThat(ProjectStatusFilter.fromString("CANCELADOS"))
                .isEqualTo(ProjectStatusFilter.CANCELADOS);
        assertThat(ProjectStatusFilter.fromString("TODOS")).isEqualTo(ProjectStatusFilter.TODOS);
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
                        BadRequestException.class, () -> ProjectStatusFilter.fromString("FOO"));
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
    @DisplayName(
            "toProjectStatus retorna o ProjectStatus correto para ATIVOS, COMPLETADOS, CANCELADOS")
    void toProjectStatusReturnsCorrectStatus() {
        assertThat(ProjectStatusFilter.ATIVOS.toProjectStatus()).contains(ProjectStatus.active);
        assertThat(ProjectStatusFilter.COMPLETADOS.toProjectStatus())
                .contains(ProjectStatus.completed);
        assertThat(ProjectStatusFilter.CANCELADOS.toProjectStatus())
                .contains(ProjectStatus.cancelled);
    }
}
