package com.vinculohub.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vinculohub.backend.dto.DocumentRequestDTO;
import com.vinculohub.backend.dto.DocumentResponseDTO;
//import com.vinculohub.backend.service.DocumentService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    //private final DocumentService documentService;
    private final ObjectMapper objectMapper;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> uploadDocument(
            @RequestPart("file") MultipartFile file,
            @RequestPart("data") String data
    ) {
        try {
            // FUTURAMENTE: lançar exceção se arquivo for inválido
            // if (file.isEmpty()) throw new IllegalArgumentException("Arquivo vazio");

            // FUTURAMENTE: validar tamanho máximo do arquivo
            // if (file.getSize() > MAX_SIZE) throw new IllegalArgumentException("Arquivo muito grande");

            DocumentRequestDTO dto =
                    objectMapper.readValue(data, DocumentRequestDTO.class);

            // FUTURAMENTE: validar mimeType vs conteúdo real do arquivo
            // (evitar spoof de extensão)

            //REESCREVER O RETORNO
            DocumentResponseDTO response = null; //documentService.upload(file, dto);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body("Erro ao processar requisição: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponseDTO>> getDocuments(
            @RequestParam(required = false) Integer npoId,
            @RequestParam(required = false) Integer projectId
    ) {
        // ⚠️ FUTURO: validar combinação de filtros

        List<DocumentResponseDTO> documents =
                documentService.findAll(npoId, projectId);

        return ResponseEntity.ok(documents);
    }
}