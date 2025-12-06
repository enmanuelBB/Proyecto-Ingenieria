package com.v1.proyecto.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.v1.proyecto.auth.dto.*;
import com.v1.proyecto.auth.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void register_ShouldReturnOk_WhenRequestIsValid() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("John");
        request.setLastname("Doe");
        request.setEmail("john.doe@example.com");
        request.setPassword("password");
        request.setMfaEnabled(false);

        TokenResponse response = TokenResponse.builder()
                .accessToken("accessToken")
                .refreshToken("refreshToken")
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").value("accessToken"));
    }

    @Test
    void authenticate_ShouldReturnOk_WhenRequestIsValid() throws Exception {
        AuthRequest request = new AuthRequest();
        request.setEmail("john.doe@example.com");
        request.setPassword("password");

        TokenResponse response = TokenResponse.builder()
                .accessToken("accessToken")
                .refreshToken("refreshToken")
                .build();

        when(authService.authenticate(any(AuthRequest.class))).thenReturn(response);

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").value("accessToken"));
    }

    @Test
    void verifyCode_ShouldReturnOk_WhenRequestIsValid() throws Exception {
        VerificationRequest request = new VerificationRequest();
        request.setEmail("john.doe@example.com");
        request.setCode("123456");

        TokenResponse response = TokenResponse.builder()
                .accessToken("accessToken")
                .refreshToken("refreshToken")
                .build();

        when(authService.verifyCode(any(VerificationRequest.class))).thenReturn(response);

        mockMvc.perform(post("/auth/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").value("accessToken"));
    }
}
