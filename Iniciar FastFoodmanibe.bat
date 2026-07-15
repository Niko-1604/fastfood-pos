@echo off
title FastFoodmanibe

echo ============================================
echo   Iniciando FastFoodmanibe...
echo ============================================
echo.

powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 80 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if errorlevel 1 (
    echo Iniciando Apache...
    start "XAMPP - Apache" cmd /k "C:\xampp\apache_start.bat"
) else (
    echo Apache ya esta corriendo.
)

powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if errorlevel 1 (
    echo Iniciando MySQL...
    start "XAMPP - MySQL" cmd /k "C:\xampp\mysql_start.bat"
) else (
    echo MySQL ya esta corriendo.
)

echo Esperando a que los servicios esten listos...
ping -n 6 127.0.0.1 >nul

powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if errorlevel 1 (
    echo Iniciando servidor del sistema...
    start "FastFood - Servidor" cmd /k "cd /d C:\xampp\htdocs\fastfood\backend && node server.js"
    ping -n 4 127.0.0.1 >nul
) else (
    echo El servidor ya esta corriendo.
)

echo Abriendo FastFoodmanibe en el navegador...
start "" "http://localhost/fastfood/frontend/login.html"
