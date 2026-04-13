package com.vinculohub.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
@Getter
@Setter
@Entity
@Table(name = "company")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "legal_name")
    private String legalName;

    @Column(name = "social_name")
    private String socialName;

    private String description;

    @Column(name = "logo_url")
    private String logoUrl;

    private String cnpj;
    private String phone;

    @OneToOne
    @JoinColumn(name = "address_id")
    private Address address;

    @OneToOne
    @JoinColumn(name = "user_id")
    private Users user;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}