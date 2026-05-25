package com.goldenhour.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record SaveRouteRequest(
    @NotBlank(message = "El nombre de la ruta es obligatorio")
    String routeName,

    @NotBlank(message = "El origen es obligatorio")
    String origin,

    @NotBlank(message = "El destino es obligatorio")
    String destination,

    @NotBlank(message = "Los datos de coordenadas de la ruta son obligatorios")
    String coordinatesJson
) {}
