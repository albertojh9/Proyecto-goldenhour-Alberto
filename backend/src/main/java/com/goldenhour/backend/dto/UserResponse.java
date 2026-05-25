package com.goldenhour.backend.dto;

import com.goldenhour.backend.model.AppUser;
import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String email,
    String fullName,
    String role,
    LocalDateTime createdAt
) {
    public static UserResponse from(AppUser user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole().name(),
            user.getCreatedAt()
        );
    }
}
