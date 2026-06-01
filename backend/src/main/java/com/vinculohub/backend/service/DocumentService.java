/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.DocumentDownloadResponseDTO;
import com.vinculohub.backend.dto.DocumentRequestDTO;
import com.vinculohub.backend.dto.DocumentResponseDTO;
import com.vinculohub.backend.exception.BadRequestException;
import com.vinculohub.backend.exception.FileFormatValidationException;
import com.vinculohub.backend.exception.FileSizeValidationException;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.exception.UserNotFoundException;
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
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final NpoRepository npoRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final S3Uploader s3Uploader;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private static final Duration DOWNLOAD_URL_TTL = Duration.ofMinutes(10);

    private static final List<String> ALLOWED_TYPES =
            List.of(
                    "application/pdf",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/vnd.ms-excel");

    public DocumentResponseDTO upload(
            String auth0Id, MultipartFile file, DocumentRequestDTO docReq) {
        if (auth0Id == null || auth0Id.isBlank()) {
            throw new BadRequestException("Não foi possível identificar o usuário autenticado.");
        }
        User user = userRepository.findByAuth0Id(auth0Id).orElseThrow(UserNotFoundException::new);
        Npo npo =
                npoRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() -> new NotFoundException("ONG não encontrada"));

        if (docReq == null) {
            throw new BadRequestException("Document metadata is required");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileSizeValidationException("File exceeds 5MB limit");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new FileFormatValidationException("Unsupported file type");
        }

        Project project = null;
        if (docReq.getProjectId() != null) {
            project =
                    projectRepository
                            .findById(docReq.getProjectId().longValue())
                            .orElseThrow(() -> new NotFoundException("Project not found"));
        }

        String fileUrl;
        try {
            String folder = "npo/" + npo.getId();
            fileUrl = s3Uploader.uploadFile(file, folder);
        } catch (IOException e) {
            throw new RuntimeException("Storage upload failed: ", e);
        }

        String safeFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        Document document = new Document();
        document.setNpo(npo);
        document.setProject(project);
        document.setTitle(docReq.getTitle());
        document.setDescription(docReq.getDescription());
        document.setFileUrl(fileUrl);
        document.setFileName(safeFileName);
        document.setFileSize((int) file.getSize());
        document.setMimeType(file.getContentType());

        Document saved = documentRepository.save(document);
        return mapToResponse(saved);
    }

    public DocumentResponseDTO upload(MultipartFile file, DocumentRequestDTO docReq) {
        if (docReq == null) {
            throw new BadRequestException("Document metadata is required");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileSizeValidationException("File exceeds 5MB limit");
        }

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new FileFormatValidationException("Unsupported file type");
        }

        if (docReq.getNpoId() == null) {
            throw new BadRequestException("Npo id is required");
        }

        Npo npo =
                npoRepository
                        .findById(docReq.getNpoId())
                        .orElseThrow(() -> new NotFoundException("Npo not found"));

        Project project = null;
        if (docReq.getProjectId() != null) {
            project =
                    projectRepository
                            .findById(docReq.getProjectId().longValue())
                            .orElseThrow(() -> new NotFoundException("Project not found"));
        }

        String fileUrl;
        try {
            String folder = "npo/" + npo.getId();
            fileUrl = s3Uploader.uploadFile(file, folder);
        } catch (IOException e) {
            throw new RuntimeException("Storage upload failed: ", e);
        }

        String safeFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        Document document = new Document();
        document.setNpo(npo);
        document.setProject(project);
        document.setTitle(docReq.getTitle());
        document.setDescription(docReq.getDescription());
        document.setFileUrl(fileUrl);
        document.setFileName(safeFileName);
        document.setFileSize((int) file.getSize());
        document.setMimeType(file.getContentType());

        Document saved = documentRepository.save(document);

        return mapToResponse(saved);
    }

    public List<DocumentResponseDTO> findAll(Integer npoId, Integer projectId) {
        List<Document> documents;

        if (npoId != null && projectId != null) {
            documents = documentRepository.findByNpo_IdAndProject_Id(npoId, projectId);
        } else if (npoId != null) {
            documents = documentRepository.findByNpo_Id(npoId);
        } else if (projectId != null) {
            documents = documentRepository.findByProject_Id(projectId);
        } else {
            documents = documentRepository.findAll();
        }

        return documents.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public Page<DocumentResponseDTO> findAllByAuthenticatedNpo(String auth0Id, Pageable pageable) {
        if (auth0Id == null || auth0Id.isBlank()) {
            throw new BadRequestException("Nao foi possivel identificar o usuario autenticado.");
        }

        User user = userRepository.findByAuth0Id(auth0Id).orElseThrow(UserNotFoundException::new);
        Npo npo =
                npoRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() -> new NotFoundException("ONG nao encontrada"));

        return documentRepository.findByNpo_Id(npo.getId(), pageable).map(this::mapToResponse);
    }

    public DocumentDownloadResponseDTO generateDownloadUrlForAuthenticatedNpo(
            String auth0Id, Integer documentId) {
        if (auth0Id == null || auth0Id.isBlank()) {
            throw new BadRequestException("Nao foi possivel identificar o usuario autenticado.");
        }
        if (documentId == null) {
            throw new BadRequestException("Document id is required");
        }

        User user = userRepository.findByAuth0Id(auth0Id).orElseThrow(UserNotFoundException::new);
        Npo npo =
                npoRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() -> new NotFoundException("ONG nao encontrada"));

        Document document =
                documentRepository
                        .findByIdAndNpo_Id(documentId, npo.getId())
                        .orElseThrow(() -> new NotFoundException("Documento nao encontrado"));

        String downloadUrl =
                s3Uploader.generatePresignedDownloadUrl(document.getFileUrl(), DOWNLOAD_URL_TTL);

        return new DocumentDownloadResponseDTO(
                downloadUrl,
                document.getFileName(),
                document.getMimeType(),
                Instant.now().plus(DOWNLOAD_URL_TTL));
    }

    private DocumentResponseDTO mapToResponse(Document document) {
        DocumentResponseDTO dto = new DocumentResponseDTO();

        dto.setId(document.getId());
        dto.setNpoId(document.getNpo() == null ? null : document.getNpo().getId());
        dto.setProjectId(
                document.getProject() == null ? null : document.getProject().getId().intValue());
        dto.setTitle(document.getTitle());
        dto.setDescription(document.getDescription());
        dto.setFileUrl(document.getFileUrl());
        dto.setFileName(document.getFileName());
        dto.setFileSize(document.getFileSize());
        dto.setMimeType(document.getMimeType());
        dto.setCreatedAt(document.getCreatedAt());
        dto.setUpdatedAt(document.getUpdatedAt());
        dto.setDeletedAt(document.getDeletedAt());

        return dto;
    }
}
