/* (C)2026 */
package com.vinculohub.backend.config.seed.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.vinculohub.backend.config.seed.auth0.ResolvedAuth0Users;
import com.vinculohub.backend.config.seed.dataset.AddressSeedRow;
import com.vinculohub.backend.config.seed.dataset.NpoSeedRow;
import com.vinculohub.backend.config.seed.dataset.ProjectOdsSeedRow;
import com.vinculohub.backend.config.seed.dataset.ProjectSeedRow;
import com.vinculohub.backend.config.seed.dataset.SampleDataDataset;
import com.vinculohub.backend.config.seed.dataset.SeedRow;
import com.vinculohub.backend.config.seed.dataset.SeedRowSource;
import com.vinculohub.backend.config.seed.dataset.UserSeedRow;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Ods;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.AddressRepository;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import com.vinculohub.backend.service.OdsService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class CoreSampleDataPersisterTest {

    @Test
    void persistsCoreEntitiesAndTranslatesLogicalReferences() {
        UserRepository users = mock(UserRepository.class);
        AddressRepository addresses = mock(AddressRepository.class);
        CompanyRepository companies = mock(CompanyRepository.class);
        NpoRepository npos = mock(NpoRepository.class);
        ProjectRepository projects = mock(ProjectRepository.class);
        OdsService ods = mock(OdsService.class);
        assignIds(users, addresses, companies, npos, projects);
        when(ods.resolveSelection(List.of("1")))
                .thenReturn(java.util.Set.of(new Ods(1, "ODS 1", "Description")));

        PersistedSampleData persisted =
                new CoreSampleDataPersister(users, addresses, companies, npos, projects, ods)
                        .persist(
                                dataset(), new ResolvedAuth0Users(Map.of("npo_user", "auth0|npo")));

        User user = persisted.users().get("npo_user");
        Address address = persisted.addresses().get("npo_address");
        Npo npo = persisted.npos().get("npo_one");
        Project project = persisted.projects().get("project_one");

        assertThat(user.getId()).isEqualTo(10);
        assertThat(user.getAuth0Id()).isEqualTo("auth0|npo");
        assertThat(npo.getUserId()).isEqualTo(user.getId());
        assertThat(npo.getNpoUser()).isSameAs(user);
        assertThat(npo.getAddress()).isSameAs(address);
        assertThat(npo.getCnpj()).isEqualTo("11222333000181");
        assertThat(project.getNpo()).isSameAs(npo);
        assertThat(project.getProgress()).isEqualTo(45);
        assertThat(project.getOds()).extracting(Ods::getId).containsExactly(1);
    }

    private void assignIds(
            UserRepository users,
            AddressRepository addresses,
            CompanyRepository companies,
            NpoRepository npos,
            ProjectRepository projects) {
        when(users.save(any(User.class)))
                .thenAnswer(
                        invocation -> {
                            User user = invocation.getArgument(0);
                            user.setId(10);
                            return user;
                        });
        when(addresses.save(any(Address.class)))
                .thenAnswer(
                        invocation -> {
                            Address address = invocation.getArgument(0);
                            address.setId(20);
                            return address;
                        });
        when(companies.save(any(Company.class)))
                .thenAnswer(
                        invocation -> {
                            Company company = invocation.getArgument(0);
                            company.setId(30);
                            return company;
                        });
        when(npos.save(any(Npo.class)))
                .thenAnswer(
                        invocation -> {
                            Npo npo = invocation.getArgument(0);
                            npo.setId(40);
                            return npo;
                        });
        when(projects.save(any(Project.class)))
                .thenAnswer(
                        invocation -> {
                            Project project = invocation.getArgument(0);
                            project.setId(50L);
                            return project;
                        });
    }

    private SampleDataDataset dataset() {
        SeedRowSource source = new SeedRowSource("seed.csv", 2);
        return new SampleDataDataset(
                List.of(
                        new SeedRow<>(
                                source,
                                new UserSeedRow(
                                        "npo_user", "NPO User", "npo@example.test", UserType.npo))),
                List.of(
                        new SeedRow<>(
                                source,
                                new AddressSeedRow(
                                        "npo_address",
                                        "Rio Grande do Sul",
                                        "RS",
                                        "Porto Alegre",
                                        "Rua A",
                                        "10",
                                        null,
                                        "90000-000"))),
                List.of(),
                List.of(
                        new SeedRow<>(
                                source,
                                new NpoSeedRow(
                                        "npo_one",
                                        "npo_user",
                                        "npo_address",
                                        "NPO One",
                                        "Description",
                                        null,
                                        NpoSize.small,
                                        "11.222.333/0001-81",
                                        null,
                                        null,
                                        true,
                                        true,
                                        false))),
                List.of(
                        new SeedRow<>(
                                source,
                                new ProjectSeedRow(
                                        "project_one",
                                        "npo_one",
                                        "Project One",
                                        "Description",
                                        ProjectStatus.ACTIVE,
                                        ProjectType.SOCIAL,
                                        new BigDecimal("1000.00"),
                                        new BigDecimal("250.00"),
                                        LocalDate.of(2026, 1, 1),
                                        LocalDate.of(2026, 12, 31),
                                        "Education",
                                        "2026-06",
                                        100,
                                        "Porto Alegre",
                                        "Main objective",
                                        45))),
                List.of(new SeedRow<>(source, new ProjectOdsSeedRow("project_one", 1))),
                List.of(),
                List.of());
    }
}
