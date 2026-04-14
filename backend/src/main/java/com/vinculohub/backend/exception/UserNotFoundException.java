/* (C)2026 */
package com.vinculohub.backend.exception;

public class UserNotFoundException extends NotFoundException {
    public UserNotFoundException() {
        super("User not found");
    }
}
