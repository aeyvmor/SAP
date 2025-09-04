Quick Dev Setup

## Prerequisites
- Python 3.11+
- Node.js 18+

## 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

## 2. Setup Environment
```bash
# Copy the example env file
cp .env.example .env

1. Install PostgreSQL
2. Create database and user

# do this
makedb sap

3. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://postgre:admin@localhost/sap"
   
```

## 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## 4. Run Everything
```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

## 5. Access the App
- Frontend: http://localhost:3000
