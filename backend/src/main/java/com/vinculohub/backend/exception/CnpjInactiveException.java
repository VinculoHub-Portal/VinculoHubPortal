/* (C)2026 */
package com.vinculohub.backend.exception;

public class CnpjInactiveException extends UnprocessableEntityException {

    public CnpjInactiveException(String cnpj, String situacao) {
        super("CNPJ " + cnpj + " is inactive (situacao: " + situacao + ")");
    }
}
