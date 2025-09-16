#!/bin/bash
# Start Both Backend and Frontend Servers

echo "🏭 Starting Complete SAP Manufacturing System..."
echo "============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to start backend in background
start_backend() {
    echo -e "\n🚀 ${YELLOW}Starting Backend Server...${NC}"
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "./start-backend.sh; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "./start-backend.sh" &
    elif command -v osascript &> /dev/null; then
        # macOS
        osascript -e 'tell app "Terminal" to do script "./start-backend.sh"'
    else
        # Fallback: start in background
        ./start-backend.sh &
        BACKEND_PID=$!
        echo "Backend started with PID: $BACKEND_PID"
    fi
    sleep 3
}

# Function to start frontend in background
start_frontend() {
    echo -e "🎨 ${YELLOW}Starting Frontend Server...${NC}"
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "./start-frontend.sh; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "./start-frontend.sh" &
    elif command -v osascript &> /dev/null; then
        # macOS
        osascript -e 'tell app "Terminal" to do script "./start-frontend.sh"'
    else
        # Fallback: start in background
        ./start-frontend.sh &
        FRONTEND_PID=$!
        echo "Frontend started with PID: $FRONTEND_PID"
    fi
    sleep 3
}

# Start both servers
start_backend
start_frontend

echo -e "\n✅ ${GREEN}Both servers are starting up!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "\n${CYAN}Access your application at:${NC}"
echo -e "  🌐 Frontend:          http://localhost:3000"
echo -e "  📡 Backend API:       http://localhost:8000"
echo -e "  📊 Backend Dashboard: http://localhost:8000/dashboard"
echo -e "\nNew terminal windows will open for backend and frontend."
echo -e "Close those terminals to stop the servers."
echo -e "\nPress any key to exit this script..."
read -n 1 -s