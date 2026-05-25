# 🗺️ Guía 1: Paso a Paso del Desarrollo (Memoria de Programación)

En esta guía explico paso a paso cómo he ido programando y organizando todo el código de mi proyecto **GoldenHour** desde cero. Aquí detallo la estructura de carpetas, cómo he configurado los ficheros del sistema, el diseño de las tablas de la base de datos y el código que he escrito tanto para el servidor (backend en Spring Boot) como para la aplicación móvil (frontend en Ionic y Angular).

---

## 📐 1. Estructura Completa de Carpetas de mi Proyecto

Para poder organizar bien todo el código de mi aplicación, he estructurado las carpetas y los archivos de la siguiente manera:

```
GoldenHour/
│
├── backend/
│   ├── src/main/java/com/goldenhour/backend/
│   │   ├── BackendApplication.java
│   │   ├── config/
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   ├── JwtTokenProvider.java
│   │   │   ├── SecurityConfig.java
│   │   │   └── WebConfig.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── HealthcareController.java
│   │   │   └── RouteController.java
│   │   ├── dto/
│   │   │   ├── LoginRequest.java
│   │   │   ├── RegisterRequest.java
│   │   │   ├── RouteRequest.java
│   │   │   ├── SaveRouteRequest.java
│   │   │   ├── SavedRouteResponse.java
│   │   │   └── TokenResponse.java
│   │   ├── model/
│   │   │   ├── AppUser.java
│   │   │   ├── Hospital.java
│   │   │   └── SavedRoute.java
│   │   ├── repository/
│   │   │   ├── AppUserRepository.java
│   │   │   ├── HospitalRepository.java
│   │   │   └── SavedRouteRepository.java
│   │   └── service/
│   │       ├── AuthService.java
│   │       ├── HealthcareNetworkService.java
│   │       └── RouteService.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── spain_healthcare.json
│   └── pom.xml
│
└── mobile/
    ├── src/app/
    │   ├── pages/
    │   │   ├── login/
    │   │   │   ├── login.page.ts
    │   │   │   └── login.page.html
    │   │   ├── register/
    │   │   │   ├── register.page.ts
    │   │   │   └── register.page.html
    │   │   └── map/
    │   │       ├── map.page.ts
    │   │       └── map.page.html
    │   ├── services/
    │   │   ├── auth.service.ts
    │   │   ├── hospital.service.ts
    │   │   └── route.service.ts
    │   ├── guards/
    │   │   └── auth.guard.ts
    │   └── interceptors/
    │       └── auth.interceptor.ts
    ├── angular.json
    ├── ionic.config.json
    └── package.json
```

---

## 🛠️ 2. Programación del Backend (Servidor en Spring Boot)

### A. Fichero de Dependencias de Maven (`backend/pom.xml`)
En el archivo `pom.xml` he metido todas las librerías que he necesitado para usar Spring Boot, Spring Security para proteger el servidor, base de datos H2, JPA para interactuar con las tablas, JWT para los tokens de inicio de sesión y Lombok para ahorrarme escribir los getters y setters:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.4.3</version>
    </parent>
    <groupId>com.goldenhour</groupId>
    <artifactId>backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>backend</name>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <!-- Web y JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <!-- Base de Datos H2 -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Seguridad y JWT -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
</project>
```

### B. Fichero de Configuración de Propiedades (`backend/src/main/resources/application.properties`)
Para que Spring Boot sepa cómo gestionar la base de datos persistente H2 (almacenada en un archivo físico para que no se borre al apagar el servidor), qué puertos utilizar y cómo configurar las claves JWT, he creado este fichero de propiedades:
```properties
# Server Config
server.port=8080
server.servlet.context-path=/

# Database (H2 File-based Persistent)
spring.datasource.url=jdbc:h2:file:./data/goldenhour;DB_CLOSE_DELAY=-1;AUTO_RECONNECT=TRUE;MODE=PostgreSQL
spring.datasource.username=sa
spring.datasource.password=
spring.datasource.driver-class-name=org.h2.Driver

# H2 Console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.h2.console.settings.web-allow-others=true

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# Security JWT Config
jwt.secret=your-secret-key-min-32-chars-long-12345678-abcdef
jwt.expiration=86400000

# Logging
logging.level.root=INFO
logging.level.com.goldenhour.backend=DEBUG
logging.level.org.springframework.security=INFO

