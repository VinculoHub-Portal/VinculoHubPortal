/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import java.util.List;

public record SampleDataDataset(
        List<SeedRow<UserSeedRow>> users,
        List<SeedRow<AddressSeedRow>> addresses,
        List<SeedRow<CompanySeedRow>> companies,
        List<SeedRow<NpoSeedRow>> npos,
        List<SeedRow<ProjectSeedRow>> projects,
        List<SeedRow<ProjectOdsSeedRow>> projectOds,
        List<SeedRow<CompanyProjectSeedRow>> companyProjects,
        List<SeedRow<NpoReportSeedRow>> npoReports) {

    public SampleDataDataset {
        users = List.copyOf(users);
        addresses = List.copyOf(addresses);
        companies = List.copyOf(companies);
        npos = List.copyOf(npos);
        projects = List.copyOf(projects);
        projectOds = List.copyOf(projectOds);
        companyProjects = List.copyOf(companyProjects);
        npoReports = List.copyOf(npoReports);
    }

    public int rowCount() {
        return users.size()
                + addresses.size()
                + companies.size()
                + npos.size()
                + projects.size()
                + projectOds.size()
                + companyProjects.size()
                + npoReports.size();
    }

    public String summary() {
        return ("users=%d addresses=%d companies=%d npos=%d projects=%d projectOds=%d "
                        + "companyProjects=%d npoReports=%d")
                .formatted(
                        users.size(),
                        addresses.size(),
                        companies.size(),
                        npos.size(),
                        projects.size(),
                        projectOds.size(),
                        companyProjects.size(),
                        npoReports.size());
    }
}
