package com.v1.proyecto.auth.service;

import com.v1.proyecto.auth.config.JwtProperties;
import com.v1.proyecto.auth.model.Role;
import com.v1.proyecto.auth.model.Users;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @Mock
    private JwtProperties jwtProperties;

    @InjectMocks
    private JwtService jwtService;

    private Users user;
    private String secretKey;

    @BeforeEach
    void setUp() {
        // Generate a safe HS256 key
        Key key = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS256);
        secretKey = Base64.getEncoder().encodeToString(key.getEncoded());

        user = Users.builder()
                .id(1)
                .name("John")
                .lastname("Doe")
                .email("john.doe@example.com")
                .password("password")
                .role(Role.USER)
                .build();
    }

    @Test
    void extractUsername_ShouldReturnUsername_WhenTokenIsValid() {
        when(jwtProperties.getSecretKey()).thenReturn(secretKey);
        when(jwtProperties.getExpiration()).thenReturn(1000L * 60 * 24); // 24 hours

        String token = jwtService.generateToken(user);
        String username = jwtService.extractUsername(token);

        assertEquals(user.getEmail(), username);
    }

    @Test
    void generateToken_ShouldReturnToken_WhenUserIsValid() {
        when(jwtProperties.getSecretKey()).thenReturn(secretKey);
        when(jwtProperties.getExpiration()).thenReturn(1000L * 60 * 24);

        String token = jwtService.generateToken(user);

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void isTokenValid_ShouldReturnTrue_WhenTokenIsValid() {
        when(jwtProperties.getSecretKey()).thenReturn(secretKey);
        when(jwtProperties.getExpiration()).thenReturn(1000L * 60 * 24);

        String token = jwtService.generateToken(user);

        assertTrue(jwtService.isTokenValid(token, user));
    }

    @Test
    void isTokenValid_ShouldReturnFalse_WhenUsernameDoesNotMatch() {
        when(jwtProperties.getSecretKey()).thenReturn(secretKey);
        when(jwtProperties.getExpiration()).thenReturn(1000L * 60 * 24);

        String token = jwtService.generateToken(user);

        Users otherUser = Users.builder().email("other@example.com").build();

        assertFalse(jwtService.isTokenValid(token, otherUser));
    }

    @Test
    void generateRefreshToken_ShouldReturnToken() {
        when(jwtProperties.getSecretKey()).thenReturn(secretKey);
        when(jwtProperties.getRefreshExpiration()).thenReturn(1000L * 60 * 24 * 7);

        String token = jwtService.generateRefreshToken(user);

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }
}
