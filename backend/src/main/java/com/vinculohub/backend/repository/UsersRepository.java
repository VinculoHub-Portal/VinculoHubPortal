/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.Users;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsersRepository extends JpaRepository<Users, Integer> {
    boolean existsByEmailIgnoreCase(String email);

    boolean existsByAuth0Id(String auth0Id);

    Optional<Users> findByAuth0Id(String auth0Id);
}
