@echo off
where mvn >nul 2>&1
if %ERRORLEVEL% equ 0 (
    mvn %*
) else if exist "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1\plugins\maven\lib\maven3\bin\mvn.cmd" (
    "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1\plugins\maven\lib\maven3\bin\mvn.cmd" %*
) else (
    echo [ERROR] Maven not found.
    exit /b 1
)
