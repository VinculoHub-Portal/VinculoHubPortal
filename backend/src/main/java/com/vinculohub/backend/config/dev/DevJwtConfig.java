/* (C)2026 */
package com.vinculohub.backend.config.dev;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

/**
 * Auth LOCAL para o profile {@code dev}: um par decoder/encoder HS256 com um segredo de
 * desenvolvimento, substituindo o Auth0. Por fornecer um {@link JwtDecoder}, a auto-config do
 * resource server (que buscaria o JWKS do Auth0) recua. NUNCA habilitar em produção — o profile
 * default continua validando JWTs reais do Auth0.
 */
@Configuration
@Profile("dev")
public class DevJwtConfig {

    private final SecretKey secretKey;

    public DevJwtConfig(@Value("${app.dev.jwt.secret}") String secret) {
        this.secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }

    @Bean
    public JwtDecoder devJwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(secretKey).macAlgorithm(MacAlgorithm.HS256).build();
    }

    @Bean
    public JwtEncoder devJwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(secretKey));
    }
}