# JSON formatting
spring.jackson.serialization.write-dates-as-timestamps=false
```

### C. Clases del Modelo de Datos (`backend/src/main/java/com/goldenhour/backend/model/`)

#### 1. Clase Usuario (`AppUser.java`)
Esta clase representa la tabla donde guardo a los usuarios registrados. Para proteger las contraseñas, no las guardo tal cual sino que almaceno el hash que me devuelve BCrypt:
```java
package com.goldenhour.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_user")
@Data
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String fullName;
    private String role = "USER";
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

#### 2. Clase Hospital/Clínica (`Hospital.java`)
Con esta clase represento la tabla de los centros de salud y hospitales que muestro en el mapa interactivo:
```java
package com.goldenhour.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "hospital")
@Data
public class Hospital {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private double latitude;
    private double longitude;
    private String category; // 'hospital' o 'centro_salud'
    private String address;
    private String serviceType;
    private String emergencyPhone;
}
```

#### 3. Clase Ruta Guardada (`SavedRoute.java`)
Aquí guardo las rutas que los usuarios deciden archivar en su panel para verlas luego:
```java
package com.goldenhour.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "saved_route")
@Data
public class SavedRoute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private AppUser user;

    private String routeName;
    private String origin;
    private String destination;

    @Column(columnDefinition = "LONGTEXT")
    private String coordinatesJson;

    private boolean safeRoute;
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

### D. Repositorios de Base de Datos (`backend/src/main/java/com/goldenhour/backend/repository/`)

#### Repositorio de Hospitales (`HospitalRepository.java`)
He programado este repositorio con una consulta JPA personalizada. Me sirve para buscar de golpe en la base de datos únicamente los hospitales que caen dentro de un rectángulo geográfico (bounding box) alrededor de la carretera del viaje, mejorando mucho el rendimiento:
```java
package com.goldenhour.backend.repository;

