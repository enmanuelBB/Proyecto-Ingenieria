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
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Importante para la DB
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID; // Nuevo: Para generar el token de reseteo

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final TrustedDeviceRepository trustedDeviceRepository;

    // --- REGISTRO ---
    @Transactional
    public TokenResponse register(final RegisterRequest request) {
        // ... (lógica existente de registro)
        final Users user = Users.builder()
                .name(request.getName())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .enabled(true)
                .mfaEnabled(request.isMfaEnabled()) // Usamos el valor del DTO para MFA
                .build();

        final Users savedUser = repository.save(user);
        final String jwtToken = jwtService.generateToken(savedUser);
        final String refreshToken = jwtService.generateRefreshToken(savedUser);

        saveUserToken(savedUser, jwtToken);
        return TokenResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .mfaEnabled(false) // No hay desafío MFA en el registro
                .build();
    }

 // --- LOGIN (CON DISPOSITIVOS DE CONFIANZA OBLIGATORIO) ---
    public TokenResponse authenticate(final AuthRequest request) {
        // 1. Autenticar credenciales
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        final Users user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

        // 2. VERIFICACIÓN DE DISPOSITIVO (Para TODOS los usuarios)
        // Si el frontend manda un deviceId, verificamos si es confiable.
        if (request.getDeviceId() != null) {
            var deviceOpt = trustedDeviceRepository.findByUserAndDeviceId(user, request.getDeviceId());

            // Si NO existe el dispositivo o ha expirado -> ENVIAR CÓDIGO
            if (deviceOpt.isEmpty() || deviceOpt.get().getExpiresAt().isBefore(LocalDateTime.now())) {
                
                // Generar código
                String code = String.format("%06d", new Random().nextInt(999999));
                user.setVerificationCode(code);
                user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(10));
                repository.save(user);

                // Enviar correo
                emailService.sendEmail(
                        user.getEmail(),
                        "Nuevo Inicio de Sesión Detectado",
                        "Hola " + user.getName() + ",\n\n" +
                        "Estamos intentando iniciar sesión desde un nuevo dispositivo.\n" +
                        "Tu código de verificación es: " + code
                );

                // Retornamos mfaEnabled = true para que el frontend pida el código
                return TokenResponse.builder()
                        .mfaEnabled(true)
                        .build();
            }
        }

        // 3. Si el dispositivo YA ES CONFIABLE (o no envió ID), generamos tokens
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

    // --- VERIFICAR CÓDIGO (Y GUARDAR DISPOSITIVO) ---
    @Transactional
    public TokenResponse verifyCode(final VerificationRequest request) {
        final Users user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getVerificationCode() == null || user.getVerificationCodeExpiresAt() == null) {
            throw new RuntimeException("No hay una solicitud de verificación pendiente.");
        }

        if (LocalDateTime.now().isAfter(user.getVerificationCodeExpiresAt())) {
            throw new RuntimeException("El código ha expirado.");
        }

        if (!user.getVerificationCode().equals(request.getCode())) {
            throw new RuntimeException("Código incorrecto.");
        }

        // Limpiar código usado
        user.setVerificationCode(null);
        user.setVerificationCodeExpiresAt(null);
        repository.save(user);

        // --- NUEVO: Guardar dispositivo de confianza ---
        if (request.isRememberDevice() && request.getDeviceId() != null) {
            TrustedDevice device = TrustedDevice.builder()
                    .user(user)
                    .deviceId(request.getDeviceId())
                    .expiresAt(LocalDateTime.now().plusDays(30)) // Recordar por 30 días
                    .build();

            trustedDeviceRepository.save(device);
        }

        // Generar tokens
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

    //recuperacion de contraseña

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // 1. Buscar usuario por email. Nota: En producción, es mejor devolver siempre OK
        // para no revelar qué emails están registrados. Aquí lanzamos excepción para debug.
        Users user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ese email"));

        // 2. Generar token único (UUID) y fecha de expiración (ej. 30 min)
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30));

        repository.save(user);

        // 3. Construir el enlace y enviar correo
        // **IMPORTANTE:** Ajusta la URL base (http://localhost:8081) a la de tu Frontend
        String link = "http://localhost:8081/reset-password?token=" + token;

        emailService.sendEmail(
                user.getEmail(),
                "Solicitud de Restablecimiento de Contraseña",
                "Hola " + user.getName() + ",\n\n" +
                        "Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:\n" +
                        link + "\n\n" +
                        "Este enlace es válido solo por 30 minutos."
        );
    }

    /**
     * Completa el proceso de restablecimiento de contraseña usando el token.
     * @param request contiene el token y la nueva contraseña.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // 1. Buscar usuario por el token
        Users user = repository.findByResetToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Token de recuperación inválido o no existente"));

        // 2. Verificar si el token ha expirado
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            // Limpiar el token expirado por seguridad
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            repository.save(user);
            throw new RuntimeException("El token ha expirado. Por favor, solicita un nuevo enlace.");
        }

        // 3. Actualizar y hashear la nueva contraseña
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        // 4. Limpiar el token para que no se pueda usar de nuevo
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        repository.save(user);
    }




    // --- Métodos Auxiliares (Sin cambios) ---
    private void saveUserToken(Users user, String jwtToken) {
        // ... (método saveUserToken)
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
        // ... (método revokeAllUserTokens)
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

        final String accessToken = jwtService.generateToken(user); // Corregido: antes generaba un refresh token de nuevo.
        revokeAllUserTokens(user);
        saveUserToken(user, accessToken);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .mfaEnabled(false)
                .build();
    }
}