/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByAuth0Id(String auth0Id);

    Optional<User> findByAuth0Id(String auth0Id);
}
