/* (C)2026 */
package com.vinculohub.backend.model.enums;

public enum EsgPillar {
    ENVIRONMENTAL("Ambiental"),
    SOCIAL("Social"),
    GOVERNANCE("Governança");

    private final String label;

    EsgPillar(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
