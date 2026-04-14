/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.UserDTO;
import com.vinculohub.backend.exception.UserAlreadyExistsException;
import com.vinculohub.backend.model.UserType;
import com.vinculohub.backend.model.Users;
import com.vinculohub.backend.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsersService {

    private final UsersRepository usersRepository;

    public Users createUser(UserDTO usersDTO) {
        if (usersRepository.existsByEmail(usersDTO.email())) {
            throw new UserAlreadyExistsException();
        }
        Users user = new Users();
        user.setName(usersDTO.name());
        user.setEmail(usersDTO.email());
        user.setUserType(UserType.company);
        return usersRepository.save(user);
    }

    public UserDTO userToUserDTO(Users user) {
        return UserDTO.builder().name(user.getName()).email(user.getEmail()).build();
    }
}
