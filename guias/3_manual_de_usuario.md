# 📱 Guía 3: Manual de Usuario Completo (Cómo Usar la Aplicación al 100%)

En este manual de usuario explico de forma sencilla y paso a paso cómo funciona cada una de las pantallas de mi aplicación **GoldenHour**. He redactado esta guía de manera muy visual y directa para que cualquiera, aunque no tenga conocimientos informáticos, pueda navegar, calcular rutas y probar todas las opciones del mapa médico con total facilidad.

---

## 🩺 ¿Qué es la "Hora de Oro" y por qué sirve esta App?

En medicina de emergencias por carretera, la **"Hora de Oro"** (Golden Hour) representa el intervalo de 60 minutos transcurridos inmediatamente después de sufrir un accidente de tráfico o complicación médica grave. Si el paciente recibe atención médica especializada y es estabilizado en un hospital dentro de esta primera hora, sus probabilidades de sobrevivir aumentan exponencialmente.

Con mi aplicación **GoldenHour**, el usuario puede planificar su viaje por carretera. El programa dibuja un **semáforo de colores** en la carretera que alerta si hay zonas donde estaríamos a más de una hora de distancia del hospital de urgencias más cercano, ayudando a prevenir riesgos y a conducir con más cuidado por esos tramos aislados.

---

## 🔐 1. Registro e Inicio de Sesión

Al abrir la aplicación en tu navegador web (**`http://localhost:4200`**), entrarás en una pantalla de bienvenida con un diseño oscuro translúcido.

### Crear Cuenta Nueva
Si quieres registrarte para tener tu propio usuario:
1.  Haz clic en el enlace inferior **"¿No tienes cuenta? Regístrate gratis aquí"**.
2.  Rellena el formulario:
    *   **Nombre completo:** Escribe tu nombre y apellidos.
    *   **Correo electrónico:** Tu dirección de email (será tu usuario para entrar).
    *   **Contraseña:** Elige una clave. Por seguridad, el sistema te obliga a escribir al menos **8 caracteres**.
    *   **Confirmar Contraseña:** Vuelve a escribir tu contraseña exactamente igual para comprobar que no te has equivocado al teclear.
3.  Haz clic en **"Crear Cuenta"**. Si todo es correcto, te saldrá un cartel verde de éxito y volverás de forma automática a la pantalla de login al cabo de 1.5 segundos.

### Inicio de Sesión Rápido (Usuario Demo)
Para probar todo al instante sin registrarte, escribe estas credenciales de prueba preconfiguradas:
*   **Correo electrónico:** `demo@example.com`
*   **Contraseña:** `Demo12345!`
*   Haz clic en **"Entrar"** y accederás al mapa interactivo.

---

## 🗺️ 2. El Mapa Interactivo (Tab 1)

Esta es la pantalla principal del programa y muestra un mapa interactivo real de toda la geografía española.

### Cómo Moverse por el Mapa
*   **Desplazamiento:** Mantén pulsado el botón izquierdo de tu ratón en cualquier punto del mapa y arrástralo en la dirección que quieras para moverte por las provincias. Si usas móvil o tablet, arrastra directamente con el dedo.
*   **Zoom:** Usa la rueda del ratón para acercarte o alejarte. También puedes usar los botones **`+`** (Acercar) y **`-`** (Alejar) situados arriba a la izquierda del mapa.

### Marcadores de la Red Médica
Verás distribuidos miles de marcadores circulares de colores que representan los centros sanitarios reales de España:
1.  **Círculos Rojos (🔴):** Representan **Hospitales Principales**. Tienen servicio de urgencias 24h, quirófanos y atención médica especializada completa.
2.  **Círculos Azules (🔵):** Representan **Centros de Salud Locales** o consultorios de atención primaria.
3.  **Hacer clic en ellos:** Si haces clic sobre cualquier círculo del mapa, se abrirá un cuadro informativo que te indicará el nombre del hospital, su dirección, su tipo de servicio y su **teléfono oficial de emergencias** directo.

### Ubicación GPS en Tiempo Real
*   En la barra de búsqueda de arriba, verás el icono de una **mira telescópica / brújula (📌)**.
*   Si haces clic en él y permites que el navegador acceda a tu ubicación, el mapa se centrará en tu posición exacta al instante mostrando un **círculo azul brillante parpadeante**.
*   El campo de "Origen" se rellenará solo con tus coordenadas de GPS actuales.

