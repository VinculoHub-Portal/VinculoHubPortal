/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.CompanyProject;
import com.vinculohub.backend.model.CompanyProjectId;
import com.vinculohub.backend.repository.projection.CompanySupportedProjectsSummaryProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyProjectRepository extends JpaRepository<CompanyProject, CompanyProjectId> {

    @Query(
            """
SELECT
    COUNT(cp) AS totalActiveProjects,
    COUNT(
        CASE
            WHEN cp.project.type = com.vinculohub.backend.model.enums.ProjectType.TAX_INCENTIVE_LAW
            THEN 1
            ELSE NULL
        END
    ) AS incentiveLawProjects,
    COUNT(
        CASE
            WHEN cp.project.type = com.vinculohub.backend.model.enums.ProjectType.SOCIAL_INVESTMENT_LAW
            THEN 1
            ELSE NULL
        END
    ) AS privateInvestmentProjects
FROM CompanyProject cp
WHERE cp.company.id = :companyId
    AND cp.status = com.vinculohub.backend.model.enums.RelationshipStatus.active
    AND cp.project.status = com.vinculohub.backend.model.enums.ProjectStatus.ACTIVE
""")
    CompanySupportedProjectsSummaryProjection getSupportedProjectsSummaryByCompanyId(
            @Param("companyId") Integer companyId);
}
