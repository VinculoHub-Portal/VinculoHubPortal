/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.CompanyProject;
import com.vinculohub.backend.model.CompanyProjectId;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import com.vinculohub.backend.repository.projection.CompanySupportedProjectsSummaryProjection;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyProjectRepository extends JpaRepository<CompanyProject, CompanyProjectId> {

    List<RelationshipStatus> VISIBLE_RELATIONSHIP_STATUSES =
            List.of(
                    RelationshipStatus.pending,
                    RelationshipStatus.negotiation,
                    RelationshipStatus.active);

    default List<CompanyProject> findVisibleRelationshipsByCompanyId(Integer companyId) {
        return findRelationshipsByCompanyIdAndStatusIn(companyId, VISIBLE_RELATIONSHIP_STATUSES);
    }

    default List<CompanyProject> findVisibleRelationshipsByNpoId(Integer npoId) {
        return findRelationshipsByNpoIdAndStatusIn(npoId, VISIBLE_RELATIONSHIP_STATUSES);
    }

    @Query(
            """
            SELECT cp
            FROM CompanyProject cp
            JOIN FETCH cp.company c
            LEFT JOIN FETCH c.user
            JOIN FETCH cp.project p
            JOIN FETCH p.npo n
            LEFT JOIN FETCH n.npoUser
            WHERE c.id = :companyId
              AND cp.status IN :statuses
            ORDER BY cp.updatedAt DESC, cp.createdAt DESC
            """)
    List<CompanyProject> findRelationshipsByCompanyIdAndStatusIn(
            @Param("companyId") Integer companyId,
            @Param("statuses") Collection<RelationshipStatus> statuses);

    @Query(
            """
            SELECT cp
            FROM CompanyProject cp
            JOIN FETCH cp.company c
            LEFT JOIN FETCH c.user
            JOIN FETCH cp.project p
            JOIN FETCH p.npo n
            LEFT JOIN FETCH n.npoUser
            WHERE n.id = :npoId
              AND cp.status IN :statuses
            ORDER BY cp.updatedAt DESC, cp.createdAt DESC
            """)
    List<CompanyProject> findRelationshipsByNpoIdAndStatusIn(
            @Param("npoId") Integer npoId,
            @Param("statuses") Collection<RelationshipStatus> statuses);

    @Query(
            """
            SELECT cp
            FROM CompanyProject cp
            JOIN FETCH cp.company c
            LEFT JOIN FETCH c.user
            JOIN FETCH cp.project p
            JOIN FETCH p.npo n
            LEFT JOIN FETCH n.npoUser
            WHERE c.id = :companyId
              AND p.id = :projectId
            """)
    Optional<CompanyProject> findByIdWithGraph(
            @Param("companyId") Integer companyId, @Param("projectId") Long projectId);

    @Query(
            """
            SELECT cp
            FROM CompanyProject cp
            JOIN FETCH cp.company c
            LEFT JOIN FETCH c.user
            JOIN FETCH cp.project p
            JOIN FETCH p.npo n
            LEFT JOIN FETCH n.npoUser
            WHERE cp.status = com.vinculohub.backend.model.enums.RelationshipStatus.pending
              AND cp.createdAt <= :threshold
            ORDER BY cp.createdAt ASC
            """)
    List<CompanyProject> findOverduePendingRelationships(
            @Param("threshold") LocalDateTime threshold);

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

    long countByStatus(RelationshipStatus status);

    @Query(
            """
            SELECT cp
            FROM CompanyProject cp
            JOIN FETCH cp.company c
            JOIN FETCH cp.project p
            JOIN FETCH p.npo n
            ORDER BY cp.createdAt DESC
            """)
    Page<CompanyProject> findAllForAdmin(Pageable pageable);
}
