/* (C)2026 */
package com.vinculohub.backend.dto;

public record AddressSignupRequest(
        String state,
        String stateCode,
        String city,
        String street,
        String number,
        String complement,
        String zipCode) {}
