/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.NpoReport;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NpoReportRepository extends JpaRepository<NpoReport, Long> {

    @EntityGraph(attributePaths = {"npo", "reporterCompany", "reporterUser"})
    List<NpoReport> findAllByOrderByCreatedAtDesc();
}
