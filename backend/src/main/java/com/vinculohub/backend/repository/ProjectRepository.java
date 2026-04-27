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

    List<Project> findAllByNpoId(Long npoId);

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
