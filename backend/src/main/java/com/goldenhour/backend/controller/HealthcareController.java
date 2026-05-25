package com.goldenhour.backend.controller;

import com.goldenhour.backend.model.Hospital;
import com.goldenhour.backend.service.HealthcareNetworkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/healthcare")
public class HealthcareController {

    private final HealthcareNetworkService healthcareService;

    public HealthcareController(HealthcareNetworkService healthcareService) {
        this.healthcareService = healthcareService;
    }

    @GetMapping("/spain")
    public ResponseEntity<List<Hospital>> getSpainHealthcarePoints(
            @RequestParam(value = "limit", defaultValue = "10000") int limit) {
        List<Hospital> hospitals = healthcareService.getSpainHealthcarePoints(limit);
        return ResponseEntity.ok(hospitals);
    }

    @GetMapping("/closest")
    public ResponseEntity<Hospital> getClosestHospital(
            @RequestParam("lat") double lat,
            @RequestParam("lon") double lon,
            @RequestParam(value = "type", required = false, defaultValue = "all") String type) {
        Hospital closest = healthcareService.findClosestHospital(lat, lon, type);
        if (closest == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(closest);
    }
}
