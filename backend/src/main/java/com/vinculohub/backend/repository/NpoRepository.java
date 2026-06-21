/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.repository.projection.AdminNpoCardProjection;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NpoRepository extends JpaRepository<Npo, Integer> {

    Optional<Npo> findByUserId(Integer userId);

    Optional<Npo> findByCnpj(String cnpj);

    Optional<Npo> findByCpf(String cpf);

    boolean existsByUserId(Integer userId);

    boolean existsByCnpj(String cnpj);

    boolean existsByCpf(String cpf);

    @Query(
            value =
                    """
                    SELECT
                        n.id AS id,
                        n.name AS name,
                        n.description AS description,
                        n.logo_url AS logoUrl,
                        a.city AS city,
                        a.state_code AS stateCode
                    FROM npo n
                    LEFT JOIN address a ON a.id = n.address_id
                    WHERE n.deleted_at IS NULL
                      AND (
                            :name IS NULL
                            OR LOWER(n.name) LIKE LOWER(CONCAT('%', :name, '%'))
                      )
                    """,
            countQuery =
                    """
                    SELECT COUNT(*)
                    FROM npo n
                    WHERE n.deleted_at IS NULL
                      AND (
                            :name IS NULL
                            OR LOWER(n.name) LIKE LOWER(CONCAT('%', :name, '%'))
                      )
                    """,
            nativeQuery = true)
    Page<CompanyNpoCardProjection> findActiveCardsForCompany(
            @Param("name") String name, Pageable pageable);

    @Query(
            value =
                    """
                    SELECT
                        n.id AS id,
                        n.name AS name,
                        n.logo_url AS logoUrl,
                        CASE WHEN n.deleted_at IS NULL THEN TRUE ELSE FALSE END AS active,
                        n.environmental AS environmental,
                        n.social AS social,
                        n.governance AS governance,
                        a.city AS city,
                        a.state_code AS stateCode,
                        n.created_at AS createdAt
                    FROM npo n
                    LEFT JOIN address a ON a.id = n.address_id
                    WHERE (
                            :search IS NULL
                            OR LOWER(n.name) LIKE LOWER(CONCAT('%', :search, '%'))
                    )
                      AND (
                            :area IS NULL
                            OR (:area = 'environmental' AND n.environmental = TRUE)
                            OR (:area = 'social' AND n.social = TRUE)
                            OR (:area = 'governance' AND n.governance = TRUE)
                    )
                      AND (
                            :active IS NULL
                            OR (:active = TRUE AND n.deleted_at IS NULL)
                            OR (:active = FALSE AND n.deleted_at IS NOT NULL)
                    )
                    ORDER BY n.created_at DESC, n.id DESC
                    """,
            countQuery =
                    """
                    SELECT COUNT(*)
                    FROM npo n
                    WHERE (
                            :search IS NULL
                            OR LOWER(n.name) LIKE LOWER(CONCAT('%', :search, '%'))
                    )
                      AND (
                            :area IS NULL
                            OR (:area = 'environmental' AND n.environmental = TRUE)
                            OR (:area = 'social' AND n.social = TRUE)
                            OR (:area = 'governance' AND n.governance = TRUE)
                    )
                      AND (
                            :active IS NULL
                            OR (:active = TRUE AND n.deleted_at IS NULL)
                            OR (:active = FALSE AND n.deleted_at IS NOT NULL)
                    )
                    """,
            nativeQuery = true)
    Page<AdminNpoCardProjection> findAdminCards(
            @Param("search") String search,
            @Param("area") String area,
            @Param("active") Boolean active,
            Pageable pageable);

    interface CompanyNpoCardProjection {
        Integer getId();

        String getName();

        String getDescription();

        String getLogoUrl();

        String getCity();

        String getStateCode();
    }
}
