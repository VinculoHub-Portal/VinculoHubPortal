/* (C)2026 */
package com.vinculohub.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class CompanyProjectId implements Serializable {

    @Column(name = "company_id")
    private Integer companyId;

    @Column(name = "project_id")
    private Long projectId;
}
