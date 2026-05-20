/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.Document;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {

    List<Document> findByNpo_Id(Integer npoId);

    Page<Document> findByNpo_Id(Integer npoId, Pageable pageable);

    List<Document> findByProject_Id(Integer projectId);

    List<Document> findByNpo_IdAndProject_Id(Integer npoId, Integer projectId);
}
