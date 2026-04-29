/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.DocumentRequestDTO;
import com.vinculohub.backend.dto.DocumentResponseDTO;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentService {
    // TODO: upload(file, docReq) implementation
    public <T> DocumentResponseDTO upload(MultipartFile file, DocumentRequestDTO docReq) {
        return null;
    }

    // TODO: findAll(npoId, projectId) implementation
    public List<DocumentResponseDTO> findAll(Integer npoId, Integer projectId) {
        return null;
    }
}
