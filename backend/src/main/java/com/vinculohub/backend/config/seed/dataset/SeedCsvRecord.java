/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import org.apache.commons.csv.CSVRecord;

final class SeedCsvRecord {

    private static final String LOGICAL_KEY_PATTERN = "[a-z0-9]+(?:_[a-z0-9]+)*";

    private final String fileName;
    private final CSVRecord record;

    SeedCsvRecord(String fileName, CSVRecord record) {
        this.fileName = fileName;
        this.record = record;
    }

    SeedRowSource source() {
        return new SeedRowSource(fileName, record.getRecordNumber() + 1);
    }

    String requiredText(String column) {
        String value = optionalText(column);
        if (value == null) {
            throw error(column, "value is required");
        }
        return value;
    }

    String optionalText(String column) {
        String value = record.get(column).trim();
        return value.isEmpty() ? null : value;
    }

    String logicalKey(String column) {
        String value = requiredText(column);
        if (!value.matches(LOGICAL_KEY_PATTERN)) {
            throw error(column, "must be a lowercase snake_case logical key");
        }
        return value;
    }

    String optionalLogicalKey(String column) {
        String value = optionalText(column);
        if (value != null && !value.matches(LOGICAL_KEY_PATTERN)) {
            throw error(column, "must be a lowercase snake_case logical key");
        }
        return value;
    }

    boolean requiredBoolean(String column) {
        String value = requiredText(column);
        if ("true".equals(value)) {
            return true;
        }
        if ("false".equals(value)) {
            return false;
        }
        throw error(column, "must be true or false");
    }

    Integer requiredInteger(String column) {
        Integer value = optionalInteger(column);
        if (value == null) {
            throw error(column, "value is required");
        }
        return value;
    }

    Integer optionalInteger(String column) {
        String value = optionalText(column);
        if (value == null) {
            return null;
        }
        try {
            return Integer.valueOf(value);
        } catch (NumberFormatException exception) {
            throw error(column, "must be an integer", exception);
        }
    }

    BigDecimal optionalDecimal(String column) {
        String value = optionalText(column);
        if (value == null) {
            return null;
        }
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException exception) {
            throw error(column, "must be a decimal number", exception);
        }
    }

    LocalDate optionalDate(String column) {
        String value = optionalText(column);
        if (value == null) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException exception) {
            throw error(column, "must use ISO-8601 date format YYYY-MM-DD", exception);
        }
    }

    LocalDateTime optionalDateTime(String column) {
        String value = optionalText(column);
        if (value == null) {
            return null;
        }
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException exception) {
            throw error(
                    column, "must use ISO-8601 date-time format YYYY-MM-DDTHH:mm:ss", exception);
        }
    }

    <E extends Enum<E>> E requiredEnum(String column, Class<E> enumType) {
        E value = optionalEnum(column, enumType);
        if (value == null) {
            throw error(column, "value is required");
        }
        return value;
    }

    <E extends Enum<E>> E optionalEnum(String column, Class<E> enumType) {
        String value = optionalText(column);
        if (value == null) {
            return null;
        }
        try {
            return Enum.valueOf(enumType, value);
        } catch (IllegalArgumentException exception) {
            throw error(column, "contains an unsupported enum value", exception);
        }
    }

    SeedDatasetException error(String column, String message) {
        return SeedDatasetException.at(fileName, record.getRecordNumber() + 1, column, message);
    }

    private SeedDatasetException error(String column, String message, Throwable cause) {
        SeedDatasetException exception = error(column, message);
        exception.initCause(cause);
        return exception;
    }
}
