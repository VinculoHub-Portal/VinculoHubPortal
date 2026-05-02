/* (C)2026 */
package com.vinculohub.backend.repository.specification;

import com.vinculohub.backend.dto.ProjectFilterParams;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import jakarta.persistence.criteria.JoinType;
import java.util.Set;
import org.springframework.data.jpa.domain.Specification;

public class ProjectSpecification {

    private ProjectSpecification() {}

    public static Specification<Project> hasNpoId(Long npoId) {
        return (root, query, cb) ->
                npoId == null ? null : cb.equal(root.get("npo").get("id"), npoId);
    }

    public static Specification<Project> hasStatus(ProjectStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Project> titleContains(String title) {
        return (root, query, cb) ->
                title == null || title.isBlank()
                        ? null
                        : cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }

    public static Specification<Project> hasAnyOdsCode(Set<Integer> odsCodes) {
        return (root, query, cb) -> {
            if (odsCodes == null || odsCodes.isEmpty()) return null;
            query.distinct(true);
            return root.join("odsCodes", JoinType.INNER).in(odsCodes);
        };
    }

    public static Specification<Project> hasType(ProjectType type) {
        return (root, query, cb) -> type == null ? null : cb.equal(root.get("type"), type);
    }

    public static Specification<Project> from(ProjectFilterParams params) {
        return Specification.where(hasNpoId(params.npoId()))
                .and(hasStatus(params.status()))
                .and(titleContains(params.title()))
                .and(hasAnyOdsCode(params.odsCodes()))
                .and(hasType(params.type()));
    }
}
