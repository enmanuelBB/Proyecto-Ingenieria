package com.v1.proyecto.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Alterar la tabla user para actualizar el ENUM de roles
            String sql = "ALTER TABLE user MODIFY COLUMN role ENUM('USER', 'ADMIN', 'ANALISTA', 'INVESTIGADOR');";
            jdbcTemplate.execute(sql);
            System.out.println("Schema updated: Role ENUM updated successfully.");
        } catch (Exception e) {
            System.err.println(
                    "Schema update failed (might already be up to date or incompatible DB): " + e.getMessage());
        }
    }
}
