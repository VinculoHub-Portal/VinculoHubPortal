/* (C)2026 */
package com.vinculohub.backend.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Request to start a vínculo (1st handshake — VNC-02). The relationship is always tied to a
 * specific {@code projectId}.
 *
 * <p>When the caller is a <b>Company</b> (interest on a project page), {@code companyId} is ignored
 * and the caller's own company is used. When the caller is an <b>NPO</b> ("Propor Parceria" on a
 * company profile), {@code projectId} must be one of the NPO's own projects and {@code companyId}
 * is the targeted company (required).
 */
public record CreateRelationshipRequest(
        @NotNull(message = "projectId é obrigatório") Long projectId, Integer companyId) {}
