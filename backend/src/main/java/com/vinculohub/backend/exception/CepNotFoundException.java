/* (C)2026 */
package com.vinculohub.backend.exception;

public class CepNotFoundException extends NotFoundException {

    public CepNotFoundException(String cep) {
        super("CEP não encontrado: " + cep);
    }
}
