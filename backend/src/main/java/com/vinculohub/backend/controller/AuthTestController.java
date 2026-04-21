/* (C)2026 */
package com.vinculohub.backend.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class AuthTestController {

    private final String rolesClaim;

    public AuthTestController(@Value("${app.auth0.roles-claim}") String rolesClaim) {
        this.rolesClaim = rolesClaim;
    }

    @GetMapping("/public/ping")
    public Map<String, String> publicPing() {
        return Map.of(
                "status", "ok",
                "message", "Public endpoint is reachable.");
    }

    @GetMapping("/api/me")
    @PreAuthorize("hasRole('admin')")
    public Map<String, Object> me(@AuthenticationPrincipal Jwt jwt) {
        List<String> authorities =
                jwt.getClaimAsStringList("scope") == null
                        ? List.of()
                        : jwt.getClaimAsStringList("scope");
        List<String> roles =
                jwt.getClaimAsStringList(rolesClaim) == null
                        ? List.of()
                        : jwt.getClaimAsStringList(rolesClaim);

        return Map.of(
                "subject", jwt.getSubject(),
                "email", jwt.getClaimAsString("email"),
                "name", jwt.getClaimAsString("name"),
                "issuer", jwt.getIssuer() == null ? null : jwt.getIssuer().toString(),
                "audience", jwt.getAudience(),
                "scopes", authorities,
                "roles", roles);
    }
}
