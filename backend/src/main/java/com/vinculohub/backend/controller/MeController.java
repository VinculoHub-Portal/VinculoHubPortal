/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.AuthenticatedProfileResponse;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Users;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.UsersRepository;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/me")
public class MeController {

    private final UsersRepository usersRepository;
    private final NpoRepository npoRepository;
    private final CompanyRepository companyRepository;

    public MeController(
            UsersRepository usersRepository,
            NpoRepository npoRepository,
            CompanyRepository companyRepository) {
        this.usersRepository = usersRepository;
        this.npoRepository = npoRepository;
        this.companyRepository = companyRepository;
    }

    @GetMapping("/profile")
    public AuthenticatedProfileResponse profile(@AuthenticationPrincipal Jwt jwt) {
        log.info("GET /api/me/profile | sub={}", jwt.getSubject());
        Optional<Users> user = usersRepository.findByAuth0Id(jwt.getSubject());

        if (user.isEmpty()) {
            log.info("No DB user found for auth0Id={}, returning empty profile", jwt.getSubject());
            return new AuthenticatedProfileResponse(
                    jwt.getSubject(), jwt.getClaimAsString("email"), null, null, null, null, false);
        }

        Users savedUser = user.get();
        Integer npoId =
                savedUser.getUserType() == UserType.npo
                        ? npoRepository.findByUserId(savedUser.getId()).map(Npo::getId).orElse(null)
                        : null;
        Integer companyId =
                savedUser.getUserType() == UserType.company
                        ? companyRepository
                                .findByUserId(savedUser.getId())
                                .map(Company::getId)
                                .orElse(null)
                        : null;

        log.info(
                "Profile loaded | userId={} type={} npoId={} companyId={} complete={}",
                savedUser.getId(),
                savedUser.getUserType(),
                npoId,
                companyId,
                npoId != null || companyId != null);

        return new AuthenticatedProfileResponse(
                savedUser.getAuth0Id(),
                savedUser.getEmail(),
                savedUser.getId(),
                savedUser.getUserType(),
                npoId,
                companyId,
                npoId != null || companyId != null);
    }
}
