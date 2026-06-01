/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.Edital;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EditalRepository extends JpaRepository<Edital, Long> {

    Page<Edital> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query(
            value =
                    "SELECT e FROM Edital e WHERE e.expiredAt IS NULL OR e.expiredAt > :now"
                            + " ORDER BY e.createdAt DESC",
            countQuery =
                    "SELECT COUNT(e) FROM Edital e WHERE e.expiredAt IS NULL OR e.expiredAt > :now")
    Page<Edital> findAllActiveOrderByCreatedAtDesc(
            @Param("now") LocalDateTime now, Pageable pageable);
}
