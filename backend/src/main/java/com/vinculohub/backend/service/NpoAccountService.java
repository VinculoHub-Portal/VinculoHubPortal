/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.AddressSignupRequest;
import com.vinculohub.backend.dto.NpoInstitutionalSignupRequest;
import com.vinculohub.backend.dto.NpoInstitutionalSignupResponse;
import com.vinculohub.backend.exception.DuplicateLoginException;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.UserRepository;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NpoAccountService {

    private final UserRepository userRepository;
    private final NpoService npoService;
    private final ProjectService projectService;
    private final ProjectValidationService projectValidationService;
    private final NpoDocumentService npoDocumentService;
    private final NpoEsgService npoEsgService;

    public NpoAccountService(
        UserRepository userRepository,
        NpoService npoService,
        ProjectService projectService,
        ProjectValidationService projectValidationService,
        NpoDocumentService npoDocumentService,
        NpoEsgService npoEsgService
    ) {
        this.userRepository = userRepository;
        this.npoService = npoService;
        this.projectService = projectService;
        this.projectValidationService = projectValidationService;
        this.npoDocumentService = npoDocumentService;
        this.npoEsgService = npoEsgService;
    }

    @Transactional(rollbackFor = Exception.class)
    public NpoInstitutionalSignupResponse registerInstitutionalAccount(
        NpoInstitutionalSignupRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                "Os dados do cadastro são obrigatórios."
            );
        }

        String name = requireText(
            request.name(),
            "Nome da instituição é obrigatório."
        );
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateLoginException(
                "Já existe uma conta cadastrada com este e-mail."
            );
        }

        npoDocumentService.validateDocuments(request.cpf(), request.cnpj());
        npoEsgService.validateEsgSelection(
            request.environmental(),
            request.social(),
            request.governance()
        );
        projectValidationService.validateFirstProject(request.firstProject());

        User savedUser = userRepository.save(
            User.builder()
                .name(name)
                .email(email)
                .userType(UserType.npo)
                .build()
        );

        Npo npo = Npo.builder()
            .name(name)
            .userId(savedUser.getId())
            .description(trimToNull(request.description()))
            .npoSize(parseNpoSize(request.npoSize()))
            .cpf(trimToNull(npoDocumentService.sanitizeCpf(request.cpf())))
            .cnpj(trimToNull(npoDocumentService.sanitizeCnpj(request.cnpj())))
            .phone(trimToNull(request.phone()))
            .environmental(Boolean.TRUE.equals(request.environmental()))
            .social(Boolean.TRUE.equals(request.social()))
            .governance(Boolean.TRUE.equals(request.governance()))
            .build();

        Npo savedNpo = npoService.saveWithAddress(
            npo,
            toAddressOrNull(request.address())
        );

        Project savedProject = projectService.createFirstProject(
            savedNpo,
            request.firstProject()
        );

        return new NpoInstitutionalSignupResponse(
            savedUser.getId(),
            savedNpo.getId(),
            savedProject.getId(),
            savedUser.getEmail(),
            true
        );
    }

    private static String normalizeEmail(String value) {
        return requireText(value, "E-mail é obrigatório.").toLowerCase(
            Locale.ROOT
        );
    }

    private static String requireText(String value, String message) {
        String normalized = trimToNull(value);
        if (normalized == null) {
            throw new IllegalArgumentException(message);
        }
        return normalized;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static NpoSize parseNpoSize(String value) {
        String normalized = requireText(
            value,
            "Porte da ONG é obrigatório."
        ).toLowerCase(Locale.ROOT);

        return switch (normalized) {
            case "small", "pequena" -> NpoSize.small;
            case "medium", "media", "média" -> NpoSize.medium;
            case "large", "grande" -> NpoSize.large;
            default -> throw new IllegalArgumentException(
                "Porte da ONG inválido."
            );
        };
    }

    private static Address toAddressOrNull(AddressSignupRequest request) {
        if (request == null || isBlankAddress(request)) {
            return null;
        }

        return Address.builder()
            .state(trimToNull(request.state()))
            .stateCode(trimToNull(request.stateCode()))
            .city(trimToNull(request.city()))
            .street(trimToNull(request.street()))
            .number(trimToNull(request.number()))
            .complement(trimToNull(request.complement()))
            .zipCode(trimToNull(request.zipCode()))
            .build();
    }

    private static boolean isBlankAddress(AddressSignupRequest request) {
        return (
            trimToNull(request.state()) == null &&
            trimToNull(request.stateCode()) == null &&
            trimToNull(request.city()) == null &&
            trimToNull(request.street()) == null &&
            trimToNull(request.number()) == null &&
            trimToNull(request.complement()) == null &&
            trimToNull(request.zipCode()) == null
        );
    }
}
