/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.Project;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findAllByNpoId(Integer npoId);
}
