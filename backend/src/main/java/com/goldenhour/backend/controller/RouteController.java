package com.goldenhour.backend.controller;

import com.goldenhour.backend.dto.RouteRequest;
import com.goldenhour.backend.dto.SaveRouteRequest;
import com.goldenhour.backend.dto.SavedRouteResponse;
import com.goldenhour.backend.model.AppUser;
import com.goldenhour.backend.model.SavedRoute;
import com.goldenhour.backend.repository.AppUserRepository;
import com.goldenhour.backend.repository.SavedRouteRepository;
import com.goldenhour.backend.service.RouteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteService routeService;
    private final AppUserRepository userRepository;
    private final SavedRouteRepository savedRouteRepository;

    public RouteController(RouteService routeService, AppUserRepository userRepository, SavedRouteRepository savedRouteRepository) {
        this.routeService = routeService;
        this.userRepository = userRepository;
        this.savedRouteRepository = savedRouteRepository;
    }

    @PostMapping("/calculate")
    public ResponseEntity<?> calculateRoute(@Valid @RequestBody RouteRequest request) {
        try {
            Map<String, Object> result = routeService.calculateRoute(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al calcular la ruta: " + e.getMessage()));
        }
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveRoute(@Valid @RequestBody SaveRouteRequest request) {
        try {
            // Extraer email del usuario logueado en el contexto de seguridad
            String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            AppUser user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

            SavedRoute route = new SavedRoute();
            route.setUser(user);
            route.setRouteName(request.routeName());
            route.setOrigin(request.origin());
            route.setDestination(request.destination());
            route.setCoordinatesJson(request.coordinatesJson());
            
            // Determinar si es una ruta completamente segura globalmente.
            // Es segura si no contiene segmentos etiquetados como CRITICAL (Rojo).
            boolean isSafe = !request.coordinatesJson().contains("\"risk\":\"CRITICAL\"");
            route.setSafeRoute(isSafe);
            route.setCreatedAt(LocalDateTime.now());

            SavedRoute saved = savedRouteRepository.save(route);
            return ResponseEntity.status(HttpStatus.CREATED).body(SavedRouteResponse.from(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al guardar la ruta: " + e.getMessage()));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> listRoutes() {
        try {
            String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            AppUser user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

            List<SavedRoute> routes = savedRouteRepository.findByUserOrderByCreatedAtDesc(user);
            List<SavedRouteResponse> response = routes.stream().map(SavedRouteResponse::from).toList();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al recuperar las rutas: " + e.getMessage()));
        }
    }
}
