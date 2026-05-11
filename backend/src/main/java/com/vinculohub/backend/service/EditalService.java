/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.EditalRequestDTO;
import com.vinculohub.backend.dto.EditalResponseDTO;
import com.vinculohub.backend.exception.FileFormatValidationException;
import com.vinculohub.backend.exception.FileSizeValidationException;
import com.vinculohub.backend.model.Edital;
import com.vinculohub.backend.repository.EditalRepository;
import com.vinculohub.backend.service.storage.S3Uploader;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class EditalService {

    private final EditalRepository editalRepository;
    private final S3Uploader s3Uploader;

    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;
    private static final String ALLOWED_TYPE = "application/pdf";

    @Transactional
    public EditalResponseDTO create(MultipartFile file, EditalRequestDTO dto) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileSizeValidationException("File exceeds 10MB limit");
        }

        if (!ALLOWED_TYPE.equals(file.getContentType())) {
            throw new FileFormatValidationException("Only PDF files are allowed");
        }

        String fileUrl;
        try {
            fileUrl = s3Uploader.uploadFile(file, "editais");
        } catch (IOException e) {
            throw new RuntimeException("Storage upload failed: ", e);
        }

        Edital edital = new Edital();
        edital.setTitle(dto.title());
        edital.setDescription(dto.description());
        edital.setFileUrl(fileUrl);
        edital.setFileName(UUID.randomUUID() + "_" + file.getOriginalFilename());
        edital.setFileSize(file.getSize());
        edital.setMimeType(file.getContentType());

        return mapToResponse(editalRepository.save(edital));
    }

    @Transactional(readOnly = true)
    public List<EditalResponseDTO> findAll() {
        return editalRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private EditalResponseDTO mapToResponse(Edital edital) {
        return new EditalResponseDTO(
                edital.getId(),
                edital.getTitle(),
                edital.getDescription(),
                edital.getFileUrl(),
                edital.getFileName(),
                edital.getFileSize(),
                edital.getMimeType(),
                edital.getExpiredAt(),
                edital.getCreatedAt(),
                edital.getUpdatedAt());
    }
}
