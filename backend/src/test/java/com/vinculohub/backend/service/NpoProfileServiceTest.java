/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vinculohub.backend.dto.NpoProfileResponse;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Ods;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.AddressRepository;
import com.vinculohub.backend.repository.DocumentRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NpoProfileServiceTest {

    @Mock private NpoRepository npoRepository;
    @Mock private AddressRepository addressRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private DocumentRepository documentRepository;

    @InjectMocks private NpoProfileService npoProfileService;

    @Test
    @DisplayName("Deve retornar projetos da ONG com status e ODS no perfil publico")
    void shouldReturnNpoProjectsWithStatusAndOdsOnPublicProfile() {
        User owner =
                User.builder()
                        .id(7)
                        .name("Responsavel")
                        .email("owner@ong.org")
                        .auth0Id("auth0|owner")
                        .userType(UserType.npo)
                        .build();
        Npo npo =
                Npo.builder()
                        .id(10)
                        .name("ONG Publica")
                        .npoSize(NpoSize.small)
                        .userId(owner.getId())
                        .build();
        Ods ods =
                Ods.builder()
                        .id(4)
                        .name("ODS 4 - Educacao de Qualidade")
                        .description("Educacao inclusiva e equitativa.")
                        .build();
        Project project =
                Project.builder()
                        .id(99L)
                        .npo(npo)
                        .title("Projeto Alfabetizacao")
                        .description("Aulas no contraturno.")
                        .status(ProjectStatus.ACTIVE)
                        .ods(new LinkedHashSet<>(List.of(ods)))
                        .build();

        when(npoRepository.findById(10)).thenReturn(Optional.of(npo));
        when(userRepository.findById(owner.getId())).thenReturn(Optional.of(owner));
        when(projectRepository.findAllByNpoId(10L)).thenReturn(List.of(project));
        when(documentRepository.findByNpo_Id(10)).thenReturn(List.of());

        NpoProfileResponse response = npoProfileService.getProfile(10, null);

        assertEquals(NpoProfileResponse.ViewerContext.EXTERNAL, response.viewerContext());
        assertEquals(1, response.projects().size());
        NpoProfileResponse.ProjectData projectData = response.projects().get(0);
        assertEquals("Projeto Alfabetizacao", projectData.title());
        assertEquals(ProjectStatus.ACTIVE, projectData.status());
        assertEquals(1, projectData.ods().size());
        assertEquals(4, projectData.ods().get(0).id());
        assertEquals("ODS 4 - Educacao de Qualidade", projectData.ods().get(0).name());
        verify(projectRepository).findAllByNpoId(10L);
    }
}
