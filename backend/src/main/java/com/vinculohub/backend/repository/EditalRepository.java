/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.Edital;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EditalRepository extends JpaRepository<Edital, Long> {

    List<Edital> findAllByOrderByCreatedAtDesc();

    @Query(
            "SELECT e FROM Edital e WHERE e.expiredAt IS NULL OR e.expiredAt > :now ORDER BY"
                    + " e.createdAt DESC")
    List<Edital> findAllActiveOrderByCreatedAtDesc(@Param("now") LocalDateTime now);
}
