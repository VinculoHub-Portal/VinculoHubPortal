/* (C)2026 */
package com.vinculohub.backend.model;

import com.vinculohub.backend.model.enums.NpoSize;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "npo")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Npo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "user_id")
    private Long userId;

    @Column(length = 1000)
    private String description;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "npo_size", nullable = false)
    private NpoSize npoSize;

    @Column(length = 14)
    private String cnpj;

    @Column(length = 11)
    private String cpf;

    @Column(length = 30)
    private String phone;

    @Column(name = "address_id")
    private Long addressId;

    @Column(nullable = false)
    @Builder.Default
    private Boolean environmental = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean social = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean governance = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
