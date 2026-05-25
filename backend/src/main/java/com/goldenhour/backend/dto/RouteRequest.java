package com.goldenhour.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RouteRequest(
    @NotBlank(message = "El origen es obligatorio")
    @Pattern(regexp = "^-?\\d+(\\.\\d+)?,\\s*-?\\d+(\\.\\d+)?$", message = "El origen debe tener el formato latitud,longitud")
    String origin,

    @NotBlank(message = "El destino es obligatorio")
    @Pattern(regexp = "^-?\\d+(\\.\\d+)?,\\s*-?\\d+(\\.\\d+)?$", message = "El destino debe tener el formato latitud,longitud")
    String destination,

    // "FAST" = ruta más corta/rápida (por defecto). "SAFE" = ruta con más cobertura hospitalaria.
    String routeType
) {}
