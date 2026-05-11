/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.CompanyProject;
import com.vinculohub.backend.model.CompanyProjectId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyProjectRepository
        extends JpaRepository<CompanyProject, CompanyProjectId> {}
