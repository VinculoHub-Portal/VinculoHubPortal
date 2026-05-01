/* (C)2026 */
package com.vinculohub.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Setter
@Entity
@Table(
        name = "document",
        indexes = {
            @Index(name = "idx_document_npo", columnList = "npo_id"),
            @Index(name = "idx_document_project", columnList = "project_id")
        })
@SQLRestriction("deleted_at IS NULL")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "npo_id")
    private Npo npo;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    private String title;

    @Column(length = 500)
    private String description;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_size")
    private Integer fileSize; // considere Long se arquivos grandes

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;
}
