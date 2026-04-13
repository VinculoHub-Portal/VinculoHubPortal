package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.UsersDTO;
import com.vinculohub.backend.model.Users;
import com.vinculohub.backend.repository.UsersRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsersService {

    private final UsersRepository usersRepository;

    public Optional<UsersDTO> findById(Integer id) {
        return usersRepository.findById(id).map(UsersDTO::from);
    }

    public UsersDTO createUser(UsersDTO dto) {
        Users user = new Users();
        user.setName(dto.name());
        user.setEmail(dto.email());
        user.setUserType(dto.userType());

        return UsersDTO.from(usersRepository.save(user));
    }

    public UsersDTO updateUser(Integer id, UsersDTO dto) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        user.setName(dto.name());
        user.setEmail(dto.email());
        user.setUserType(dto.userType());

        return UsersDTO.from(usersRepository.save(user));
    }

    public void deleteUser(Integer id) {
        usersRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        usersRepository.deleteById(id);
    }
}