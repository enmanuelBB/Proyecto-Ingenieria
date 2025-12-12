package com.v1.proyecto.User.Services;

import com.v1.proyecto.User.dto.UsersDto;
import com.v1.proyecto.auth.model.Role;
import com.v1.proyecto.auth.model.Users;
import com.v1.proyecto.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServicesTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServices userServices;

    private Users user;
    private UsersDto userDto;

    @BeforeEach
    void setUp() {
        user = Users.builder()
                .id(1)
                .name("John")
                .lastname("Doe")
                .email("john.doe@example.com")
                .password("password")
                .role(Role.USER)
                .build();

        userDto = UsersDto.builder()
                .name("John")
                .lastname("Doe")
                .email("john.doe@example.com")
                .build();
    }

    @Test
    void getAllUsers_ShouldReturnListOfUsers() {
        when(userRepository.findAll()).thenReturn(Arrays.asList(user));

        List<UsersDto> result = userServices.getAllUsers();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(user.getEmail(), result.get(0).getEmail());
    }

    @Test
    void getUserById_ShouldReturnUser_WhenUserExists() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        Optional<UsersDto> result = userServices.getUserById(1);

        assertTrue(result.isPresent());
        assertEquals(user.getEmail(), result.get().getEmail());
    }

    @Test
    void getUserById_ShouldReturnEmpty_WhenUserDoesNotExist() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        Optional<UsersDto> result = userServices.getUserById(1);

        assertFalse(result.isPresent());
    }

    @Test
    void updateUser_ShouldReturnTrue_WhenUserExists() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(userRepository.save(any(Users.class))).thenReturn(user);

        boolean result = userServices.updateUser(1, userDto);

        assertTrue(result);
        verify(userRepository).save(user);
    }

    @Test
    void updateUser_ShouldReturnFalse_WhenUserDoesNotExist() {
        when(userRepository.findById(1)).thenReturn(Optional.empty());

        boolean result = userServices.updateUser(1, userDto);

        assertFalse(result);
        verify(userRepository, never()).save(any(Users.class));
    }

    @Test
    void deleteUser_ShouldReturnTrue_WhenUserExists() {
        when(userRepository.existsById(1)).thenReturn(true);

        boolean result = userServices.deleteUser(1);

        assertTrue(result);
        verify(userRepository).deleteById(1);
    }

    @Test
    void deleteUser_ShouldReturnFalse_WhenUserDoesNotExist() {
        when(userRepository.existsById(1)).thenReturn(false);

        boolean result = userServices.deleteUser(1);

        assertFalse(result);
        verify(userRepository, never()).deleteById(anyInt());
    }
}
