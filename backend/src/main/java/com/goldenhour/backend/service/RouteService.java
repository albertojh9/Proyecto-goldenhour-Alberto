package com.goldenhour.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.goldenhour.backend.dto.RouteRequest;
import com.goldenhour.backend.model.Hospital;
import com.goldenhour.backend.repository.HospitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    // ─────────────────────────────────────────────────────────────────────────
    // Entry point: calculateRoute
    // ─────────────────────────────────────────────────────────────────────────
    public Map<String, Object> calculateRoute(RouteRequest request) {
        String origin      = request.origin();
        String destination = request.destination();
        String routeType   = (request.routeType() == null || request.routeType().isBlank())
                             ? "FAST" : request.routeType().toUpperCase();

        // Parse coordinates
        String[] originParts = origin.split(",");
        double originLat = Double.parseDouble(originParts[0].trim());
        double originLon = Double.parseDouble(originParts[1].trim());

        String[] destParts = destination.split(",");
        double destLat = Double.parseDouble(destParts[0].trim());
        double destLon = Double.parseDouble(destParts[1].trim());

        // ── Fetch direct route from OSRM (FAST route reference) ──────────────
        List<OsrmRoute> candidates = fetchOsrmRoutes(originLat, originLon, destLat, destLon, false);

        if (candidates.isEmpty()) {
            // Fallback straight-line mock
            OsrmRoute mock = new OsrmRoute();
            mock.geometry = generateMockGeometry(originLat, originLon, destLat, destLon);
            mock.distanceKm = calculateHaversineDistance(originLat, originLon, destLat, destLon) * 1.3;
            mock.durationHours = mock.distanceKm / 80.0;
            candidates.add(mock);
        }

        OsrmRoute directRoute = candidates.get(0);
        OsrmRoute chosen = directRoute; // Default to FAST route

        // ── Fetch hospitals in padded bounding box (once!) ──────────────────
        double minLat = Math.min(originLat, destLat) - 0.15;
        double maxLat = Math.max(originLat, destLat) + 0.15;
        double minLon = Math.min(originLon, destLon) - 0.15;
        double maxLon = Math.max(originLon, destLon) + 0.15;

        System.out.println("[RouteService] Bounding box: Lat[" + minLat + ", " + maxLat + "], Lon[" + minLon + ", " + maxLon + "]");
        List<Hospital> hospitals = hospitalRepository.findByLatitudeBetweenAndLongitudeBetween(minLat, maxLat, minLon, maxLon);
        System.out.println("[RouteService] Total loaded from DB inside bbox (Hospitals & Clinics): " + hospitals.size());

        // Usar la red completa (tanto hospitales como centros de salud) para el cálculo de desvíos seguros
        // y los semáforos de riesgo del trayecto, según lo solicitado.
        List<Hospital> hospitalsForRisk = hospitals;

        // ── Calculate alternative SAFE route ─────────────────────────────────
        if ("SAFE".equals(routeType) && !hospitalsForRisk.isEmpty()) {
            // Find midpoint of direct route
            double midLat = (originLat + destLat) / 2.0;
            double midLon = (originLon + destLon) / 2.0;
            if (!directRoute.geometry.isEmpty()) {
                double[] midPt = directRoute.geometry.get(directRoute.geometry.size() / 2);
                midLat = midPt[0];
                midLon = midPt[1];
            }

            final double targetLat = midLat;
            final double targetLon = midLon;

            // Sort hospitals by distance to midpoint
            List<Hospital> sortedHospitals = new ArrayList<>(hospitalsForRisk);
            sortedHospitals.sort((h1, h2) -> {
                double d1 = calculateHaversineDistance(targetLat, targetLon, h1.getLatitude(), h1.getLongitude());
                double d2 = calculateHaversineDistance(targetLat, targetLon, h2.getLatitude(), h2.getLongitude());
                return Double.compare(d1, d2);
            });

            // Evaluate up to 4 closest hospitals to midpoint as intermediate waypoints
            int evaluateCount = Math.min(4, sortedHospitals.size());
            int bestScore = countHospitalsOnRoute(directRoute.geometry, hospitalsForRisk, 5.0);
            double bestDuration = directRoute.durationHours;

            for (int i = 0; i < evaluateCount; i++) {
                Hospital candidateHospital = sortedHospitals.get(i);

                // Verify if this hospital is already close to the direct route (within 4.0 km)
                // If it is, routing through it won't produce a new, safer detour route
                double distToDirectRoute = Double.MAX_VALUE;
                for (double[] pt : directRoute.geometry) {
                    double d = calculateHaversineDistance(pt[0], pt[1], candidateHospital.getLatitude(), candidateHospital.getLongitude());
                    if (d < distToDirectRoute) distToDirectRoute = d;
                }
                if (distToDirectRoute < 4.0) {
                    continue;
                }

                // Generate a 3-point route: Origin -> Hospital -> Destination
                List<double[]> waypoints = List.of(
                    new double[]{originLat, originLon},
                    new double[]{candidateHospital.getLatitude(), candidateHospital.getLongitude()},
                    new double[]{destLat, destLon}
                );

                OsrmRoute altRoute = fetchOsrmRouteWithWaypoints(waypoints);
                if (altRoute != null) {
                    // Detours adding up to 50% extra duration or distance are acceptable
                    if (altRoute.durationHours <= directRoute.durationHours * 1.5 &&
                        altRoute.distanceKm <= directRoute.distanceKm * 1.5) {

                        int score = countHospitalsOnRoute(altRoute.geometry, hospitalsForRisk, 5.0);
                        
                        // We prefer the route with strictly MORE hospitals.
                        // If they have the same number of hospitals, we prefer the shorter/faster one.
                        if (score > bestScore || (score == bestScore && altRoute.durationHours < bestDuration)) {
                            bestScore = score;
                            bestDuration = altRoute.durationHours;
                            chosen = altRoute;
                        }
                    }
                }
            }
        }

        List<double[]> routeGeometry = chosen.geometry;
        double distanceKm   = chosen.distanceKm;
        double durationHours = chosen.durationHours;

        // ── Segments + risk (usando toda la red sanitaria con un multiplicador de 4.0x para máximo realismo) ──
        List<Map<String, Object>> segments = buildSegments(routeGeometry, hospitalsForRisk);

        // ── Global risk ───────────────────────────────────────────────────────
        String globalRisk = "LOW";
        boolean hasCritical = false, hasMedium = false;
        for (Map<String, Object> seg : segments) {
            String risk = (String) seg.get("risk");
            if ("CRITICAL".equals(risk)) hasCritical = true;
            else if ("MEDIUM".equals(risk)) hasMedium = true;
        }
        if (hasCritical) globalRisk = "CRITICAL";
        else if (hasMedium)  globalRisk = "MEDIUM";

        // ── Hospitals/Clinics on route (within 5 km) ─────────────────────────
        List<Map<String, Object>> hospitalsOnRoute = buildHospitalsOnRoute(routeGeometry, hospitals);

        // ── Build response ────────────────────────────────────────────────────
        Map<String, Object> result = new HashMap<>();
        result.put("distance",        Math.round(distanceKm * 10.0) / 10.0);
        result.put("duration",        Math.round(durationHours * 10.0) / 10.0);
        result.put("riskLevel",       globalRisk);
        result.put("segments",        segments);
        result.put("hospitalsOnRoute",hospitalsOnRoute);
        result.put("totalSegments",   segments.size());
        result.put("routeType",       routeType);
        result.put("calculatedAt",    java.time.LocalDateTime.now().toString());

        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Inner data holder for an OSRM route candidate
    // ─────────────────────────────────────────────────────────────────────────
    private static class OsrmRoute {
        List<double[]> geometry = new ArrayList<>();
        double distanceKm   = 0;
        double durationHours = 0;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Fetch direct route from OSRM
    // ─────────────────────────────────────────────────────────────────────────
    private List<OsrmRoute> fetchOsrmRoutes(double originLat, double originLon,
                                             double destLat,   double destLon,
                                             boolean alternatives) {
        List<OsrmRoute> routes = new ArrayList<>();
        String altParam = alternatives ? "&alternatives=3" : "";
        String osrmUrl = String.format(java.util.Locale.US,
            "https://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=full&geometries=geojson%s",
            originLon, originLat, destLon, destLat, altParam);

        try {
            String response = restTemplate.getForObject(osrmUrl, String.class);
            JsonNode root   = objectMapper.readTree(response);
            JsonNode routesNode = root.path("routes");

            if (routesNode.isArray()) {
                for (JsonNode r : routesNode) {
                    OsrmRoute or = new OsrmRoute();
                    or.distanceKm   = r.path("distance").asDouble() / 1000.0;
                    or.durationHours = r.path("duration").asDouble() / 3600.0;

                    JsonNode coords = r.path("geometry").path("coordinates");
                    if (coords.isArray()) {
                        for (JsonNode pt : coords) {
                            or.geometry.add(new double[]{pt.get(1).asDouble(), pt.get(0).asDouble()});
                        }
                    }
                    if (!or.geometry.isEmpty()) {
                        routes.add(or);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error llamando a OSRM: " + e.getMessage());
        }
        return routes;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Fetch route passing through a sequence of waypoints
    // ─────────────────────────────────────────────────────────────────────────
    private OsrmRoute fetchOsrmRouteWithWaypoints(List<double[]> coordinates) {
        if (coordinates.size() < 2) return null;

        StringBuilder pathBuilder = new StringBuilder();
        for (int i = 0; i < coordinates.size(); i++) {
            if (i > 0) pathBuilder.append(";");
            pathBuilder.append(String.format(java.util.Locale.US, "%f,%f", coordinates.get(i)[1], coordinates.get(i)[0]));
        }

        String osrmUrl = String.format(java.util.Locale.US,
            "https://router.project-osrm.org/route/v1/driving/%s?overview=full&geometries=geojson",
            pathBuilder.toString());

        try {
            String response = restTemplate.getForObject(osrmUrl, String.class);
            JsonNode root   = objectMapper.readTree(response);
            JsonNode routesNode = root.path("routes");

            if (routesNode.isArray() && routesNode.size() > 0) {
                JsonNode r = routesNode.get(0);
                OsrmRoute or = new OsrmRoute();
                or.distanceKm   = r.path("distance").asDouble() / 1000.0;
                or.durationHours = r.path("duration").asDouble() / 3600.0;

                JsonNode coords = r.path("geometry").path("coordinates");
                if (coords.isArray()) {
                    for (JsonNode pt : coords) {
                        or.geometry.add(new double[]{pt.get(1).asDouble(), pt.get(0).asDouble()});
                    }
                }
                if (!or.geometry.isEmpty()) {
                    return or;
                }
            }
        } catch (Exception e) {
            System.err.println("Error llamando a OSRM con waypoints: " + e.getMessage());
        }
        return null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Count hospitals within `radiusKm` of any point in the route geometry
    // ─────────────────────────────────────────────────────────────────────────
    private int countHospitalsOnRoute(List<double[]> geometry, List<Hospital> hospitals, double radiusKm) {
        int count = 0;
        for (Hospital h : hospitals) {
            double minDist = Double.MAX_VALUE;
            for (double[] pt : geometry) {
                double d = calculateHaversineDistance(pt[0], pt[1], h.getLatitude(), h.getLongitude());
                if (d < minDist) minDist = d;
            }
            if (minDist <= radiusKm) count++;
        }
        return count;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Build risk segments
    // ─────────────────────────────────────────────────────────────────────────
    private List<Map<String, Object>> buildSegments(List<double[]> routeGeometry, List<Hospital> hospitals) {
        List<Map<String, Object>> segments = new ArrayList<>();
        int segmentSize = 3;
        int order = 1;

        for (int i = 0; i < routeGeometry.size() - 1; i += segmentSize - 1) {
            List<double[]> segPts = new ArrayList<>();
            int end = Math.min(i + segmentSize, routeGeometry.size());
            for (int j = i; j < end; j++) segPts.add(routeGeometry.get(j));
            if (segPts.size() < 2) break;

            double[] ref = segPts.get(0);
            Hospital closest = findClosestHospital(ref[0], ref[1], hospitals);
            double distToH   = calculateHaversineDistance(ref[0], ref[1], closest.getLatitude(), closest.getLongitude());
            int minutes      = (int) Math.round(distToH * 4.0);
            String risk      = classifyRisk(minutes);

            Map<String, Object> seg = new HashMap<>();
            seg.put("order",  order++);
            seg.put("points", segPts);
            seg.put("risk",   risk);
            seg.put("minutesToClosestHospital", minutes);
            seg.put("closestHospitalName",      closest.getName());
            segments.add(seg);
        }
        return segments;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Hospitals within 5 km of the route
    // ─────────────────────────────────────────────────────────────────────────
    private List<Map<String, Object>> buildHospitalsOnRoute(List<double[]> geometry, List<Hospital> hospitals) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Hospital h : hospitals) {
            double minDist = Double.MAX_VALUE;
            for (double[] pt : geometry) {
                double d = calculateHaversineDistance(pt[0], pt[1], h.getLatitude(), h.getLongitude());
                if (d < minDist) minDist = d;
            }
            if (minDist <= 5.0) {
                Map<String, Object> hMap = new HashMap<>();
                hMap.put("id",              h.getId());
                hMap.put("name",            h.getName());
                hMap.put("latitude",        h.getLatitude());
                hMap.put("longitude",       h.getLongitude());
                hMap.put("type",            h.getCategory());
                hMap.put("city",            h.getAddress());
                hMap.put("distanceToRoute", Math.round(minDist * 10.0) / 10.0);
                result.add(hMap);
            }
        }
        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────
    private List<double[]> generateMockGeometry(double lat1, double lon1, double lat2, double lon2) {
        List<double[]> pts = new ArrayList<>();
        for (int i = 0; i <= 100; i++) {
            double f = (double) i / 100;
            pts.add(new double[]{lat1 + (lat2 - lat1) * f, lon1 + (lon2 - lon1) * f});
        }
        return pts;
    }

    private Hospital findClosestHospital(double lat, double lon, List<Hospital> hospitals) {
        Hospital closest = hospitals.get(0);
        double   minDist = Double.MAX_VALUE;
        for (Hospital h : hospitals) {
            double d = calculateHaversineDistance(lat, lon, h.getLatitude(), h.getLongitude());
            if (d < minDist) { minDist = d; closest = h; }
        }
        return closest;
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private String classifyRisk(int minutes) {
        if (minutes < 30)  return "LOW";
        if (minutes < 60)  return "MEDIUM";
        return "CRITICAL";
    }

    private List<Hospital> fetchHospitalsFromOverpass(double minLat, double minLon, double maxLat, double maxLon) {
        if (true) return new java.util.ArrayList<>();
        double south = minLat - 0.08, west  = minLon - 0.08;
        double north = maxLat + 0.08, east  = maxLon + 0.08;

        String query = String.format(java.util.Locale.US,
            "[out:json][timeout:15];\n(\n" +
            "  node[\"amenity\"=\"hospital\"](%f,%f,%f,%f);\n" +
            "  way[\"amenity\"=\"hospital\"](%f,%f,%f,%f);\n" +
            "  node[\"amenity\"=\"clinic\"](%f,%f,%f,%f);\n" +
            "  way[\"amenity\"=\"clinic\"](%f,%f,%f,%f);\n" +
            ");\nout center;",
            south,west,north,east,
            south,west,north,east,
            south,west,north,east,
            south,west,north,east);

        List<Hospital> hospitals = new ArrayList<>();
        try {
            String url      = "https://overpass-api.de/api/interpreter?data={query}";
            String response = restTemplate.getForObject(url, String.class, query);
            JsonNode root   = objectMapper.readTree(response);
            JsonNode elems  = root.path("elements");
            if (elems.isArray()) {
                long idCounter = 1_000_000;
                for (JsonNode el : elems) {
                    double lat = el.path("lat").isMissingNode()
                                 ? el.path("center").path("lat").asDouble()
                                 : el.path("lat").asDouble();
                    double lon = el.path("lon").isMissingNode()
                                 ? el.path("center").path("lon").asDouble()
                                 : el.path("lon").asDouble();
                    if (lat == 0 || lon == 0) continue;

                    JsonNode tags   = el.path("tags");
                    String   name   = tags.path("name").asText("Centro Médico de OSM");
                    String   amenity = tags.path("amenity").asText("hospital");
                    String   type   = "hospital".equals(amenity) ? "HOSPITAL" : "CENTRO_SALUD";
                    String   city   = tags.path("addr:city").asText("Desconocida");

                    Hospital h = new Hospital();
                    h.setId(idCounter++);
                    h.setName(name);
                    h.setLatitude(lat);
                    h.setLongitude(lon);
                    h.setCategory("HOSPITAL".equals(type) ? "hospital" : "centro_salud");
                    h.setAddress(city);
                    hospitals.add(h);
                }
            }
        } catch (Exception e) {
            System.err.println("Overpass API error, usando fallback H2: " + e.getMessage());
        }
        return hospitals;
    }
}
