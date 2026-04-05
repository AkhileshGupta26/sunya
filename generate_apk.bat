@echo off
echo ==========================================
echo    Sunya App: Generate Production APK    
echo ==========================================
echo.
cd frontend

echo [1/2] Installing EAS CLI locally...
cmd /c npm install --no-save eas-cli

echo [2/2] Starting APK Build (Preview Profile)...
echo.
echo NOTE: This will generate a downloadable .apk file.
echo If this is your first build, follow the login prompts.
echo.
cmd /c npx eas build -p android --profile preview

echo.
echo ==========================================
echo    Build Process Initiated Successfully    
echo ==========================================
pause
