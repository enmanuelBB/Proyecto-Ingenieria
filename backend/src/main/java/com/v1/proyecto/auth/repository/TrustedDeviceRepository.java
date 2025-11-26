package com.v1.proyecto.auth.repository;

import com.v1.proyecto.auth.model.TrustedDevice;
import com.v1.proyecto.auth.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TrustedDeviceRepository extends JpaRepository<TrustedDevice, Integer> {
    // Buscar si existe un registro para este usuario y este dispositivo
    Optional<TrustedDevice> findByUserAndDeviceId(Users user, String deviceId);
}