import com.goldenhour.backend.model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    List<Hospital> findByLatitudeBetweenAndLongitudeBetween(
        double minLat, double maxLat, double minLon, double maxLon
    );
}
```

### E. Clases de Servicio y Algoritmos (`backend/src/main/java/com/goldenhour/backend/service/`)

#### 🚗 El Algoritmo de Cálculo de Rutas y Semáforos de Riesgo (`RouteService.java`)
Esta clase es la más importante del servidor. Se encarga de llamar a la API externa de OSRM para coger los puntos de la carretera y evaluar tramo a tramo qué tan lejos está el hospital de urgencias más cercano:

```java
package com.goldenhour.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.goldenhour.backend.dto.RouteRequest;
import com.goldenhour.backend.model.Hospital;
import com.goldenhour.backend.repository.HospitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class RouteService {

    private final HospitalRepository hospitalRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public RouteService(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, Object> calculateRoute(RouteRequest request) {
        String[] originParts = request.origin().split(",");
        double originLat = Double.parseDouble(originParts[0].trim());
        double originLon = Double.parseDouble(originParts[1].trim());

        String[] destParts = request.destination().split(",");
        double destLat = Double.parseDouble(destParts[0].trim());
        double destLon = Double.parseDouble(destParts[1].trim());

        // 1. Llamar al servidor de OSRM para conseguir los puntos de la carretera por la que se conduce
        String osrmUrl = String.format(Locale.US,
            "https://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=full&geometries=geojson",
            originLon, originLat, destLon, destLat);

        List<double[]> geometry = new ArrayList<>();
        double distanceKm = 0;
        double durationHours = 0;

        try {
            String response = restTemplate.getForObject(osrmUrl, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode route = root.path("routes").get(0);
            distanceKm = route.path("distance").asDouble() / 1000.0;
            durationHours = route.path("duration").asDouble() / 3600.0;

            JsonNode coords = route.path("geometry").path("coordinates");
            for (JsonNode pt : coords) {
                geometry.add(new double[]{pt.get(1).asDouble(), pt.get(0).asDouble()});
            }
        } catch (Exception e) {
            // Fallback en línea recta para que el programa no falle si OSRM está caído
            geometry = generateFallbackGeometry(originLat, originLon, destLat, destLon);
            distanceKm = calculateHaversine(originLat, originLon, destLat, destLon) * 1.3;
            durationHours = distanceKm / 80.0;
        }

        // 2. Cargar los hospitales cercanos que caen en los límites de la ruta
        double minLat = Math.min(originLat, destLat) - 0.15;
        double maxLat = Math.max(originLat, destLat) + 0.15;
        double minLon = Math.min(originLon, destLon) - 0.15;
        double maxLon = Math.max(originLon, destLon) + 0.15;
        List<Hospital> hospitals = hospitalRepository.findByLatitudeBetweenAndLongitudeBetween(minLat, maxLat, minLon, maxLon);

        // 3. Agrupar la carretera en segmentos pequeños y calcular el semáforo
        List<Map<String, Object>> segments = new ArrayList<>();
        int step = 3;
        int order = 1;

        for (int i = 0; i < geometry.size() - 1; i += step - 1) {
            List<double[]> pts = new ArrayList<>();
            int end = Math.min(i + step, geometry.size());
            for (int j = i; j < end; j++) pts.add(geometry.get(j));

            double[] refPt = pts.get(0);
            Hospital closest = findClosest(refPt[0], refPt[1], hospitals);
            double distH = calculateHaversine(refPt[0], refPt[1], closest.getLatitude(), closest.getLongitude());
            
            // Factor de 4.0x para traducir la distancia en línea recta a minutos reales por carretera
            int minutes = (int) Math.round(distH * 4.0);
            String risk = minutes < 30 ? "LOW" : (minutes < 60 ? "MEDIUM" : "CRITICAL");

            Map<String, Object> seg = new HashMap<>();
            seg.put("order", order++);
            seg.put("points", pts);
            seg.put("risk", risk);
            seg.put("minutesToClosestHospital", minutes);
            seg.put("closestHospitalName", closest.getName());
            segments.add(seg);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("distance", Math.round(distanceKm * 10.0) / 10.0);
        response.put("duration", Math.round(durationHours * 10.0) / 10.0);
        response.put("segments", segments);
        response.put("totalSegments", segments.size());
        return response;
    }

    private double calculateHaversine(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; // Radio de la tierra en kilómetros
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    private Hospital findClosest(double lat, double lon, List<Hospital> hospitals) {
        Hospital closest = hospitals.get(0);
        double minDist = Double.MAX_VALUE;
        for (Hospital h : hospitals) {
            double d = calculateHaversine(lat, lon, h.getLatitude(), h.getLongitude());
            if (d < minDist) {
                minDist = d;
                closest = h;
            }
        }
        return closest;
    }

    private List<double[]> generateFallbackGeometry(double lat1, double lon1, double lat2, double lon2) {
        List<double[]> pts = new ArrayList<>();
        for (int i = 0; i <= 20; i++) {
            double f = (double) i / 20.0;
            pts.add(new double[]{lat1 + (lat2 - lat1) * f, lon1 + (lon2 - lon1) * f});
        }
        return pts;
    }
}
```

#### 📡 Carga de la Red Sanitaria de España desde Fichero JSON (`HealthcareNetworkService.java`)
Para no obligar al tribunal a instalar una base de datos pesada como PostgreSQL y para garantizar que la aplicación cuente con datos reales desde el primer segundo, he desarrollado este servicio. Utiliza Jackson para leer un fichero JSON local (`spain_healthcare.json`) que contiene **más de 7.240 hospitales y centros de salud reales de España** de forma síncrona al arrancar, y los persiste en H2. También contiene la lógica para encontrar el centro de asistencia más cercano:

```java
package com.goldenhour.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.goldenhour.backend.model.Hospital;
import com.goldenhour.backend.repository.HospitalRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.InputStream;
import java.util.List;

@Service
public class HealthcareNetworkService {

    private final HospitalRepository hospitalRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public HealthcareNetworkService(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    @PostConstruct
    public void initSeedData() {
        loadSpainHealthcareFromJson();
    }

    @Transactional
    public void loadSpainHealthcareFromJson() {
        // Solo cargamos los datos si la base de datos está vacía para no duplicar en reinicios
        if (hospitalRepository.count() < 100) {
            try (InputStream is = getClass().getResourceAsStream("/spain_healthcare.json")) {
                if (is != null) {
                    System.out.println("[GoldenHour] Cargando base de datos completa de España desde JSON...");
                    List<Hospital> hospitals = objectMapper.readValue(is, 
                        objectMapper.getTypeFactory().constructCollectionType(List.class, Hospital.class));
                    
                    for (Hospital h : hospitals) {
                        h.setId(null); // Asegurar ID auto-incremental por JPA/H2
                    }
                    hospitalRepository.saveAll(hospitals);
                    System.out.println("[GoldenHour] ¡Éxito! Se han cargado " + hospitalRepository.count() + " centros reales.");
                }
            } catch (Exception e) {
                System.err.println("[GoldenHour] Fallo al cargar JSON de salud: " + e.getMessage());
            }
        }
    }

    @Transactional(readOnly = true)
    public Hospital findClosestHospital(double lat, double lon, String type) {
        List<Hospital> candidates = hospitalRepository.findAll();

        if (type != null && !type.isEmpty() && !type.equalsIgnoreCase("all")) {
            candidates = candidates.stream()
                .filter(h -> h.getCategory() != null && h.getCategory().equalsIgnoreCase(type))
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
        double earthRadius = 6371; // Radio de la Tierra en Kilómetros
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }
}
```

### F. Módulo de Seguridad y Tokens (`backend/src/main/java/com/goldenhour/backend/config/`)

#### Proveedor del Token JWT (`JwtTokenProvider.java`)
Aquí genero y valido los tokens JWT para saber qué usuario está conectado en cada petición HTTP:
```java
package com.goldenhour.backend.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {
    private final String secretKeyStr = "your-secret-key-min-32-chars-long-12345678-abcdef";
    private final SecretKey key = Keys.hmacShaKeyFor(secretKeyStr.getBytes(StandardCharsets.UTF_8));
    private final long expirationMs = 86400000; // El token dura 24 horas

    public String generateToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

#### 🛡️ Configuración de Seguridad y Filtros CORS (`SecurityConfig.java`)
Para proteger el servidor y definir qué endpoints son públicos (como el login o el cálculo de rutas) y cuáles requieren un token de sesión válido (como archivar un viaje), he programado esta clase de configuración de Spring Security. También define la política de intercambio de recursos de origen cruzado (CORS) para permitir llamadas de Angular e Ionic, y habilita la visualización de la consola de administración física de H2:

```java
package com.goldenhour.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Usado en AuthService para hashear claves con BCrypt
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // Desactivar CSRF ya que usamos tokens sin estado JWT
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas (Registro, Login, consulta médica básica y cálculo de ruta)
                .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                .requestMatchers("/api/healthcare/spain", "/api/healthcare/closest").permitAll()
                .requestMatchers("/api/routes/calculate").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                // Rutas protegidas que requieren token JWT válido
                .requestMatchers("/api/routes/save", "/api/routes/list").authenticated()
                .anyRequest().authenticated()
            )
            // Permitir frames (iframe) necesario únicamente para renderizar la consola de H2
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
            // Inyectar nuestro filtro interceptor de token JWT antes del UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200", "http://localhost:8100", "http://localhost:8080"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

---

## 📱 3. Programación de la Interfaz del Móvil (Frontend en Ionic/Angular)

### A. Servicios de Datos (`mobile/src/app/services/`)

#### 1. Servicio de Comunicación con el Servidor (`route.service.ts`)
Con este servicio inyecto la lógica para llamar a los endpoints de Java para calcular, guardar y listar las rutas archivadas:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private apiUrl = 'http://localhost:8080/api/routes';

  constructor(private http: HttpClient) {}

  calculateRoute(origin: string, destination: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/calculate`, { origin, destination });
  }

  saveRoute(routeName: string, origin: string, destination: string, coordinatesJson: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/save`, { routeName, origin, destination, coordinatesJson });
  }

  listSavedRoutes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/list`);
  }
}
```

### B. Guardianes e Interceptores de Autenticación (`mobile/src/app/guards/` y `mobile/src/app/interceptors/`)

Para asegurar la interfaz en el cliente y garantizar la inyección del token JWT en cada llamada HTTP al servidor de forma totalmente transparente, he programado las siguientes piezas de arquitectura:

#### 1. Interceptor de Peticiones HTTP (`auth.interceptor.ts`)
Este interceptor captura automáticamente todas las peticiones salientes hechas por Angular (`HttpClient`). Si el usuario ha iniciado sesión y existe un token en el almacenamiento local, introduce la cabecera `Authorization: Bearer <TOKEN>` de forma global, liberándonos de tener que meter cabeceras a mano en cada llamada de los servicios:

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    
    // Si existe el token y no es el token de invitado (guest_token), clonar la petición e inyectarlo
    if (token && token !== 'guest_token') {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned);
    }
    
    return next.handle(req);
  }
}
```

#### 2. Guardián de Rutas del Cliente (`auth.guard.ts`)
Este componente actúa como un cortafuegos en la navegación de Ionic/Angular. Si un usuario intenta acceder al mapa o a su perfil sin haber iniciado sesión antes (sin token en `localStorage`), el guard lo intercepta y lo redirige automáticamente a la pantalla de Login:

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const token = localStorage.getItem('token');
    
    if (token) {
      return true; // Permitir el acceso a la pantalla
    }
    
    // Si no está autenticado, forzar redirección a la pantalla de login
    return this.router.parseUrl('/login');
  }
}
```

### C. Controladores y Vistas del Mapa (`mobile/src/app/pages/map/`)

#### Código del Controlador del Mapa (`map.page.ts`)
En este fichero he programado la lógica para pintar el mapa con Leaflet, capturar los clics del usuario para poner el marcador de origen (verde) y destino (rojo), y pintar la carretera con el color del semáforo:
```typescript
import { Component, OnInit } from '@angular/core';
import { RouteService } from '../../services/route.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  private map!: L.Map;
  originCoords: string = '';
  destinationCoords: string = '';
  private originMarker?: L.Marker;
  private destinationMarker?: L.Marker;
  private routeLines: L.Polyline[] = [];

  constructor(private routeService: RouteService) {}

  ngOnInit() {
    this.initMap();
  }

  ionViewDidEnter() {
    // Truco: invalidamos el tamaño del mapa para arreglar el bug de Leaflet que se ve gris al cambiar de pestaña
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  private initMap() {
    this.map = L.map('map-container', {
      zoomControl: false
    }).setView([40.4168, -3.7038], 6); // Centrado en España

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Si el usuario hace clic en el mapa, rellenamos origen y destino en orden
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const latlng = `${e.latlng.lat.toFixed(4)},${e.latlng.lng.toFixed(4)}`;
      if (!this.originCoords) {
        this.originCoords = latlng;
        this.originMarker = L.marker(e.latlng).addTo(this.map)
          .bindPopup('<b>Origen</b>').openPopup();
      } else if (!this.destinationCoords) {
        this.destinationCoords = latlng;
        this.destinationMarker = L.marker(e.latlng).addTo(this.map)
          .bindPopup('<b>Destino</b>').openPopup();
      }
    });
  }

  processRoute() {
    if (!this.originCoords || !this.destinationCoords) return;

    this.routeService.calculateRoute(this.originCoords, this.destinationCoords).subscribe(res => {
      // Borrar la carretera anterior si la hubiera
      this.routeLines.forEach(line => this.map.removeLayer(line));
      this.routeLines = [];

      // Pintar cada tramo con su color de semáforo
      res.segments.forEach((seg: any) => {
        const color = seg.risk === 'LOW' ? '#2dd36f' : (seg.risk === 'MEDIUM' ? '#ffc409' : '#eb445a');
        const path = seg.points.map((pt: number[]) => [pt[0], pt[1]]);
        
        const polyline = L.polyline(path, { color, weight: 6 }).addTo(this.map);
        polyline.bindPopup(`
          <b>Tramo de Carretera:</b> ${seg.order}<br>
          <b>Hospital de asistencia:</b> ${seg.closestHospitalName}<br>
          <b>Tiempo de espera:</b> ${seg.minutesToClosestHospital} min
        `);
        this.routeLines.push(polyline);
      });
    });
  }

  clearRoute() {
    this.originCoords = '';
    this.destinationCoords = '';
    if (this.originMarker) this.map.removeLayer(this.originMarker);
    if (this.destinationMarker) this.map.removeLayer(this.destinationMarker);
    this.routeLines.forEach(line => this.map.removeLayer(line));
    this.routeLines = [];
  }
}
```

#### Maquetación HTML de la Pantalla del Mapa (`map.page.html`)
```html
<ion-header [translucent]="true">
  <ion-toolbar color="dark">
    <ion-title>GoldenHour - Mapa de Carreteras</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true" class="map-page-content">
  <!-- Aquí se renderiza el mapa interactivo de Leaflet -->
  <div id="map-container" style="width: 100%; height: 100%;"></div>

  <!-- Panel translúcido para meter origen y destino -->
  <div class="coordinate-panel-box">
    <ion-item lines="none" class="glass-item">
      <ion-input label="Origen" [(ngModel)]="originCoords" placeholder="Haz clic en el mapa"></ion-input>
    </ion-item>
    <ion-item lines="none" class="glass-item">
      <ion-input label="Destino" [(ngModel)]="destinationCoords" placeholder="Haz clic en el mapa"></ion-input>
    </ion-item>
    <div class="actions-row">
      <ion-button color="warning" expand="block" (click)="processRoute()">Calcular Ruta Segura</ion-button>
      <ion-button color="danger" fill="clear" (click)="clearRoute()">Limpiar</ion-button>
    </div>
  </div>
