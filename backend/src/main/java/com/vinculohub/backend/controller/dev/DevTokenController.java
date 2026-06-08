/* (C)2026 */
package com.vinculohub.backend.controller.dev;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Emissor de tokens APENAS para o profile {@code dev}. Gera um JWT HS256 (assinado pelo segredo
 * local do {@link com.vinculohub.backend.config.dev.DevJwtConfig}) com o {@code sub} e as roles
 * desejadas, para testar os endpoints autenticados via curl sem depender do Auth0. Em produção esta
 * rota não existe (o controller só é registrado no profile dev).
 */
@RestController
@Profile("dev")
@RequestMapping("/dev")
@RequiredArgsConstructor
@Tag(name = "Dev", description = "Utilitários de desenvolvimento (somente profile dev)")
public class DevTokenController {

    private final JwtEncoder jwtEncoder;

    @Value("${app.auth0.roles-claim}")
    private String rolesClaim;

    @GetMapping("/token")
    @Operation(
            summary = "Emite um JWT de desenvolvimento",
            description =
                    "Gera um token Bearer assinado localmente (HS256) com o sub e as roles"
                            + " informados. Ex.: /dev/token?sub=dev|company&roles=COMPANY")
    public ResponseEntity<Map<String, Object>> token(
            @RequestParam(defaultValue = "dev|company") String sub,
            @RequestParam(defaultValue = "COMPANY") List<String> roles) {
        Instant now = Instant.now();
        Duration ttl = Duration.ofHours(12);

        JwtClaimsSet claims =
                JwtClaimsSet.builder()
                        .subject(sub)
                        .issuer("http://dev-local/")
                        .audience(List.of("dev-local"))
                        .issuedAt(now)
                        .expiresAt(now.plus(ttl))
                        .claim(rolesClaim, roles)
                        .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();

        return ResponseEntity.ok(
                Map.of(
                        "access_token", token,
                        "token_type", "Bearer",
                        "sub", sub,
                        "roles", roles,
                        "expires_in", ttl.toSeconds()));
    }
}
