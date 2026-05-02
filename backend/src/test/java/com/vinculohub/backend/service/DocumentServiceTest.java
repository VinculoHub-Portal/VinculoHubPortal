/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.dto.DocumentRequestDTO;
import com.vinculohub.backend.dto.DocumentResponseDTO;
import com.vinculohub.backend.exception.FileFormatValidationException;
import com.vinculohub.backend.exception.FileSizeValidationException;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.model.Document;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.repository.DocumentRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.service.storage.S3Uploader;
import java.io.IOException;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock private DocumentRepository documentRepository;

    @Mock private NpoRepository npoRepository;

    @Mock private ProjectRepository projectRepository;

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
}
