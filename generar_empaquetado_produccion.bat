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
:: Limpiar carpeta static previa
del /q /s "backend\src\main\resources\static\*" >nul 2>&1
xcopy /E /Y /Q "mobile\www\*" "backend\src\main\resources\static\"

:: 3. Compilar y empaquetar Backend en JAR
echo.
echo [3/3] Compilando y empaquetando Backend (Spring Boot JAR)...
cd backend
:: Configurar JAVA_HOME si no existe para asegurar compilación
if "%JAVA_HOME%"=="" (
    if exist "C:\Program Files\Eclipse Adoptium\jdk-21.0.7.6-hotspot" (
        set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.7.6-hotspot"
    )
)
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
echo Para arrancarlo, ejecuta: java -jar backend\target\backend-0.0.1-SNAPSHOT.jar
echo Y accede en tu navegador a: http://localhost:8080
echo =====================================================================
pause
