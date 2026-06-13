/* (C)2026 */
package com.vinculohub.backend.config.seed.lifecycle;

public class SampleDataSeedException extends RuntimeException {

    public SampleDataSeedException(String message) {
        super(message);
    }

    public SampleDataSeedException(String message, Throwable cause) {
        super(message, cause);
    }
}
