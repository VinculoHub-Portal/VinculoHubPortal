/* (C)2026 */
package com.vinculohub.backend.repository;

import com.vinculohub.backend.model.Ods;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OdsRepository extends JpaRepository<Ods, Integer> {}
