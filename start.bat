@echo off
echo =========================================================================
echo  Starting Software Development Document Environment (SDDE) Services...
echo =========================================================================

echo.
echo [1/3] Starting Spring Boot Back-end on Port 8080...
start "SDDE-SpringBoot" /Min cmd /k "cd sde-app && mvn spring-boot:run"

echo.
echo [2/3] Starting Flask Local AI RAG Back-end on Port 5000...
start "SDDE-FlaskRAG" /Min cmd /k "cd rag-app/backend && python app.py"

echo.
echo [3/3] Starting React Front-end UI on Port 3000...
start "SDDE-ReactVite" /Min cmd /k "cd rag-app/frontend && npm run dev"

echo.
echo =========================================================================
echo  All SDDE Services started successfully!
echo  - Front-end Dashboard URL: http://localhost:3000
echo  - Spring Boot API URL: http://localhost:8080
echo  - Local AI RAG API URL: http://localhost:5000
echo =========================================================================
