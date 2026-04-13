/* (C)2026 */
package com.vinculohub.backend.exception;

public class CnpjNotFoundException extends NotFoundException {

    public CnpjNotFoundException(String cnpj) {
        super("CNPJ not found: " + cnpj);
    }
}
