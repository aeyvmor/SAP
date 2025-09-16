# 🚀 SAP Manufacturing System - Easy Setup Scripts

This project includes automated setup and startup scripts for easy development environment initialization.

## 📋 Prerequisites

Before running any scripts, ensure you have:
- **Python 3.12+** (tested with 3.13.7)
- **Node.js 18+** (for Next.js frontend)
- **PostgreSQL** (for database)

---

## 🪟 **Windows (PowerShell)**

### **Initial Setup**
```powershell
# Run this once to install all dependencies
.\setup.ps1
```

### **Daily Development**
```powershell
# Start both backend and frontend
.\start-all.ps1

# Or start individually:
.\start-backend.ps1    # Backend only (port 8000)
.\start-frontend.ps1   # Frontend only (port 3000)
```

---

## 🐧 **Linux/Mac (Bash)**

### **Initial Setup**
```bash
# Make scripts executable (first time only)
chmod +x *.sh

# Run setup
./setup.sh
```

### **Daily Development**
```bash
# Start both backend and frontend
./start-all.sh

# Or start individually:
./start-backend.sh     # Backend only (port 8000)
./start-frontend.sh    # Frontend only (port 3000)
```

---

## 🗄️ **Database Setup**

The scripts will guide you, but here's the manual process:

1. **Start PostgreSQL service**
2. **Create database**:
   ```sql
   psql -U postgres
   CREATE DATABASE sap;
   \q
   ```
3. **Password**: Use `admin` when prompted

---

## 🌐 **Access Points**

After running the scripts, access your application at:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | [`http://localhost:3000`](http://localhost:3000) | Next.js React application |
| **Backend API** | [`http://localhost:8000`](http://localhost:8000) | FastAPI REST endpoints |
| **Backend Dashboard** | [`http://localhost:8000/dashboard`](http://localhost:8000/dashboard) | Built-in HTML dashboard |
| **API Docs** | [`http://localhost:8000/docs`](http://localhost:8000/docs) | Swagger/OpenAPI documentation |

---

## 🔧 **What Each Script Does**

### **Setup Scripts** (`setup.ps1` / `setup.sh`)
- ✅ Check Python, Node.js, PostgreSQL installation
- ✅ Install backend Python dependencies from [`requirements.txt`](backend/requirements.txt)
- ✅ Install frontend Node.js dependencies from [`package.json`](frontend/package.json)
- ✅ Provide database setup instructions
- ✅ Display next steps and access URLs

### **Backend Scripts** (`start-backend.ps1` / `start-backend.sh`)
- ✅ Navigate to [`backend/`](backend/) directory
- ✅ Start FastAPI server with uvicorn
- ✅ Enable auto-reload for development
- ✅ Bind to all interfaces (0.0.0.0:8000)

### **Frontend Scripts** (`start-frontend.ps1` / `start-frontend.sh`)
- ✅ Navigate to [`frontend/`](frontend/) directory  
- ✅ Start Next.js development server
- ✅ Enable Turbopack for faster builds
- ✅ Serve on localhost:3000

### **Combined Scripts** (`start-all.ps1` / `start-all.sh`)
- ✅ Start backend in separate terminal/window
- ✅ Start frontend in separate terminal/window
- ✅ Display access URLs and instructions
- ✅ Handle cross-platform terminal launching

---

## 🛠️ **Troubleshooting**

### **Common Issues:**

**"Database 'sap' does not exist"**
```bash
# Create the database manually:
psql -U postgres
CREATE DATABASE sap;
\q
```

**"Permission denied" (Linux/Mac)**
```bash
# Make scripts executable:
chmod +x *.sh
```

**"Python not found"**
- Ensure Python 3.12+ is installed and in PATH
- Try `python3` instead of `python` on Linux/Mac

**"Node.js not found"**
- Install Node.js 18+ from [nodejs.org](https://nodejs.org)

**"PostgreSQL not found"**
- Install PostgreSQL and ensure it's running
- Add PostgreSQL bin directory to PATH

---

## 📁 **Script Files Overview**

| File | Platform | Purpose |
|------|----------|---------|
| [`setup.ps1`](setup.ps1) | Windows | Complete environment setup |
| [`setup.sh`](setup.sh) | Linux/Mac | Complete environment setup |
| [`start-backend.ps1`](start-backend.ps1) | Windows | Start backend only |
| [`start-backend.sh`](start-backend.sh) | Linux/Mac | Start backend only |
| [`start-frontend.ps1`](start-frontend.ps1) | Windows | Start frontend only |
| [`start-frontend.sh`](start-frontend.sh) | Linux/Mac | Start frontend only |
| [`start-all.ps1`](start-all.ps1) | Windows | Start both servers |
| [`start-all.sh`](start-all.sh) | Linux/Mac | Start both servers |

---

## 🎯 **Quick Start Guide**

### **First Time Setup:**
1. Clone the repository
2. Run setup script for your platform
3. Create PostgreSQL database
4. Run start-all script

### **Daily Development:**
1. Run `start-all.ps1` (Windows) or `./start-all.sh` (Linux/Mac)
2. Open [`http://localhost:3000`](http://localhost:3000) for frontend
3. Open [`http://localhost:8000/dashboard`](http://localhost:8000/dashboard) for backend dashboard

**That's it! Your SAP Manufacturing System is ready to go! 🏭✨**