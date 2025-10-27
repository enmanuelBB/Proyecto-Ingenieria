package com.v1.proyecto.auth.service;

import com.v1.proyecto.auth.config.JwtProperties;
import com.v1.proyecto.models.Users;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;


@Service
@AllArgsConstructor
public class JwtService {

    private final JwtProperties jwtProperties;

    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public String generateToken(final Users user) {
        return buildToken(user, jwtProperties.getExpiration());
    }

    public String generateRefreshToken(final Users user) {
        return buildToken(user, jwtProperties.getRefreshExpiration());
    }

    private String buildToken(final Users user, final long expiration) {


        var extraClaims = new HashMap<String, Object>();

        extraClaims.put("name", user.getName());


        extraClaims.put("authorities", user.getAuthorities());


        return Jwts
                .builder()
                .claims(extraClaims)
                .subject(user.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey())
                .compact();
    }


    public boolean isTokenValid(String token, Users user) {
        final String username = extractUsername(token);
        return (username.equals(user.getEmail())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
    }

    private SecretKey getSignInKey() {
        final byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.getSecretKey());
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
