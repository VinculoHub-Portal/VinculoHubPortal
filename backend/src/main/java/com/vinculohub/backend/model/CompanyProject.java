/* (C)2026 */
package com.vinculohub.backend.model;

import com.vinculohub.backend.model.enums.InitiatorType;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

@Entity
@Table(name = "company_project")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyProject {

    @EmbeddedId private CompanyProjectId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("companyId")
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("projectId")
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "status", columnDefinition = "relationship_status")
    @Builder.Default
    private RelationshipStatus status = RelationshipStatus.pending;

    @Column(name = "company_confirmed", nullable = false)
    @Builder.Default
    private Boolean companyConfirmed = false;

    @Column(name = "npo_confirmed", nullable = false)
    @Builder.Default
    private Boolean npoConfirmed = false;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "initiator_type", columnDefinition = "initiator_type")
    @Builder.Default
    private InitiatorType initiatorType = InitiatorType.company;

    @Column(name = "company_confirmed_at")
    private LocalDateTime companyConfirmedAt;

    @Column(name = "npo_confirmed_at")
    private LocalDateTime npoConfirmedAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
