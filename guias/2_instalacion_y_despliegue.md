# 🚀 Guía 2: Manual de Instalación y Despliegue Paso a Paso

En esta guía explico de forma sencilla cómo instalar todo lo necesario para arrancar mi proyecto **GoldenHour** en local. He estructurado la secuencia de tareas para simplificar el proceso de configuración y garantizar una puesta en marcha ágil y libre de fricciones técnicas. También he añadido al final una sección con los pasos que seguí para crear la base del proyecto (el bootstrapping) por si quieres reconstruirlo en blanco desde cero.

---

## 🧰 1. Instalación de las Herramientas (Requisitos Previos)

Para que el proyecto funcione en tu ordenador, necesitas instalar estas tres herramientas básicas:

### A. Java JDK 21 (Para el Servidor Java)
Java es el lenguaje con el que he programado todo el servidor backend que calcula las rutas y maneja la base de datos.
1.  **Descarga:** Entra en la web oficial de [Adoptium Temurin JDK 21](https://adoptium.net/temurin/releases/?version=21).
2.  **Elegir instalador:** En la lista de descargas para Windows, busca la fila de **Windows** y la columna **x64**. Descarga el archivo que termina en **`.msi`** (es el instalador automático).
3.  **Instalar:**
    *   Abre el archivo descargado con doble clic.
    *   **Paso clave:** En la lista de componentes, busca la opción que tiene una cruz roja y dice **"Set JAVA_HOME variable"**. Haz clic en ella y selecciona **"Will be installed on local hard drive"** (Se instalará en el disco duro local). Esto es fundamental para que Windows sepa dónde está Java.
    *   Comprueba que la casilla **"Add to PATH"** también esté seleccionada para que se configure sola.
    *   Haz clic en **Siguiente** (Next) y luego en **Instalar** (Install). Acepta los permisos de administrador de Windows.

### B. Node.js v22 (LTS) (Para la pantalla del móvil)
Node.js es el entorno que compila la interfaz del móvil y la muestra en el navegador de internet.
1.  **Descarga:** Ve a la web oficial de [Node.js](https://nodejs.org/).
2.  **Elegir versión:** Descarga la versión de la izquierda, la que dice **"22.X.X LTS (Recomendada para la mayoría)"**.
3.  **Instalar:**
    *   Abre el archivo de instalación.
    *   Haz clic en **Siguiente** (Next) en todas las ventanas del asistente, aceptando los valores que vienen por defecto y la licencia, hasta que termine.

### C. Antigravity IDE (El Entorno donde he programado)
Este proyecto lo he desarrollado usando **Antigravity IDE**, que es un entorno de desarrollo muy avanzado desarrollado por Google DeepMind. Tiene un panel de inteligencia artificial que te ayuda a programar, depurar y ejecutar comandos escribiendo en lenguaje natural.
1.  **Descarga:** Descarga el instalador oficial de **Antigravity IDE** desde el enlace o paquete que te hayan proporcionado.
2.  **Instalar:**
    *   Abre el archivo de instalación (`antigravity-setup.exe`).
    *   Sigue los pasos haciendo clic en **Siguiente** y deja las rutas que vienen por defecto. Haz clic en **Instalar** y luego en **Terminar**.
3.  **Abrir el proyecto:**
    *   Abre **Antigravity IDE** en tu ordenador.
    *   En la pantalla de inicio, pulsa la opción **"Abrir carpeta"** (Open Folder).
    *   Selecciona la carpeta raíz de mi proyecto (`Proyecto-goldenhour-Alberto`) y pulsa en **Seleccionar carpeta**.
    *   El IDE cargará al instante todos los archivos. En la parte derecha de la pantalla verás el panel de la IA **Antigravity** para ayudarte en lo que necesites del código sin tener que teclear comandos complicados.

> [!IMPORTANT]
> **Aviso importante:** Cuando hayas terminado de instalar Java JDK, Node.js y Antigravity IDE, **reinicia tu ordenador**. Así te aseguras de que Windows cargue las rutas del sistema y no te dé ningún error de herramientas no encontradas.

---

## 🛠️ 2. Cómo Crear el Proyecto desde Cero (Paso a Paso)

Si en vez de usar mis archivos quieres ver cómo he creado la estructura del proyecto en blanco en un directorio vacío, estos son los comandos que utilicé:

### A. Estructurar el Backend (Spring Boot)
1.  **Base del servidor:** Entré en [Spring Initializr](https://start.spring.io/).
2.  **Configuración:** Seleccioné **Maven Project**, **Java**, versión de Spring Boot **3.4.x**, Packaging **Jar** y Java **21**.
3.  **Dependencias:** Añadí las librerías *Spring Web*, *Spring Data JPA*, *Validation*, *H2 Database*, *Spring Security* y *Lombok*.
4.  **Generar:** Descargé el fichero ZIP, lo descomprimí y renombré la carpeta como `backend`.
5.  **Maven Wrapper:** Entré en la carpeta `backend` con la consola y ejecuté este comando para crear el ejecutable local del servidor:
    ```powershell
    mvn -N io.takari:maven:wrapper
    ```

### B. Estructurar el Frontend (Ionic / Angular)
1.  **Instalar las herramientas de desarrollo:** Abrí una consola como administrador e instalé los comandos globales de Ionic y Angular:
    ```powershell
    npm install -g @ionic/cli @angular/cli
    ```
2.  **Crear la estructura móvil:** Fuera de la carpeta `backend`, ejecuté el comando para crear una app móvil con arquitectura de tres pestañas (tabs):
    ```powershell
    ionic start mobile tabs --type=angular --standalone=false
    ```
3.  **Instalar Leaflet (Mapas):** Entré en la carpeta creada (`cd mobile`) e instalé el motor de mapas y sus tipados para TypeScript:
    ```powershell
    npm install leaflet
    npm install @types/leaflet --save-dev
    ```
4.  **Crear las pantallas de Login y Registro:** Ejecuté los generadores automáticos de Ionic para crear las páginas en sus respectivas carpetas:
    ```powershell
    ionic generate page pages/login
    ionic generate page pages/register
    ```

---

## ⚡ 3. Despliegue Rápido (Arrancar la Aplicación)

Si ya tienes mi carpeta y quieres arrancar todo para probarlo de golpe:

1.  Abre la carpeta del proyecto (`Proyecto-goldenhour-Alberto`).
2.  Busca el archivo automático llamado **`iniciar_proyecto.bat`** y haz **doble clic** sobre él.
3.  *Saltarse el aviso de Windows:* Si te sale una ventana azul de protección, haz clic en **"Más información"** y después en **"Ejecutar de todas formas"**.
4.  **Pulsar una tecla:** En la pantalla negra que se abre, pulsa **Enter** o la barra espaciadora para confirmar que todo está listo.
5.  **Ventanas automáticas:** Se abrirán solas dos ventanas negras de comandos en segundo plano:
    *   La del **Backend** arrancará la base de datos y cargará los hospitales (pondrá `Started BackendApplication`).
    *   La del **Frontend** compilará las pantallas del móvil (pondrá `Compiled successfully`).

    > [!WARNING]
    > **Importante:** No cierres ninguna de esas dos ventanas negras. Si las cierras, apagarás los servidores y la aplicación dejará de funcionar en tu navegador.

---

## 🌐 4. Probar la Aplicación en el Navegador

Una vez que termine de cargar, tu navegador se abrirá solo en la siguiente dirección:

👉 **[http://localhost:4200](http://localhost:4200)**

Si no se abre solo, copia esa dirección y pégala en Google Chrome o Microsoft Edge.

### 🔑 Datos de Acceso Demo (Para no tener que registrarte)
Para entrar de inmediato, introduce estos datos en la pantalla de inicio de sesión:
*   **Email:** `demo@example.com`
*   **Contraseña:** `Demo12345!`
*   Pulsa en **"Entrar"** y accederás al mapa interactivo.

---

## 🤖 5. Cómo Generar e Instalar la APK en tu Móvil (Prueba Física)

Si deseas compilar la aplicación móvil y probarla de forma física en un teléfono móvil Android, el proyecto está completamente preparado para empaquetarse como una APK nativa usando Capacitor.

### ⚠️ El paso clave de Red (Evitar el fallo de localhost en el móvil)
Si dejas la URL del servidor como `localhost` en el código, el móvil buscará la base de datos dentro del propio teléfono y dará error de conexión. Para solucionarlo:
1.  **Conecta ambos dispositivos a la misma red Wi-Fi:** Tu portátil y tu móvil deben compartir el mismo router Wi-Fi.
2.  **Busca la IP local de tu portátil:** Abre una consola de comandos de Windows, escribe `ipconfig` y anota tu dirección IPv4 (por ejemplo: `192.168.1.138`).
3.  **Configura la IP en el código:** Abre el archivo `mobile/src/environments/environment.ts` (y `environment.prod.ts`) y cambia el parámetro `apiUrl` poniendo la IP de tu portátil:
    `apiUrl: 'http://192.168.1.138:8080/api'`
    *(Ya he dejado configurada la IP de tu portátil en el código actual, pero si la IP de tu router cambia, deberás actualizarla aquí).*

### 🚀 Generar la APK en 3 Pasos
1.  **Ejecutar el Lanzador:** Haz doble clic sobre el script **`preparar_android.bat`** en la raíz del proyecto. Este script compilará la interfaz móvil con la IP configurada, sincronizará los archivos web en el contenedor nativo y abrirá de forma automática **Android Studio**.
2.  **Compilar en Android Studio:**
    *   Espera a que Gradle termine de sincronizar todos los ficheros en segundo plano (verás una barra de progreso abajo a la derecha de Android Studio, espera a que desaparezca).
    *   En el menú superior de Android Studio, haz clic en: **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
3.  **Localizar e Instalar la APK:**
    *   Una vez que finalice la compilación, haz clic en el enlace azul **"locate"** (localizar) en la notificación emergente de Android Studio.
    *   Se abrirá la carpeta del sistema mostrándote el archivo ejecutable **`app-debug.apk`**.
    *   Envía este archivo a tu móvil (por cable, Drive o WhatsApp Web) e instálalo (permite la instalación de origen desconocido si el móvil lo solicita).
    *   ¡Listo! Ya podrás probar la aplicación móvil de manera física conectada en tiempo real al servidor de tu portátil.

---

## 🛠️ 6. Resolución de Problemas Frecuentes (Troubleshooting DAW)

Durante la preparación de entornos híbridos de desarrollo con **Capacitor** y **Android Studio**, es habitual encontrarse con pequeños conflictos de configuración en Windows. Aquí tienes las soluciones a los 3 errores más clásicos:

### ❌ Error 1: `"npx cap" no se reconoce o Android Studio no se abre automáticamente`
*   **Por qué ocurre:** O bien no tienes instalado el CLI de Capacitor localmente, o el script `preparar_android.bat` no encuentra la ruta de instalación de Android Studio en Windows (suele buscar en `C:\Program Files\Android\Android Studio\bin\studio64.exe`).
*   **Solución:**
    1.  Asegúrate de que has ejecutado `npm install` en la carpeta `mobile` para descargar las dependencias del proyecto.
    2.  Si Android Studio no se abre solo, no te preocupes: abre **Android Studio** a mano desde tu menú de Inicio, selecciona **"Open"** (Abrir) y busca la carpeta `mobile/android` en tu proyecto. Android Studio la importará perfectamente como un proyecto nativo.

### ❌ Error 2: `Falta de variable ANDROID_HOME o error de Gradle "SDK location not found"`
*   **Por qué ocurre:** Android Studio no sabe dónde está instalado el SDK de Android en tu disco duro porque no tienes configuradas las variables de entorno de Windows.
*   **Solución:**
    1.  Abre el menú de Inicio de Windows y busca **"Editar las variables de entorno del sistema"**.
    2.  Haz clic en el botón **"Variables de entorno..."** abajo a la derecha.
    3.  En "Variables de usuario", pulsa **Nueva...** y escribe:
        *   **Nombre de la variable:** `ANDROID_HOME`
        *   **Valor de la variable:** `C:\Users\TU_USUARIO_WINDOWS\AppData\Local\Android\Sdk` *(Sustituye TU_USUARIO_WINDOWS por tu nombre de usuario real en Windows).*
    4.  Busca la variable `Path` en la misma sección de variables de usuario, pulsa **Editar...**, luego **Nuevo** y añade:
        `%ANDROID_HOME%\platform-tools`
    5.  Pulsa Aceptar en todas las ventanas, cierra tu terminal y vuelve a ejecutar el script `.bat`. ¡Problema resuelto!

### ❌ Error 3: `La APK se instala en mi móvil pero da error de conexión al iniciar sesión`
*   **Por qué ocurre:** Aunque estés en el mismo Wi-Fi, tu portátil puede tener activado el "Perfil de red pública" en Windows, lo que hace que el cortafuegos (Firewall) de Windows bloquee cualquier conexión que venga desde fuera (como tu móvil).
*   **Solución:**
    1.  En tu portátil, haz clic en el icono de Wi-Fi de la barra de tareas, entra en las propiedades de la red Wi-Fi a la que estás conectado y asegúrate de cambiar el perfil de red de **"Pública"** a **"Privada"**.
    2.  Si el problema persiste, abre la terminal en tu portátil y ejecuta:
        `ping TU_IP_DEL_MOVIL` para verificar si ambos se ven físicamente.
    3.  Asegúrate de que la IP IPv4 configurada en el archivo `mobile/src/environments/environment.ts` es exactamente la que te devolvió el comando `ipconfig` al compilar (si reinicias el router o te conectas a otro Wi-Fi, tu IP local puede cambiar).


