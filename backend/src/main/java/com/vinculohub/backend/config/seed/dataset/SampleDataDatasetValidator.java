/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import com.vinculohub.backend.dto.NpoReportCreateRequest;
import com.vinculohub.backend.dto.ProjectCreateRequest;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.service.NpoEsgService;
import com.vinculohub.backend.utils.DocumentValidator;
import com.vinculohub.backend.utils.RelationshipLifecyclePolicy;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SampleDataDatasetValidator {

    private final NpoEsgService npoEsgService;
    private final Validator beanValidator;

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
        requireUniqueUserEmails(dataset.users());
        requireUniqueProfileUsers(dataset.companies(), dataset.npos());

        for (SeedRow<CompanySeedRow> row : dataset.companies()) {
            CompanySeedRow company = row.value();
            requireReference(row.source(), "user_key", company.userKey(), users);
            requireUserType(row.source(), company.userKey(), users, UserType.company);
            requireOptionalReference(row.source(), "address_key", company.addressKey(), addresses);
            validateCompanyDocument(row);
        }
        for (SeedRow<NpoSeedRow> row : dataset.npos()) {
            NpoSeedRow npo = row.value();
            requireReference(row.source(), "user_key", npo.userKey(), users);
            requireUserType(row.source(), npo.userKey(), users, UserType.npo);
            requireOptionalReference(row.source(), "address_key", npo.addressKey(), addresses);
            validateNpoDocument(row);
            validateNpoEsg(row);
        }
        requireUniqueDocuments(dataset.companies(), dataset.npos());
        Map<String, List<Integer>> odsIdsByProject = indexProjectOds(dataset.projectOds());
        for (SeedRow<ProjectSeedRow> row : dataset.projects()) {
            requireReference(row.source(), "npo_key", row.value().npoKey(), npos);
            validateProject(row, odsIdsByProject.getOrDefault(row.value().key(), List.of()));
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
            validateBean(
                    row.source(),
                    new NpoReportCreateRequest(report.reason()),
                    Map.of("reason", "reason"));
        }
    }

    private Map<String, List<Integer>> indexProjectOds(
            List<SeedRow<ProjectOdsSeedRow>> projectOds) {
        Map<String, List<Integer>> idsByProject = new LinkedHashMap<>();
        for (SeedRow<ProjectOdsSeedRow> seedRow : projectOds) {
            idsByProject
                    .computeIfAbsent(seedRow.value().projectKey(), ignored -> new ArrayList<>())
                    .add(seedRow.value().odsId());
        }
        return idsByProject;
    }

    private void requireUniqueUserEmails(List<SeedRow<UserSeedRow>> rows) {
        Map<String, SeedRowSource> sources = new HashMap<>();
        for (SeedRow<UserSeedRow> row : rows) {
            String normalized = row.value().email().toLowerCase(java.util.Locale.ROOT);
            SeedRowSource previous = sources.putIfAbsent(normalized, row.source());
            if (previous != null) {
                throw SeedDatasetException.at(
                        row.source().fileName(),
                        row.source().lineNumber(),
                        "email",
                        "duplicates email first declared at line " + previous.lineNumber());
            }
        }
    }

    private void requireUniqueProfileUsers(
            List<SeedRow<CompanySeedRow>> companies, List<SeedRow<NpoSeedRow>> npos) {
        requireUniqueReference(companies, row -> row.value().userKey(), "user_key", "company user");
        requireUniqueReference(npos, row -> row.value().userKey(), "user_key", "NPO user");
    }

    private <T> void requireUniqueReference(
            List<SeedRow<T>> rows,
            Function<SeedRow<T>, String> reference,
            String column,
            String description) {
        Map<String, SeedRowSource> sources = new HashMap<>();
        for (SeedRow<T> row : rows) {
            String key = reference.apply(row);
            SeedRowSource previous = sources.putIfAbsent(key, row.source());
            if (previous != null) {
                throw SeedDatasetException.at(
                        row.source().fileName(),
                        row.source().lineNumber(),
                        column,
                        "duplicates %s first declared at line %d"
                                .formatted(description, previous.lineNumber()));
            }
        }
    }

    private void requireUniqueDocuments(
            List<SeedRow<CompanySeedRow>> companies, List<SeedRow<NpoSeedRow>> npos) {
        Map<String, SeedRowSource> cnpjSources = new HashMap<>();
        Map<String, SeedRowSource> cpfSources = new HashMap<>();
        for (SeedRow<CompanySeedRow> row : companies) {
            registerDocument(cnpjSources, row.source(), "cnpj", row.value().cnpj());
        }
        for (SeedRow<NpoSeedRow> row : npos) {
            registerDocument(cnpjSources, row.source(), "cnpj", row.value().cnpj());
            registerDocument(cpfSources, row.source(), "cpf", row.value().cpf());
        }
    }

    private void registerDocument(
            Map<String, SeedRowSource> sources,
            SeedRowSource source,
            String column,
            String document) {
        String normalized = DocumentValidator.sanitize(document);
        if (normalized == null || normalized.isBlank()) {
            return;
        }
        SeedRowSource previous = sources.putIfAbsent(normalized, source);
        if (previous != null) {
            throw SeedDatasetException.at(
                    source.fileName(),
                    source.lineNumber(),
                    column,
                    "duplicates document first declared at %s:%d"
                            .formatted(previous.fileName(), previous.lineNumber()));
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
        String violation =
                RelationshipLifecyclePolicy.validate(
                        row.status(),
                        row.companyConfirmedAt(),
                        row.npoConfirmedAt(),
                        row.respondedAt());
        if (violation != null) {
            throw relationshipError(seedRow, violation);
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
        String cnpj = DocumentValidator.sanitize(row.value().cnpj());
        String cpf = DocumentValidator.sanitize(row.value().cpf());
        boolean hasCnpj = cnpj != null && !cnpj.isBlank();
        boolean hasCpf = cpf != null && !cpf.isBlank();
        if (!hasCnpj && !hasCpf) {
            throw SeedDatasetException.at(
                    row.source().fileName(),
                    row.source().lineNumber(),
                    "cnpj/cpf",
                    "at least one of cnpj or cpf must be provided");
        }
        if (hasCnpj && !DocumentValidator.isValidCnpj(cnpj)) {
            throw SeedDatasetException.at(
                    row.source().fileName(), row.source().lineNumber(), "cnpj", "is invalid");
        }
        if (hasCpf && !DocumentValidator.isValidCpf(cpf)) {
            throw SeedDatasetException.at(
                    row.source().fileName(), row.source().lineNumber(), "cpf", "is invalid");
        }
    }

    private void validateCompanyDocument(SeedRow<CompanySeedRow> row) {
        String cnpj = DocumentValidator.sanitize(row.value().cnpj());
        if (cnpj != null && !cnpj.isBlank() && !DocumentValidator.isValidCnpj(cnpj)) {
            throw SeedDatasetException.at(
                    row.source().fileName(), row.source().lineNumber(), "cnpj", "is invalid");
        }
    }

    private void validateNpoEsg(SeedRow<NpoSeedRow> row) {
        try {
            npoEsgService.validateEsgSelection(
                    row.value().environmental(), row.value().social(), row.value().governance());
        } catch (RuntimeException exception) {
            throw SeedDatasetException.at(
                    row.source().fileName(),
                    row.source().lineNumber(),
                    "environmental/social/governance",
                    exception.getMessage());
        }
    }

    private void validateProject(SeedRow<ProjectSeedRow> seedRow, List<Integer> odsIds) {
        ProjectSeedRow row = seedRow.value();
        ProjectCreateRequest request =
                ProjectCreateRequest.builder()
                        .title(row.title())
                        .description(row.description())
                        .budgetNeeded(row.budgetNeeded())
                        .startDate(row.startDate())
                        .endDate(row.endDate())
                        .odsIds(odsIds)
                        .type(row.type())
                        .focusArea(row.focusArea())
                        .fundraisingDeadline(row.fundraisingDeadline())
                        .beneficiariesCount(row.beneficiariesCount())
                        .location(row.location())
                        .mainObjective(row.mainObjective())
                        .progress(row.progress())
                        .build();
        validateBean(
                seedRow.source(),
                request,
                Map.of(
                        "title", "title",
                        "description", "description",
                        "budgetNeeded", "budget_needed",
                        "odsIds", "project_ods.csv",
                        "type", "type",
                        "mainObjective", "main_objective",
                        "progress", "progress"));
        requireNonNegative(seedRow, "invested_amount", row.investedAmount());
        if (row.beneficiariesCount() != null && row.beneficiariesCount() < 0) {
            throw SeedDatasetException.at(
                    seedRow.source().fileName(),
                    seedRow.source().lineNumber(),
                    "beneficiaries_count",
                    "must not be negative");
        }
        if (row.startDate() != null
                && row.endDate() != null
                && row.endDate().isBefore(row.startDate())) {
            throw SeedDatasetException.at(
                    seedRow.source().fileName(),
                    seedRow.source().lineNumber(),
                    "end_date",
                    "must not precede start_date");
        }
        requireMaxLength(seedRow, "focus_area", row.focusArea(), 50);
        requireMaxLength(seedRow, "fundraising_deadline", row.fundraisingDeadline(), 50);
        requireMaxLength(seedRow, "location", row.location(), 255);
    }

    private void requireNonNegative(SeedRow<ProjectSeedRow> row, String column, BigDecimal value) {
        if (value != null && value.compareTo(BigDecimal.ZERO) < 0) {
            throw SeedDatasetException.at(
                    row.source().fileName(),
                    row.source().lineNumber(),
                    column,
                    "must not be negative");
        }
    }

    private void requireMaxLength(
            SeedRow<ProjectSeedRow> row, String column, String value, int maxLength) {
        if (value != null && value.length() > maxLength) {
            throw SeedDatasetException.at(
                    row.source().fileName(),
                    row.source().lineNumber(),
                    column,
                    "must contain at most %d characters".formatted(maxLength));
        }
    }

    private void validateBean(
            SeedRowSource source, Object value, Map<String, String> columnsByProperty) {
        Set<ConstraintViolation<Object>> violations = beanValidator.validate(value);
        if (violations.isEmpty()) {
            return;
        }
        ConstraintViolation<Object> violation =
                violations.stream()
                        .sorted(
                                (left, right) ->
                                        left.getPropertyPath()
                                                .toString()
                                                .compareTo(right.getPropertyPath().toString()))
                        .findFirst()
                        .orElseThrow();
        String property = violation.getPropertyPath().toString();
        throw SeedDatasetException.at(
                source.fileName(),
                source.lineNumber(),
                columnsByProperty.getOrDefault(property, property),
                violation.getMessage());
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
