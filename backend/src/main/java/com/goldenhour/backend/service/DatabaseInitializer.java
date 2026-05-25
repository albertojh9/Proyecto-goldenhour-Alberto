package com.goldenhour.backend.service;

import com.goldenhour.backend.model.AppUser;
import com.goldenhour.backend.model.Role;
import com.goldenhour.backend.repository.AppUserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class DatabaseInitializer {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseInitializer(AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    @Transactional
    public void initUsers() {
        System.out.println("[GoldenHour] Base de datos de usuarios iniciada limpia (0 cuentas pre-registradas).");
    }

}
