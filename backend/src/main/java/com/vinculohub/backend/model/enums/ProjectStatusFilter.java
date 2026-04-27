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
