@echo off
REM Fix production database - Windows version

echo ============================================================
echo FIX PRODUCTION DATABASE
echo ============================================================
echo.
echo This will fix ticket structure in your production database
echo MongoDB: mongodb+srv://rag123456:***@cluster0.qipvo.mongodb.net/
echo Database: tambola_multiplayer
echo.

set /p confirm="Continue? (yes/no): "
if /i not "%confirm%"=="yes" (
    echo Cancelled
    exit /b 0
)

echo.
echo Running fix script...
python fix_production_db.py

echo.
echo Done!
pause
