/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.repository.projection.EsgPillarAggregationProjection;
import com.vinculohub.backend.repository.projection.PortfolioTotalsProjection;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository
        extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {
    List<Project> findAllByNpoId(Long npoId);

    Page<Project> findSomeByNpoId(Long npoId, Pageable pageable);

    @Query(
            value =
                    """
                    SELECT
                        COUNT(DISTINCT p.id) AS project_count,
                        COALESCE(SUM(p.invested_amount), 0) AS total_invested,
                        COALESCE(SUM(p.budget_needed), 0) AS total_budget_needed
                    FROM project p
                    INNER JOIN company_project cp ON cp.project_id = p.id
                    WHERE cp.company_id = :companyId
                      AND cp.deleted_at IS NULL
                      AND cp.status = 'active'
                      AND p.deleted_at IS NULL
                      AND p.status = 'ACTIVE'
                    """,
            nativeQuery = true)
    PortfolioTotalsProjection sumPortfolioTotalsByCompanyId(@Param("companyId") Integer companyId);

    @Query(
            value =
                    """
                    SELECT 'ENVIRONMENTAL' AS pillar,
                        COUNT(DISTINCT p.id) AS project_count,
                        COALESCE(SUM(p.invested_amount), 0) AS total_invested,
                        COALESCE(SUM(p.budget_needed), 0) AS total_budget_needed
                    FROM project p
                    INNER JOIN company_project cp ON cp.project_id = p.id
                    INNER JOIN npo n ON n.id = p.npo_id
                    WHERE cp.company_id = :companyId
                      AND cp.deleted_at IS NULL
                      AND cp.status = 'active'
                      AND p.deleted_at IS NULL
                      AND p.status = 'ACTIVE'
                      AND n.deleted_at IS NULL
                      AND n.environmental IS TRUE
                    UNION ALL
                    SELECT 'SOCIAL' AS pillar,
                        COUNT(DISTINCT p.id) AS project_count,
                        COALESCE(SUM(p.invested_amount), 0) AS total_invested,
                        COALESCE(SUM(p.budget_needed), 0) AS total_budget_needed
                    FROM project p
                    INNER JOIN company_project cp ON cp.project_id = p.id
                    INNER JOIN npo n ON n.id = p.npo_id
                    WHERE cp.company_id = :companyId
                      AND cp.deleted_at IS NULL
                      AND cp.status = 'active'
                      AND p.deleted_at IS NULL
                      AND p.status = 'ACTIVE'
                      AND n.deleted_at IS NULL
                      AND n.social IS TRUE
                    UNION ALL
                    SELECT 'GOVERNANCE' AS pillar,
                        COUNT(DISTINCT p.id) AS project_count,
                        COALESCE(SUM(p.invested_amount), 0) AS total_invested,
                        COALESCE(SUM(p.budget_needed), 0) AS total_budget_needed
                    FROM project p
                    INNER JOIN company_project cp ON cp.project_id = p.id
                    INNER JOIN npo n ON n.id = p.npo_id
                    WHERE cp.company_id = :companyId
                      AND cp.deleted_at IS NULL
                      AND cp.status = 'active'
                      AND p.deleted_at IS NULL
                      AND p.status = 'ACTIVE'
                      AND n.deleted_at IS NULL
                      AND n.governance IS TRUE
                    """,
            nativeQuery = true)
    List<EsgPillarAggregationProjection> sumByEsgPillarForCompany(
            @Param("companyId") Integer companyId);
}
