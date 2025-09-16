# 🚀 Easy Setup Scripts

## Quick Start

**Windows:**
```powershell
.\setup-and-run.ps1
```

**Linux/Mac:**
```bash
chmod +x setup-and-run.sh
./setup-and-run.sh
```

## What it does:
1. ✅ Checks Python & Node.js installation
2. ✅ Installs backend dependencies
3. ✅ Installs frontend dependencies  
4. ✅ Reminds you to create PostgreSQL database
5. ✅ Optionally starts both servers

## Database Setup:
```sql
psql -U postgres
CREATE DATABASE sap;
\q
```
Password: `admin`

## Access Points:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000  
- Dashboard: http://localhost:8000/dashboard

That's it! 🎉