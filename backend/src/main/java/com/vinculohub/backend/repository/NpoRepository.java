/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.Npo;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NpoRepository extends JpaRepository<Npo, Long> {

    Optional<Npo> findByUserId(Long userId);

    Optional<Npo> findByCnpj(String cnpj);

    Optional<Npo> findByCpf(String cpf);

    boolean existsByUserId(Long userId);

    boolean existsByCnpj(String cnpj);

    boolean existsByCpf(String cpf);
}
