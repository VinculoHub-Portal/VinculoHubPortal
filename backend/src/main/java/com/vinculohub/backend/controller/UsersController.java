package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.UsersDTO;
import com.vinculohub.backend.service.UsersService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsersController {

    private final UsersService usersService;

    @GetMapping("/{userId}")
    public ResponseEntity<UsersDTO> getUserById(@PathVariable Integer userId) {
        return usersService.findById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UsersDTO> createUser(@RequestBody UsersDTO usersDTO) {
        return ResponseEntity.status(201).body(usersService.createUser(usersDTO));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UsersDTO> updateUser(@PathVariable Integer userId,
                                               @RequestBody UsersDTO usersDTO) {
        return ResponseEntity.ok(usersService.updateUser(userId, usersDTO));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer userId) {
        usersService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}