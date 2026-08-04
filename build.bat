@echo off
echo =========================================================================
echo  Building Software Development Document Environment (SDDE) Package
echo =========================================================================

echo.
echo [1/3] Compiling and packaging Spring Boot Back-end...
cd sde-app
call mvn clean package -DskipTests
if %ERRORLEVEL% neq 0 (
    echo Error compiling Spring Boot Back-end!
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo [2/3] Installing and compiling React Front-end...
cd rag-app/frontend
call npm install
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Error building React Front-end static bundle!
    exit /b %ERRORLEVEL%
)
cd ../..

echo.
echo [3/3] Checking python environment requirements...
if exist "rag-app/backend/requirements.txt" (
    echo Python Flask Backend structure verified.
)

echo.
echo =========================================================================
echo  SDDE Build completed successfully! Packages are ready for installation.
echo =========================================================================
