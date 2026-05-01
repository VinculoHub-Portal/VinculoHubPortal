/* (C)2026 */
package com.vinculohub.backend.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentResponseDTO {

    private Integer id;

    private Integer npoId;
    private Integer projectId;

    private String title;
    private String description;

    private String fileUrl;
    private String fileName;
    private Integer fileSize;
    private String mimeType;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    
    private LocalDateTime expiredAt;
}
