/* (C)2026 */
package com.vinculohub.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sdg")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sdg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 50)
    private String name;
}
