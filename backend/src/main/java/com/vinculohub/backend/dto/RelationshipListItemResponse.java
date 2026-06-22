/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.RelationshipStatus;

/**
 * One row of the "Meus Vínculos" panel (VNC-01).
 *
 * <p>{@code partnerContactEmail}/{@code partnerContactPhone} are only populated once the
 * relationship reaches {@code negotiation} or {@code active} (1st handshake accepted — VNC-03);
 * they are {@code null} while {@code pending}. {@code canRespond} and {@code canConfirm} tell the
 * caller which actions it may take given its role in this specific relationship.
 */
public record RelationshipListItemResponse(
        Long projectId,
        String projectName,
        Integer partnerInstitutionId,
        String partnerInstitutionName,
        RelationshipStatus status,
        String partnerContactEmail,
        String partnerContactPhone,
        boolean canRespond,
        boolean canConfirm) {}
