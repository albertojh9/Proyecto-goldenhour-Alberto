package com.goldenhour.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "saved_route")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavedRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "route_name", nullable = false)
    private String routeName;

    @Column(nullable = false)
    private String origin; // "40.4168,-3.7038"

    @Column(nullable = false)
    private String destination; // "41.3874,2.1686"

    @Lob
    @Column(name = "coordinates_json", columnDefinition = "LONGTEXT", nullable = false)
    private String coordinatesJson; // JSON array stringificado: [{order, points:[[lat,lon],...], risk, minutesToClosestHospital}]

    @Column(name = "safe_route", nullable = false)
    private Boolean safeRoute;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
