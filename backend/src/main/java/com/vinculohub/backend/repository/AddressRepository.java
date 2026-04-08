package com.vinculohub.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.vinculohub.backend.model.Address;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {
}