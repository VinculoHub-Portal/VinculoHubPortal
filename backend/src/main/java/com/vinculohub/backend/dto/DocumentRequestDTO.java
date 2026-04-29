/* (C)2026 */
package com.vinculohub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentRequestDTO {

    private Integer id;

    private Integer npoId;

    private Integer projectId;

    @NotBlank
    @Size(max = 255)
    private String title;

    @Size(max = 500)
    private String description;

    @Size(max = 100)
    private String mimeType;
}
