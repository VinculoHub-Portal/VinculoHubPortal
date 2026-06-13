/* (C)2026 */
package com.vinculohub.backend.config.seed.auth0;

import java.util.Map;

public record ResolvedAuth0Users(Map<String, String> auth0IdByUserKey) {

    public ResolvedAuth0Users {
        auth0IdByUserKey = Map.copyOf(auth0IdByUserKey);
    }

    public String auth0IdFor(String userKey) {
        String auth0Id = auth0IdByUserKey.get(userKey);
        if (auth0Id == null) {
            throw new IllegalArgumentException("Auth0 user was not resolved for key: " + userKey);
        }
        return auth0Id;
    }
}
