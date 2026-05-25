# 🗺️ GoldenHour - Planificación de Rutas Seguras con Cobertura Sanitaria Garantizada

¡Bienvenido al proyecto **GoldenHour**! Esta aplicación web y móvil híbrida ha sido desarrollada como **Proyecto de Fin de Ciclo de 2º de DAW (Desarrollo de Aplicaciones Web - 2026)** en el **IES Castelar** por el alumno **Alberto Jiménez Hernández**.

El objetivo principal de la aplicación es dotar a los conductores de una herramienta de planificación de viajes por carretera que evalúe y muestre en tiempo real la cobertura médica de urgencias en caso de accidente, calculando la distancia y tiempo de respuesta a hospitales para pintar el **Semáforo de la Hora de Oro** a lo largo del trayecto.

---

## ⚡ Despliegue Rápido en un Clic (Sin configuraciones complejas)

Para facilitar la evaluación del proyecto por parte del profesorado o el tribunal, se han programado **4 scripts automáticos (`.bat`)** en la raíz del proyecto. No es necesario instalar servidores web separados ni bases de datos complejas.

### 🎮 Modo 1: Producción Unificada (Recomendado para Evaluar)
Arranca el cliente móvil y el servidor Java en un único puerto y proceso.
1.  Haz doble clic en **`generar_empaquetado_produccion.bat`** para compilar la interfaz de Ionic/Angular, inyectar los archivos estáticos en el backend y empaquetar todo de forma unificada en un ejecutable `.jar`.
2.  Haz doble clic en **`iniciar_produccion.bat`** para arrancar el servidor embebido Tomcat.
3.  Acede directamente en tu navegador a:
    👉 **[http://localhost:8080](http://localhost:8080)**

### 💻 Modo 2: Entorno de Desarrollo (Para programar)
Arranca ambos entornos de forma separada con recarga en caliente de código.
1.  Haz doble clic en **`iniciar_proyecto.bat`**.
2.  Accede en tu navegador a:
    👉 **[http://localhost:4200](http://localhost:4200)** *(El backend correrá en paralelo en el puerto `8080`)*.

### 📱 Modo 3: Preparación Android (APK Física)
Compila y exporta la aplicación nativa a tu smartphone.
1.  Haz doble clic en **`preparar_android.bat`** para sincronizar Capacitor y abrir automáticamente Android Studio para compilar la APK (`app-debug.apk`).

---

## 📚 Carpetas de Documentación y Guías del Proyecto

Para conocer todos los detalles teóricos, metodológicos y de código del proyecto, la documentación se encuentra perfectamente estructurada en las siguientes rutas:

*   📂 **[guias/](file:///c:/Users/alber/Documents/Proyecto-goldenhour-Alberto/guias/) (Documentación Técnica y de Usuario):**
    *   📘 [Guía 1: Paso a Paso del Desarrollo (Memoria de Programación)](file:///c:/Users/alber/Documents/Proyecto-goldenhour-Alberto/guias/1_desarrollo_paso_a_paso.md) - Código fuente completo, diagramas, entidades y arquitectura de datos.
    *   📗 [Guía 2: Manual de Instalación y Despliegue](file:///c:/Users/alber/Documents/Proyecto-goldenhour-Alberto/guias/2_instalacion_y_despliegue.md) - Requisitos previos, bootstrappings y solución a problemas frecuentes de Android Studio.
    *   📙 [Guía 3: Manual de Usuario Completo](file:///c:/Users/alber/Documents/Proyecto-goldenhour-Alberto/guias/3_manual_de_usuario.md) - Explicación de pantallas, cómo usar el mapa y una batería de 14 pruebas de validación.
    *   📕 [Guía 4: Despliegue de Producción Unificado](file:///c:/Users/alber/Documents/Proyecto-goldenhour-Alberto/guias/4_despliegue_produccion_unificado.md) - Explicación detallada del modelo de integración JAR y puertos.
*   📂 **[docs/entregables/](file:///c:/Users/alber/Documents/Proyecto-goldenhour-Alberto/docs/entregables/) (Documentos Oficiales del Ciclo):**
    *   📝 [Checklist de Demo Final y Defensa de Proyecto](file:///c:/Users/alber/Documents/Proyecto-goldenhour-Alberto/docs/entregables/CHECKLIST_DEMO_FINAL.md) - Guion paso a paso de 5-8 minutos para realizar una defensa perfecta ante el tribunal y preguntas clave frecuentes de examen.
    *   📄 *Documentos PDF de Entregables oficiales del Ciclo (Ficha Técnica, Planificación de Sprints, Requisitos y Diapositivas de la Defensa).*

---

## 🛠️ Stack Tecnológico Utilizado

*   **Servidor (Backend):** Java 21, Spring Boot 3.4.x, Spring Security (JWT sin estado), Spring Data JPA, Hibernate y Jackson.
*   **Interfaz (Frontend):** Ionic Framework, Angular v19, TypeScript y Leaflet.js (Mapas interactivos).
*   **Base de Datos:** Base de Datos SQL embebida y persistente H2 (archivo local `./data/goldenhour`).
*   **Servicio Cartográfico Externo:** OSRM (Open Source Routing Machine) API.
