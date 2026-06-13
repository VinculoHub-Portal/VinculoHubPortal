/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedException;

public class SeedDatasetException extends SampleDataSeedException {

    public SeedDatasetException(String message) {
        super(message);
    }

    public SeedDatasetException(String message, Throwable cause) {
        super(message, cause);
    }

    public static SeedDatasetException at(
            String fileName, long lineNumber, String column, String message) {
        return new SeedDatasetException(
                "%s:%d [%s] %s".formatted(fileName, lineNumber, column, message));
    }
}
