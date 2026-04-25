/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.UsersDTO;
import com.vinculohub.backend.model.Users;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsersService {

    private final UsersRepository usersRepository;

    public Users createUser(UsersDTO usersDTO) {
        Users user =
                Users.builder()
                        .name(usersDTO.firstName())
                        .email(usersDTO.email())
                        .userType(UserType.valueOf(usersDTO.userType()))
                        .build();
        return usersRepository.save(user);
    }

    public UsersDTO userToUserDTO(Users user) {
        if (user == null) {
            return null;
        }
        return UsersDTO.builder()
                .firstName(user.getName())
                .email(user.getEmail())
                .userType(user.getUserType().name())
                .build();
    }
}
