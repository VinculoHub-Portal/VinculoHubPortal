/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.dto.EditalRequestDTO;
import com.vinculohub.backend.dto.EditalResponseDTO;
import com.vinculohub.backend.exception.FileFormatValidationException;
import com.vinculohub.backend.exception.FileSizeValidationException;
import com.vinculohub.backend.model.Edital;
import com.vinculohub.backend.repository.EditalRepository;
import com.vinculohub.backend.service.storage.S3Uploader;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class EditalServiceTest {

    @Mock private EditalRepository editalRepository;

    @Mock private S3Uploader s3Uploader;

    @Mock private OdsService odsService;

    @InjectMocks private EditalService editalService;

    @Test
    void shouldCreateEditalSuccessfully() throws Exception {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getOriginalFilename()).thenReturn("edital.pdf");

        EditalRequestDTO dto =
                new EditalRequestDTO("Edital 2026", "Descrição do edital", null, null);

        when(s3Uploader.uploadFile(any(MultipartFile.class), eq("editais")))
                .thenReturn("https://bucket.s3.amazonaws.com/editais/edital.pdf");
        when(s3Uploader.generatePresignedDownloadUrl(any(), any()))
                .thenReturn("https://bucket.s3.amazonaws.com/editais/edital.pdf?presigned=abc123");

        Edital saved = new Edital();
        saved.setId(1L);
        saved.setTitle("Edital 2026");
        saved.setDescription("Descrição do edital");
        saved.setFileUrl("https://bucket.s3.amazonaws.com/editais/edital.pdf");
        saved.setFileName("edital.pdf");
        saved.setFileSize(1024L);
        saved.setMimeType("application/pdf");
        saved.setCreatedAt(LocalDateTime.now());
        saved.setUpdatedAt(LocalDateTime.now());

        when(editalRepository.save(any(Edital.class))).thenReturn(saved);

        EditalResponseDTO result = editalService.create(file, dto);

        assertNotNull(result);
        assertEquals(1L, result.id());
        assertEquals("Edital 2026", result.title());
        assertEquals("Descrição do edital", result.description());
        assertEquals(
                "https://bucket.s3.amazonaws.com/editais/edital.pdf?presigned=abc123",
                result.fileUrl());
        assertEquals("application/pdf", result.mimeType());
        assertNull(result.expiredAt());

        verify(s3Uploader).uploadFile(file, "editais");
        verify(editalRepository).save(any());
    }

    @Test
    void shouldThrowWhenFileSizeExceedsLimit() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getSize()).thenReturn(11 * 1024 * 1024L);

        EditalRequestDTO dto = new EditalRequestDTO("Edital", null, null, null);

        assertThrows(FileSizeValidationException.class, () -> editalService.create(file, dto));

        verifyNoInteractions(s3Uploader, editalRepository);
    }

    @Test
    void shouldThrowWhenFileTypeIsNotAllowed() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("image/png");

        EditalRequestDTO dto = new EditalRequestDTO("Edital", null, null, null);

        assertThrows(FileFormatValidationException.class, () -> editalService.create(file, dto));

        verifyNoInteractions(s3Uploader, editalRepository);
    }

    @Test
    void shouldNotThrowForDocxMimeType() throws Exception {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType())
                .thenReturn(
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        when(file.getOriginalFilename()).thenReturn("edital.docx");

        EditalRequestDTO dto = new EditalRequestDTO("Edital", null, null, null);

        when(s3Uploader.uploadFile(any(MultipartFile.class), any())).thenReturn("https://url");
        when(editalRepository.save(any(Edital.class))).thenReturn(buildEdital(1L, "Edital"));

        assertDoesNotThrow(() -> editalService.create(file, dto));
    }

    @Test
    void shouldThrowRuntimeExceptionWhenS3UploadFails() throws Exception {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("application/pdf");

        EditalRequestDTO dto = new EditalRequestDTO("Edital", null, null, null);

        when(s3Uploader.uploadFile(any(), any())).thenThrow(IOException.class);

        assertThrows(RuntimeException.class, () -> editalService.create(file, dto));

        verifyNoInteractions(editalRepository);
    }

    @Test
    void shouldReturnAllEditais() {
        Edital e1 = buildEdital(1L, "Edital A");
        Edital e2 = buildEdital(2L, "Edital B");

        when(editalRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(e1, e2));

        List<EditalResponseDTO> result = editalService.findAll();

        assertEquals(2, result.size());
        assertEquals("Edital A", result.get(0).title());
        assertEquals("Edital B", result.get(1).title());
    }

    @Test
    void shouldThrowFileFormatExceptionForNonPdfMimeType() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("image/jpeg");

        EditalRequestDTO dto = new EditalRequestDTO("Edital", null, null, null);

        assertThrows(FileFormatValidationException.class, () -> editalService.create(file, dto));
    }

    @Test
    void shouldNotThrowForPdfMimeType() throws Exception {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getOriginalFilename()).thenReturn("edital.pdf");

        EditalRequestDTO dto = new EditalRequestDTO("Edital", null, null, null);

        when(s3Uploader.uploadFile(any(MultipartFile.class), any())).thenReturn("https://url");
        when(editalRepository.save(any(Edital.class))).thenReturn(buildEdital(1L, "Edital"));

        assertDoesNotThrow(() -> editalService.create(file, dto));
    }

    @Test
    void shouldReturnEmptyListWhenNoEditaisExist() {
        when(editalRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of());

        List<EditalResponseDTO> result = editalService.findAll();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void shouldPersistExpiredAtWhenProvided() throws Exception {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getSize()).thenReturn(1024L);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getOriginalFilename()).thenReturn("edital.pdf");

        LocalDateTime expiredAt = LocalDateTime.of(2026, 12, 31, 23, 59);
        EditalRequestDTO dto =
                new EditalRequestDTO("Edital com Prazo", "Descrição", null, expiredAt);

        when(s3Uploader.uploadFile(any(MultipartFile.class), eq("editais")))
                .thenReturn("https://bucket.s3.amazonaws.com/editais/edital.pdf");

        Edital saved = buildEdital(1L, "Edital com Prazo");
        saved.setExpiredAt(expiredAt);
        when(editalRepository.save(any(Edital.class))).thenReturn(saved);

        ArgumentCaptor<Edital> captor = ArgumentCaptor.forClass(Edital.class);

        EditalResponseDTO result = editalService.create(file, dto);

        verify(editalRepository).save(captor.capture());
        assertEquals(expiredAt, captor.getValue().getExpiredAt());
        assertEquals(expiredAt, result.expiredAt());
    }

    private Edital buildEdital(Long id, String title) {
        Edital edital = new Edital();
        edital.setId(id);
        edital.setTitle(title);
        edital.setFileUrl("https://bucket.s3.amazonaws.com/editais/file.pdf");
        edital.setFileName("file.pdf");
        edital.setFileSize(2048L);
        edital.setMimeType("application/pdf");
        edital.setCreatedAt(LocalDateTime.now());
        edital.setUpdatedAt(LocalDateTime.now());
        return edital;
    }
}
