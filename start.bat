@echo off
echo ============================================
echo   TZ-Generator - Запуск всех сервисов
echo ============================================
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

:: Проверка ngrok
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Ngrok не найден. Установи с https://ngrok.com
    echo     Запуск без удаленного доступа...
    npx concurrently -n ollama,back,front -c yellow,blue,green "ollama serve" "npm run dev --prefix backend" "npm run dev --prefix frontend"
    exit /b
)

:: Запуск всех сервисов + вывод ngrok URL через скрипт
npx concurrently -n ollama,back,front,ngrok,url -c yellow,blue,green,magenta,cyan "ollama serve" "npm run dev --prefix backend" "npm run dev --prefix frontend" "ngrok http 5173 --log stdout --log-level info" "node ngrok-url.js"