</ion-content>
```

---

## 🛠️ 4. Scripts de Automatización del Proyecto (Lanzadores `.bat`)

Para facilitar el despliegue del proyecto DAW y evitar tener que abrir múltiples terminales de comandos a mano, he programado **4 scripts automáticos (`.bat`)** en la raíz. A continuación explico qué hace cada script y muestro su código:

### A. Arrancar en Modo Desarrollo (`iniciar_proyecto.bat`)
*   **Qué hace:** Comprueba el entorno Java y Node, arranca el backend en el puerto `8080` y el cliente Angular en el puerto `4200` de forma paralela.
*   **Código:**
```batch
@echo off
title GoldenHour - Iniciador Automático del Proyecto
color 0B
echo =====================================================================
echo           GoldenHour - Iniciar Aplicacion Completa (DAW)
echo =====================================================================
echo.

where java >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: No se ha detectado Java (JDK) instalado.
    pause
    exit /b 1
)
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: No se ha detectado Node.js instalado.
    pause
    exit /b 1
)

echo Requisitos verificados con exito.
pause

start "GoldenHour - Backend Spring Boot" cmd /c "title GoldenHour - Backend Spring Boot && cd backend && mvnw.cmd spring-boot:run"
start "GoldenHour - Frontend Ionic" cmd /c "title GoldenHour - Frontend Ionic && cd mobile && npm install && npm start"
```

### B. Preparar Aplicación para Móvil Android (`preparar_android.bat`)
*   **Qué hace:** Crea la carpeta nativa Android mediante Capacitor, compila la interfaz móvil (`ionic build`), la sincroniza con el contenedor nativo (`npx cap sync`) y abre Android Studio de forma automática.
*   **Código:**
```batch
@echo off
title GoldenHour - Preparar Android (Capacitor)
color 0E
cd mobile
if not exist "android" (
    call npx cap add android
)
call ionic build
call npx cap sync
call npx cap open android
pause
```

### C. Ensamblar e Integrar el Proyecto Unificado (`generar_empaquetado_produccion.bat`)
*   **Qué hace:** Compila el frontend móvil, copia el resultado en la carpeta `resources/static` del backend y compila el backend de Java con Maven para generar el archivo autocontenido `.jar`.
*   **Código:**
```batch
@echo off
title GoldenHour - Empaquetador Unificado de Producción
color 0A
cd mobile
call npm run build
cd ..
if not exist "backend\src\main\resources\static" (
    mkdir "backend\src\main\resources\static"
)
xcopy /E /Y /Q "mobile\www\*" "backend\src\main\resources\static\"
cd backend
call mvnw.cmd clean package -DskipTests
pause
```

### D. Lanzamiento de la Aplicación en Producción (`iniciar_produccion.bat`)
*   **Qué hace:** Ejecuta el archivo `.jar` unificado en la máquina virtual de Java y abre el navegador por defecto directamente en el puerto integrado **`http://localhost:8080`**.
*   **Código:**
```batch
@echo off
title GoldenHour - Iniciar Aplicación de Producción
color 0E
if not exist "backend\target\backend-0.0.1-SNAPSHOT.jar" (
    echo ERROR: No se encuentra el archivo compilado JAR.
    pause
    exit /b 1
)
start /b cmd /c "timeout /t 5 >nul && start http://localhost:8080"
java -jar backend\target\backend-0.0.1-SNAPSHOT.jar
pause
```

