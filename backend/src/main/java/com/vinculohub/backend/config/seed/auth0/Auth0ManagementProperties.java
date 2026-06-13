/* (C)2026 */
package com.vinculohub.backend.config.seed.auth0;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.sample-data.auth0")
public record Auth0ManagementProperties(String domain, String clientId, String clientSecret) {}
