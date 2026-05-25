@echo off
title GoldenHour - Iniciar Aplicación de Producción
color 0E
echo =====================================================================
echo         GoldenHour - Iniciando Servidor Unificado (JAR)
echo =====================================================================
echo.

if not exist "backend\target\backend-0.0.1-SNAPSHOT.jar" (
    color 0C
    echo ERROR: No se encuentra el archivo compilado [backend\target\backend-0.0.1-SNAPSHOT.jar].
    echo Por favor, ejecuta primero el script [generar_empaquetado_produccion.bat] para construirlo.
    echo.
    pause
    exit /b 1
)

echo Iniciando servidor en el puerto 8080...
echo Se abrira tu navegador en http://localhost:8080 en unos segundos.
echo.
echo Para detener la aplicacion, simplemente cierra esta ventana de comandos.
echo.

:: Abrir el navegador tras 3 segundos
start /b cmd /c "timeout /t 5 >nul && start http://localhost:8080"

:: Ejecutar JAR
java -jar backend\target\backend-0.0.1-SNAPSHOT.jar
if %errorlevel% neq 0 (
    color 0C
    echo ERROR al ejecutar el archivo JAR. Asegurate de tener Java instalado.
    pause
)
