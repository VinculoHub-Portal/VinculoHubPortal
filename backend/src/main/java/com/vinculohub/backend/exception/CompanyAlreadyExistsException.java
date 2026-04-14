package com.vinculohub.backend.exception;

public class CompanyAlreadyExistsException extends BadRequestException {
    public CompanyAlreadyExistsException() {
        super("A comany with the same CNPJ already exists.");
    }
}
