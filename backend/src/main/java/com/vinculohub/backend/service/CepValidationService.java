/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.CepRawResponseDto;
import com.vinculohub.backend.dto.CepResponseDto;
import com.vinculohub.backend.exception.CepNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class CepValidationService {

    private static final String BASE_URL = "https://viacep.com.br/ws/";

    private final RestClient restClient = RestClient.create();

    public CepResponseDto validate(String cep) {
        String digits = cep.replaceAll("\\D", "");
        CepRawResponseDto raw =
                restClient
                        .get()
                        .uri(BASE_URL + digits + "/json/")
                        .retrieve()
                        .body(CepRawResponseDto.class);

        if (raw == null || Boolean.TRUE.equals(raw.erro())) {
            throw new CepNotFoundException(digits);
        }
        return CepResponseDto.from(raw);
    }
}
