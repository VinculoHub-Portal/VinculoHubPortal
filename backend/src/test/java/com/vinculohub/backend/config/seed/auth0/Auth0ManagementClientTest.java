/* (C)2026 */
package com.vinculohub.backend.config.seed.auth0;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.vinculohub.backend.config.seed.dataset.SeedRow;
import com.vinculohub.backend.config.seed.dataset.SeedRowSource;
import com.vinculohub.backend.config.seed.dataset.UserSeedRow;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedException;
import com.vinculohub.backend.model.enums.UserType;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class Auth0ManagementClientTest {

    private MockRestServiceServer server;
    private Auth0ManagementClient client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        client =
                new Auth0ManagementClient(
                        builder,
                        new Auth0ManagementProperties(
                                "https://tenant.example.test", "client-id", "client-secret"));
    }

    @Test
    void resolvesExistingAuth0UserByExactEmail() {
        expectToken();
        server.expect(
                        once(),
                        requestTo(
                                "https://tenant.example.test/api/v2/users-by-email"
                                        + "?email=company@example.test"))
                .andExpect(method(GET))
                .andExpect(header("Authorization", "Bearer management-token"))
                .andRespond(
                        withSuccess(
                                """
                                [{
                                  "user_id": "auth0|company",
                                  "email": "company@example.test"
                                }]
                                """,
                                MediaType.APPLICATION_JSON));

        ResolvedAuth0Users resolved = client.resolveExistingUsers(List.of(user("company_user")));

        assertThat(resolved.auth0IdFor("company_user")).isEqualTo("auth0|company");
        server.verify();
    }

    @Test
    void requestsOneTokenForAllSeedUsers() {
        expectToken();
        expectUser("first@example.test", "auth0|first");
        expectUser("second@example.test", "auth0|second");

        ResolvedAuth0Users resolved =
                client.resolveExistingUsers(
                        List.of(
                                user("first", "first@example.test"),
                                user("second", "second@example.test")));

        assertThat(resolved.auth0IdByUserKey())
                .containsEntry("first", "auth0|first")
                .containsEntry("second", "auth0|second");
        server.verify();
    }

    @Test
    void rejectsMissingAuth0Account() {
        expectToken();
        server.expect(
                        requestTo(
                                "https://tenant.example.test/api/v2/users-by-email"
                                        + "?email=company@example.test"))
                .andRespond(withSuccess("[]", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.resolveExistingUsers(List.of(user("company_user"))))
                .isInstanceOf(SampleDataSeedException.class)
                .hasMessageContaining("No Auth0 account found")
                .hasMessageContaining("company_user");
    }

    @Test
    void rejectsAmbiguousAuth0Account() {
        expectToken();
        server.expect(
                        requestTo(
                                "https://tenant.example.test/api/v2/users-by-email"
                                        + "?email=company@example.test"))
                .andRespond(
                        withSuccess(
                                """
                                [
                                  {"user_id":"auth0|one","email":"company@example.test"},
                                  {"user_id":"auth0|two","email":"company@example.test"}
                                ]
                                """,
                                MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.resolveExistingUsers(List.of(user("company_user"))))
                .isInstanceOf(SampleDataSeedException.class)
                .hasMessageContaining("Multiple Auth0 accounts found");
    }

    @Test
    void rejectsMissingCredentialsWhenSeedClientIsCreated() {
        assertThatThrownBy(
                        () ->
                                new Auth0ManagementClient(
                                        RestClient.builder(),
                                        new Auth0ManagementProperties(
                                                "tenant.example.test", "", "secret")))
                .isInstanceOf(SampleDataSeedException.class)
                .hasMessageContaining("APP_SAMPLE_DATA_AUTH0_CLIENT_ID");
    }

    private void expectToken() {
        server.expect(once(), requestTo("https://tenant.example.test/oauth/token"))
                .andExpect(method(POST))
                .andExpect(jsonPath("$.client_id").value("client-id"))
                .andExpect(jsonPath("$.client_secret").value("client-secret"))
                .andExpect(jsonPath("$.audience").value("https://tenant.example.test/api/v2/"))
                .andExpect(jsonPath("$.grant_type").value("client_credentials"))
                .andRespond(
                        withSuccess(
                                "{\"access_token\":\"management-token\"}",
                                MediaType.APPLICATION_JSON));
    }

    private void expectUser(String email, String auth0Id) {
        server.expect(requestTo("https://tenant.example.test/api/v2/users-by-email?email=" + email))
                .andRespond(
                        withSuccess(
                                "[{\"user_id\":\"%s\",\"email\":\"%s\"}]".formatted(auth0Id, email),
                                MediaType.APPLICATION_JSON));
    }

    private SeedRow<UserSeedRow> user(String key) {
        return user(key, "company@example.test");
    }

    private SeedRow<UserSeedRow> user(String key, String email) {
        return new SeedRow<>(
                new SeedRowSource("users.csv", 2),
                new UserSeedRow(key, "Seed User", email, UserType.company));
    }
}
