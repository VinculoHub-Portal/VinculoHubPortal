/* (C)2026 */
package com.vinculohub.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ods {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 255)
    private String description;
}
