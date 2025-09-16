#!/bin/bash
# SAP Manufacturing System - One-Click Setup & Run

echo "🏭 SAP Manufacturing System - One-Click Setup"
echo "============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check prerequisites
echo -e "\n📋 ${YELLOW}Checking Prerequisites...${NC}"

# Python check
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "✅ ${GREEN}Python: $PYTHON_VERSION${NC}"
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    echo -e "✅ ${GREEN}Python: $PYTHON_VERSION${NC}"
    PYTHON_CMD="python"
else
    echo -e "❌ ${RED}Python not found. Install Python 3.12+ first.${NC}"
    exit 1
fi

# Node.js check
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "✅ ${GREEN}Node.js: $NODE_VERSION${NC}"
else
    echo -e "❌ ${RED}Node.js not found. Install Node.js first.${NC}"
    exit 1
fi

# Setup backend
echo -e "\n🔧 ${YELLOW}Installing Backend Dependencies...${NC}"
cd ../backend
$PYTHON_CMD -m pip install --upgrade pip
$PYTHON_CMD -m pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "❌ ${RED}Backend setup failed${NC}"
    cd ../setupDev
    exit 1
fi
echo -e "✅ ${GREEN}Backend ready!${NC}"

# Setup frontend
echo -e "\n🎨 ${YELLOW}Installing Frontend Dependencies...${NC}"
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo -e "❌ ${RED}Frontend setup failed${NC}"
    cd ../setupDev
    exit 1
fi
echo -e "✅ ${GREEN}Frontend ready!${NC}"

cd ../setupDev

# Database reminder
echo -e "\n🗄️  ${YELLOW}Database Setup Required:${NC}"
echo -e "  Run: psql -U postgres"
echo -e "  Then: CREATE DATABASE sap;"
echo -e "  Password: admin"

# Ask if user wants to start servers
echo -e "\n🚀 ${GREEN}Setup Complete! Start servers now? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "\n🚀 ${BLUE}Starting Backend...${NC}"
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd ../backend; $PYTHON_CMD -m uvicorn main:app --reload --host 0.0.0.0 --port 8000; exec bash"
    elif command -v osascript &> /dev/null; then
        osascript -e "tell app \"Terminal\" to do script \"cd $(pwd)/../backend; $PYTHON_CMD -m uvicorn main:app --reload --host 0.0.0.0 --port 8000\""
    else
        echo "Starting backend in background..."
        cd ../backend && $PYTHON_CMD -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
        cd ../setupDev
    fi
    
    sleep 3
    
    echo -e "🎨 ${BLUE}Starting Frontend...${NC}"
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd ../frontend; npm run dev; exec bash"
    elif command -v osascript &> /dev/null; then
        osascript -e "tell app \"Terminal\" to do script \"cd $(pwd)/../frontend; npm run dev\""
    else
        echo "Starting frontend in background..."
        cd ../frontend && npm run dev &
        cd ../setupDev
    fi
    
    echo -e "\n✅ ${GREEN}Both servers starting!${NC}"
    echo -e "🌐 ${CYAN}Frontend: http://localhost:3000${NC}"
    echo -e "📡 ${CYAN}Backend: http://localhost:8000${NC}"
    echo -e "📊 ${CYAN}Dashboard: http://localhost:8000/dashboard${NC}"
fi

echo -e "\nPress any key to exit..."
read -n 1 -s