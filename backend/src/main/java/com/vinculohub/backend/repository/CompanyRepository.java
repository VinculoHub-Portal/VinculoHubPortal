package com.vinculohub.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.vinculohub.backend.model.Company;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Integer> {
}