@echo off
title Smart Study Platform - Launcher
echo ========================================================
echo       Lancement de Smart Study Platform
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Demarrage du Backend Spring Boot (port 8080)...
start "SmartStudy Backend (8080)" cmd /k "cd backend && java -Dfile.encoding=UTF-8 -jar target\smart-study-platform-1.0.0.jar"

echo [2/2] Demarrage du Frontend React + Vite (port 5173)...
start "SmartStudy Frontend (5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo Plateforme lancee avec succes !
echo - Frontend : http://localhost:5173
echo - Backend  : http://localhost:8080/api
echo ========================================================
echo.
timeout /t 3 >nul
start http://localhost:5173
