@echo off
title GoldenHour - Preparar Android (Capacitor)
color 0E
echo =====================================================================
echo         GoldenHour - Preparando Proyecto Nativo de Android
echo =====================================================================
echo.

cd mobile

:: 1. Comprobar si ya existe la carpeta android nativa
if not exist "android" (
    echo [1/4] Anadiendo plataforma Android nativa...
    call npx cap add android
) else (
    echo [1/4] La plataforma Android ya existe. Omitiendo 'add'.
)

:: 2. Compilar la interfaz móvil
echo.
echo [2/4] Compilando la interfaz del movil (generando carpeta /www)...
call ionic build

:: 3. Sincronizar archivos web con el contenedor de Android
echo.
echo [3/4] Sincronizando pantallas web con el contenedor nativo...
call npx cap sync

:: 4. Abrir el proyecto en Android Studio
echo.
echo =====================================================================
echo     ¡PROCESO COMPLETADO! Abriendo Android Studio...
echo =====================================================================
echo.
echo Nota: Espera a que Android Studio cargue por completo y Gradle
echo termine de sincronizar en segundo plano. Luego ve a:
echo Build -> Build Bundle(s) / APK(s) -> Build APK(s)
echo =====================================================================
echo.
call npx cap open android
pause
