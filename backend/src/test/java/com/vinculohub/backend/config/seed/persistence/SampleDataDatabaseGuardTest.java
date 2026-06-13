/* (C)2026 */
package com.vinculohub.backend.config.seed.persistence;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class SampleDataDatabaseGuardTest {

    private UserRepository users;
    private AddressRepository addresses;
    private CompanyRepository companies;
    private NpoRepository npos;
    private ProjectRepository projects;
    private CompanyProjectRepository companyProjects;
    private NpoReportRepository reports;
    private DocumentRepository documents;
    private EditalRepository editals;
    private SampleDataDatabaseGuard guard;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        addresses = mock(AddressRepository.class);
        companies = mock(CompanyRepository.class);
        npos = mock(NpoRepository.class);
        projects = mock(ProjectRepository.class);
        companyProjects = mock(CompanyProjectRepository.class);
        reports = mock(NpoReportRepository.class);
        documents = mock(DocumentRepository.class);
        editals = mock(EditalRepository.class);
        guard =
                new SampleDataDatabaseGuard(
                        users,
                        addresses,
                        companies,
                        npos,
                        projects,
                        companyProjects,
                        reports,
                        documents,
                        editals);
    }

    @Test
    void acceptsEmptyFunctionalDatabase() {
        assertThatCode(guard::requireEmptyFunctionalDatabase).doesNotThrowAnyException();
    }

    @Test
    void rejectsDatabaseWithExistingFunctionalData() {
        when(users.count()).thenReturn(2L);
        when(projects.count()).thenReturn(3L);

        assertThatThrownBy(guard::requireEmptyFunctionalDatabase)
                .isInstanceOf(SampleDataSeedException.class)
                .hasMessageContaining("users=2")
                .hasMessageContaining("project=3");
    }
}
