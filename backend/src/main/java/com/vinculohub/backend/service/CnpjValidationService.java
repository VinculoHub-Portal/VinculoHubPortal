/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.CnpjResponseDto;
import com.vinculohub.backend.exception.CnpjInactiveException;
import com.vinculohub.backend.exception.CnpjNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Service
public class CnpjValidationService {

    private static final String BASE_URL = "https://api.opencnpj.org/";
    private static final String STATUS_ATIVA = "Ativa";

    private final RestClient restClient = RestClient.create();

    public CnpjResponseDto validate(String cnpj) {
        String digits = cnpj.replaceAll("\\D", "");
        CnpjResponseDto result;
        try {
            result = restClient.get().uri(BASE_URL + digits).retrieve().body(CnpjResponseDto.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new CnpjNotFoundException(digits);
        }
        if (result == null || !STATUS_ATIVA.equals(result.situation())) {
            throw new CnpjInactiveException(digits, result != null ? result.situation() : "null");
        }
        return result;
    }
}
