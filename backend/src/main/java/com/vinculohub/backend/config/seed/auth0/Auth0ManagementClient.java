/* (C)2026 */
package com.vinculohub.backend.config.seed.auth0;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.vinculohub.backend.config.seed.dataset.SeedRow;
import com.vinculohub.backend.config.seed.dataset.UserSeedRow;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@Slf4j
@ConditionalOnProperty(name = "app.sample-data.enabled", havingValue = "true")
public class Auth0ManagementClient {

    private static final String CLIENT_CREDENTIALS = "client_credentials";

    private final RestClient restClient;
    private final String audience;
    private final String clientId;
    private final String clientSecret;

    public Auth0ManagementClient(
            RestClient.Builder restClientBuilder, Auth0ManagementProperties properties) {
        String domain = normalizedDomain(properties.domain());
        this.restClient = restClientBuilder.baseUrl(domain).build();
        this.audience = domain + "/api/v2/";
        this.clientId = required(properties.clientId(), "APP_SAMPLE_DATA_AUTH0_CLIENT_ID");
        this.clientSecret =
                required(properties.clientSecret(), "APP_SAMPLE_DATA_AUTH0_CLIENT_SECRET");
    }

    public ResolvedAuth0Users resolveExistingUsers(List<SeedRow<UserSeedRow>> users) {
        if (users.isEmpty()) {
            return new ResolvedAuth0Users(Map.of());
        }

        String accessToken = requestAccessToken();
        Map<String, String> resolved = new LinkedHashMap<>();
        for (SeedRow<UserSeedRow> row : users) {
            resolved.put(row.value().key(), resolveAuth0Id(row.value(), accessToken));
        }
        log.info("Sample data Auth0 accounts validated | users={}", resolved.size());
        return new ResolvedAuth0Users(resolved);
    }

    private String requestAccessToken() {
        TokenResponse response;
        try {
            response =
                    restClient
                            .post()
                            .uri("/oauth/token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(
                                    new TokenRequest(
                                            clientId, clientSecret, audience, CLIENT_CREDENTIALS))
                            .retrieve()
                            .body(TokenResponse.class);
        } catch (RestClientException exception) {
            throw new SampleDataSeedException(
                    "Could not obtain an Auth0 Management API access token.", exception);
        }

        if (response == null
                || response.accessToken() == null
                || response.accessToken().isBlank()) {
            throw new SampleDataSeedException(
                    "Auth0 Management API returned an empty access token.");
        }
        return response.accessToken();
    }

    private String resolveAuth0Id(UserSeedRow seedUser, String accessToken) {
        Auth0UserResponse[] matches;
        try {
            matches =
                    restClient
                            .get()
                            .uri(
                                    uriBuilder ->
                                            uriBuilder
                                                    .path("/api/v2/users-by-email")
                                                    .queryParam("email", seedUser.email())
                                                    .build())
                            .headers(headers -> headers.setBearerAuth(accessToken))
                            .retrieve()
                            .body(Auth0UserResponse[].class);
        } catch (RestClientException exception) {
            throw new SampleDataSeedException(
                    "Could not validate Auth0 account for seed user '%s' (%s)."
                            .formatted(seedUser.key(), seedUser.email()),
                    exception);
        }

        if (matches == null || matches.length == 0) {
            throw new SampleDataSeedException(
                    "No Auth0 account found for seed user '%s' with email '%s'."
                            .formatted(seedUser.key(), seedUser.email()));
        }
        if (matches.length > 1) {
            throw new SampleDataSeedException(
                    "Multiple Auth0 accounts found for seed user '%s' with email '%s'."
                            .formatted(seedUser.key(), seedUser.email()));
        }

        Auth0UserResponse match = matches[0];
        if (match.email() == null || !match.email().equalsIgnoreCase(seedUser.email())) {
            throw new SampleDataSeedException(
                    "Auth0 returned a non-matching email for seed user '%s'."
                            .formatted(seedUser.key()));
        }
        if (match.userId() == null || match.userId().isBlank()) {
            throw new SampleDataSeedException(
                    "Auth0 returned an empty user_id for seed user '%s'."
                            .formatted(seedUser.key()));
        }
        return match.userId();
    }

    private static String normalizedDomain(String domain) {
        String value = required(domain, "APP_SAMPLE_DATA_AUTH0_DOMAIN");
        String normalized =
                value.startsWith("http://") || value.startsWith("https://")
                        ? value
                        : "https://" + value;
        return normalized.endsWith("/")
                ? normalized.substring(0, normalized.length() - 1)
                : normalized;
    }

    private static String required(String value, String environmentVariable) {
        if (value == null || value.isBlank()) {
            throw new SampleDataSeedException(
                    environmentVariable + " is required when sample data seed is enabled.");
        }
        return value.trim();
    }

    private record TokenRequest(
            @JsonProperty("client_id") String clientId,
            @JsonProperty("client_secret") String clientSecret,
            String audience,
            @JsonProperty("grant_type") String grantType) {}

    private record TokenResponse(@JsonProperty("access_token") String accessToken) {}

    private record Auth0UserResponse(@JsonProperty("user_id") String userId, String email) {}
}
