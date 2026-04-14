/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.Company;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Integer> {
    boolean existsByCnpj(String cnpj);

    Optional<Company> findByUserId(Integer userId);
}
