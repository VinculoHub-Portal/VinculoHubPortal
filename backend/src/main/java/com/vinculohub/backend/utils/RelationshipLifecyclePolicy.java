/* (C)2026 */
package com.vinculohub.backend.utils;

import com.vinculohub.backend.model.CompanyProject;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import java.time.LocalDateTime;

public final class RelationshipLifecyclePolicy {

    private RelationshipLifecyclePolicy() {}

    public static String validate(CompanyProject relationship) {
        return validate(
                relationship.getStatus(),
                relationship.getCompanyConfirmedAt(),
                relationship.getNpoConfirmedAt(),
                relationship.getRespondedAt());
    }

    public static String validate(
            RelationshipStatus status,
            LocalDateTime companyConfirmedAt,
            LocalDateTime npoConfirmedAt,
            LocalDateTime respondedAt) {
        boolean responded = respondedAt != null;
        boolean companyConfirmed = companyConfirmedAt != null;
        boolean npoConfirmed = npoConfirmedAt != null;
        boolean bothConfirmed = companyConfirmed && npoConfirmed;

        if (status == RelationshipStatus.pending
                && (responded || companyConfirmed || npoConfirmed)) {
            return "pending relationship cannot be answered or confirmed";
        }
        if (status == RelationshipStatus.inactive
                && (!responded || companyConfirmed || npoConfirmed)) {
            return "inactive relationship must be answered and cannot be confirmed";
        }
        if (status == RelationshipStatus.negotiation && (!responded || bothConfirmed)) {
            return "negotiation relationship must be answered and cannot have both confirmations";
        }
        if (status == RelationshipStatus.active && (!responded || !bothConfirmed)) {
            return "active relationship must be answered and confirmed by both sides";
        }
        if (responded && companyConfirmed && companyConfirmedAt.isBefore(respondedAt)) {
            return "company confirmation cannot precede the relationship response";
        }
        if (responded && npoConfirmed && npoConfirmedAt.isBefore(respondedAt)) {
            return "NPO confirmation cannot precede the relationship response";
        }
        return null;
    }
}
