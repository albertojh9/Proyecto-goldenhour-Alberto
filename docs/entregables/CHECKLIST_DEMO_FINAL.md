# 🧪 Guía de Validación y Plan de Pruebas de Integración Funcional (E2E)

Este documento describe el **Plan de Pruebas Funcionales Extremo a Extremo (E2E)** y el **Protocolo de Validación Técnica** diseñado para certificar la estabilidad, seguridad e integridad del proyecto **GoldenHour**. 

Actúa como el entregable oficial de **Aseguramiento de Calidad (QA)** del sistema, demostrando que el 100% de los requisitos funcionales implementados en la arquitectura cliente-servidor responden con total precisión.

---

## 🎯 1. Objetivos del Plan de Pruebas

*   **Validación de Flujos:** Asegurar que los flujos críticos de la aplicación (autenticación sin estado, persistencia local, geolocalización activa, y cálculos cartográficos externos con OSRM) se ejecutan de manera integrada y sin fisuras.
*   **Trazabilidad de Datos:** Verificar que las transacciones y persistencias realizadas desde la interfaz móvil impactan correctamente en el motor de base de datos relacional del backend.
*   **Optimización de Tiempos:** Certificar que las respuestas de red, el parseo de datos y el renderizado visual de Leaflet se producen en intervalos óptimos de tiempo.

---

## ⏳ 2. Preparación y Verificación de Salud del Entorno

Antes de ejecutar la batería de pruebas de integración, es necesario verificar que los servicios estén activos y saludables:

1.  **Lanzamiento de Servidores:** Ejecutar el software en Modo de Desarrollo (`iniciar_proyecto.bat`) o en Modo de Producción Unificado (`iniciar_produccion.bat`).
2.  **Verificación de Salud (Health Check):**
    *   Acceder en el navegador a: **`http://localhost:8080/actuator/health`**
    *   El servidor debe responder con un código `200 OK` y el estado saludable: `{"status":"UP"}`.
3.  **Herramientas de Trazabilidad:** Mantener abiertas las Herramientas de Desarrollador de Google Chrome (F12 -> pestaña *Network* o Red) y la base de datos de administración de H2 (`localhost:8080/h2-console`) para monitorizar los tráficos en tiempo real.

---

## 🎬 3. Protocolo de Pruebas de Integración (Batería E2E)

A continuación, se detalla la tabla de validación secuencial que certifica el correcto funcionamiento del software en todas sus capas:

| ID | Caso de Prueba | Acción de Entrada | Resultado Esperado | Evidencia Visual / Comportamiento |
|:---|:---|:---|:---|:---|
| **1** | **Validación de Registro Fallido** | Escribir nombre, correo válido y contraseña de menos de 8 caracteres. | El sistema bloquea el envío de la petición por validación en el cliente y el servidor. | Se muestra mensaje de alerta en la interfaz. |
| **2** | **Registro de Usuario Exitoso** | Registrar una cuenta nueva con contraseña de 8+ caracteres. | Petición `POST` procesada con éxito. Redirección automática al Login en 1.5s. | Notificación emergente verde de éxito en pantalla. |
| **3** | **Control de Acceso (Login)** | Introducir credenciales correctas en la pantalla de inicio de sesión. | Backend valida la sesión, devuelve el token JWT y el cliente redirige al Mapa. | El mapa de Leaflet carga de forma fluida los marcadores. |
| **4** | **Carga de Red Sanitaria** | Hacer zoom en el mapa e interactuar con marcadores rojos y azules. | Se carga la información completa del centro desde el JSON local en memoria de H2. | Popup con nombre, especialidades, dirección y teléfono del hospital. |
| **5** | **Ubicación GPS Nativa** | Pulsar el icono de brújula (📌) y otorgar permisos de localización. | Geolocation captura la ubicación satelital del dispositivo móvil. | Aparece el círculo azul brillante parpadeante y rellena el origen. |
| **6** | **Cálculo de Ruta (OSRM)** | Fijar origen en Madrid, destino en Valencia y pulsar "Calcular Ruta Segura". | El backend llama a OSRM para capturar la geometría y asocia los hospitales cercanos. | Dibuja la línea de la carretera del viaje sobre el mapa. |
| **7** | **Semáforo de la Hora de Oro** | Inspeccionar el trazado de la carretera pintada en el mapa. | El sistema divide la carretera en segmentos según la cobertura hospitalaria real. | Tramos con colores: verde (<30 min), amarillo (30-60 min) y rojo (>60 min). |
| **8** | **Interactividad de Tramos** | Hacer clic directo sobre la línea de color de la carretera. | Indica de forma dinámica el hospital de urgencias que socorrería ese tramo exacto. | Popup indicando hospital de referencia y minutos de respuesta. |
| **9** | **Persistencia de Itinerario** | Escribir un nombre descriptivo (ej: "Viaje Vacacional") y guardar la ruta. | El backend asocia y persiste los datos de la ruta en la tabla H2 de forma física. | Mensaje flotante de confirmación: "Ruta guardada correctamente". |
| **10**| **Historial de Viajes** | Navegar a la pestaña inferior central "Mis Rutas". | Se visualizan las rutas recuperadas desde el backend ordenadas cronológicamente. | Tarjeta "Viaje Vacacional" listada con su semáforo de riesgo global. |
| **11**| **Desglose de Tramos** | Pulsar en el botón "Ver tramos" de la tarjeta de historial. | El cliente expande la tarjeta mostrando el listado de vías y clínicas guardadas. | Lista desplegable con desgloses detallados de carreteras y minutos. |
| **12**| **Carga Diferida en Mapa** | Pulsar en "Cargar en Mapa" dentro de la tarjeta de historial. | Redirección automática a la vista del mapa e inyección inmediata de la geometría. | El mapa centra e inyecta la geometría exacta de la ruta archivada sin recalcular. |
| **13**| **Estadísticas de Perfil** | Acceder a la pestaña inferior derecha "Mi Perfil". | Los contadores de actividad se actualizan en caliente según tu base de datos física. | El contador de rutas totales y rutas seguras aumenta con precisión. |
| **14**| **Persistencia Física (SQL)** | Entrar a H2 Console (`localhost:8080/h2-console`) y conectar. | Permite ver las tablas e inspeccionar físicamente las filas de la base de datos. | `SELECT * FROM SAVED_ROUTE;` muestra las coordenadas y nombre del viaje. |

