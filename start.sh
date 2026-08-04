#!/bin/bash
echo "========================================================================="
echo " Starting Software Development Document Environment (SDDE) Services..."
echo "========================================================================="

# Ensure scripts have execute permission
chmod +x "$0"

# Kill active ports to avoid bind address conflict
echo "Killing active processes on ports 3000, 8080, and 5000 (if any)..."
kill $(lsof -t -i :3000) 2>/dev/null || true
kill $(lsof -t -i :8080) 2>/dev/null || true
kill $(lsof -t -i :5000) 2>/dev/null || true

echo ""
echo "[1/3] Starting Spring Boot Back-end on Port 8080..."
cd sde-app && mvn spring-boot:run > ../spring_boot_server.log 2>&1 &
cd ..

echo ""
echo "[2/3] Starting Flask Local AI RAG Back-end on Port 5000..."
cd rag-app/backend && python3 app.py > ../../flask_rag_server.log 2>&1 &
cd ../..

echo ""
echo "[3/3] Starting React Front-end UI on Port 3000..."
cd rag-app/frontend && npm run dev > ../../react_frontend_server.log 2>&1 &
cd ../..

echo ""
echo "========================================================================="
echo " SDDE Services are starting in the background!"
echo " - Front-end Dashboard URL: http://localhost:3000"
echo " - Spring Boot API URL: http://localhost:8080"
echo " - Local AI RAG API URL: http://localhost:5000"
echo " You can inspect background logs inside: "
echo "   spring_boot_server.log, flask_rag_server.log, react_frontend_server.log"
echo "========================================================================="
