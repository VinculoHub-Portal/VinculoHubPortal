package com.vinculohub.backend.exception;

public class CepNotFoundException extends NotFoundException {

    public CepNotFoundException(String cep) {
        super("CEP not found: " + cep);
    }
}