---

## 🚗 3. Planificación y Cálculo de Rutas Seguras

Para planificar un viaje y ver qué tan seguras son las carreteras por las que vas a pasar, sigue estos sencillos pasos:

### Método de Clics en el Mapa (El más fácil)
1.  **Origen:** Haz un clic izquierdo sobre el mapa en el lugar de donde quieres salir. Se colocará un marcador de color **Verde (Origen)**.
2.  **Destino:** Haz un segundo clic en el punto final de tu viaje. Se colocará un marcador de color **Rojo (Destino)**.
3.  **Calcular:** Una vez marcados el punto verde y el rojo, haz clic en el botón flotante naranja de abajo: **"Calcular Ruta Segura"**.

---

## 🚦 4. Cómo Interpretar el Semáforo de Riesgo

Una vez calculada la ruta, la línea de la carretera del viaje se pintará de tres posibles colores según el tiempo de respuesta del hospital más cercano:

*   🟢 **Línea Verde (Riesgo Bajo):** La cobertura es excelente. El hospital de urgencias más cercano está a **menos de 30 minutos** de conducción en ese tramo de vía.
*   🟡 **Línea Amarilla (Riesgo Medio):** El hospital de urgencias más cercano está a entre **30 y 60 minutos** (aún dentro de la Hora de Oro).
*   🔴 **Línea Roja (Riesgo Crítico):** Estás a **más de 60 minutos** (más de una hora) de cualquier hospital. En estos tramos aislados, una ambulancia tardaría demasiado en llegar. ¡Conduce con extrema precaución aquí!

### Popup interactivo en la Carretera
Si haces clic directo con el ratón sobre cualquier parte de la línea coloreada de la ruta en el mapa, se abrirá un popup informativo indicándote:
1.  El nombre de la carretera.
2.  El hospital asignado para socorrerte en esa zona exacta.
3.  El tiempo estimado en minutos que tardaría en llegar la asistencia.

---

## 💾 5. Guardar la Ruta en tu Historial

Cuando calculas un viaje, en la parte inferior se despliega una tarjeta de resumen con la distancia total en kilómetros, el tiempo total y el nivel de riesgo global (`LOW` o `CRITICAL`).

Para guardarlo en tu historial personal:
1.  Escribe el nombre que quieras en la casilla de texto de abajo (ej: *"Viaje Fin de Semana"*).
2.  Haz clic en el botón **"Guardar Ruta en Historial"**.
3.  Aparecerá un mensaje emergente verde confirmando que la ruta se ha guardado correctamente.

---

## 📂 6. Pestaña de Historial de Rutas (Tab 2)

En el menú inferior, pulsa en la pestaña central llamada **"Mis Rutas"**:
*   **Visualización rápida:** Verás todas las rutas que has guardado en tarjetas. Cada una tiene un borde de color lateral que te indica el semáforo global del viaje al instante.
*   **Ver Tramos:** Si pulsas este botón, la tarjeta se expandirá hacia abajo y te mostrará el listado tramo a tramo de las carreteras, hospitales asignados y minutos de retraso de toda la ruta.
*   **Cargar en Mapa:** Si quieres ver la ruta de nuevo de forma interactiva en la primera pestaña, pulsa el botón naranja **"Cargar en Mapa"** y el sistema la inyectará y pintará sola en el mapa interactivo de inmediato.

---

## 👤 7. Pestaña de Perfil y Estadísticas (Tab 3)

Haz clic en la pestaña inferior derecha llamada **"Mi Perfil"**:
1.  **Tus Datos:** Muestra tu nombre registrado, tu correo de cuenta y tu rol de permisos.
2.  **Resumen de Actividad (Estadísticas):** Te dice de forma interactiva cuántas rutas totales has guardado, cuántas son **100% Seguras** (carreteras siempre verdes) y cuántas contienen **Tramos de Riesgo** (carreteras rojas o amarillas).
3.  **Guía Médica Educativa:** Un panel interactivo de lectura rápida que te explica en qué consiste la Hora de Oro.
4.  **Cerrar Sesión:** Un botón rojo inferior para salir de tu cuenta de forma 100% segura.

