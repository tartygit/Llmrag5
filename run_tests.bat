@echo off
echo =========================================================================
echo  Executing Software Development Document Environment (SDDE) JUnit Tests
echo =========================================================================
echo.

cd sde-app
call mvn test
if %ERRORLEVEL% neq 0 (
    echo JUnit Test execution failed!
    cd ..
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo =========================================================================
echo  All SDDE Back-end JUnit tests executed successfully!
echo =========================================================================