---

## 📡 4. Especificación Técnica de Trazabilidad e Intercambio de APIs

Para los auditores del proyecto o el tribunal de evaluación que deseen verificar las comunicaciones de red en la arquitectura cliente-servidor (mediante la consola del navegador - F12), se documenta la especificación de los endpoints REST implementados:

1.  **Registro de Usuarios (`POST /api/auth/register`):**
    *   *Payload enviado:* `{ "email": "nuevo@test.com", "password": "...", "fullName": "..." }`
    *   *Respuesta del servidor:* Código `201 Created` con el ID único autogenerado por la base de datos relacional.
2.  **Inicio de Sesión (`POST /api/auth/login`):**
    *   *Payload enviado:* `{ "email": "...", "password": "..." }`
    *   *Respuesta del servidor:* Código `200 OK` devolviendo `{ "token": "eyJhbG..." }`. El token **JWT (JSON Web Token)** se cifra bajo el estándar HMAC-SHA256, permitiendo peticiones sin estado (stateless) para optimizar el rendimiento.
3.  **Carga Sanitaria (`GET /api/healthcare/spain?limit=10000`):**
    *   *Respuesta del servidor:* Código `200 OK` devolviendo los más de 7.240 hospitales reales. Se precargan síncronamente al iniciar Spring Boot para servirse en menos de **50 milisegundos**.
4.  **Cálculo Cartográfico (`POST /api/routes/calculate`):**
    *   *Payload enviado:* `{ "origin": "lat,lon", "destination": "lat,lon", "type": "SAFE/FAST" }`
    *   *Respuesta del servidor:* Código `200 OK` con distancia, duración y el array de segmentos de riesgo de la carretera del viaje.
5.  **Persistencia del Itinerario (`POST /api/routes/save`):**
    *   *Cabecera obligatoria:* `Authorization: Bearer <TOKEN>` (inyectada de forma centralizada por nuestro interceptor de Angular).
    *   *Respuesta del servidor:* Código `201 Created` persistiendo físicamente la ruta vinculada al ID del usuario logueado en la tabla `SAVED_ROUTE`.

---

## 🏛️ 5. Justificación Técnica de Decisiones de Diseño y Arquitectura

Para finalizar, se documenta la justificación ingenieril de tres decisiones críticas de diseño adoptadas en el proyecto:

### A. Uso de Base de Datos Embebida H2 en Archivo Físico
*   **Justificación:** Para garantizar la **máxima portabilidad e instalabilidad del software** en el entorno de evaluación sin forzar al profesor a instalar motores de bases de datos pesados como PostgreSQL o MySQL. Al utilizar JPA e Hibernate, la base H2 simula perfectamente a una base industrial y escribe físicamente los datos en la carpeta del proyecto (`./data/goldenhour`), asegurando que la información de los usuarios y viajes guardados no se pierda al apagar el servidor.

### B. Calibración del Algoritmo del Semáforo de la Hora de Oro
*   **Justificación:** El backend realiza un cálculo geométrico de distancia en línea recta mediante la **fórmula del semiverseno (Haversine)** entre cada punto de la carretera y las clínicas. Como las ambulancias conducen por carreteras reales con curvas y tráfico, el algoritmo del backend multiplica la distancia por un **factor de corrección corrector del 4.0x** para traducirla a minutos reales por carretera de forma fiable y segura.

### C. Conectividad Híbrida de la APK Móvil Física
*   **Justificación:** Los sistemas operativos Android bloquean las llamadas de red locales a `localhost` para evitar bucles. Para permitir que la APK móvil corra de manera física en un teléfono móvil real, se ha centralizado el endpoint en variables de entorno del cliente (`environment.ts`) apuntando a la **dirección IP local IPv4** del ordenador portátil dentro del Wi-Fi compartido, y configurado Spring Security para autorizar orígenes cruzados (CORS) y permitir el flujo de datos.
