#!/bin/bash
# Run both frontend and backend together
# Usage: ./run.sh

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting LINE LIFF Influencer Platform${NC}"
echo ""

# Check if we're in the project root
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${GREEN}Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo -e "${BLUE}[Backend]${NC} Starting Django server on http://localhost:8000..."
cd backend
if [ ! -d "venv" ]; then
    echo -e "${BLUE}[Backend]${NC} Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Run migrations if needed
python manage.py migrate --check >/dev/null 2>&1 || python manage.py migrate

# Start Django in background
python manage.py runserver &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 2

# Start Frontend
echo -e "${BLUE}[Frontend]${NC} Starting Vite dev server on http://localhost:5173..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}[Frontend]${NC} Installing dependencies..."
    npm install
fi

# Start Vite in background
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Both servers are running!${NC}"
echo ""
echo -e "  Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "  Backend:  ${BLUE}http://localhost:8000${NC}"
echo -e "  Admin:    ${BLUE}http://localhost:8000/admin${NC}"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait
