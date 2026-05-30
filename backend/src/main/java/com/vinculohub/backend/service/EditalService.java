/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.EditalRequestDTO;
import com.vinculohub.backend.dto.EditalResponseDTO;
import com.vinculohub.backend.dto.OdsResponse;
import com.vinculohub.backend.exception.FileFormatValidationException;
import com.vinculohub.backend.exception.FileSizeValidationException;
import com.vinculohub.backend.model.Edital;
import com.vinculohub.backend.model.Ods;
import com.vinculohub.backend.repository.EditalRepository;
import com.vinculohub.backend.service.storage.S3Uploader;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
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
    private final OdsService odsService;

    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES =
            Set.of(
                    "application/pdf",
                    "application/x-pdf",
                    "application/acrobat",
                    "application/vnd.pdf",
                    "text/pdf",
                    "text/x-pdf",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/msword");

    @Transactional
    public EditalResponseDTO create(MultipartFile file, EditalRequestDTO dto) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileSizeValidationException("File exceeds 10MB limit");
        }

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new FileFormatValidationException("Only PDF and DOCX files are allowed");
        }

        String fileUrl;
        try {
            fileUrl = s3Uploader.uploadFile(file, "editais");
        } catch (IOException e) {
            throw new RuntimeException("Storage upload failed: ", e);
        }

        Set<Ods> ods = Set.of();
        if (dto.odsIds() != null && !dto.odsIds().isEmpty()) {
            List<String> odsStringIds = dto.odsIds().stream().map(String::valueOf).toList();
            ods = odsService.resolveSelection(odsStringIds);
        }

        Edital edital = new Edital();
        edital.setTitle(dto.title());
        edital.setDescription(dto.description());
        edital.setFileUrl(fileUrl);
        edital.setFileName(UUID.randomUUID() + "_" + file.getOriginalFilename());
        edital.setFileSize(file.getSize());
        edital.setMimeType(file.getContentType());
        edital.setExpiredAt(dto.expiredAt());
        edital.setOds(ods);

        return mapToResponse(editalRepository.save(edital));
    }

    @Transactional(readOnly = true)
    public List<EditalResponseDTO> findAll() {
        return editalRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EditalResponseDTO> findAllActive() {
        return editalRepository.findAllActiveOrderByCreatedAtDesc(LocalDateTime.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private EditalResponseDTO mapToResponse(Edital edital) {
        Set<Ods> odsSet = edital.getOds() == null ? Set.of() : edital.getOds();
        List<OdsResponse> odsList =
                odsSet.stream()
                        .map(o -> new OdsResponse(o.getId(), o.getName(), o.getDescription()))
                        .toList();

        return new EditalResponseDTO(
                edital.getId(),
                edital.getTitle(),
                edital.getDescription(),
                edital.getFileUrl(),
                edital.getFileName(),
                edital.getFileSize(),
                edital.getMimeType(),
                odsList,
                edital.getExpiredAt(),
                edital.getCreatedAt(),
                edital.getUpdatedAt());
    }
}
