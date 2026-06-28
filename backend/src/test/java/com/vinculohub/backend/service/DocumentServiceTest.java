/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.dto.DocumentDownloadResponseDTO;
import com.vinculohub.backend.dto.DocumentRequestDTO;
import com.vinculohub.backend.dto.DocumentResponseDTO;
import com.vinculohub.backend.exception.BadRequestException;
import com.vinculohub.backend.exception.FileFormatValidationException;
import com.vinculohub.backend.exception.FileSizeValidationException;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.model.Document;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.repository.DocumentRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import com.vinculohub.backend.service.storage.S3Uploader;
import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock private DocumentRepository documentRepository;

    @Mock private NpoRepository npoRepository;

    @Mock private ProjectRepository projectRepository;

    @Mock private UserRepository userRepository;

    @Mock private S3Uploader s3Uploader;

    @InjectMocks private DocumentService documentService;

    @Test
    void shouldUploadDocumentSuccessfully() throws Exception {
        MultipartFile file = mock(MultipartFile.class);

        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getOriginalFilename()).thenReturn("file.pdf");

        DocumentRequestDTO dto = new DocumentRequestDTO();
        dto.setNpoId(1);
        dto.setProjectId(1);
        dto.setTitle("Doc Title");
        dto.setDescription("Desc");

        Npo npo = new Npo();
        npo.setId(1);

        Project project = new Project();
        project.setId(1L);

        when(npoRepository.findById(1)).thenReturn(Optional.of(npo));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        when(s3Uploader.uploadFile(any(), any())).thenReturn("http://url");

        Document saved = new Document();
        saved.setId(10);
        saved.setNpo(npo);
        saved.setProject(project);
        saved.setTitle(dto.getTitle());
        saved.setDescription(dto.getDescription());
        saved.setFileUrl("http://url");
        saved.setFileName("file.pdf");
        saved.setFileSize(1024);
        saved.setMimeType("application/pdf");

        when(documentRepository.save(any())).thenReturn(saved);

        DocumentResponseDTO result = documentService.upload(file, dto);

        assertNotNull(result);
        assertEquals(10, result.getId());
        assertEquals("http://url", result.getFileUrl());
        assertEquals("Doc Title", result.getTitle());

        verify(s3Uploader).uploadFile(any(), any());
        verify(documentRepository).save(any());
    }

    @Test
    void shouldUploadDocumentWithoutProject() throws Exception {
        MultipartFile file = mock(MultipartFile.class);

        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getOriginalFilename()).thenReturn("file.pdf");

        DocumentRequestDTO dto = new DocumentRequestDTO();
        dto.setNpoId(1);
        dto.setTitle("Institutional Doc");
        dto.setDescription("Desc");

        Npo npo = new Npo();
        npo.setId(1);

        when(npoRepository.findById(1)).thenReturn(Optional.of(npo));
        when(s3Uploader.uploadFile(any(), any())).thenReturn("http://url");

        Document saved = new Document();
        saved.setId(10);
        saved.setNpo(npo);
        saved.setProject(null);
        saved.setTitle(dto.getTitle());
        saved.setDescription(dto.getDescription());
        saved.setFileUrl("http://url");
        saved.setFileName("file.pdf");
        saved.setFileSize(1024);
        saved.setMimeType("application/pdf");

        when(documentRepository.save(any())).thenReturn(saved);

        DocumentResponseDTO result = documentService.upload(file, dto);

        assertNotNull(result);
        assertEquals(10, result.getId());
        assertEquals(1, result.getNpoId());
        assertNull(result.getProjectId());

        verify(projectRepository, never()).findById(anyLong());
        verify(documentRepository).save(any());
    }

    @Test
    void shouldThrowExceptionWhenFileTooLarge() {
        MultipartFile file = mock(MultipartFile.class);

        when(file.getSize()).thenReturn(11 * 1024 * 1024L);

        DocumentRequestDTO dto = new DocumentRequestDTO();

        assertThrows(FileSizeValidationException.class, () -> documentService.upload(file, dto));
    }

    @Test
    void shouldThrowExceptionWhenInvalidFileType() {
        MultipartFile file = mock(MultipartFile.class);

        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("application/exe");

        DocumentRequestDTO dto = new DocumentRequestDTO();

        assertThrows(FileFormatValidationException.class, () -> documentService.upload(file, dto));
    }

    @Test
    void shouldThrowExceptionWhenNpoNotFound() {
        MultipartFile file = mock(MultipartFile.class);

        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("application/pdf");

        DocumentRequestDTO dto = new DocumentRequestDTO();
        dto.setNpoId(1);
        dto.setProjectId(1);

        when(npoRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> documentService.upload(file, dto));
    }

    @Test
    void shouldThrowBadRequestWhenNpoIdIsMissing() {
        MultipartFile file = mock(MultipartFile.class);

        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("application/pdf");

        DocumentRequestDTO dto = new DocumentRequestDTO();

        assertThrows(BadRequestException.class, () -> documentService.upload(file, dto));
    }

    @Test
    void shouldThrowExceptionWhenProjectNotFound() {
        MultipartFile file = mock(MultipartFile.class);

        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("application/pdf");

        DocumentRequestDTO dto = new DocumentRequestDTO();
        dto.setNpoId(1);
        dto.setProjectId(1);

        Npo npo = new Npo();
        npo.setId(1);

        when(npoRepository.findById(1)).thenReturn(Optional.of(npo));
        when(projectRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> documentService.upload(file, dto));
    }

    @Test
    void shouldThrowExceptionWhenUploadFails() throws Exception {
        MultipartFile file = mock(MultipartFile.class);

        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("application/pdf");

        DocumentRequestDTO dto = new DocumentRequestDTO();
        dto.setNpoId(1);
        dto.setProjectId(1);

        Npo npo = new Npo();
        npo.setId(1);

        Project project = new Project();
        project.setId(1L);

        when(npoRepository.findById(1)).thenReturn(Optional.of(npo));
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        when(s3Uploader.uploadFile(any(), any())).thenThrow(IOException.class);

        assertThrows(RuntimeException.class, () -> documentService.upload(file, dto));
    }

    @Test
    void shouldListDocumentsForAuthenticatedNpo() {
        User user = new User();
        user.setId(20);

        Npo npo = new Npo();
        npo.setId(1);

        Document document = new Document();
        document.setId(10);
        document.setNpo(npo);
        document.setTitle("Institutional Doc");
        document.setDescription("Desc");
        document.setFileUrl("http://url");
        document.setFileName("file.pdf");
        document.setFileSize(1024);
        document.setMimeType("application/pdf");

        when(userRepository.findByAuth0Id("auth0|123")).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(20)).thenReturn(Optional.of(npo));
        PageRequest pageable = PageRequest.of(0, 20);

        when(documentRepository.findByNpo_Id(1, pageable))
                .thenReturn(new PageImpl<>(List.of(document), pageable, 1));

        Page<DocumentResponseDTO> result =
                documentService.findAllByAuthenticatedNpo("auth0|123", pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals(10, result.getContent().get(0).getId());
        assertEquals(1, result.getContent().get(0).getNpoId());
        assertEquals("Institutional Doc", result.getContent().get(0).getTitle());

        verify(documentRepository).findByNpo_Id(1, pageable);
    }

    @Test
    void shouldThrowBadRequestWhenAuthenticatedUserIsMissing() {
        assertThrows(
                BadRequestException.class,
                () -> documentService.findAllByAuthenticatedNpo(" ", PageRequest.of(0, 20)));
    }

    @Test
    void shouldThrowExceptionWhenAuthenticatedNpoNotFound() {
        User user = new User();
        user.setId(20);

        when(userRepository.findByAuth0Id("auth0|123")).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(20)).thenReturn(Optional.empty());

        assertThrows(
                NotFoundException.class,
                () ->
                        documentService.findAllByAuthenticatedNpo(
                                "auth0|123", PageRequest.of(0, 20)));
    }

    @Test
    void shouldGenerateDownloadUrlForAuthenticatedNpoDocument() {
        User user = new User();
        user.setId(20);

        Npo npo = new Npo();
        npo.setId(1);

        Document document = new Document();
        document.setId(10);
        document.setNpo(npo);
        document.setFileUrl("https://bucket.s3.amazonaws.com/npo/1/file.pdf");
        document.setFileName("file.pdf");
        document.setMimeType("application/pdf");

        when(userRepository.findByAuth0Id("auth0|123")).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(20)).thenReturn(Optional.of(npo));
        when(documentRepository.findByIdAndNpo_Id(10, 1)).thenReturn(Optional.of(document));
        when(s3Uploader.generatePresignedDownloadUrl(
                        eq("https://bucket.s3.amazonaws.com/npo/1/file.pdf"), any(Duration.class)))
                .thenReturn("https://signed-url");

        DocumentDownloadResponseDTO result =
                documentService.generateDownloadUrlForAuthenticatedNpo("auth0|123", 10);

        assertEquals("https://signed-url", result.downloadUrl());
        assertEquals("file.pdf", result.fileName());
        assertEquals("application/pdf", result.mimeType());
        assertNotNull(result.expiresAt());
    }

    @Test
    void shouldNotGenerateDownloadUrlForDocumentFromAnotherNpo() {
        User user = new User();
        user.setId(20);

        Npo npo = new Npo();
        npo.setId(1);

        when(userRepository.findByAuth0Id("auth0|123")).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(20)).thenReturn(Optional.of(npo));
        when(documentRepository.findByIdAndNpo_Id(10, 1)).thenReturn(Optional.empty());

        assertThrows(
                NotFoundException.class,
                () -> documentService.generateDownloadUrlForAuthenticatedNpo("auth0|123", 10));

        verify(s3Uploader, never()).generatePresignedDownloadUrl(anyString(), any());
    }

    @Test
    void shouldThrowBadRequestWhenDocReqIsNull() {
        MultipartFile file = mock(MultipartFile.class);
        assertThrows(BadRequestException.class, () -> documentService.upload(file, null));
    }

    @Test
    void shouldFindAllByNpoIdAndProjectId() {
        Npo npo = new Npo();
        npo.setId(1);
        Document doc = new Document();
        doc.setId(5);
        doc.setNpo(npo);
        when(documentRepository.findByNpo_IdAndProject_Id(1, 2)).thenReturn(List.of(doc));

        List<DocumentResponseDTO> result = documentService.findAll(1, 2);

        assertEquals(1, result.size());
        assertEquals(5, result.get(0).getId());
        verify(documentRepository).findByNpo_IdAndProject_Id(1, 2);
    }

    @Test
    void shouldFindAllByProjectIdOnly() {
        Document doc = new Document();
        doc.setId(7);
        when(documentRepository.findByProject_Id(3)).thenReturn(List.of(doc));

        List<DocumentResponseDTO> result = documentService.findAll(null, 3);

        assertEquals(1, result.size());
        verify(documentRepository).findByProject_Id(3);
    }

    @Test
    void shouldFindAllWithNoFilter() {
        when(documentRepository.findAll()).thenReturn(List.of());

        List<DocumentResponseDTO> result = documentService.findAll(null, null);

        assertTrue(result.isEmpty());
        verify(documentRepository).findAll();
    }

    @Test
    void shouldThrowBadRequestWhenGenerateUrlAuth0IdIsNull() {
        assertThrows(
                BadRequestException.class,
                () -> documentService.generateDownloadUrlForAuthenticatedNpo(null, 1));
    }

    @Test
    void shouldThrowBadRequestWhenGenerateUrlDocumentIdIsNull() {
        assertThrows(
                BadRequestException.class,
                () -> documentService.generateDownloadUrlForAuthenticatedNpo("auth0|x", null));
    }

    @Test
    void shouldThrowBadRequestWhenFindAllByNpoAuth0IdIsNull() {
        assertThrows(
                BadRequestException.class,
                () -> documentService.findAllByAuthenticatedNpo(null, PageRequest.of(0, 10)));
    }

    @Test
    void shouldMapToResponseWithNullNpoAndNullProject() throws Exception {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getOriginalFilename()).thenReturn("x.pdf");

        DocumentRequestDTO dto = new DocumentRequestDTO();
        dto.setNpoId(1);

        Npo npo = new Npo();
        npo.setId(1);
        when(npoRepository.findById(1)).thenReturn(Optional.of(npo));
        when(s3Uploader.uploadFile(any(), any())).thenReturn("http://url");

        Document saved = new Document();
        saved.setId(99);
        saved.setNpo(null);
        saved.setProject(null);
        when(documentRepository.save(any())).thenReturn(saved);

        DocumentResponseDTO result = documentService.upload(file, dto);

        assertNull(result.getNpoId());
        assertNull(result.getProjectId());
    }
}
