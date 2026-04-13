/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.CepRawResponseDTO;
import com.vinculohub.backend.dto.CepResponseDTO;
import com.vinculohub.backend.exception.CepNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class CepValidationService {

    private static final String BASE_URL = "https://viacep.com.br/ws/";

    private final RestClient restClient = RestClient.create();

    public CepResponseDTO validate(String cep) {
        String digits = cep.replaceAll("\\D", "");
        CepRawResponseDTO raw =
                restClient
                        .get()
                        .uri(BASE_URL + digits + "/json/")
                        .retrieve()
                        .body(CepRawResponseDTO.class);

        if (raw == null || Boolean.TRUE.equals(raw.hasError())) {
            throw new CepNotFoundException(digits);
        }
        return CepResponseDTO.from(raw);
    }
}
