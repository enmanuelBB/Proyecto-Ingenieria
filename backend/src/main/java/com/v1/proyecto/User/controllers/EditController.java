package com.v1.proyecto.User.controllers;

import com.v1.proyecto.User.Services.UserServices;
import com.v1.proyecto.auth.model.Users;
import com.v1.proyecto.User.dto.UsersDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class EditController {

    private final UserServices userServices;

    //mostrar todos los usuarios
    @GetMapping("")
    public ResponseEntity<List<UsersDto>> getAllUsers() {
        try {
            List<UsersDto> users = userServices.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //obtener usuario por id
    @GetMapping("/{id}")
    public ResponseEntity<UsersDto> getUserById(@PathVariable (name= "id") Long id) {
        try {
            Optional<UsersDto> user = userServices.getUserById(id);
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //actualizar
    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable (name= "id") Long id, @RequestBody UsersDto dto) {
        try {
            boolean updated = userServices.updateUser(id, dto);
            if (updated) {
                return ResponseEntity.ok("Usuario actualizado exitosamente");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Usuario no encontrado con ID: " + id);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al actualizar el usuario: " + e.getMessage());
        }
    }

    //eliminar usuario por id
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable (name= "id") Long id) {
        try {
            boolean deleted = userServices.deleteUser(id);
            if (deleted) {
                return ResponseEntity.ok("Usuario eliminado exitosamente");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Usuario no encontrado con ID: " + id);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al eliminar el usuario: " + e.getMessage());
        }
    }
}
