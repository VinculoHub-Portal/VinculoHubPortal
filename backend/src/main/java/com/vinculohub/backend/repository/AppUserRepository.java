/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.AppUser;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {

    Optional<AppUser> findByAuth0UserId(String auth0UserId);

    Optional<AppUser> findByEmail(String email);
}
