/* (C)2026 */
package com.vinculohub.backend.exception;

public class UserAlreadyExistsException extends BadRequestException {
    public UserAlreadyExistsException() {
        super("A user with the same email already exists.");
    }
}
