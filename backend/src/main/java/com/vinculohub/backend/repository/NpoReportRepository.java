/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.NpoReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface NpoReportRepository
        extends JpaRepository<NpoReport, Long>, JpaSpecificationExecutor<NpoReport> {

    @Override
    @EntityGraph(attributePaths = {"npo", "reporterCompany", "reporterUser"})
    Page<NpoReport> findAll(Specification<NpoReport> spec, Pageable pageable);
}
