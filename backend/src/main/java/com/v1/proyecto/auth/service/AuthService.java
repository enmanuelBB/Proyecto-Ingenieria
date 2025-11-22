package com.v1.proyecto.auth.service;

import com.v1.proyecto.auth.dto.*;
import com.v1.proyecto.auth.model.Role;
import com.v1.proyecto.auth.model.Token;
import com.v1.proyecto.auth.model.Users;
import com.v1.proyecto.auth.repository.TokenRepository;
import com.v1.proyecto.auth.repository.UserRepository;
import com.v1.proyecto.email.service.EmailService; // <-- 1. Importamos el servicio de email
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService; // <-- 2. Inyectamos el servicio

    // --- REGISTRO (Sin cambios importantes, solo asegura enabled=true) ---
    public TokenResponse register(final RegisterRequest request) {
        final Users user = Users.builder()
                .name(request.getName())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .enabled(true)
                .mfaEnabled(false) // Por defecto desactivado
                .build();

        final Users savedUser = repository.save(user);
        final String jwtToken = jwtService.generateToken(savedUser);
        final String refreshToken = jwtService.generateRefreshToken(savedUser);

        saveUserToken(savedUser, jwtToken);
        return TokenResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .mfaEnabled(false)
                .build();
    }

    // --- LOGIN (MODIFICADO PARA 2FA) ---
    public TokenResponse authenticate(final AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        final Users user = repository.findByEmail(request.getEmail())
                .orElseThrow();

        // --- LÓGICA 2FA ---
        if (user.isMfaEnabled()) {
            // 1. Generar código aleatorio de 6 dígitos
            String code = String.format("%06d", new Random().nextInt(999999));

            // 2. Guardar en base de datos
            user.setVerificationCode(code);
            user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(10)); // Valido por 10 min
            repository.save(user);

            // 3. Enviar correo (Asíncrono)
            emailService.sendEmail(
                    user.getEmail(),
                    "Código de Verificación - Cleanbuild",
                    "Hola " + user.getName() + ", tu código de acceso es: " + code
            );

            // 4. Responder SIN tokens, avisando que se requiere código
            return TokenResponse.builder()
                    .mfaEnabled(true)
                    .build();
        }

        // --- FLUJO NORMAL (Sin 2FA) ---
        final String accessToken = jwtService.generateToken(user);
        final String refreshToken = jwtService.generateRefreshToken(user);

        revokeAllUserTokens(user);
        saveUserToken(user, accessToken);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .mfaEnabled(false)
                .build();
    }

    // --- NUEVO MÉTODO: VERIFICAR CÓDIGO 2FA ---
    public TokenResponse verifyCode(final VerificationRequest request) {
        final Users user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 1. Validar si hay código y si no ha expirado
        if (user.getVerificationCode() == null || user.getVerificationCodeExpiresAt() == null) {
            throw new RuntimeException("No hay una solicitud de verificación pendiente.");
        }

        if (LocalDateTime.now().isAfter(user.getVerificationCodeExpiresAt())) {
            throw new RuntimeException("El código de verificación ha expirado. Intenta hacer login de nuevo.");
        }

        // 2. Validar si el código coincide
        if (!user.getVerificationCode().equals(request.getCode())) {
            throw new RuntimeException("Código de verificación incorrecto.");
        }

        // 3. ¡Éxito! Limpiamos el código usado
        user.setVerificationCode(null);
        user.setVerificationCodeExpiresAt(null);
        repository.save(user);

        // 4. Generamos y devolvemos los tokens
        final String accessToken = jwtService.generateToken(user);
        final String refreshToken = jwtService.generateRefreshToken(user);

        revokeAllUserTokens(user);
        saveUserToken(user, accessToken);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .mfaEnabled(false)
                .build();
    }

    // --- Métodos Auxiliares (Sin cambios) ---
    private void saveUserToken(Users user, String jwtToken) {
        final Token token = Token.builder()
                .user(user)
                .token(jwtToken)
                .tokenType(Token.TokenType.BEARER)
                .isExpired(false)
                .isRevoked(false)
                .build();
        tokenRepository.save(token);
    }

    private void revokeAllUserTokens(final Users user) {
        final List<Token> validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
        if (!validUserTokens.isEmpty()) {
            validUserTokens.forEach(token -> {
                token.setIsExpired(true);
                token.setIsRevoked(true);
            });
            tokenRepository.saveAll(validUserTokens);
        }
    }

    public TokenResponse refreshToken(final String authentication) {
        // ... (Tu lógica de refresh token existente)
        if (authentication == null || !authentication.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid auth header");
        }
        final String refreshToken = authentication.substring(7);
        final String userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail == null) {
            return null;
        }

        final Users user = this.repository.findByEmail(userEmail).orElseThrow();
        if (!jwtService.isTokenValid(refreshToken, user)) {
            return null;
        }

        final String accessToken = jwtService.generateRefreshToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, accessToken);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .mfaEnabled(false)
                .build();
    }
}