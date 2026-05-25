package com.goldenhour.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.goldenhour.backend.model.Hospital;
import com.goldenhour.backend.repository.HospitalRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class HealthcareNetworkService {

    private final HospitalRepository hospitalRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public HealthcareNetworkService(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @PostConstruct
    public void initSeedData() {
        // Cargar toda la base de datos sanitaria de España de forma síncrona y ultra rápida desde el recurso local
        loadSpainHealthcareFromJson();
    }

    @Transactional
    public void loadSpainHealthcareFromJson() {
        if (hospitalRepository.count() < 100) {
            try (java.io.InputStream is = getClass().getResourceAsStream("/spain_healthcare.json")) {
                if (is != null) {
                    System.out.println("[GoldenHour] Cargando base de datos completa de España desde spain_healthcare.json...");
                    List<Hospital> hospitals = objectMapper.readValue(is, 
                        objectMapper.getTypeFactory().constructCollectionType(List.class, Hospital.class));
                    
                    // Set IDs to null so H2 autogenerates correct sequential IDs
                    for (Hospital h : hospitals) {
                        h.setId(null);
                    }
                    
                    hospitalRepository.saveAll(hospitals);
                    System.out.println("[GoldenHour] ¡Base de datos cargada con éxito! Se han insertado " + hospitalRepository.count() + " centros sanitarios reales de España.");
                } else {
                    System.err.println("[GoldenHour] No se pudo encontrar el archivo spain_healthcare.json en los recursos, usando semilla básica.");
                    insertBasicSeed();
                }
            } catch (Exception e) {
                System.err.println("[GoldenHour] Error al cargar la base de datos desde JSON, usando semilla básica: " + e.getMessage());
                insertBasicSeed();
            }
        } else {
            System.out.println("[GoldenHour] La base de datos ya contiene " + hospitalRepository.count() + " puntos de salud de España.");
        }
    }

    @Transactional
    public void insertBasicSeed() {
        if (hospitalRepository.count() == 0) {
            List<Hospital> seedHospitals = Arrays.asList(
                // Madrid
                new Hospital(null, "Hospital Universitario 12 de Octubre", 40.3631, -3.7495, "hospital", "Madrid", "urgencias", "911"),
                new Hospital(null, "Hospital Universitario La Paz", 40.4806, -3.6795, "hospital", "Madrid", "urgencias", "911"),
                new Hospital(null, "Hospital General Universitario Gregorio Marañón", 40.4192, -3.6719, "hospital", "Madrid", "urgencias", "911"),
                new Hospital(null, "Hospital Clínico San Carlos", 40.4404, -3.7275, "hospital", "Madrid", "urgencias", "911"),
                new Hospital(null, "Centro de Salud Goya", 40.4247, -3.6811, "centro_salud", "Madrid", "atencion_primaria", "915764321"),

                // Barcelona
                new Hospital(null, "Hospital Clínic de Barcelona", 41.3894, 2.1526, "hospital", "Barcelona", "urgencias", "911"),
                new Hospital(null, "Hospital Universitari Vall d'Hebron", 41.4351, 2.1184, "hospital", "Barcelona", "urgencias", "911"),
                new Hospital(null, "Hospital de la Santa Creu i Sant Pau", 41.4116, 2.1744, "hospital", "Barcelona", "urgencias", "911"),
                new Hospital(null, "Centro de Salud Eixample", 41.3885, 2.1611, "centro_salud", "Barcelona", "atencion_primaria", "933221100"),

                // Valencia
                new Hospital(null, "Hospital Universitari i Politècnic La Fe", 39.4439, -0.3761, "hospital", "Valencia", "urgencias", "911"),
                new Hospital(null, "Hospital General Universitario de Valencia", 39.4678, -0.4076, "hospital", "Valencia", "urgencias", "911"),
                new Hospital(null, "Centro de Salud Ruzafa", 39.4611, -0.3722, "centro_salud", "Valencia", "atencion_primaria", "963456789"),

                // Sevilla
                new Hospital(null, "Hospital Universitario Virgen del Rocío", 37.3592, -5.9792, "hospital", "Sevilla", "urgencias", "911"),
                new Hospital(null, "Hospital Universitario Virgen Macarena", 37.4089, -5.9869, "hospital", "Sevilla", "urgencias", "911"),
                new Hospital(null, "Centro de Salud Triana", 37.3853, -6.0075, "centro_salud", "Sevilla", "atencion_primaria", "954332211"),

                // Zaragoza
                new Hospital(null, "Hospital Universitario Miguel Servet", 41.6361, -0.8994, "hospital", "Zaragoza", "urgencias", "911"),
                new Hospital(null, "Hospital Clínico Universitario Lozano Blesa", 41.6425, -0.9023, "hospital", "Zaragoza", "urgencias", "911"),

                // Málaga
                new Hospital(null, "Hospital Regional Universitario de Málaga", 36.7214, -4.4394, "hospital", "Málaga", "urgencias", "911"),
                new Hospital(null, "Hospital Universitario Virgen de la Victoria", 36.7175, -4.4756, "hospital", "Málaga", "urgencias", "911"),

                // Murcia
                new Hospital(null, "Hospital Clínico Universitario Virgen de la Arrixaca", 37.9547, -1.1619, "hospital", "Murcia", "urgencias", "911"),
                new Hospital(null, "Hospital Reina Sofía", 37.9836, -1.1194, "hospital", "Murcia", "urgencias", "911"),

                // País Vasco
                new Hospital(null, "Hospital Universitario Cruces", 43.2847, -2.9912, "hospital", "Bilbao/Barakaldo", "urgencias", "911"),
                new Hospital(null, "Hospital de Basurto", 43.2619, -2.9511, "hospital", "Bilbao", "urgencias", "911"),
                new Hospital(null, "Hospital Universitario Donostia", 43.3075, -1.9723, "hospital", "San Sebastián", "urgencias", "911"),
                new Hospital(null, "Hospital Universitario de Araba", 42.8594, -2.6883, "hospital", "Vitoria-Gasteiz", "urgencias", "911"),

                // Galicia
                new Hospital(null, "Hospital Universitario de A Coruña (CHUAC)", 43.3444, -8.3844, "hospital", "A Coruña", "urgencias", "911"),
                new Hospital(null, "Hospital Álvaro Cunqueiro", 42.1983, -8.7461, "hospital", "Vigo", "urgencias", "911"),
                new Hospital(null, "Hospital Clínico Universitario de Santiago", 42.8711, -8.5667, "hospital", "Santiago de Compostela", "urgencias", "911"),

                // Asturias & Cantabria
                new Hospital(null, "Hospital Universitario Central de Asturias (HUCA)", 43.3769, -5.8364, "hospital", "Oviedo", "urgencias", "911"),
                new Hospital(null, "Hospital Universitario Marqués de Valdecilla", 43.4561, -3.8322, "hospital", "Santander", "urgencias", "911"),

                // Navarra & La Rioja
                new Hospital(null, "Hospital Universitario de Navarra", 42.8081, -1.6631, "hospital", "Pamplona", "urgencias", "911"),
                new Hospital(null, "Hospital San Pedro", 42.4564, -2.4242, "hospital", "Logroño", "urgencias", "911"),

                // Castilla y León
                new Hospital(null, "Hospital Clínico Universitario de Valladolid", 41.6575, -4.7192, "hospital", "Valladolid", "urgencias", "911"),
                new Hospital(null, "Hospital Universitario de Burgos", 42.3608, -3.6792, "hospital", "Burgos", "urgencias", "911"),
                new Hospital(null, "Complejo Asistencial Universitario de Salamanca", 40.9639, -5.6744, "hospital", "Salamanca", "urgencias", "911"),
                new Hospital(null, "Complejo Asistencial Universitario de León", 42.6125, -5.5714, "hospital", "León", "urgencias", "911"),

                // Extremadura
                new Hospital(null, "Hospital Universitario de Badajoz", 38.8778, -7.0094, "hospital", "Badajoz", "urgencias", "911"),
                new Hospital(null, "Hospital Universitario de Cáceres", 39.4447, -6.3456, "hospital", "Cáceres", "urgencias", "911"),
                new Hospital(null, "Hospital de Mérida", 38.9275, -6.3639, "hospital", "Mérida", "urgencias", "911"),

                // Castilla-La Mancha
                new Hospital(null, "Hospital Universitario de Toledo", 39.8731, -3.9928, "hospital", "Toledo", "urgencias", "911"),
                new Hospital(null, "Hospital General Universitario de Ciudad Real", 38.9808, -3.9431, "hospital", "Ciudad Real", "urgencias", "911"),
                new Hospital(null, "Hospital General Universitario de Albacete", 38.9867, -1.8594, "hospital", "Albacete", "urgencias", "911"),

                // Andalucía Oriental & Sur
                new Hospital(null, "Hospital Universitario Virgen de las Nieves", 37.1894, -3.6083, "hospital", "Granada", "urgencias", "911"),
                new Hospital(null, "Hospital Universitario Reina Sofía", 37.8683, -4.7956, "hospital", "Córdoba", "urgencias", "911"),
                new Hospital(null, "Hospital Universitario Puerta del Mar", 36.5056, -6.2756, "hospital", "Cádiz", "urgencias", "911"),
                new Hospital(null, "Hospital Juan Ramón Jiménez", 37.2817, -6.9536, "hospital", "Huelva", "urgencias", "911"),
                new Hospital(null, "Hospital Universitario de Jaén", 37.7783, -3.7842, "hospital", "Jaén", "urgencias", "911"),
                new Hospital(null, "Hospital Universitario Torrecárdenas", 36.8622, -2.4383, "hospital", "Almería", "urgencias", "911"),

                // Aragón y Cataluña (Provincias)
                new Hospital(null, "Hospital San Jorge de Huesca", 42.1306, -0.4208, "hospital", "Huesca", "urgencias", "911"),
                new Hospital(null, "Hospital Obispo Polanco", 40.3347, -1.1014, "hospital", "Teruel", "urgencias", "911"),
                new Hospital(null, "Hospital Universitari de Girona Doctor Josep Trueta", 41.9997, 2.8256, "hospital", "Girona", "urgencias", "911"),
                new Hospital(null, "Hospital Universitari de Tarragona Joan XXIII", 41.1256, 1.2389, "hospital", "Tarragona", "urgencias", "911"),
                new Hospital(null, "Hospital Universitari Arnau de Vilanova", 41.6256, 0.6139, "hospital", "Lleida", "urgencias", "911"),

                // Comunidad Valenciana (Provincias)
                new Hospital(null, "Hospital General de Alicante", 38.3589, -0.4914, "hospital", "Alicante", "urgencias", "911"),
                new Hospital(null, "Hospital General de Castellón", 39.9961, -0.0464, "hospital", "Castellón de la Plana", "urgencias", "911"),

                // Islas Baleares y Canarias
                new Hospital(null, "Hospital Universitari Son Espases", 39.6053, 2.6453, "hospital", "Palma de Mallorca", "urgencias", "911"),
                new Hospital(null, "Hospital Universitario de Gran Canaria Doctor Negrín", 28.1189, -15.4497, "hospital", "Las Palmas de Gran Canaria", "urgencias", "911"),
                new Hospital(null, "Hospital Universitario de Canarias (HUC)", 28.4558, -16.2947, "hospital", "Santa Cruz de Tenerife/La Laguna", "urgencias", "911"),

                // Centros de Salud de Ruta Clave (Urgencias y Atención Primaria Adicional)
                new Hospital(null, "Centro de Salud Mérida Centro", 38.9175, -6.3417, "centro_salud", "Mérida", "atencion_primaria", "924382500"),
                new Hospital(null, "Centro de Salud Cáceres Plaza de Argel", 39.4797, -6.3683, "centro_salud", "Cáceres", "atencion_primaria", "927230400"),
                new Hospital(null, "Centro de Salud Badajoz Zona Centro", 38.8817, -6.9742, "centro_salud", "Badajoz", "atencion_primaria", "924212300"),
                new Hospital(null, "Centro de Salud Toledo Buenavista", 39.8742, -4.0375, "centro_salud", "Toledo", "atencion_primaria", "925257900"),
                new Hospital(null, "Centro de Salud Salamanca Alamedilla", 40.9658, -5.6592, "centro_salud", "Salamanca", "atencion_primaria", "923261000")
            );
            hospitalRepository.saveAll(seedHospitals);
            System.out.println("[GoldenHour] Semilla básica de 50 centros sanitarios cargada.");
        }
    }

    @Transactional(readOnly = true)
    public List<Hospital> getSpainHealthcarePoints(int limit) {
        return hospitalRepository.findAll().stream().limit(limit).toList();
    }

    @Transactional(readOnly = true)
    public Hospital findClosestHospital(double lat, double lon) {
        return findClosestHospital(lat, lon, "all");
    }

    @Transactional(readOnly = true)
    public Hospital findClosestHospital(double lat, double lon, String type) {
        // Obtener candidatos directamente de la base de datos local H2 (completa y ultra rápida)
        List<Hospital> candidates = hospitalRepository.findAll();

        // Filtrar candidatos si type es 'hospital' o 'centro_salud'
        if (type != null && !type.isEmpty() && !type.equalsIgnoreCase("all")) {
            final String filterType = type.trim();
            candidates = candidates.stream()
                .filter(h -> h.getCategory() != null && h.getCategory().equalsIgnoreCase(filterType))
                .toList();
        }

        if (candidates.isEmpty()) return null;
        
        Hospital closest = candidates.get(0);
        double minDistance = Double.MAX_VALUE;

        for (Hospital h : candidates) {
            double dist = calculateHaversineDistance(lat, lon, h.getLatitude(), h.getLongitude());
            if (dist < minDistance) {
                minDistance = dist;
                closest = h;
            }
        }
        return closest;
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371; // km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }
}
