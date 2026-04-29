/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.dto.ProjectFilterParams;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.ProjectStatus;
import org.springframework.data.jpa.domain.Specification;

public class ProjectSpecification {

    private ProjectSpecification() {}

    public static Specification<Project> hasNpoId(Long npoId) {
        return (root, query, cb) ->
                npoId == null ? null : cb.equal(root.get("npo").get("id"), npoId);
    }

    public static Specification<Project> hasStatus(ProjectStatus status) {
        return (root, query, cb) ->
                status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Project> titleContains(String title) {
        return (root, query, cb) ->
                (title == null || title.isBlank())
                        ? null
                        : cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }

    public static Specification<Project> from(ProjectFilterParams params) {
        return Specification.where(hasNpoId(params.npoId()))
                .and(hasStatus(params.status()))
                .and(titleContains(params.title()));
    }
}
