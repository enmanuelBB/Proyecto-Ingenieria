package com.v1.proyecto.auth.service;

import com.v1.proyecto.auth.dto.*;
import com.v1.proyecto.auth.model.Role;
import com.v1.proyecto.auth.model.Token;
import com.v1.proyecto.auth.model.TrustedDevice;
import com.v1.proyecto.auth.model.Users;
import com.v1.proyecto.auth.repository.TokenRepository;
import com.v1.proyecto.auth.repository.TrustedDeviceRepository;
import com.v1.proyecto.auth.repository.UserRepository;
import com.v1.proyecto.email.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository repository;
    @Mock
    private TokenRepository tokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private EmailService emailService;
    @Mock
    private TrustedDeviceRepository trustedDeviceRepository;

    @InjectMocks
    private AuthService authService;

    private Users user;
    private RegisterRequest registerRequest;
    private AuthRequest authRequest;

    @BeforeEach
    void setUp() {
        user = Users.builder()
                .id(1)
                .name("John")
                .lastname("Doe")
                .email("john.doe@example.com")
                .password("encodedPassword")
                .role(Role.USER)
                .build();

        registerRequest = new RegisterRequest();
        registerRequest.setName("John");
        registerRequest.setLastname("Doe");
        registerRequest.setEmail("john.doe@example.com");
        registerRequest.setPassword("password");
        registerRequest.setMfaEnabled(false);

        authRequest = new AuthRequest();
        authRequest.setEmail("john.doe@example.com");
        authRequest.setPassword("password");
    }

    @Test
    void register_ShouldReturnTokenResponse_WhenRequestIsValid() {
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(repository.save(any(Users.class))).thenReturn(user);
        when(jwtService.generateToken(any(Users.class))).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any(Users.class))).thenReturn("refreshToken");

        TokenResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        assertEquals("refreshToken", response.getRefreshToken());
        verify(repository).save(any(Users.class));
        verify(tokenRepository).save(any(Token.class));
    }

    @Test
    void authenticate_ShouldReturnTokenResponse_WhenCredentialsAreValidAndNoDeviceCheck() {
        when(repository.findByEmail(authRequest.getEmail())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any(Users.class))).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any(Users.class))).thenReturn("refreshToken");

        TokenResponse response = authService.authenticate(authRequest);

        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        assertFalse(response.isMfaEnabled());
    }

    @Test
    void authenticate_ShouldTriggerMFA_WhenDeviceIsNotTrusted() {
        authRequest.setDeviceId("unknown-device");
        when(repository.findByEmail(authRequest.getEmail())).thenReturn(Optional.of(user));
        when(trustedDeviceRepository.findByUserAndDeviceId(user, "unknown-device")).thenReturn(Optional.empty());

        TokenResponse response = authService.authenticate(authRequest);

        assertNotNull(response);
        assertTrue(response.isMfaEnabled());
        verify(emailService).sendEmail(eq(user.getEmail()), anyString(), anyString());
        verify(repository).save(user); // Saves verification code
    }

    @Test
    void authenticate_ShouldReturnTokens_WhenDeviceIsTrusted() {
        authRequest.setDeviceId("trusted-device");
        TrustedDevice trustedDevice = TrustedDevice.builder()
                .deviceId("trusted-device")
                .user(user)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        when(repository.findByEmail(authRequest.getEmail())).thenReturn(Optional.of(user));
        when(trustedDeviceRepository.findByUserAndDeviceId(user, "trusted-device"))
                .thenReturn(Optional.of(trustedDevice));
        when(jwtService.generateToken(any(Users.class))).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any(Users.class))).thenReturn("refreshToken");

        TokenResponse response = authService.authenticate(authRequest);

        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        assertFalse(response.isMfaEnabled());
    }

    @Test
    void authenticate_ShouldThrowException_WhenUserNotFound() {
        when(repository.findByEmail(authRequest.getEmail())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.authenticate(authRequest));
    }

    @Test
    void verifyCode_ShouldReturnTokens_WhenCodeIsValid() {
        user.setVerificationCode("123456");
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(10));

        VerificationRequest request = new VerificationRequest();
        request.setEmail(user.getEmail());
        request.setCode("123456");
        request.setDeviceId("new-device");
        request.setRememberDevice(true);

        when(repository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any(Users.class))).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any(Users.class))).thenReturn("refreshToken");

        TokenResponse response = authService.verifyCode(request);

        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        verify(trustedDeviceRepository).save(any(TrustedDevice.class));
    }

    @Test
    void verifyCode_ShouldThrowException_WhenCodeIsInvalid() {
        user.setVerificationCode("123456");
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(10));

        VerificationRequest request = new VerificationRequest();
        request.setEmail(user.getEmail());
        request.setCode("wrong-code");

        when(repository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));

        assertThrows(RuntimeException.class, () -> authService.verifyCode(request));
    }

    @Test
    void forgotPassword_ShouldSendEmail_WhenUserExists() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("john.doe@example.com");

        when(repository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));

        authService.forgotPassword(request);

        verify(repository).save(user); // Saves reset token
        verify(emailService).sendEmail(eq(user.getEmail()), anyString(), anyString());
    }

    @Test
    void resetPassword_ShouldUpdatePassword_WhenTokenIsValid() {
        user.setResetToken("valid-token");
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10));

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setNewPassword("newPassword");

        when(repository.findByResetToken("valid-token")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");

        authService.resetPassword(request);

        verify(repository).save(user);
        assertNull(user.getResetToken());
    }

    @Test
    void refreshToken_ShouldReturnNewToken_WhenRefreshTokenIsValid() {
        String refreshToken = "validRefreshToken";
        String authHeader = "Bearer " + refreshToken;

        when(jwtService.extractUsername(refreshToken)).thenReturn(user.getEmail());
        when(repository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(jwtService.isTokenValid(refreshToken, user)).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("newAccessToken");

        TokenResponse response = authService.refreshToken(authHeader);

        assertNotNull(response);
        assertEquals("newAccessToken", response.getAccessToken());
    }
}
