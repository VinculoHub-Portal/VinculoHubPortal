/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import com.vinculohub.backend.model.enums.RelationshipStatus;
import com.vinculohub.backend.model.enums.UserType;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import org.springframework.stereotype.Component;

@Component
public class SampleDataDatasetValidator {

    public void validate(SampleDataDataset dataset) {
        if (dataset.rowCount() == 0) {
            throw new SeedDatasetException(
                    "Sample data seed is enabled, but every CSV file contains only its header.");
        }

        Map<String, SeedRow<UserSeedRow>> users = unique(dataset.users(), row -> row.value().key());
        Map<String, SeedRow<AddressSeedRow>> addresses =
                unique(dataset.addresses(), row -> row.value().key());
        Map<String, SeedRow<CompanySeedRow>> companies =
                unique(dataset.companies(), row -> row.value().key());
        Map<String, SeedRow<NpoSeedRow>> npos = unique(dataset.npos(), row -> row.value().key());
        Map<String, SeedRow<ProjectSeedRow>> projects =
                unique(dataset.projects(), row -> row.value().key());
        unique(dataset.npoReports(), row -> row.value().key());

        for (SeedRow<CompanySeedRow> row : dataset.companies()) {
            CompanySeedRow company = row.value();
            requireReference(row.source(), "user_key", company.userKey(), users);
            requireUserType(row.source(), company.userKey(), users, UserType.company);
            requireOptionalReference(row.source(), "address_key", company.addressKey(), addresses);
        }
        for (SeedRow<NpoSeedRow> row : dataset.npos()) {
            NpoSeedRow npo = row.value();
            requireReference(row.source(), "user_key", npo.userKey(), users);
            requireUserType(row.source(), npo.userKey(), users, UserType.npo);
            requireOptionalReference(row.source(), "address_key", npo.addressKey(), addresses);
            validateNpoDocument(row);
        }
        for (SeedRow<ProjectSeedRow> row : dataset.projects()) {
            requireReference(row.source(), "npo_key", row.value().npoKey(), npos);
            int progress = row.value().progress();
            if (progress < 0 || progress > 100) {
                throw SeedDatasetException.at(
                        row.source().fileName(),
                        row.source().lineNumber(),
                        "progress",
                        "must be between 0 and 100");
            }
        }
        for (SeedRow<ProjectOdsSeedRow> row : dataset.projectOds()) {
            requireReference(row.source(), "project_key", row.value().projectKey(), projects);
            if (row.value().odsId() < 1 || row.value().odsId() > 17) {
                throw SeedDatasetException.at(
                        row.source().fileName(),
                        row.source().lineNumber(),
                        "ods_id",
                        "must be between 1 and 17");
            }
        }
        requireUniqueProjectOds(dataset.projectOds());
        for (SeedRow<CompanyProjectSeedRow> row : dataset.companyProjects()) {
            requireReference(row.source(), "company_key", row.value().companyKey(), companies);
            requireReference(row.source(), "project_key", row.value().projectKey(), projects);
            validateRelationshipLifecycle(row);
        }
        requireUniqueCompanyProjects(dataset.companyProjects());
        for (SeedRow<NpoReportSeedRow> row : dataset.npoReports()) {
            NpoReportSeedRow report = row.value();
            requireReference(row.source(), "npo_key", report.npoKey(), npos);
            requireReference(
                    row.source(), "reporter_company_key", report.reporterCompanyKey(), companies);
            requireReference(row.source(), "reporter_user_key", report.reporterUserKey(), users);
            CompanySeedRow reporterCompany = companies.get(report.reporterCompanyKey()).value();
            if (!reporterCompany.userKey().equals(report.reporterUserKey())) {
                throw SeedDatasetException.at(
                        row.source().fileName(),
                        row.source().lineNumber(),
                        "reporter_user_key",
                        "must reference the user owned by reporter_company_key");
            }
        }
    }

    private void requireUniqueProjectOds(List<SeedRow<ProjectOdsSeedRow>> rows) {
        Set<String> pairs = new HashSet<>();
        for (SeedRow<ProjectOdsSeedRow> row : rows) {
            String pair = row.value().projectKey() + ":" + row.value().odsId();
            if (!pairs.add(pair)) {
                throw SeedDatasetException.at(
                        row.source().fileName(),
                        row.source().lineNumber(),
                        "project_key/ods_id",
                        "duplicates project and ODS pair '%s'".formatted(pair));
            }
        }
    }

