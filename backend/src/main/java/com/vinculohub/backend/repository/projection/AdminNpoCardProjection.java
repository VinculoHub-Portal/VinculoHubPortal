/* (C)2026 */
package com.vinculohub.backend.repository.projection;

import java.time.LocalDateTime;

public interface AdminNpoCardProjection {
    Integer getId();

    String getName();

    String getLogoUrl();

    Boolean getActive();

    Boolean getEnvironmental();

    Boolean getSocial();

    Boolean getGovernance();

    String getCity();

    String getStateCode();

    LocalDateTime getCreatedAt();
}
