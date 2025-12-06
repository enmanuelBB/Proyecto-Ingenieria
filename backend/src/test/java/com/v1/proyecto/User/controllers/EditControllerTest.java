package com.v1.proyecto.User.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.v1.proyecto.User.Services.UserServices;
import com.v1.proyecto.User.dto.UsersDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class EditControllerTest {

    @Mock
    private UserServices userServices;

    @InjectMocks
    private EditController editController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private UsersDto userDto;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(editController).build();
        objectMapper = new ObjectMapper();

        userDto = UsersDto.builder()
                .name("John")
                .lastname("Doe")
                .email("john.doe@example.com")
                .build();
    }

    @Test
    void getAllUsers_ShouldReturnOk() throws Exception {
        when(userServices.getAllUsers()).thenReturn(Arrays.asList(userDto));

        mockMvc.perform(get("/api/v1/user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("john.doe@example.com"));
    }

    @Test
    void getUserById_ShouldReturnOk_WhenUserExists() throws Exception {
        when(userServices.getUserById(1L)).thenReturn(Optional.of(userDto));

        mockMvc.perform(get("/api/v1/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("john.doe@example.com"));
    }

    @Test
    void getUserById_ShouldReturnNotFound_WhenUserDoesNotExist() throws Exception {
        when(userServices.getUserById(1L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/user/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateUser_ShouldReturnOk_WhenUserExists() throws Exception {
        when(userServices.updateUser(eq(1L), any(UsersDto.class))).thenReturn(true);

        mockMvc.perform(put("/api/v1/user/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("Usuario actualizado exitosamente"));
    }

    @Test
    void updateUser_ShouldReturnNotFound_WhenUserDoesNotExist() throws Exception {
        when(userServices.updateUser(eq(1L), any(UsersDto.class))).thenReturn(false);

        mockMvc.perform(put("/api/v1/user/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userDto)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteUser_ShouldReturnOk_WhenUserExists() throws Exception {
        when(userServices.deleteUser(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/v1/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("Usuario eliminado exitosamente"));
    }

    @Test
    void deleteUser_ShouldReturnNotFound_WhenUserDoesNotExist() throws Exception {
        when(userServices.deleteUser(1L)).thenReturn(false);

        mockMvc.perform(delete("/api/v1/user/1"))
                .andExpect(status().isNotFound());
    }
}
