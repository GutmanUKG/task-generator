@echo off
echo ============================================
echo   TZ-Generator - Локальный запуск
echo ============================================
echo.
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:5173
echo.

:: Проверка ollama
where ollama >nul 2>nul
if %errorlevel% neq 0 (
    if exist "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\Ollama;%PATH%"
    ) else (
        echo [!] Ollama не найдена. Установи с https://ollama.com
    )
)

npx concurrently -n ollama,back,front -c yellow,blue,green "ollama serve" "npm run dev --prefix backend" "npm run dev --prefix frontend"
