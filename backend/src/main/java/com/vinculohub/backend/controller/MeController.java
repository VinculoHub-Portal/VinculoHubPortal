/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.AuthenticatedProfileResponse;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.util.Optional;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final UserRepository userRepository;
    private final NpoRepository npoRepository;

    public MeController(UserRepository userRepository, NpoRepository npoRepository) {
        this.userRepository = userRepository;
        this.npoRepository = npoRepository;
    }

    @GetMapping("/profile")
    public AuthenticatedProfileResponse profile(@AuthenticationPrincipal Jwt jwt) {
        Optional<User> user = userRepository.findByAuth0Id(jwt.getSubject());

        if (user.isEmpty()) {
            return new AuthenticatedProfileResponse(
                    jwt.getSubject(), jwt.getClaimAsString("email"), null, null, null, false);
        }

        User savedUser = user.get();
        Integer npoId =
                npoRepository.findByUserId(savedUser.getId()).map(Npo::getId).orElse(null);

        return new AuthenticatedProfileResponse(
                savedUser.getAuth0Id(),
                savedUser.getEmail(),
                savedUser.getId(),
                savedUser.getUserType(),
                npoId,
                npoId != null);
    }
}
