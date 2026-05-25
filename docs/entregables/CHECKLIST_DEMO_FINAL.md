# Checklist de Demo Final GoldenHour

Este documento sirve de guía rápida y guion ordenado para realizar la defensa de la aplicación **GoldenHour** ante el tribunal de evaluación del **Proyecto Final de Ciclo de 2º de DAW (2026)**.

## 🎯 Objetivo de la Demostración
Demostrar de forma fluida y ordenada, en un intervalo de **5 a 8 minutos**, que la aplicación cumple al 100% con todos los requisitos funcionales implementados en la arquitectura cliente-servidor (registro/login, geolocalización real, carga de la red médica, cálculo de rutas semafóricas, guardado del viaje e inspección de datos).

---

## ⏳ Preparación (2 Minutos Antes de la Defensa)
1.  **Levantar el Servidor:** Asegúrate de que las consolas de backend y frontend están encendidas (usando `iniciar_proyecto.bat` para desarrollo en `localhost:4200` o `iniciar_produccion.bat` para producción integrada en `localhost:8080`).
2.  **Abrir el navegador:** Ten la aplicación abierta en una pestaña del navegador lista en la pantalla de bienvenida.
3.  **Herramientas abiertas:** Deja abierta una pestaña con las Herramientas de Desarrollador de Chrome (F12 -> pestaña *Network* o Red) y la consola de la base de datos de H2 (`localhost:8080/h2-console`) minimizada por si el tribunal solicita evidencias físicas.

---

## 🎬 Guion de Defensa Paso a Paso (El recorrido perfecto)

### 1. Creación de Cuenta (RF-Autenticación)
*   **Acción:** Ir al enlace de Registro, completar el Nombre completo, un Correo nuevo y una clave de 8+ caracteres. Pulsar en **"Crear Cuenta"**.
*   **Resultado esperado:** El sistema valida los campos, muestra una notificación verde de éxito y redirige a la pantalla de login automáticamente en 1.5 segundos.

### 2. Acceso Segura al Mapa (RF-Autenticación)
*   **Acción:** Escribir el correo y contraseña recién registrados en el Login (o usar la cuenta demo: `demo@example.com` / `Demo12345!`) y pulsar **"Entrar"**.
*   **Resultado esperado:** Validación con el backend, almacenamiento del token JWT en `localStorage`, redirección instantánea y renderizado del mapa completo de España.

### 3. Visualización de la Red Sanitaria (RF-Consulta)
*   **Acción:** Hacer zoom en el mapa y hacer clic sobre un círculo Rojo (🔴 - Hospital de urgencias) y sobre uno Azul (🔵 - Centro de salud).
*   **Resultado esperado:** El mapa carga de forma fluida los marcadores reales. Al hacer clic se despliega el popup indicando el nombre del hospital, dirección, especialidades y el teléfono oficial directo de emergencias.

### 4. Geolocalización en Tiempo Real (RF-Ubicación GPS)
*   **Acción:** Hacer clic en el icono de brújula/mirilla (📌) situado a la derecha del campo de Origen. Conceder permisos de ubicación en el navegador si los solicita.
*   **Resultado esperado:** El mapa centra la vista en la ubicación real del usuario, dibujando un círculo azul brillante parpadeante y rellenando automáticamente el campo de Origen con las coordenadas actuales de latitud y longitud.

### 5. Cálculo y Trazado de Carretera (RF-Rutas)
*   **Acción:** Marcar un punto de salida haciendo clic directo en el mapa (chincheta verde de Origen) y un destino haciendo un segundo clic en otra provincia (chincheta roja de Destino). Pulsar en el botón flotante **"Calcular Ruta Segura"**.
*   **Resultado esperado:** La aplicación realiza la llamada REST al backend (el cual consulta con OSRM), devolviendo en segundos la geometría exacta de las autovías y dibujando la línea de la carretera sobre el mapa.

### 6. Semáforo de la Hora de Oro (RF-Semáforo)
*   **Acción:** Mostrar la carretera del viaje dividida en colores y hacer clic directo sobre cualquier tramo de color de la línea pintada.
*   **Resultado esperado:** Visualización de los tres colores: verde (🟢 - hospital a <30 min), amarillo (🟡 - hospital a 30-60 min) y rojo (🔴 - desierto médico a >60 min). Al clicar el tramo se muestra el globo indicando la vía, hospital asignado y minutos de respuesta estimados.

### 7. Guardar el Viaje en el Historial (RF-Persistencia)
*   **Acción:** Escribir un nombre descriptivo en la tarjeta de resultados inferior (ej: *"Mi Ruta de Pruebas"*) y pulsar en el botón **"Guardar Ruta en Historial"**.
*   **Resultado esperado:** El sistema extrae el token JWT, lo envía al servidor, este lo asocia a tu usuario y realiza la inserción en la base de datos de H2, devolviendo una notificación verde de éxito en pantalla.

### 8. Biblioteca de Rutas y Consulta Diferida (RF-Persistencia)
*   **Acción:** Ir al menú inferior y hacer clic en la pestaña central **"Mis Rutas"**.
    *   Pulsar en el botón **"Ver tramos"** de la tarjeta guardada para expandir la información.
    *   Pulsar en el botón naranja **"Cargar en Mapa"** de la tarjeta.
*   **Resultado esperado:** Se visualiza la tarjeta de *"Mi Ruta de Pruebas"* listada cronológicamente con su borde de color correspondiente. Al pulsar en *"Ver tramos"* se expande el listado completo de vías y hospitales asignados sin recalcular nada. Al pulsar en *"Cargar en mapa"*, redirige solo al Mapa inyectando el trazado de forma inmediata.

