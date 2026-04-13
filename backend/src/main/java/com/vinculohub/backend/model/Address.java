package com.vinculohub.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
@Getter
@Setter
@Entity
@Table(name = "address")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String state;

    @Column(name = "state_code")
    private String stateCode;

    private String city;
    private String street;
    private String number;
    private String complement;

    @Column(name = "zip_code")
    private String zipCode;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}