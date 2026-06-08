/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.CompanyProject;
import com.vinculohub.backend.model.CompanyProjectId;
import com.vinculohub.backend.repository.projection.CompanySupportedProjectsSummaryProjection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyProjectRepository extends JpaRepository<CompanyProject, CompanyProjectId> {

    @Query(
            """
            SELECT cp FROM CompanyProject cp
            JOIN FETCH cp.company c
            JOIN FETCH cp.project p
            JOIN FETCH p.npo n
            ORDER BY c.legalName, n.name, p.title
            """)
    List<CompanyProject> findAllForExport();

    @Query(
            value =
                    """
                    SELECT
                        COUNT(DISTINCT p.id) AS totalActiveProjects,
                        COUNT(DISTINCT CASE
                            WHEN p.project_type = 'TAX_INCENTIVE_LAW' THEN p.id
                            ELSE NULL
                        END) AS incentiveLawProjects,
                        COUNT(DISTINCT CASE
                            WHEN p.project_type = 'SOCIAL_INVESTMENT_LAW' THEN p.id
                            ELSE NULL
                        END) AS privateInvestmentProjects
                    FROM company_project cp
                    INNER JOIN project p ON p.id = cp.project_id
                    WHERE cp.company_id = :companyId
                      AND cp.deleted_at IS NULL
                      AND cp.status = 'active'::relationship_status
                      AND p.deleted_at IS NULL
                      AND p.status = 'ACTIVE'
                    """,
            nativeQuery = true)
    CompanySupportedProjectsSummaryProjection getSupportedProjectsSummaryByCompanyId(
            @Param("companyId") Integer companyId);
}