---

## 🖥️ 8. Consola de Base de Datos H2 (Para Curiosos)

Para ver la base de datos real del servidor donde se guardan tus usuarios registrados y las rutas por dentro:
1.  Abre una pestaña nueva en tu navegador y entra en: **`http://localhost:8080/h2-console`**.
2.  Comprueba que en la casilla **"JDBC URL"** pone exactamente:
    `jdbc:h2:file:./data/goldenhour`
3.  Deja la contraseña en blanco y haz clic en el botón **"Connect"** (Conectar).
4.  En el panel izquierdo verás las tablas físicas del proyecto (`APP_USER`, `HOSPITAL` y `SAVED_ROUTE`). Puedes hacer consultas SQL haciendo clic sobre ellas.

---

## 🧪 9. Batería de Pruebas y Validación (Checklist E2E)

He preparado esta tabla de pruebas paso a paso para que puedas validar de forma rápida y ordenada que el 100% de la aplicación funciona perfectamente:

| ID | Prueba | Acción Realizada | Resultado Esperado | Confirmación Visual |
|:---|:---|:---|:---|:---|
| **1** | **Registro Fallido** | Escribir nombre, correo y contraseña muy corta (menos de 8 caracteres). | El sistema bloquea el envío o da error de validación. | Mensaje de error en pantalla. |
| **2** | **Registro Exitoso** | Registrar una cuenta nueva con contraseña de 8+ caracteres. | Registrado con éxito, vuelve al login solo en 1.5 segundos. | Notificación emergente verde de éxito. |
| **3** | **Iniciar Sesión** | Escribir los datos de la cuenta creada o del usuario Demo. | Acceso concedido, te redirige al mapa principal. | El mapa carga y renderiza los hospitales. |
| **4** | **Red Médica** | Hacer clic en un círculo rojo (🔴) y en uno azul (🔵). | Se abre el popup informativo del hospital. | Muestra nombre, dirección y teléfono del centro. |
| **5** | **GPS Geolocalización** | Pulsar el icono de brújula (📌) y permitir permisos. | Te geolocaliza en milisegundos. | Aparece el círculo azul brillante parpadeante y rellena "Origen". |
| **6** | **Cálculo de Ruta** | Clicar origen en Madrid, destino en Valencia y pulsar "Calcular". | El backend calcula la ruta de OSRM y divide los riesgos. | Dibuja la línea de la carretera dividida en colores. |
| **7** | **Interpretación** | Ver la carretera coloreada resultante. | Las carreteras urbanas son verdes y las rurales rojas. | Visualización de tramos verdes (🟢), amarillos (🟡) y rojos (🔴). |
| **8** | **Tramos Mapa** | Hacer clic directo sobre la línea de color de la carretera. | Indica el hospital más rápido para esa zona. | Popup mostrando hospital de referencia y minutos. |
| **9** | **Guardar Viaje** | Escribir "Mi Viaje" y pulsar "Guardar Ruta en Historial". | El backend asocia y guarda la ruta en la base de datos SQL. | Notificación de éxito: "Ruta guardada correctamente". |
| **10**| **Historial** | Ir a la pestaña inferior central "Mis Rutas". | Se visualiza la tarjeta de la ruta guardada con borde de color. | Tarjeta "Mi Viaje" listada con su semáforo de riesgo global. |
| **11**| **Desglose** | Pulsar en el botón "Ver tramos" de la tarjeta. | Se abre la lista mostrando todas las carreteras y hospitales. | Lista desplegable con desgloses del viaje. |
| **12**| **Carga en Mapa** | Pulsar en "Cargar en Mapa" dentro de la tarjeta. | Redirección automática a Tab 1 cargando los datos. | El mapa centra e inyecta la geometría exacta de la ruta. |
| **13**| **Estadísticas** | Ir a la pestaña inferior derecha "Mi Perfil". | Los contadores muestran tu actividad real de guardado. | El contador de rutas guardadas se incrementa con precisión. |
| **14**| **Base de Datos** | Entrar a H2 Console (`localhost:8080/h2-console`) y conectar. | Permite ver las tablas de H2 en memoria/archivo. | `SELECT * FROM SAVED_ROUTE;` muestra la ruta guardada. |
