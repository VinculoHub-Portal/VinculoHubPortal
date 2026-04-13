/* (C)2026 */
package com.vinculohub.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CepRawResponseDTO(
        @JsonProperty("cep") String zipCode,
        @JsonProperty("logradouro") String street,
        @JsonProperty("complemento") String complement,
        @JsonProperty("localidade") String city,
        @JsonProperty("uf") String stateCode,
        @JsonProperty("estado") String state,
        @JsonProperty("erro") Boolean hasError) {}
