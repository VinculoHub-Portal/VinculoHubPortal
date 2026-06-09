/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.NpoProfileResponse;
import com.vinculohub.backend.dto.OdsResponse;
import com.vinculohub.backend.exception.ForbiddenException;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Document;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Ods;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.repository.AddressRepository;
import com.vinculohub.backend.repository.DocumentRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NpoProfileService {

    private final NpoRepository npoRepository;
    private final AddressRepository addressRepository;
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

    @Transactional(readOnly = true)
    public NpoProfileResponse.ProjectPageData getPublicProjects(Integer npoId, Pageable pageable) {
        if (npoId == null) {
            throw new IllegalArgumentException("O id da ONG é obrigatório.");
        }

        if (!npoRepository.existsById(npoId)) {
            throw new NotFoundException("ONG não encontrada.");
        }

        return mapProjectsPage(npoId, pageable);
    }

    @Transactional
    public NpoProfileResponse updateProfile(
            Integer npoId, String authenticatedAuth0Id, NpoProfileResponse.UpdateRequest request) {
        if (npoId == null) {
            throw new IllegalArgumentException("O id da ONG é obrigatório.");
        }
        if (request == null) {
            throw new IllegalArgumentException("Os dados de atualização são obrigatórios.");
        }

        Npo npo =
                npoRepository
                        .findById(npoId)
                        .orElseThrow(() -> new NotFoundException("ONG não encontrada."));

        User responsibleUser = resolveResponsibleUser(npo);
        if (!isOwner(authenticatedAuth0Id, responsibleUser)) {
            throw new ForbiddenException("Apenas o dono do perfil pode editar os dados da ONG.");
        }

        applyInstitutionalUpdate(npo, request.institutionalData(), request.contact());
        applyResponsibleUpdate(responsibleUser, request.responsible());
        applyAddressUpdate(npo, request.address());

        npoRepository.save(npo);
        if (responsibleUser != null) {
            userRepository.save(responsibleUser);
        }

        return getProfile(npoId, authenticatedAuth0Id);
    }

    private User resolveResponsibleUser(Npo npo) {
        Integer userId = npo.getUserId();
        if (userId == null) {
            return null;
        }

        return userRepository.findById(userId).orElse(null);
    }

    private boolean isOwner(String authenticatedAuth0Id, User responsibleUser) {
        return authenticatedAuth0Id != null
                && !authenticatedAuth0Id.isBlank()
                && responsibleUser != null
                && authenticatedAuth0Id.equals(responsibleUser.getAuth0Id());
    }

    private void applyInstitutionalUpdate(
            Npo npo,
            NpoProfileResponse.InstitutionalUpdate institutionalData,
            NpoProfileResponse.ContactUpdate contactData) {
        if (institutionalData != null) {
            if (institutionalData.name() != null && !institutionalData.name().isBlank()) {
                npo.setName(institutionalData.name().trim());
            }
            if (institutionalData.description() != null) {
                npo.setDescription(trimToNull(institutionalData.description()));
            }
            if (institutionalData.logoUrl() != null) {
                npo.setLogoUrl(trimToNull(institutionalData.logoUrl()));
            }
            if (institutionalData.npoSize() != null) {
                npo.setNpoSize(institutionalData.npoSize());
            }
            if (institutionalData.cnpj() != null) {
                npo.setCnpj(trimToNull(institutionalData.cnpj()));
            }
            if (institutionalData.cpf() != null) {
                npo.setCpf(trimToNull(institutionalData.cpf()));
            }
            if (institutionalData.environmental() != null) {
                npo.setEnvironmental(institutionalData.environmental());
            }
            if (institutionalData.social() != null) {
                npo.setSocial(institutionalData.social());
            }
            if (institutionalData.governance() != null) {
                npo.setGovernance(institutionalData.governance());
            }
        }

        if (contactData != null) {
            if (contactData.phone() != null) {
                npo.setPhone(trimToNull(contactData.phone()));
            }
            if (contactData.email() != null && !contactData.email().isBlank()) {
                User responsibleUser = resolveResponsibleUser(npo);
                if (responsibleUser != null) {
                    responsibleUser.setEmail(contactData.email().trim());
                }
            }
        }
    }

    private void applyResponsibleUpdate(
            User responsibleUser, NpoProfileResponse.ResponsibleUpdate responsible) {
        if (responsibleUser == null || responsible == null) {
            return;
        }

        if (responsible.name() != null && !responsible.name().isBlank()) {
            responsibleUser.setName(responsible.name().trim());
        }
        if (responsible.email() != null && !responsible.email().isBlank()) {
            responsibleUser.setEmail(responsible.email().trim());
        }
    }

    private void applyAddressUpdate(Npo npo, NpoProfileResponse.AddressUpdate addressData) {
        if (addressData == null) {
            return;
        }

        Address address = npo.getAddress();
        if (address == null) {
            address = new Address();
        }

        if (addressData.state() != null) {
            address.setState(trimToNull(addressData.state()));
        }
        if (addressData.stateCode() != null) {
            address.setStateCode(trimToNull(addressData.stateCode()));
        }
        if (addressData.city() != null) {
            address.setCity(trimToNull(addressData.city()));
        }
        if (addressData.street() != null) {
            address.setStreet(trimToNull(addressData.street()));
        }
        if (addressData.number() != null) {
            address.setNumber(trimToNull(addressData.number()));
        }
        if (addressData.complement() != null) {
            address.setComplement(trimToNull(addressData.complement()));
        }
        if (addressData.zipCode() != null) {
            address.setZipCode(trimToNull(addressData.zipCode()));
        }

        npo.setAddress(addressRepository.save(address));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
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

    private NpoProfileResponse.ProjectPageData mapProjectsPage(Integer npoId, Pageable pageable) {
        Page<NpoProfileResponse.ProjectData> page =
                projectRepository.findByNpoId(npoId.longValue(), pageable).map(this::mapProject);

        return new NpoProfileResponse.ProjectPageData(
                page.getContent(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize(),
                page.isFirst(),
                page.isLast());
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
                mapProjectOds(project),
                project.getStartDate(),
                project.getEndDate(),
                project.getFocusArea(),
                project.getFundraisingDeadline(),
                project.getBeneficiariesCount(),
                project.getLocation(),
                project.getMainObjective(),
                project.getCreatedAt());
    }

    private List<OdsResponse> mapProjectOds(Project project) {
        if (project.getOds() == null) {
            return List.of();
        }

        return project.getOds().stream()
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(Ods::getId, Comparator.nullsLast(Integer::compareTo)))
                .map(ods -> new OdsResponse(ods.getId(), ods.getName(), ods.getDescription()))
                .toList();
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
