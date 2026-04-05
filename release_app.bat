@echo off
echo ==========================================
echo    Sunya App Final Release Automation    
echo ==========================================
echo.
cd frontend

echo [1/3] Fixing NPM Execution Policy...
setlocal
set "PATH=%PATH%;%AppData%\npm"

echo [2/3] Installing EAS CLI locally...
cmd /c npm install --no-save eas-cli

echo [3/3] Starting EAS Build...
echo.
echo Select build profile:
echo 1. Preview (APK for Testing)
echo 2. Production (AAB for Play Store)
set /p profile_choice="Enter choice (1 or 2): "

if "%profile_choice%"=="1" (
  echo Launching Preview Build...
  cmd /c npx eas build -p android --profile preview
) else (
  echo Launching Production Build...
  cmd /c npx eas build -p android --profile production
)

echo.
echo ==========================================
echo    Build Process Initiated Successfully    
echo ==========================================
pause
