/* (C)2026 */
package com.vinculohub.backend.config.seed.auth0;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public record ResolvedAuth0Users(Map<String, String> auth0IdByUserKey) {

    public ResolvedAuth0Users {
        auth0IdByUserKey = Map.copyOf(auth0IdByUserKey);
        Set<String> uniqueAuth0Ids = new HashSet<>();
        for (Map.Entry<String, String> entry : auth0IdByUserKey.entrySet()) {
            String auth0Id = entry.getValue();
            if (auth0Id == null || auth0Id.isBlank()) {
                throw new IllegalArgumentException(
                        "Auth0 user id must not be blank for key: " + entry.getKey());
            }
            if (!uniqueAuth0Ids.add(auth0Id)) {
                throw new IllegalArgumentException(
                        "Auth0 user id is associated with more than one seed user.");
            }
        }
    }

    public String auth0IdFor(String userKey) {
        String auth0Id = auth0IdByUserKey.get(userKey);
        if (auth0Id == null) {
            throw new IllegalArgumentException("Auth0 user was not resolved for key: " + userKey);
        }
        return auth0Id;
    }
}
