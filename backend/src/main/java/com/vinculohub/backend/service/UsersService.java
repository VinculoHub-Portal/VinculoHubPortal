/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.UsersDTO;
import com.vinculohub.backend.model.UserType;
import com.vinculohub.backend.model.Users;
import com.vinculohub.backend.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsersService {

    private final UsersRepository usersRepository;

    public Users createUser(UsersDTO usersDTO) {
        Users user = new Users();
        user.setFirstName(usersDTO.getFirstName());
        user.setLastName(usersDTO.getLastName());
        user.setEmail(usersDTO.getEmail());
        user.setPassword(usersDTO.getPassword());
        user.setUserType(UserType.valueOf(usersDTO.getUserType()));
        return usersRepository.save(user);
    }

    public UserDTO userToUserDTO(Users user) {
        return UserDTO.builder()
            .name(user.getFirstName() + " " + user.getLastName())
            .email(user.getEmail())
            .userType(user.getUserType().name())
            .build();
    }
}
