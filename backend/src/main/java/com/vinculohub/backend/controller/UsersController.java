package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.UsersDTO;
import com.vinculohub.backend.model.Users;
import com.vinculohub.backend.service.UsersService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsersController {

    private final UsersService usersService;

    @GetMapping("/{userId}")
    public ResponseEntity<UsersDTO> getUserById(@PathVariable Integer userId) {
        Optional<Users> userOptional = usersService.findById(userId);

        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Users user = userOptional.get();

        UsersDTO usersDTO = UsersDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .userType(user.getUserType())
                .build();

        return ResponseEntity.ok(usersDTO);
    }

    @PostMapping
    public ResponseEntity<UsersDTO> createUser(@RequestBody UsersDTO usersDTO) {
        Users createdUser = usersService.createUser(usersDTO);

        UsersDTO responseDTO = UsersDTO.builder()
                .id(createdUser.getId())
                .name(createdUser.getName())
                .email(createdUser.getEmail())
                .userType(createdUser.getUserType())
                .build();

        return ResponseEntity.status(201).body(responseDTO);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UsersDTO> updateUser(@PathVariable Integer userId,
                                               @RequestBody UsersDTO usersDTO) {
        Users updatedUser = usersService.updateUser(userId, usersDTO);

        UsersDTO responseDTO = UsersDTO.builder()
                .id(updatedUser.getId())
                .name(updatedUser.getName())
                .email(updatedUser.getEmail())
                .userType(updatedUser.getUserType())
                .build();

        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer userId) {
        usersService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}