    private void requireUniqueCompanyProjects(List<SeedRow<CompanyProjectSeedRow>> rows) {
        Set<String> pairs = new HashSet<>();
        for (SeedRow<CompanyProjectSeedRow> row : rows) {
            String pair = row.value().companyKey() + ":" + row.value().projectKey();
            if (!pairs.add(pair)) {
                throw SeedDatasetException.at(
                        row.source().fileName(),
                        row.source().lineNumber(),
                        "company_key/project_key",
                        "duplicates company and project pair '%s'".formatted(pair));
            }
        }
    }

    private void validateRelationshipLifecycle(SeedRow<CompanyProjectSeedRow> seedRow) {
        CompanyProjectSeedRow row = seedRow.value();
        boolean responded = row.respondedAt() != null;
        boolean companyConfirmed = row.companyConfirmedAt() != null;
        boolean npoConfirmed = row.npoConfirmedAt() != null;
        boolean bothConfirmed = companyConfirmed && npoConfirmed;

        if (row.status() == RelationshipStatus.pending
                && (responded || companyConfirmed || npoConfirmed)) {
            throw relationshipError(
                    seedRow, "pending relationship cannot be answered or confirmed");
        }
        if (row.status() == RelationshipStatus.inactive
                && (!responded || companyConfirmed || npoConfirmed)) {
            throw relationshipError(
                    seedRow, "inactive relationship must be answered and cannot be confirmed");
        }
        if (row.status() == RelationshipStatus.negotiation && (!responded || bothConfirmed)) {
            throw relationshipError(
                    seedRow,
                    "negotiation relationship must be answered and cannot have both confirmations");
        }
        if (row.status() == RelationshipStatus.active && (!responded || !bothConfirmed)) {
            throw relationshipError(
                    seedRow, "active relationship must be answered and confirmed by both sides");
        }
    }

    private SeedDatasetException relationshipError(
            SeedRow<CompanyProjectSeedRow> row, String message) {
        return SeedDatasetException.at(
                row.source().fileName(), row.source().lineNumber(), "status", message);
    }

    private <T> Map<String, SeedRow<T>> unique(
            List<SeedRow<T>> rows, Function<SeedRow<T>, String> keyExtractor) {
        Map<String, SeedRow<T>> indexed = new HashMap<>();
        for (SeedRow<T> row : rows) {
            String key = keyExtractor.apply(row);
            SeedRow<T> previous = indexed.putIfAbsent(key, row);
            if (previous != null) {
                throw SeedDatasetException.at(
                        row.source().fileName(),
                        row.source().lineNumber(),
                        "key",
                        "duplicates logical key '%s' first declared at line %d"
                                .formatted(key, previous.source().lineNumber()));
            }
        }
        return indexed;
    }

    private void requireUserType(
            SeedRowSource source,
            String userKey,
            Map<String, SeedRow<UserSeedRow>> users,
            UserType expectedType) {
        UserType actualType = users.get(userKey).value().userType();
        if (actualType != expectedType) {
            throw SeedDatasetException.at(
                    source.fileName(),
                    source.lineNumber(),
                    "user_key",
                    "references user '%s' with type %s; expected %s"
                            .formatted(userKey, actualType, expectedType));
        }
    }

    private void validateNpoDocument(SeedRow<NpoSeedRow> row) {
        boolean hasCnpj = row.value().cnpj() != null;
        boolean hasCpf = row.value().cpf() != null;
        if (hasCnpj == hasCpf) {
            throw SeedDatasetException.at(
                    row.source().fileName(),
                    row.source().lineNumber(),
                    "cnpj/cpf",
                    "exactly one of cnpj or cpf must be provided");
        }
    }

    private <T> void requireOptionalReference(
            SeedRowSource source, String column, String key, Map<String, SeedRow<T>> targets) {
        if (key != null) {
            requireReference(source, column, key, targets);
        }
    }

    private <T> void requireReference(
            SeedRowSource source, String column, String key, Map<String, SeedRow<T>> targets) {
        if (!targets.containsKey(key)) {
            throw SeedDatasetException.at(
                    source.fileName(),
                    source.lineNumber(),
                    column,
                    "references unknown logical key '%s'".formatted(key));
        }
    }
}
