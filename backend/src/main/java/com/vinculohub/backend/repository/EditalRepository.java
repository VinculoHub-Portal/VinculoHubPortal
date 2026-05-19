/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.Edital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EditalRepository extends JpaRepository<Edital, Long> {}
