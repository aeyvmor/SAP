#!/bin/bash
# SAP Manufacturing System - Cross-Platform Setup Script

echo "🏭 SAP Manufacturing System Setup"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Python is installed
echo -e "\n📋 Checking Prerequisites..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "✅ ${GREEN}Python found: $PYTHON_VERSION${NC}"
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    echo -e "✅ ${GREEN}Python found: $PYTHON_VERSION${NC}"
    PYTHON_CMD="python"
else
    echo -e "❌ ${RED}Python not found. Please install Python 3.12+ first.${NC}"
    exit 1
fi

# Check if Node.js is installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "✅ ${GREEN}Node.js found: $NODE_VERSION${NC}"
else
    echo -e "❌ ${RED}Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

# Check if PostgreSQL is available
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version)
    echo -e "✅ ${GREEN}PostgreSQL found: $PG_VERSION${NC}"
else
    echo -e "⚠️  ${YELLOW}PostgreSQL not found. Please ensure PostgreSQL is installed and accessible.${NC}"
fi

echo -e "\n🔧 ${YELLOW}Setting up Backend...${NC}"

# Backend setup
if [ -d "backend" ]; then
    cd backend
    
    echo -e "📦 ${BLUE}Installing Python dependencies...${NC}"
    if $PYTHON_CMD -m pip install --upgrade pip && $PYTHON_CMD -m pip install -r requirements.txt; then
        echo -e "✅ ${GREEN}Backend dependencies installed successfully!${NC}"
    else
        echo -e "❌ ${RED}Failed to install backend dependencies${NC}"
        cd ..
        exit 1
    fi
    
    cd ..
else
    echo -e "❌ ${RED}Backend directory not found!${NC}"
    exit 1
fi

echo -e "\n🎨 ${YELLOW}Setting up Frontend...${NC}"

# Frontend setup
if [ -d "frontend" ]; then
    cd frontend
    
    echo -e "📦 ${BLUE}Installing Node.js dependencies...${NC}"
    if npm install; then
        echo -e "✅ ${GREEN}Frontend dependencies installed successfully!${NC}"
    else
        echo -e "❌ ${RED}Failed to install frontend dependencies${NC}"
        cd ..
        exit 1
    fi
    
    cd ..
else
    echo -e "❌ ${RED}Frontend directory not found!${NC}"
    exit 1
fi

echo -e "\n🗄️  ${YELLOW}Database Setup...${NC}"
echo -e "${BLUE}Please ensure PostgreSQL is running and create the 'sap' database:${NC}"
echo -e "  ${NC}1. Run: psql -U postgres${NC}"
echo -e "  ${NC}2. Enter password: admin${NC}"
echo -e "  ${NC}3. Run: CREATE DATABASE sap;${NC}"
echo -e "  ${NC}4. Run: \\q${NC}"

echo -e "\n✅ ${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}==================${NC}"
echo -e "\n${CYAN}To start the application:${NC}"
echo -e "  ${NC}Backend:  ./start-backend.sh${NC}"
echo -e "  ${NC}Frontend: ./start-frontend.sh${NC}"
echo -e "  ${NC}Both:     ./start-all.sh${NC}"
echo -e "\n${CYAN}Access points:${NC}"
echo -e "  ${NC}Backend API:       http://localhost:8000${NC}"
echo -e "  ${NC}Backend Dashboard: http://localhost:8000/dashboard${NC}"
echo -e "  ${NC}Frontend:          http://localhost:3000${NC}"

# Make shell scripts executable
chmod +x start-backend.sh start-frontend.sh start-all.sh 2>/dev/null || true