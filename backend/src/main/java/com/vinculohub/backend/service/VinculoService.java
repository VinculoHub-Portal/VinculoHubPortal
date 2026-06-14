/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.EfetivarParceiraResponse;
import com.vinculohub.backend.dto.VinculoResponse;
import com.vinculohub.backend.exception.BadRequestException;
import com.vinculohub.backend.exception.ForbiddenException;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.exception.UserNotFoundException;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.CompanyProject;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class VinculoService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final NpoRepository npoRepository;
    private final CompanyProjectRepository companyProjectRepository;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<VinculoResponse> listVinculosForUser(String auth0Id) {
        User user = userRepository.findByAuth0Id(auth0Id).orElseThrow(UserNotFoundException::new);

        if (user.getUserType() == UserType.company) {
            Company company =
                    companyRepository
                            .findByUserId(user.getId())
                            .orElseThrow(() -> new NotFoundException("Empresa não encontrada"));
            return companyProjectRepository
                    .findAllByIdCompanyId(company.getId())
                    .stream()
                    .map(cp -> toResponse(cp, UserType.company))
                    .toList();
        }

        if (user.getUserType() == UserType.npo) {
            Npo npo =
                    npoRepository
                            .findByUserId(user.getId())
                            .orElseThrow(() -> new NotFoundException("ONG não encontrada"));
            return companyProjectRepository
                    .findAllByNpoId(npo.getId())
                    .stream()
                    .map(cp -> toResponse(cp, UserType.npo))
                    .toList();
        }

        throw new ForbiddenException("Tipo de usuário sem acesso a vínculos");
    }

    @Transactional
    public EfetivarParceiraResponse efetivarParceria(
            String auth0Id, Integer companyId, Long projectId) {
        User user = userRepository.findByAuth0Id(auth0Id).orElseThrow(UserNotFoundException::new);

        CompanyProject cp =
                companyProjectRepository
                        .findByIdCompanyIdAndIdProjectId(companyId, projectId)
                        .orElseThrow(() -> new NotFoundException("Vínculo não encontrado"));

        if (cp.getStatus() != RelationshipStatus.negotiation) {
            throw new BadRequestException(
                    "O vínculo não está em negociação. Status atual: " + cp.getStatus());
        }

        if (user.getUserType() == UserType.company) {
            return handleCompanyConfirmation(user, cp);
        }

        if (user.getUserType() == UserType.npo) {
            return handleNpoConfirmation(user, cp);
        }

        throw new ForbiddenException("Tipo de usuário sem permissão para efetivar parceria");
    }

    private EfetivarParceiraResponse handleCompanyConfirmation(User user, CompanyProject cp) {
        Company company =
                companyRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() -> new NotFoundException("Empresa não encontrada"));

        if (!cp.getId().getCompanyId().equals(company.getId())) {
            throw new ForbiddenException("Este vínculo não pertence à sua empresa");
        }

        if (Boolean.TRUE.equals(cp.getCompanyConfirmed())) {
            throw new BadRequestException("Sua empresa já confirmou a efetivação deste vínculo");
        }

        cp.setCompanyConfirmed(true);

        String npoEmail = cp.getProject().getNpo().getNpoUser().getEmail();
        String npoName = cp.getProject().getNpo().getName();
        String projectTitle = cp.getProject().getTitle();
        String companyName = company.getSocialName() != null ? company.getSocialName() : company.getLegalName();

        if (Boolean.TRUE.equals(cp.getNpoConfirmed())) {
            cp.setStatus(RelationshipStatus.active);
            companyProjectRepository.save(cp);
            log.info(
                    "Vínculo activated: companyId={} projectId={}",
                    cp.getId().getCompanyId(),
                    cp.getId().getProjectId());
            emailService.sendPartnershipActivated(npoEmail, npoName, projectTitle);
            emailService.sendPartnershipActivated(user.getEmail(), companyName, projectTitle);
            return buildResponse(cp, "Parceria efetivada com sucesso! O vínculo agora está Ativo.");
        }

        companyProjectRepository.save(cp);
        log.info(
                "Company confirmed partnership: companyId={} projectId={}",
                cp.getId().getCompanyId(),
                cp.getId().getProjectId());
        emailService.sendPartnershipConfirmationRequest(
                npoEmail, npoName, companyName, projectTitle, "/ong/vinculos");
        return buildResponse(
                cp,
                "Confirmação registrada. A ONG receberá um e-mail para confirmar a efetivação.");
    }

    private EfetivarParceiraResponse handleNpoConfirmation(User user, CompanyProject cp) {
        Npo npo =
                npoRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() -> new NotFoundException("ONG não encontrada"));

        if (!cp.getProject().getNpo().getId().equals(npo.getId())) {
            throw new ForbiddenException("Este vínculo não pertence a um projeto da sua ONG");
        }

        if (Boolean.TRUE.equals(cp.getNpoConfirmed())) {
            throw new BadRequestException("Sua ONG já confirmou a efetivação deste vínculo");
        }

        cp.setNpoConfirmed(true);

        String companyEmail = cp.getCompany().getUser().getEmail();
        String companyName =
                cp.getCompany().getSocialName() != null
                        ? cp.getCompany().getSocialName()
                        : cp.getCompany().getLegalName();
        String projectTitle = cp.getProject().getTitle();
        String npoName = npo.getName();

        if (Boolean.TRUE.equals(cp.getCompanyConfirmed())) {
            cp.setStatus(RelationshipStatus.active);
            companyProjectRepository.save(cp);
            log.info(
                    "Vínculo activated: companyId={} projectId={}",
                    cp.getId().getCompanyId(),
                    cp.getId().getProjectId());
            emailService.sendPartnershipActivated(companyEmail, companyName, projectTitle);
            emailService.sendPartnershipActivated(user.getEmail(), npoName, projectTitle);
            return buildResponse(cp, "Parceria efetivada com sucesso! O vínculo agora está Ativo.");
        }

        companyProjectRepository.save(cp);
        log.info(
                "NPO confirmed partnership: companyId={} projectId={}",
                cp.getId().getCompanyId(),
                cp.getId().getProjectId());
        emailService.sendPartnershipConfirmationRequest(
                companyEmail, companyName, npoName, projectTitle, "/empresa/vinculos");
        return buildResponse(
                cp,
                "Confirmação registrada. A empresa receberá um e-mail para confirmar a"
                        + " efetivação.");
    }

    private VinculoResponse toResponse(CompanyProject cp, UserType callerType) {
        boolean currentUserConfirmed =
                callerType == UserType.company
                        ? Boolean.TRUE.equals(cp.getCompanyConfirmed())
                        : Boolean.TRUE.equals(cp.getNpoConfirmed());

        String companyName =
                cp.getCompany().getSocialName() != null
                        ? cp.getCompany().getSocialName()
                        : cp.getCompany().getLegalName();

        String companyEmail =
                cp.getCompany().getUser() != null ? cp.getCompany().getUser().getEmail() : null;

        String npoEmail =
                cp.getProject().getNpo().getNpoUser() != null
                        ? cp.getProject().getNpo().getNpoUser().getEmail()
                        : null;

        return new VinculoResponse(
                cp.getId().getCompanyId(),
                cp.getId().getProjectId(),
                cp.getProject().getTitle(),
                companyName,
                cp.getProject().getNpo().getName(),
                companyEmail,
                npoEmail,
                cp.getStatus(),
                Boolean.TRUE.equals(cp.getCompanyConfirmed()),
                Boolean.TRUE.equals(cp.getNpoConfirmed()),
                currentUserConfirmed);
    }

    private EfetivarParceiraResponse buildResponse(CompanyProject cp, String message) {
        return new EfetivarParceiraResponse(
                cp.getId().getCompanyId(),
                cp.getId().getProjectId(),
                cp.getStatus(),
                Boolean.TRUE.equals(cp.getCompanyConfirmed()),
                Boolean.TRUE.equals(cp.getNpoConfirmed()),
                message);
    }
}
