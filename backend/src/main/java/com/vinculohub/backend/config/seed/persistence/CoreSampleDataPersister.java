/* (C)2026 */
package com.vinculohub.backend.config.seed.persistence;

import com.vinculohub.backend.config.seed.auth0.ResolvedAuth0Users;
import com.vinculohub.backend.config.seed.dataset.AddressSeedRow;
import com.vinculohub.backend.config.seed.dataset.CompanySeedRow;
import com.vinculohub.backend.config.seed.dataset.NpoSeedRow;
import com.vinculohub.backend.config.seed.dataset.ProjectOdsSeedRow;
import com.vinculohub.backend.config.seed.dataset.ProjectSeedRow;
import com.vinculohub.backend.config.seed.dataset.SampleDataDataset;
import com.vinculohub.backend.config.seed.dataset.SeedRow;
import com.vinculohub.backend.config.seed.dataset.UserSeedRow;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedException;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Ods;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.repository.AddressRepository;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.OdsRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CoreSampleDataPersister {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CompanyRepository companyRepository;
    private final NpoRepository npoRepository;
    private final ProjectRepository projectRepository;
    private final OdsRepository odsRepository;

    public PersistedSampleData persist(
            SampleDataDataset dataset, ResolvedAuth0Users resolvedAuth0Users) {
        Map<String, Address> addresses = persistAddresses(dataset.addresses());
        Map<String, User> users = persistUsers(dataset.users(), resolvedAuth0Users);
        Map<String, Company> companies = persistCompanies(dataset.companies(), users, addresses);
        Map<String, Npo> npos = persistNpos(dataset.npos(), users, addresses);
        Map<String, Project> projects =
                persistProjects(dataset.projects(), dataset.projectOds(), npos);
        return new PersistedSampleData(users, addresses, companies, npos, projects);
    }

    private Map<String, Address> persistAddresses(List<SeedRow<AddressSeedRow>> rows) {
        Map<String, Address> addresses = new LinkedHashMap<>();
        for (SeedRow<AddressSeedRow> seedRow : rows) {
            AddressSeedRow row = seedRow.value();
            Address address =
                    Address.builder()
                            .state(row.state())
                            .stateCode(row.stateCode())
                            .city(row.city())
                            .street(row.street())
                            .number(row.number())
                            .complement(row.complement())
                            .zipCode(row.zipCode())
                            .build();
            addresses.put(row.key(), addressRepository.save(address));
        }
        return addresses;
    }

    private Map<String, User> persistUsers(
            List<SeedRow<UserSeedRow>> rows, ResolvedAuth0Users resolvedAuth0Users) {
        Map<String, User> users = new LinkedHashMap<>();
        for (SeedRow<UserSeedRow> seedRow : rows) {
            UserSeedRow row = seedRow.value();
            User user =
                    User.builder()
                            .name(row.name())
                            .email(row.email())
                            .auth0Id(resolvedAuth0Users.auth0IdFor(row.key()))
                            .userType(row.userType())
                            .build();
            users.put(row.key(), userRepository.save(user));
        }
        return users;
    }

    private Map<String, Company> persistCompanies(
            List<SeedRow<CompanySeedRow>> rows,
            Map<String, User> users,
            Map<String, Address> addresses) {
        Map<String, Company> companies = new LinkedHashMap<>();
        for (SeedRow<CompanySeedRow> seedRow : rows) {
            CompanySeedRow row = seedRow.value();
            Company company = new Company();
            company.setUser(required(users, row.userKey(), "user"));
            company.setAddress(optional(addresses, row.addressKey()));
            company.setLegalName(row.legalName());
            company.setSocialName(row.socialName());
            company.setDescription(row.description());
            company.setLogoUrl(row.logoUrl());
            company.setCnpj(row.cnpj());
            company.setPhone(row.phone());
            companies.put(row.key(), companyRepository.save(company));
        }
        return companies;
    }

    private Map<String, Npo> persistNpos(
            List<SeedRow<NpoSeedRow>> rows,
            Map<String, User> users,
            Map<String, Address> addresses) {
        Map<String, Npo> npos = new LinkedHashMap<>();
        for (SeedRow<NpoSeedRow> seedRow : rows) {
            NpoSeedRow row = seedRow.value();
            User user = required(users, row.userKey(), "user");
            Npo npo =
                    Npo.builder()
                            .name(row.name())
                            .userId(user.getId())
                            .npoUser(user)
                            .description(row.description())
                            .logoUrl(row.logoUrl())
                            .npoSize(row.npoSize())
                            .cnpj(row.cnpj())
                            .cpf(row.cpf())
                            .phone(row.phone())
                            .address(optional(addresses, row.addressKey()))
                            .environmental(row.environmental())
                            .social(row.social())
                            .governance(row.governance())
                            .build();
            npos.put(row.key(), npoRepository.save(npo));
        }
        return npos;
    }

    private Map<String, Project> persistProjects(
            List<SeedRow<ProjectSeedRow>> rows,
            List<SeedRow<ProjectOdsSeedRow>> odsRows,
            Map<String, Npo> npos) {
        Map<String, Set<Integer>> odsIdsByProject = indexOdsIds(odsRows);
        Map<Integer, Ods> odsById = loadOds(odsIdsByProject);
        Map<String, Project> projects = new LinkedHashMap<>();
        for (SeedRow<ProjectSeedRow> seedRow : rows) {
            ProjectSeedRow row = seedRow.value();
            Set<Ods> projectOds = new LinkedHashSet<>();
            for (Integer odsId : odsIdsByProject.getOrDefault(row.key(), Set.of())) {
                projectOds.add(required(odsById, odsId, "ODS"));
            }
            Project project =
                    Project.builder()
                            .npo(required(npos, row.npoKey(), "NPO"))
                            .title(row.title())
                            .description(row.description())
                            .status(row.status())
                            .type(row.type())
                            .budgetNeeded(row.budgetNeeded())
                            .investedAmount(row.investedAmount())
                            .ods(projectOds)
                            .startDate(row.startDate())
                            .endDate(row.endDate())
                            .focusArea(row.focusArea())
                            .fundraisingDeadline(row.fundraisingDeadline())
                            .beneficiariesCount(row.beneficiariesCount())
                            .location(row.location())
                            .mainObjective(row.mainObjective())
                            .progress(row.progress())
                            .build();
            projects.put(row.key(), projectRepository.save(project));
        }
        return projects;
    }

    private Map<String, Set<Integer>> indexOdsIds(List<SeedRow<ProjectOdsSeedRow>> rows) {
        Map<String, Set<Integer>> odsIdsByProject = new LinkedHashMap<>();
        for (SeedRow<ProjectOdsSeedRow> seedRow : rows) {
            ProjectOdsSeedRow row = seedRow.value();
            odsIdsByProject
                    .computeIfAbsent(row.projectKey(), ignored -> new LinkedHashSet<>())
                    .add(row.odsId());
        }
        return odsIdsByProject;
    }

    private Map<Integer, Ods> loadOds(Map<String, Set<Integer>> odsIdsByProject) {
        Set<Integer> ids = new LinkedHashSet<>();
        odsIdsByProject.values().forEach(ids::addAll);
        Map<Integer, Ods> odsById = new LinkedHashMap<>();
        odsRepository.findAllById(ids).forEach(ods -> odsById.put(ods.getId(), ods));
        if (odsById.size() != ids.size()) {
            Set<Integer> missing = new LinkedHashSet<>(ids);
            missing.removeAll(odsById.keySet());
            throw new SampleDataSeedException(
                    "ODS records are missing from the database: " + missing);
        }
        return odsById;
    }

    private <K, V> V required(Map<K, V> values, K key, String entityName) {
        V value = values.get(key);
        if (value == null) {
            throw new SampleDataSeedException(
                    "%s was not persisted for logical key '%s'".formatted(entityName, key));
        }
        return value;
    }

    private <K, V> V optional(Map<K, V> values, K key) {
        return key == null ? null : values.get(key);
    }
}
