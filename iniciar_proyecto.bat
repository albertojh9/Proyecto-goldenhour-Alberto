@echo off
title GoldenHour - Iniciador Automático del Proyecto
color 0B
echo =====================================================================
echo           GoldenHour - Iniciar Aplicacion Completa (DAW)
echo =====================================================================
echo.
echo Este script iniciara de forma automatica y paralela el Backend
echo y el Frontend del proyecto en ventanas separadas.
echo.

:: 1. Comprobar requisitos del sistema
echo [1/3] Comprobando requisitos del entorno...
echo.

where java >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: No se ha detectado Java (JDK) instalado en el sistema o no esta en el PATH.
    echo Por favor, instala JDK 17 o superior y vuelve a ejecutar este script.
    echo Revisa el archivo MANUAL_DE_INICIO.md para ver la guia de instalacion.
    pause
    exit /b 1
) else (
    echo - Java (JDK) detectado correctamente.
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: No se ha detectado Node.js instalado en el sistema o no esta en el PATH.
    echo Por favor, instala Node.js (version LTS) y vuelve a ejecutar este script.
    echo Revisa el archivo MANUAL_DE_INICIO.md para ver la guia de instalacion.
    pause
    exit /b 1
) else (
    echo - Node.js detectado correctamente.
)

echo.
echo Requisitos verificados con exito.
echo.
pause

:: 2. Arrancar Backend en una ventana separada
echo [2/3] Levantando el Backend (Java Spring Boot)...
echo El backend estara disponible en http://localhost:8080
echo Nota: La primera ejecucion puede tardar unos minutos en descargar Maven Wrapper y dependencias.
echo.
start "GoldenHour - Backend Spring Boot" cmd /c "title GoldenHour - Backend Spring Boot && cd backend && mvnw.cmd spring-boot:run"

:: 3. Arrancar Frontend en una ventana separada
echo [3/3] Levantando el Frontend (Ionic / Angular)...
echo Instalando dependencias y levantando servidor de desarrollo...
echo El frontend se abrira automaticamente en tu navegador web.
echo.
start "GoldenHour - Frontend Ionic" cmd /c "title GoldenHour - Frontend Ionic && cd mobile && npm install && npm start"

echo =====================================================================
echo         ¡PROCESOS DE ARRANQUE INICIADOS CON EXITO!
echo =====================================================================
echo.
echo Las ventanas secundarias compilaran y ejecutaran cada parte:
echo - Backend corriendo en el puerto 8080 (Base de datos H2 en memoria activa)
echo - Frontend corriendo e interactuando en tu navegador web
echo.
echo Puedes mantener esta ventana abierta o cerrarla. Para detener los
echo servidores, simplemente cierra las ventanas de consola correspondientes.
echo =====================================================================
pause
