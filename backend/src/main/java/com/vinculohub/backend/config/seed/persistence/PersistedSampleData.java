/* (C)2026 */
package com.vinculohub.backend.config.seed.persistence;

import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import java.util.Map;

public record PersistedSampleData(
        Map<String, User> users,
        Map<String, Address> addresses,
        Map<String, Company> companies,
        Map<String, Npo> npos,
        Map<String, Project> projects) {

    public PersistedSampleData {
        users = Map.copyOf(users);
        addresses = Map.copyOf(addresses);
        companies = Map.copyOf(companies);
        npos = Map.copyOf(npos);
        projects = Map.copyOf(projects);
    }
}
