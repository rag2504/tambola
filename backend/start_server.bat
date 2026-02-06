@echo off
echo ========================================
echo   Tambola Multiplayer Backend Server
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo.
    echo Please create .env file with:
    echo   MONGO_URL=mongodb://localhost:27017
    echo   DB_NAME=tambola_multiplayer
    echo   SECRET_KEY=your-super-secret-key-at-least-32-characters-long
    echo.
    pause
    exit /b 1
)

echo [INFO] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found! Please install Python 3.8+
    pause
    exit /b 1
)

echo [INFO] Installing/Updating dependencies...
pip install -r requirements-multiplayer.txt

echo.
echo [INFO] Starting server on http://0.0.0.0:8000
echo [INFO] Press Ctrl+C to stop
echo.

python server_multiplayer.py

pause
