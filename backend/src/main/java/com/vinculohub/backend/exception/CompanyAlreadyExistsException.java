/* (C)2026 */
package com.vinculohub.backend.exception;

public class CompanyAlreadyExistsException extends BadRequestException {
    public CompanyAlreadyExistsException() {
        super("A company with the same CNPJ already exists.");
    }
}
