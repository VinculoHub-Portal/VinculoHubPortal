/* (C)2026 */
package com.vinculohub.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CnpjResponseDto(
        String cnpj,
        @JsonProperty("razao_social") String legalName,
        @JsonProperty("nome_fantasia") String tradeName,
        @JsonProperty("situacao_cadastral") String situation) {}
