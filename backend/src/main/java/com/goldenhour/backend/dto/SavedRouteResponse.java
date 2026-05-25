package com.goldenhour.backend.dto;

import com.goldenhour.backend.model.SavedRoute;
import java.time.LocalDateTime;

public record SavedRouteResponse(
    Long id,
    Long userId,
    String routeName,
    String origin,
    String destination,
    String coordinatesJson,
    Boolean safeRoute,
    LocalDateTime createdAt
) {
    public static SavedRouteResponse from(SavedRoute route) {
        return new SavedRouteResponse(
            route.getId(),
            route.getUser().getId(),
            route.getRouteName(),
            route.getOrigin(),
            route.getDestination(),
            route.getCoordinatesJson(),
            route.getSafeRoute(),
            route.getCreatedAt()
        );
    }
}
