package com.v1.proyecto.User.Services;

import com.v1.proyecto.auth.model.Users;
import com.v1.proyecto.User.dto.UsersDto;
import com.v1.proyecto.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServices {

    private final UserRepository userRepository; // <-- 2. AÑADE FINAL

    // --- MÉTODOS ACTUALIZADOS PARA USAR DTO ---

    @Transactional(readOnly = true)
    public List<UsersDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToDto) // Convierte cada Users a UsersDto
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<UsersDto> getUserById(Integer id) {
        return userRepository.findById(id)
                .map(this::mapToDto); // Convierte el Users a UsersDto
    }

    @Transactional
    public boolean updateUser(Integer id, UsersDto dto) {
        Optional<Users> userOptional = userRepository.findById(id);

        if (userOptional.isPresent()) {
            Users user = userOptional.get();
            user.setName(dto.getName());
            user.setLastname(dto.getLastname());
            user.setPhone_number(dto.getPhone_number());
            user.setAddress(dto.getAddress());
            user.setEmail(dto.getEmail());
            // Nuevo: Actualizar rol si se envía
            if (dto.getRole() != null) {
                try {
                    user.setRole(com.v1.proyecto.auth.model.Role.valueOf(dto.getRole()));
                } catch (IllegalArgumentException e) {
                    // Ignorar rol inválido o lanzar excepción
                }
            }
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Transactional
    public boolean deleteUser(Integer id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private UsersDto mapToDto(Users user) {
        return UsersDto.builder()
                .id(user.getId())
                .name(user.getName())
                .lastname(user.getLastname())
                .phone_number(user.getPhone_number())
                .address(user.getAddress())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
