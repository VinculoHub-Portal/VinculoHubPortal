/* (C)2026 */
package com.vinculohub.backend.exception;

public class CompanyAlreadyExistsException extends BadRequestException {
    public CompanyAlreadyExistsException(String message) {
        super(message);
    }
}
