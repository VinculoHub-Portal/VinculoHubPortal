package com.vinculohub.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.vinculohub.backend.dto.DocumentRequestDTO;
import com.vinculohub.backend.dto.DocumentResponseDTO;

@Service
public class DocumentService {
    //TODO: upload(file, docReq) implementation
    public <T> DocumentResponseDTO upload(MultipartFile file, DocumentRequestDTO docReq){
        return null;
    }
    //TODO: findAll(npoId, projectId) implementation
    public List<DocumentResponseDTO> findAll(Integer npoId, Integer projectId){
        return null;
    }
}
