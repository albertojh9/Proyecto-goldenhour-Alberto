package com.goldenhour.backend.service;

import com.goldenhour.backend.dto.LoginRequest;
import com.goldenhour.backend.dto.RegisterRequest;
import com.goldenhour.backend.dto.TokenResponse;
import com.goldenhour.backend.dto.UserResponse;
import com.goldenhour.backend.model.AppUser;
import com.goldenhour.backend.model.Role;
import com.goldenhour.backend.repository.AppUserRepository;
import com.goldenhour.backend.config.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AppUserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("El correo electrónico ya está registrado");
        }

        AppUser user = new AppUser();
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);
        user.setCreatedAt(LocalDateTime.now());

        AppUser savedUser = userRepository.save(user);
        return UserResponse.from(savedUser);
    }

    @Transactional(readOnly = true)
    public TokenResponse login(LoginRequest request) {
        AppUser user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciales inválidas");
        }

        String token = tokenProvider.generateToken(user);
        return new TokenResponse(token);
    }
}
