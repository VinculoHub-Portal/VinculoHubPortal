/* (C)2026 */
package com.vinculohub.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI metadata and a bearer-JWT security scheme so the "Authorize" button works in Swagger UI
 * ({@code /swagger-ui.html}); the spec is served at {@code /v3/api-docs}.
 */
@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI vinculoHubOpenAPI() {
        return new OpenAPI()
                .info(
                        new Info()
                                .title("VinculoHub Portal API")
                                .description("API do VinculoHubPortal — inclui o épico Vínculos.")
                                .version("v1"))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME))
                .components(
                        new Components()
                                .addSecuritySchemes(
                                        BEARER_SCHEME,
                                        new SecurityScheme()
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT")));
    }
}
