# 📦 Guía 4: Despliegue de Producción Unificado (Ejecutable Único JAR)

En esta guía explico cómo he programado el empaquetado final para unir tanto el cliente móvil (frontend) como el servidor de Java (backend) en **un único archivo ejecutable `.jar`**. 

Este modelo de despliegue unificado es ideal para entregárselo al tribunal o al profesor de mi proyecto de DAW. De esta manera, para arrancar y probar el 100% de la aplicación no hace falta instalar Node.js ni compilar carpetas; solo se necesita **un único comando y usar un único puerto (8080)**.

---

## 📐 ¿Cómo funciona la unión de Frontend y Backend?

Para evitar tener dos servidores corriendo en puertos distintos en producción (el 4200 y el 8080), lo que hago es compilar la interfaz móvil y meter los archivos estáticos resultantes directamente dentro del servidor Java:

```
┌─────────────────────────────────────────────────────────────┐
│             PROCESO DE ENSAMBLADO EN PRODUCCIÓN             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [ mobile/src/ ]  --->  Compilación Angular (ng build)      │
│                                  │                          │
│                                  ▼                          │
│  [ mobile/www/ ]  --->  Archivos Estáticos (HTML, JS, CSS)  │
│                                  │                          │
│                                  ▼ Copiado Automático       │
│  [ backend/src/main/resources/static/ ]                     │
│                                  │                          │
│                                  ▼ Compilación Maven (mvnw) │
│  [ backend/target/backend-0.0.1-SNAPSHOT.jar ]  <-- [ JAR ] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Al hacer esto, el servidor web embebido **Apache Tomcat** que lleva Spring Boot dentro se encarga de dos cosas a la vez:
1.  Servir las APIs REST de lógica de negocio y base de datos en `/api/*`.
2.  Servir y mostrar directamente todas las pantallas de la aplicación móvil (archivos HTML, JS, CSS) al entrar en la dirección raíz `/`.

---

## 🔌 Modos de Prueba y Puertos: ¿Cómo se puede probar la aplicación?

He programado el proyecto para que se pueda ejecutar en dos modalidades distintas según lo que necesite el revisor:

### 1. Modo de Desarrollo (Puerto `4200` - Recomendado para programar)
*   **Cómo se inicia:** Haciendo doble clic en el script **`iniciar_proyecto.bat`** (explicado en la Guía 2).
*   **Puertos:** 
    *   El backend de Java corre en el puerto `8080`.
    *   El móvil en Ionic/Angular corre en el puerto `4200`.
*   **Dirección de acceso:** **`http://localhost:4200`**
*   **Características:** Permite compilar y ver los cambios de código en caliente (Hot Reload) en cuanto guardas un archivo en el IDE. Es el modo de pruebas habitual.

### 2. Modo de Producción Unificado (Puerto `8080` - Despliegue Rápido)
*   **Cómo se inicia:** Ejecutando el archivo `.jar` compilado o mediante el script **`iniciar_produccion.bat`**.
*   **Puertos:** 
    *   Tanto el backend como la interfaz móvil se ejecutan juntos a través del puerto `8080`. El puerto `4200` está apagado ya que no se necesita arrancar Node.js.
*   **Dirección de acceso:** **`http://localhost:8080`**
*   **Características:** Es la forma más rápida y limpia de cara a la evaluación final, ya que no requiere levantar servidores de desarrollo separados.

---

## 🛠️ Pasos para Compilar y Ensamblar a Mano

Para generar el archivo unificado de producción `.jar` de forma manual en la terminal, se siguen estos pasos:

### Paso 1: Compilar la Aplicación Móvil
1.  Entra en la carpeta de la interfaz móvil en tu consola:
    ```powershell
    cd mobile
    ```
2.  Ejecuta el comando de compilación optimizada:
    ```powershell
    npm run build
    ```
    *Este comando traduce el TypeScript y estilos del móvil en ficheros web optimizados en la carpeta `mobile/www`.*

### Paso 2: Copiar los Archivos al Servidor
1.  Crea la carpeta de recursos estáticos de Java si no existía:
    `backend/src/main/resources/static`
2.  Copia todo el contenido de la carpeta `mobile/www` y pégalo directamente en `backend/src/main/resources/static`.

### Paso 3: Crear el Fichero Ejecutable `.jar`
1.  Entra en la carpeta del servidor en tu consola:
    ```powershell
    cd ../backend
    ```
2.  Ejecuta el empaquetado con Maven:
    ```powershell
    .\mvnw.cmd clean package -DskipTests
    ```
    *Maven compilará el código de Java, unirá la base de datos y los archivos del móvil, y lo empaquetará todo en el ejecutable `backend-0.0.1-SNAPSHOT.jar` dentro de la carpeta `backend/target/`.*

---

## 🚀 Cómo Arrancar el Fichero Ejecutable

Una vez generado, para probar la aplicación unificada no se requiere tener instalado Node.js ni Ionic.

### Requisitos:
*   Tener instalado **Java JDK 21** en el ordenador (explicado en la Guía 2).

### Instrucciones de Lanzamiento:
1.  Abre una consola de comandos en la carpeta `backend/target/` del proyecto.
2.  Arranca la aplicación con este comando:
    ```powershell
    java -jar backend-0.0.1-SNAPSHOT.jar
    ```
3.  **Acceso:** Abre tu navegador y entra en la dirección:
    👉 **[http://localhost:8080](http://localhost:8080)**

---

## ⚡ Script de Empaquetado Automático en un Clic

He creado el archivo automático **`generar_empaquetado_produccion.bat`** en la raíz del proyecto para que realice los Pasos 1, 2 y 3 de manera automática al hacer doble clic sobre él.

### Código del Script (`generar_empaquetado_produccion.bat`):
```batch
@echo off
title GoldenHour - Empaquetador Unificado de Producción
color 0A
echo =====================================================================
echo         GoldenHour - Ensamblando Ejecutable de Producción
echo =====================================================================
echo.

:: 1. Compilar Frontend
echo [1/3] Compilando Frontend (Ionic / Angular)...
cd mobile
call npm run build
if %errorlevel% neq 0 (
    echo ERROR en la compilacion del Frontend.
    pause
    exit /b 1
)

:: 2. Crear carpetas y copiar archivos
echo.
echo [2/3] Transfiriendo archivos de interfaz al servidor backend...
cd ..
if not exist "backend\src\main\resources\static" (
    mkdir "backend\src\main\resources\static"
)
xcopy /E /Y /Q "mobile\www\*" "backend\src\main\resources\static\"

:: 3. Compilar y empaquetar Backend en JAR
echo.
echo [3/3] Compilando y empaquetando Backend (Spring Boot JAR)...
cd backend
call mvnw.cmd clean package -DskipTests
if %errorlevel% neq 0 (
    echo ERROR al generar el paquete unificado JAR.
    pause
    exit /b 1
)

echo.
echo =====================================================================
echo        ¡PROCESO DE COMPILACIÓN Y ENSAMBLADO COMPLETADO!
echo =====================================================================
echo.
echo El archivo ejecutable unificado ha sido generado en:
echo [backend\target\backend-0.0.1-SNAPSHOT.jar]
echo.
echo Para arrancarlo, ejecuta: java -jar backend-0.0.1-SNAPSHOT.jar
echo Y accede en tu navegador a: http://localhost:8080
echo =====================================================================
pause
```
