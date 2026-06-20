/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.repository.projection.CompanyNpoCardProjection;
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
}
