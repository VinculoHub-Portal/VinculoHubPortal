/* (C)2026 */
package com.vinculohub.backend.exception;

public class FileSizeValidationException extends RuntimeException {

    public FileSizeValidationException() {
        super("Tamanho de arquivo indevido.");
    }
}
