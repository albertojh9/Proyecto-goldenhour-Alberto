package com.goldenhour.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hospital")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private String category; // 'hospital', 'centro_salud'

    private String address;

    @Column(name = "service_type")
    private String serviceType; // 'urgencias', 'atencion_primaria'

    @Column(name = "emergency_phone")
    private String emergencyPhone;
}
