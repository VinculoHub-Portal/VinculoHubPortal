/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import java.util.List;

public enum SampleDataCsvFile {
    USERS("users.csv", "key", "name", "email", "user_type"),
    ADDRESSES(
            "addresses.csv",
            "key",
            "state",
            "state_code",
            "city",
            "street",
            "number",
            "complement",
            "zip_code"),
    COMPANIES(
            "companies.csv",
            "key",
            "user_key",
            "address_key",
            "legal_name",
            "social_name",
            "description",
            "logo_url",
            "cnpj",
            "phone"),
    NPOS(
            "npos.csv",
            "key",
            "user_key",
            "address_key",
            "name",
            "description",
            "logo_url",
            "npo_size",
            "cnpj",
            "cpf",
            "phone",
            "environmental",
            "social",
            "governance"),
    PROJECTS(
            "projects.csv",
            "key",
            "npo_key",
            "title",
            "description",
            "status",
            "type",
            "budget_needed",
            "invested_amount",
            "start_date",
            "end_date",
            "focus_area",
            "fundraising_deadline",
            "beneficiaries_count",
            "location",
            "main_objective",
            "progress"),
    PROJECT_ODS("project_ods.csv", "project_key", "ods_id"),
    COMPANY_PROJECTS(
            "company_projects.csv",
            "company_key",
            "project_key",
            "status",
            "initiator_type",
            "company_confirmed_at",
            "npo_confirmed_at",
            "responded_at",
            "expires_at"),
    NPO_REPORTS(
            "npo_reports.csv",
            "key",
            "npo_key",
            "reporter_company_key",
            "reporter_user_key",
            "reason",
            "status");

    private final String fileName;
    private final List<String> headers;

    SampleDataCsvFile(String fileName, String... headers) {
        this.fileName = fileName;
        this.headers = List.of(headers);
    }

    public String fileName() {
        return fileName;
    }

    public List<String> headers() {
        return headers;
    }
}
