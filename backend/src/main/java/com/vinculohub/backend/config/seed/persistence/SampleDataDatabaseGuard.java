/* (C)2026 */
package com.vinculohub.backend.config.seed.persistence;

import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedException;
import com.vinculohub.backend.repository.AddressRepository;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.DocumentRepository;
import com.vinculohub.backend.repository.EditalRepository;
import com.vinculohub.backend.repository.NpoReportRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SampleDataDatabaseGuard {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CompanyRepository companyRepository;
    private final NpoRepository npoRepository;
    private final ProjectRepository projectRepository;
    private final CompanyProjectRepository companyProjectRepository;
    private final NpoReportRepository npoReportRepository;
    private final DocumentRepository documentRepository;
    private final EditalRepository editalRepository;

    public void requireEmptyFunctionalDatabase() {
        Map<String, Long> populatedTables = new LinkedHashMap<>();
        addIfPopulated(populatedTables, "users", userRepository.count());
        addIfPopulated(populatedTables, "address", addressRepository.count());
        addIfPopulated(populatedTables, "company", companyRepository.count());
        addIfPopulated(populatedTables, "npo", npoRepository.count());
        addIfPopulated(populatedTables, "project", projectRepository.count());
        addIfPopulated(populatedTables, "company_project", companyProjectRepository.count());
        addIfPopulated(populatedTables, "npo_report", npoReportRepository.count());
        addIfPopulated(populatedTables, "document", documentRepository.count());
        addIfPopulated(populatedTables, "edital", editalRepository.count());

        if (!populatedTables.isEmpty()) {
            throw new SampleDataSeedException(
                    "Sample data seed requires an empty functional database; populated tables: "
                            + populatedTables);
        }
    }

    private void addIfPopulated(Map<String, Long> populatedTables, String table, long count) {
        if (count > 0) {
            populatedTables.put(table, count);
        }
    }
}
