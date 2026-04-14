/* (C)2026 */
package com.vinculohub.backend.exception;

public class AddressNotFoundException extends NotFoundException {
    public AddressNotFoundException() {
        super("Address not found");
    }
}
