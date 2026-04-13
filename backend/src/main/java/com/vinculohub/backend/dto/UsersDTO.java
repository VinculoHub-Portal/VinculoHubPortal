/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.UserType;
import com.vinculohub.backend.model.Users;
import lombok.Builder;

@Builder
public record UsersDTO(Integer id, String name, String email, UserType userType) {

    public static UsersDTO from(Users user) {
        return UsersDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .userType(user.getUserType())
                .build();
    }
}