### 9. Panel de Estadísticas y Educación (RF-Perfil)
*   **Acción:** Acceder a la pestaña inferior derecha **"Mi Perfil"**.
*   **Resultado esperado:** Muestra los datos del alumno y las estadísticas actualizadas en tiempo real (las rutas guardadas y cuántas son seguras). Muestra el panel didáctico de primeros auxilios y el botón de Cerrar Sesión.

---

## 📡 Evidencias Técnicas en Consola (Por si el tribunal las pide)

Si algún miembro de la mesa de evaluación solicita evidenciar la comunicación de datos de la arquitectura cliente-servidor, ten preparadas estas llamadas en la pestaña *Network* (F12) de tu navegador para dejarlos asombrados:

1.  **Registro (`POST /api/auth/register`):**
    *   *Payload:* `{ "email": "nuevo@test.com", "password": "...", "fullName": "..." }`
    *   *Respuesta:* Código `201 Created` con el ID autogenerado en la base de datos H2 y los datos del usuario registrados de forma limpia.
2.  **Login (`POST /api/auth/login`):**
    *   *Payload:* `{ "email": "...", "password": "..." }`
    *   *Respuesta:* Código `200 OK` con un JSON conteniendo `{ "token": "eyJhbG..." }`. Explica que es un token **JWT (JSON Web Token)** cifrado con el algoritmo HMAC-SHA256, sin estado (stateless) para optimizar recursos del backend.
3.  **Red Médica (`GET /api/healthcare/spain?limit=10000`):**
    *   *Respuesta:* Código `200 OK`. Devuelve un array JSON con los **más de 7.240 hospitales y consultorios** reales de España.
    *   *Detalle técnico pro:* Se carga desde la memoria síncrona del backend (`@PostConstruct` en `HealthcareNetworkService`) en **menos de 50ms**, actuando como caché interna de alto rendimiento.
4.  **Cálculo de Carretera (`POST /api/routes/calculate`):**
    *   *Payload:* `{ "origin": "40.4168,-3.7038", "destination": "39.4699,-0.3763" }`
    *   *Respuesta:* Código `200 OK` que contiene la distancia total, la duración en horas y el array de segmentos de carretera. Cada segmento tiene su array de coordenadas de geolocalización, hospital asignado, minutos de respuesta y el riesgo calculado (`LOW`, `MEDIUM` o `CRITICAL`).
5.  **Persistencia (`POST /api/routes/save`):**
    *   *Headers:* Envía la cabecera `Authorization: Bearer <TOKEN>` inyectada automáticamente por nuestro `AuthInterceptor` en Angular.
    *   *Payload:* Datos JSON con el nombre del viaje y las coordenadas de la ruta.
    *   *Respuesta:* Código `201 Created`, almacenado y vinculado físicamente al ID del usuario en la tabla `SAVED_ROUTE`.
6.  **Historial (`GET /api/routes/list`):**
    *   *Respuesta:* Código `200 OK` con el listado de las rutas guardadas de ese usuario específico ordenadas de forma cronológica descendente.
7.  **Inspección Física (SQL H2 Console):**
    *   Abre `http://localhost:8080/h2-console`, comprueba que la URL JDBC es `jdbc:h2:file:./data/goldenhour`, escribe el usuario `sa` y pulsa *Connect*.
    *   Escribe `SELECT * FROM APP_USER;` y `SELECT * FROM SAVED_ROUTE;` para mostrar las filas reales físicas de la base de datos persistente.

---

## 🎓 3 Preguntas Clave que el Tribunal te puede hacer (Y cómo responderlas como un pro)

*   **P1: ¿Por qué habéis utilizado una base de datos en archivo H2 en lugar de una base de datos como PostgreSQL en producción?**
    *   *Respuesta:* *"Para este proyecto de fin de ciclo, queríamos garantizar la máxima portabilidad e instalabilidad del software en un solo clic. H2 permite persistir los datos de manera física en la carpeta del proyecto (`./data/goldenhour`) simulando a la perfección una base de datos PostgreSQL gracias a la capa de abstracción de JPA/Hibernate. De esta forma, el evaluador puede arrancar la aplicación sin tener que instalar ningún motor de base de datos local en su equipo."*
*   **P2: ¿Cómo traduce el backend la distancia al hospital en minutos de respuesta reales en el semáforo?**
    *   *Respuesta:* *"Hacemos un cálculo geométrico de la distancia en línea recta usando la fórmula del semiverseno (Haversine) entre los puntos de la carretera y el hospital. Para traducirla a minutos reales por carretera (que siempre tiene curvas y semáforos), aplicamos un factor de multiplicación corrector del algoritmo del backend. Si el resultado es <30 min es verde (seguro), de 30 a 60 min amarillo (hora de oro) y >60 min rojo (desierto médico)."*
*   **P3: ¿Cómo habéis solucionado la conectividad del móvil con la API del ordenador portátil al generar la APK?**
    *   *Respuesta:* *"Las APK de Android bloquean por seguridad las llamadas a `localhost` ya que buscarían el servidor dentro de la propia placa del teléfono. Lo que hicimos fue centralizar las URLs de llamadas en el archivo `environment.ts` de Angular apuntando a la IP local IPv4 del ordenador portátil en nuestra red Wi-Fi compartida, y configurar Spring Security para aceptar llamadas CORS provenientes del puerto nativo del móvil."*

