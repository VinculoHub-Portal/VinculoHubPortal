/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.NpoProfileResponse;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Document;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.repository.DocumentRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NpoProfileService {

    private final NpoRepository npoRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final DocumentRepository documentRepository;

    @Transactional(readOnly = true)
    public NpoProfileResponse getProfile(Integer npoId, String authenticatedAuth0Id) {
        if (npoId == null) {
            throw new IllegalArgumentException("O id da ONG é obrigatório.");
        }

        Npo npo =
                npoRepository
                        .findById(npoId)
                        .orElseThrow(() -> new NotFoundException("ONG não encontrada."));

        User responsibleUser = resolveResponsibleUser(npo);
        boolean ownerView =
                authenticatedAuth0Id != null
                        && !authenticatedAuth0Id.isBlank()
                        && responsibleUser != null
                        && authenticatedAuth0Id.equals(responsibleUser.getAuth0Id());

        return new NpoProfileResponse(
                ownerView
                        ? NpoProfileResponse.ViewerContext.OWNER
                        : NpoProfileResponse.ViewerContext.EXTERNAL,
                new NpoProfileResponse.InstitutionalData(
                        npo.getId(),
                        npo.getName(),
                        npo.getDescription(),
                        npo.getLogoUrl(),
                        npo.getNpoSize(),
                        npo.getCnpj(),
                        npo.getCpf(),
                        npo.getEnvironmental(),
                        npo.getSocial(),
                        npo.getGovernance()),
                new NpoProfileResponse.ContactData(
                        responsibleUser == null ? null : responsibleUser.getEmail(),
                        npo.getPhone()),
                mapAddress(npo.getAddress()),
                mapResponsible(responsibleUser),
                mapProjects(npo.getId()),
                mapDocuments(npo.getId()));
    }

    private User resolveResponsibleUser(Npo npo) {
        Integer userId = npo.getUserId();
        if (userId == null) {
            return null;
        }

        return userRepository.findById(userId).orElse(null);
    }

    private NpoProfileResponse.AddressData mapAddress(Address address) {
        if (address == null) {
            return null;
        }

        return new NpoProfileResponse.AddressData(
                address.getId(),
                address.getState(),
                address.getStateCode(),
                address.getCity(),
                address.getStreet(),
                address.getNumber(),
                address.getComplement(),
                address.getZipCode());
    }

    private NpoProfileResponse.ResponsibleData mapResponsible(User user) {
        if (user == null) {
            return null;
        }

        return new NpoProfileResponse.ResponsibleData(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAuth0Id(),
                user.getUserType());
    }

    private List<NpoProfileResponse.ProjectData> mapProjects(Integer npoId) {
        return projectRepository.findAllByNpoId(npoId.longValue()).stream()
                .filter(Objects::nonNull)
                .sorted(
                        Comparator.comparing(
                                Project::getCreatedAt,
                                Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapProject)
                .toList();
    }

    private NpoProfileResponse.ProjectData mapProject(Project project) {
        return new NpoProfileResponse.ProjectData(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getStatus(),
                project.getType(),
                project.getBudgetNeeded(),
                project.getInvestedAmount(),
                project.getStartDate(),
                project.getEndDate(),
                project.getFocusArea(),
                project.getFundraisingDeadline(),
                project.getBeneficiariesCount(),
                project.getLocation(),
                project.getMainObjective());
    }

    private List<NpoProfileResponse.DocumentData> mapDocuments(Integer npoId) {
        return documentRepository.findByNpo_Id(npoId).stream()
                .filter(Objects::nonNull)
                .sorted(
                        Comparator.comparing(
                                Document::getCreatedAt,
                                Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapDocument)
                .toList();
    }

    private NpoProfileResponse.DocumentData mapDocument(Document document) {
        return new NpoProfileResponse.DocumentData(
                document.getId(),
                document.getTitle(),
                document.getDescription(),
                document.getFileUrl(),
                document.getFileName(),
                document.getFileSize(),
                document.getMimeType(),
                document.getCreatedAt(),
                document.getProject() == null ? null : document.getProject().getId());
    }
}
