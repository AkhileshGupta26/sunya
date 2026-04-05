@echo off
echo ==========================================
echo    Sunya App: Direct Native APK Build    
echo ==========================================
echo.
cd frontend/android

echo [1/2] Preparing Project Environment...
echo Cleaning build directories...
cmd /c gradlew clean

echo.
echo [2/2] Assembling Production APK...
echo PLEASE NOTE: This will take several minutes to compile.
echo.
cmd /c gradlew assembleRelease

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==========================================
    echo    BUILD SUCCESSFUL!
    echo ==========================================
    echo.
    echo Your final APK is located here:
    echo frontend/android/app/build/outputs/apk/release/app-release.apk
) else (
    echo.
    echo ==========================================
    echo    BUILD FAILED (Error %ERRORLEVEL%)
    echo ==========================================
)
pause
