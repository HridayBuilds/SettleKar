#!/bin/bash

# SettleKar — Start All Services
# Usage: bash start-settlekar.sh

PROJECT="/Users/hridaymulchandani/Desktop/SettleKar"
ML_DIR="$PROJECT/ML/receipt-scanner"
BACKEND_DIR="$PROJECT/Backend"
FRONTEND_DIR="$PROJECT/Frontend/settlekar-frontend"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

ML_PID=""
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down all services...${NC}"
  [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null
  [ -n "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null
  [ -n "$ML_PID" ] && kill $ML_PID 2>/dev/null
  sleep 1
  lsof -ti :8000 | xargs kill -9 2>/dev/null
  lsof -ti :8080 | xargs kill -9 2>/dev/null
  lsof -ti :5173 | xargs kill -9 2>/dev/null
  echo -e "${GREEN}All services stopped.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

wait_for_port() {
  local port=$1
  local name=$2
  local max=$3
  local count=0
  while [ $count -lt $max ]; do
    if lsof -i :$port -sTCP:LISTEN >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
    count=$((count + 1))
  done
  return 1
}

echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║       SettleKar Service Launcher     ║${NC}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# Kill stale processes
echo -e "${YELLOW}Cleaning up stale processes...${NC}"
lsof -ti :8000 | xargs kill -9 2>/dev/null
lsof -ti :8080 | xargs kill -9 2>/dev/null
lsof -ti :5173 | xargs kill -9 2>/dev/null
sleep 1

# ---------- 1. ML Model ----------
echo ""
echo -e "${CYAN}[1/3] ML Receipt Scanner (port 8000)${NC}"
cd "$ML_DIR" || { echo -e "${RED}  ERROR: ML directory not found${NC}"; exit 1; }

if [ ! -d "venv" ]; then
  echo -e "${YELLOW}  Creating virtual environment...${NC}"
  python3 -m venv venv
fi

source venv/bin/activate
pip install -q setuptools 2>/dev/null
pip install -q -r requirements.txt 2>/dev/null

python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 > /tmp/settlekar-ml.log 2>&1 &
ML_PID=$!

if wait_for_port 8000 "ML" 30; then
  echo -e "${GREEN}  ✓ ML service running (PID: $ML_PID)${NC}"
else
  echo -e "${RED}  ✗ ML service failed to start — check /tmp/settlekar-ml.log${NC}"
fi

# ---------- 2. Backend ----------
echo ""
echo -e "${CYAN}[2/3] Spring Boot Backend (port 8080)${NC}"
cd "$BACKEND_DIR" || { echo -e "${RED}  ERROR: Backend directory not found${NC}"; exit 1; }

./mvnw spring-boot:run > /tmp/settlekar-backend.log 2>&1 &
BACKEND_PID=$!

if wait_for_port 8080 "Backend" 60; then
  echo -e "${GREEN}  ✓ Backend running (PID: $BACKEND_PID)${NC}"
else
  echo -e "${RED}  ✗ Backend failed to start — check /tmp/settlekar-backend.log${NC}"
fi

# ---------- 3. Frontend ----------
echo ""
echo -e "${CYAN}[3/3] Vite Frontend (port 5173)${NC}"
cd "$FRONTEND_DIR" || { echo -e "${RED}  ERROR: Frontend directory not found${NC}"; exit 1; }

npm run dev > /tmp/settlekar-frontend.log 2>&1 &
FRONTEND_PID=$!

if wait_for_port 5173 "Frontend" 15; then
  echo -e "${GREEN}  ✓ Frontend running (PID: $FRONTEND_PID)${NC}"
else
  echo -e "${RED}  ✗ Frontend failed to start — check /tmp/settlekar-frontend.log${NC}"
fi

# ---------- Status ----------
echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║          Service Status              ║${NC}"
echo -e "${BOLD}${CYAN}╠══════════════════════════════════════╣${NC}"

for entry in "8000:ML Model:http://localhost:8000" "8080:Backend:http://localhost:8080" "5173:Frontend:http://localhost:5173"; do
  port=$(echo $entry | cut -d: -f1)
  name=$(echo $entry | cut -d: -f2)
  url=$(echo $entry | cut -d: -f3-)
  if lsof -i :$port -sTCP:LISTEN >/dev/null 2>&1; then
    printf "${CYAN}║${NC}  ${GREEN}● %-12s${NC} → ${BOLD}%-22s${NC}${CYAN}║${NC}\n" "$name" "$url"
  else
    printf "${CYAN}║${NC}  ${RED}○ %-12s${NC}   %-22s ${CYAN}║${NC}\n" "$name" "FAILED"
  fi
done

echo -e "${BOLD}${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

wait
