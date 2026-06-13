/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

class SampleDataContractTest {

    private static final String BASE_PATH = "db/sample-data/default/";

    @Test
    void defaultDatasetContainsOnlyTheExpectedHeaders() throws IOException {
        Map<String, String> expectedHeaders = new LinkedHashMap<>();
        expectedHeaders.put("users.csv", "key,name,email,user_type");
        expectedHeaders.put(
                "addresses.csv", "key,state,state_code,city,street,number,complement,zip_code");
        expectedHeaders.put(
                "companies.csv",
                "key,user_key,address_key,legal_name,social_name,description,logo_url,cnpj,phone");
        expectedHeaders.put(
                "npos.csv",
                "key,user_key,address_key,name,description,logo_url,npo_size,cnpj,cpf,phone,"
                        + "environmental,social,governance");
        expectedHeaders.put(
                "projects.csv",
                "key,npo_key,title,description,status,type,budget_needed,invested_amount,start_date,"
                    + "end_date,focus_area,fundraising_deadline,beneficiaries_count,location,"
                    + "main_objective,progress");
        expectedHeaders.put("project_ods.csv", "project_key,ods_id");
        expectedHeaders.put(
                "company_projects.csv",
                "company_key,project_key,status,initiator_type,company_confirmed_at,"
                        + "npo_confirmed_at,responded_at,expires_at");
        expectedHeaders.put(
                "npo_reports.csv",
                "key,npo_key,reporter_company_key,reporter_user_key,reason,status");

        for (Map.Entry<String, String> entry : expectedHeaders.entrySet()) {
            try (BufferedReader reader = open(entry.getKey())) {
                assertThat(reader.readLine()).isEqualTo(entry.getValue());
                assertThat(reader.readLine()).isNull();
            }
        }
    }

    private BufferedReader open(String fileName) {
        InputStream stream =
                Thread.currentThread()
                        .getContextClassLoader()
                        .getResourceAsStream(BASE_PATH + fileName);
        assertThat(stream).as("resource %s", fileName).isNotNull();
        return new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8));
    }
}
