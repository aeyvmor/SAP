# iPhone Production Planning & Execution System
## Step-by-Step Development Guide

---

## 🎯 **PROJECT SETUP & REQUIREMENTS**

### **What You'll Build**
A complete SAP-like manufacturing system for iPhone production with:
- Real-time production dashboards
- Material requirement planning (MRP)
- Production order management
- Cost tracking and analytics
- Modern React UI with Material-UI

### **Technology Stack**
```
Frontend: React + TypeScript + Material-UI
Backend: Python + FastAPI + PostgreSQL
Real-time: WebSocket connections
Charts: Recharts library
```

---

## 📅 **12-WEEK DEVELOPMENT ROADMAP**

### **WEEK 1-2: PROJECT FOUNDATION**

#### **Step 1: Environment Setup (Day 1-2)**

1. **Create Project Structure**
```bash
mkdir iphone-production-system
cd iphone-production-system
mkdir frontend backend database docs

# Initialize frontend
cd frontend
npx create-react-app . --template typescript
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/x-data-grid
npm install recharts axios socket.io-client
npm install @reduxjs/toolkit react-redux

# Initialize backend
cd ../backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install fastapi uvicorn sqlalchemy psycopg2-binary alembic
pip install pydantic python-jose[cryptography] passlib[bcrypt]
pip install python-socketio redis celery faker pandas
```

2. **Setup Database (Day 2)**
```bash
# Install PostgreSQL locally or use Docker
docker run --name postgres-dev -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres

# Create database
createdb production_system_dev
```

3. **Initialize Git Repository (Day 2)**
```bash
git init
# Create .gitignore for Python, Node.js, and database files
git add .
git commit -m "Initial project setup"
```

#### **Step 2: Basic Backend Structure (Day 3-5)**

1. **Create FastAPI App Structure**
```python
# backend/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db

app = FastAPI(title="iPhone Production System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "iPhone Production System API"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
```

2. **Setup Database Models (Day 4-5)**
```python
# backend/models.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class Material(Base):
    __tablename__ = "materials"
    
    material_id = Column(String, primary_key=True)
    description = Column(String, nullable=False)
    material_type = Column(String, nullable=False)
    unit_price = Column(Float, default=0.0)
    unit_of_measure = Column(String, default="EA")

class ProductionOrder(Base):
    __tablename__ = "production_orders"
    
    order_id = Column(String, primary_key=True)
    material_id = Column(String, ForeignKey("materials.material_id"))
    quantity = Column(Integer, nullable=False)
    status = Column(String, default="CREATED")
    created_date = Column(DateTime)
    due_date = Column(DateTime)
    
    material = relationship("Material")

# Add more models: BOM, WorkCenter, Routing, etc.
```

#### **Step 3: Basic Frontend Structure (Day 6-7)**

1. **Setup React App Structure**
```typescript
// frontend/src/App.tsx
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ProductionOrders from './components/ProductionOrders';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/production-orders" element={<ProductionOrders />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
```

---

### **WEEK 3-4: CORE FUNCTIONALITY**

#### **Step 4: Material Master Management (Day 8-10)**

1. **Backend: Material API Endpoints**
```python
# backend/routers/materials.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models import Material
from database import get_db
from schemas import MaterialCreate, MaterialResponse

router = APIRouter(prefix="/api/materials", tags=["materials"])

@router.post("/", response_model=MaterialResponse)
def create_material(material: MaterialCreate, db: Session = Depends(get_db)):
    db_material = Material(**material.dict())
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material

@router.get("/", response_model=List[MaterialResponse])
def list_materials(db: Session = Depends(get_db)):
    return db.query(Material).all()

@router.get("/{material_id}")
def get_material(material_id: str, db: Session = Depends(get_db)):
    material = db.query(Material).filter(Material.material_id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material
```

2. **Frontend: Material Management Component**
```typescript
// frontend/src/components/MaterialMaster.tsx
import React, { useState, useEffect } from 'react';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem
} from '@mui/x-data-grid';
import { Button, Dialog, TextField, Box } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const MaterialMaster: React.FC = () => {
  const [materials, setMaterials] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const columns: GridColDef[] = [
    { field: 'material_id', headerName: 'Material ID', width: 150 },
    { field: 'description', headerName: 'Description', width: 300 },
    { field: 'material_type', headerName: 'Type', width: 150 },
    { field: 'unit_price', headerName: 'Unit Price', width: 120, type: 'number' },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
        />,
      ],
    },
  ];

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/materials');
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const handleEdit = (material: any) => {
    setSelectedMaterial(material);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setDialogOpen(true)}
        sx={{ mb: 2 }}
      >
        Add Material
      </Button>
      
      <DataGrid
        rows={materials}
        columns={columns}
        getRowId={(row) => row.material_id}
        pageSizeOptions={[25, 50, 100]}
        checkboxSelection
      />
      
      {/* Add Material Dialog Component here */}
    </Box>
  );
};

export default ProductionAnalytics;
```

---

### **WEEK 11-12: TESTING & DEPLOYMENT**

#### **Step 12: Testing Implementation (Day 36-38)**

1. **Backend Testing Setup**
```python
# backend/tests/test_production_orders.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from database import get_db, Base

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_create_production_order():
    """Test production order creation"""
    # First create a material
    material_data = {
        "material_id": "IPHONE15PRO256",
        "description": "iPhone 15 Pro 256GB",
        "material_type": "FERT",
        "unit_price": 999.00
    }
    
    response = client.post("/api/materials/", json=material_data)
    assert response.status_code == 200
    
    # Then create production order
    order_data = {
        "material_id": "IPHONE15PRO256",
        "quantity": 1000,
        "due_date": "2024-12-31T00:00:00"
    }
    
    response = client.post("/api/production-orders/", json=order_data)
    assert response.status_code == 200
    
    order = response.json()
    assert order["material_id"] == "IPHONE15PRO256"
    assert order["quantity"] == 1000
    assert order["status"] == "CREATED"

def test_release_production_order():
    """Test production order release"""
    # Create order first
    order_data = {
        "material_id": "IPHONE15PRO256",
        "quantity": 1000,
        "due_date": "2024-12-31T00:00:00"
    }
    
    response = client.post("/api/production-orders/", json=order_data)
    order_id = response.json()["order_id"]
    
    # Release the order
    response = client.post(f"/api/production-orders/{order_id}/release")
    assert response.status_code == 200
    
    released_order = response.json()
    assert released_order["status"] == "RELEASED"

def test_mrp_calculation():
    """Test MRP calculation logic"""
    # Create test materials and BOMs
    # Run MRP
    # Verify results
    response = client.post("/api/mrp/run", json={"planning_horizon_days": 90})
    assert response.status_code == 200
    
    mrp_result = response.json()
    assert "procurement_plan" in mrp_result
```

2. **Frontend Testing Setup**
```typescript
// frontend/src/components/__tests__/ProductionOrderDashboard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ProductionOrderDashboard from '../ProductionOrderDashboard';

// Mock API responses
const mockOrders = [
  {
    order_id: 'PO001',
    material_id: 'IPHONE15PRO256',
    quantity: 1000,
    status: 'IN_PROGRESS',
    due_date: '2024-12-31T00:00:00Z',
    material: {
      description: 'iPhone 15 Pro 256GB'
    }
  }
];

// Mock store
const mockStore = configureStore({
  reducer: {
    production: (state = { orders: mockOrders }, action) => state
  }
});

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </Provider>
  );
};

describe('ProductionOrderDashboard', () => {
  test('renders production orders', () => {
    renderWithProviders(<ProductionOrderDashboard />);
    
    expect(screen.getByText('PO001')).toBeInTheDocument();
    expect(screen.getByText('iPhone 15 Pro 256GB')).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument();
  });

  test('displays correct status chips', () => {
    renderWithProviders(<ProductionOrderDashboard />);
    
    const statusChip = screen.getByText('IN_PROGRESS');
    expect(statusChip).toBeInTheDocument();
    expect(statusChip).toHaveClass('MuiChip-colorPrimary');
  });

  test('calculates progress correctly', () => {
    renderWithProviders(<ProductionOrderDashboard />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });
});
```

#### **Step 13: Docker & Deployment Setup (Day 39-41)**

1. **Docker Configuration**
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. **Docker Compose for Development**
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - REACT_APP_API_URL=http://localhost:8000
      - REACT_APP_WS_URL=ws://localhost:8000

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/production_dev
      - REDIS_URL=redis://redis:6379
      - DEBUG=true
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=production_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  pgadmin:
    image: dpage/pgadmin4:latest
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@example.com
      - PGADMIN_DEFAULT_PASSWORD=admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

#### **Step 14: Final Integration & Demo Preparation (Day 42)**

1. **Data Seeding Script**
```python
# backend/seed_data.py
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Material, BOMHeader, BOMItem, WorkCenter, Routing
from faker import Faker
import random

fake = Faker()

def seed_database():
    db = SessionLocal()
    
    try:
        # Seed iPhone materials
        iphone_materials = [
            {
                "material_id": "IPHONE15PRO256",
                "description": "iPhone 15 Pro 256GB Natural Titanium",
                "material_type": "FERT",
                "unit_price": 999.00
            },
            {
                "material_id": "A17_CHIP",
                "description": "A17 Pro Bionic Chip",
                "material_type": "RAW",
                "unit_price": 130.00
            },
            {
                "material_id": "OLED_DISPLAY",
                "description": "6.1-inch Super Retina XDR Display",
                "material_type": "RAW",
                "unit_price": 110.00
            },
            {
                "material_id": "TITANIUM_FRAME",
                "description": "Titanium Frame Assembly",
                "material_type": "RAW",
                "unit_price": 85.00
            },
            {
                "material_id": "CAMERA_MODULE",
                "description": "Triple Camera System",
                "material_type": "RAW",
                "unit_price": 95.00
            }
        ]
        
        for material_data in iphone_materials:
            material = Material(**material_data)
            db.add(material)
        
        # Seed work centers
        work_centers = [
            {"work_center_id": "WC001", "name": "Component Preparation", "capacity_per_hour": 500},
            {"work_center_id": "WC002", "name": "Logic Board Assembly", "capacity_per_hour": 200},
            {"work_center_id": "WC003", "name": "Display Installation", "capacity_per_hour": 180},
            {"work_center_id": "WC004", "name": "Camera Integration", "capacity_per_hour": 150},
            {"work_center_id": "WC005", "name": "Final Assembly", "capacity_per_hour": 120},
            {"work_center_id": "WC006", "name": "Quality Testing", "capacity_per_hour": 100},
        ]
        
        for wc_data in work_centers:
            work_center = WorkCenter(**wc_data)
            db.add(work_center)
        
        # Create BOM for iPhone
        bom_header = BOMHeader(
            bom_id="BOM_IPHONE15PRO256",
            parent_material_id="IPHONE15PRO256",
            version="001"
        )
        db.add(bom_header)
        
        bom_items = [
            {"bom_item_id": "BOM_001", "bom_id": "BOM_IPHONE15PRO256", "component_material_id": "A17_CHIP", "quantity": 1, "position": 10},
            {"bom_item_id": "BOM_002", "bom_id": "BOM_IPHONE15PRO256", "component_material_id": "OLED_DISPLAY", "quantity": 1, "position": 20},
            {"bom_item_id": "BOM_003", "bom_id": "BOM_IPHONE15PRO256", "component_material_id": "TITANIUM_FRAME", "quantity": 1, "position": 30},
            {"bom_item_id": "BOM_004", "bom_id": "BOM_IPHONE15PRO256", "component_material_id": "CAMERA_MODULE", "quantity": 1, "position": 40},
        ]
        
        for item_data in bom_items:
            bom_item = BOMItem(**item_data)
            db.add(bom_item)
        
        # Generate sample production orders
        for i in range(10):
            order = ProductionOrder(
                order_id=f"PO{2024}{i+1:06d}",
                material_id="IPHONE15PRO256",
                quantity=random.randint(1000, 5000),
                status=random.choice(["CREATED", "RELEASED", "IN_PROGRESS", "COMPLETED"]),
                created_date=fake.date_time_this_month(),
                due_date=fake.date_time_this_year()
            )
            db.add(order)
        
        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
```

2. **Demo Scenarios Script**
```python
# backend/demo_scenarios.py
class DemoScenarios:
    def __init__(self, db: Session):
        self.db = db
    
    async def scenario_1_rush_order(self):
        """Simulate iPhone 16 launch rush order"""
        print("🚀 DEMO: iPhone 16 Launch Rush Order")
        
        # Create rush order for 100,000 units
        rush_order = ProductionOrder(
            order_id="PO_RUSH_001",
            material_id="IPHONE15PRO256",
            quantity=100000,
            status="CREATED",
            priority="HIGH",
            due_date=datetime.now() + timedelta(days=30)
        )
        
        self.db.add(rush_order)
        self.db.commit()
        
        # Run MRP to check material availability
        mrp_service = MRPService(self.db)
        procurement_plan = mrp_service.run_mrp()
        
        print(f"📊 MRP Results: {len(procurement_plan)} materials need procurement")
        
        # Simulate real-time updates
        await self.simulate_production_progress(rush_order.order_id)
    
    async def scenario_2_supply_chain_disruption(self):
        """Simulate chip shortage impact"""
        print("⚠️  DEMO: Supply Chain Disruption (Chip Shortage)")
        
        # Mark A17 chips as unavailable
        chip_material = self.db.query(Material).filter(
            Material.material_id == "A17_CHIP"
        ).first()
        
        if chip_material:
            # Set stock to 0
            chip_material.available_stock = 0
            self.db.commit()
            
            # Run MRP to show impact
            mrp_service = MRPService(self.db)
            procurement_plan = mrp_service.run_mrp()
            
            print(f"🚨 Impact: {len(procurement_plan)} production orders affected")
    
    async def scenario_3_quality_issue(self):
        """Simulate quality control issue detection"""
        print("🔍 DEMO: Quality Control Issue Detection")
        
        # Create quality inspection with defects
        quality_issue = {
            "inspection_id": "QI_001",
            "order_id": "PO_RUSH_001",
            "defect_type": "Display Color Variance",
            "severity": "HIGH",
            "defect_rate": 5.2,
            "root_cause": "Supplier batch quality issue"
        }
        
        # Trigger quality alerts
        await self.emit_quality_alert(quality_issue)
        
        print(f"🚨 Quality Alert: {quality_issue['defect_rate']}% defect rate detected")

# Run demo scenarios
async def run_demo():
    db = SessionLocal()
    demo = DemoScenarios(db)
    
    print("🎬 Starting iPhone Production System Demo")
    print("=" * 50)
    
    await demo.scenario_1_rush_order()
    await asyncio.sleep(2)
    
    await demo.scenario_2_supply_chain_disruption()
    await asyncio.sleep(2)
    
    await demo.scenario_3_quality_issue()
    
    print("✅ Demo completed!")

if __name__ == "__main__":
    asyncio.run(run_demo())
```

---

## 📋 **FINAL DELIVERABLES CHECKLIST**

### **✅ Code Deliverables**
- [ ] **Backend API** (FastAPI + PostgreSQL)
  - [ ] 25+ REST endpoints implemented
  - [ ] Real-time WebSocket functionality
  - [ ] JWT authentication system
  - [ ] SQLAlchemy models & migrations
  - [ ] MRP calculation engine
  - [ ] ML demand forecasting
  - [ ] 80%+ test coverage

- [ ] **Frontend Application** (React + TypeScript + Material-UI)
  - [ ] Executive dashboard with KPIs
  - [ ] Production order management
  - [ ] Real-time monitoring dashboards
  - [ ] Advanced analytics & charts
  - [ ] Mobile-responsive design
  - [ ] 75%+ test coverage

- [ ] **Database & Infrastructure**
  - [ ] Normalized database schema (10+ tables)
  - [ ] Docker containerization
  - [ ] Sample data generation
  - [ ] Development environment setup

### **📁 Repository Structure**
```
iphone-production-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── __tests__/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── backend/
│   ├── routers/
│   ├── models/
│   ├── services/
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── database/
│   ├── migrations/
│   └── seed_data.py
├── docs/
│   ├── api-documentation.md
│   ├── user-guide.md
│   └── deployment-guide.md
├── docker-compose.yml
├── README.md
└── .env.example
```

### **📖 Documentation Deliverables**
- [ ] **README.md** with setup instructions
- [ ] **API Documentation** (Swagger/OpenAPI)
- [ ] **User Guide** with screenshots
- [ ] **Technical Architecture** document
- [ ] **Demo Script** for presentations
- [ ] **Video Walkthrough** (10-15 minutes)

### **🎯 Presentation Materials**
- [ ] **PowerPoint/Slides** overview
- [ ] **Live Demo** scenarios
- [ ] **Code Review** highlights
- [ ] **Business Value** explanation
- [ ] **Technical Challenges** solved

---

## 🏆 **SUCCESS CRITERIA**

Your project will be considered **exceptional** if it demonstrates:

### **Technical Excellence (40%)**
- Clean, well-structured code
- Proper error handling
- Comprehensive testing
- Good performance optimization
- Security best practices

### **Business Functionality (35%)**
- Complete production workflow
- Realistic manufacturing scenarios
- Data-driven decision making
- Integration between modules

### **User Experience (15%)**
- Intuitive interface design
- Responsive layouts
- Real-time updates
- Professional appearance

### **Innovation & Extras (10%)**
- Machine learning features
- Advanced analytics
- Creative problem solving
- Going beyond requirements

---

## 🚀 **GETTING STARTED - ONE-CLICK SETUP**

### **🎯 Super Easy Setup (Recommended)**

**Windows:**
```powershell
cd setupDev
.\setup-and-run.ps1
```

**Linux/Mac:**
```bash
cd setupDev
chmod +x setup-and-run.sh
./setup-and-run.sh
```

**That's it!** The script will:
- ✅ Install all dependencies
- ✅ Guide you through database setup
- ✅ Start both servers automatically

### **📋 Manual Setup (If needed)**

```bash
# Backend setup
cd backend
python -m pip install -r requirements.txt

# Frontend setup
cd frontend
npm install

# Database setup
psql -U postgres
CREATE DATABASE sap;
\q

# Start servers manually
# Backend: cd backend && python -m uvicorn main:app --reload
# Frontend: cd frontend && npm run dev
```

**📖 See [`setupDev/README.md`](setupDev/README.md) for details**

---

## 💡 **TIPS FOR SUCCESS**

1. **Start Simple**: Get basic CRUD operations working first
2. **Iterate Quickly**: Deploy early, test often
3. **Document Everything**: Good docs = professional project
4. **Real Data**: Use realistic iPhone manufacturing data
5. **Performance**: Optimize database queries and API calls
6. **Mobile First**: Design for mobile from the beginning
7. **Security**: Never commit secrets, use environment variables
8. **Testing**: Write tests as you build features
9. **Git Flow**: Use meaningful commit messages and branches
10. **Demo Ready**: Always have a working version ready to show

**Estimated Timeline**: 12 weeks for full implementation
**Team Size**: 3-4 developers optimal
**Complexity**: Advanced level capstone project

This comprehensive system will showcase enterprise-level software development skills and create an impressive portfolio piece that demonstrates real-world manufacturing operations expertise!

#### **Step 5: Bill of Materials (BOM) System (Day 11-14)**

1. **Create BOM Database Models**
```python
# Add to backend/models.py
class BOMHeader(Base):
    __tablename__ = "bom_headers"
    
    bom_id = Column(String, primary_key=True)
    parent_material_id = Column(String, ForeignKey("materials.material_id"))
    version = Column(String, default="001")
    valid_from = Column(DateTime)
    valid_to = Column(DateTime)
    
    parent_material = relationship("Material")
    bom_items = relationship("BOMItem", back_populates="bom_header")

class BOMItem(Base):
    __tablename__ = "bom_items"
    
    bom_item_id = Column(String, primary_key=True)
    bom_id = Column(String, ForeignKey("bom_headers.bom_id"))
    component_material_id = Column(String, ForeignKey("materials.material_id"))
    quantity = Column(Float, nullable=False)
    position = Column(Integer, nullable=False)
    
    bom_header = relationship("BOMHeader", back_populates="bom_items")
    component_material = relationship("Material")
```

2. **Create BOM API Endpoints**
```python
# backend/routers/bom.py
@router.post("/")
def create_bom(bom_data: BOMCreate, db: Session = Depends(get_db)):
    # Create BOM header
    bom_header = BOMHeader(
        bom_id=bom_data.bom_id,
        parent_material_id=bom_data.parent_material_id,
        version=bom_data.version
    )
    db.add(bom_header)
    
    # Create BOM items
    for item in bom_data.items:
        bom_item = BOMItem(
            bom_item_id=f"{bom_data.bom_id}_{item.position:03d}",
            bom_id=bom_data.bom_id,
            component_material_id=item.component_material_id,
            quantity=item.quantity,
            position=item.position
        )
        db.add(bom_item)
    
    db.commit()
    return {"message": "BOM created successfully"}
```

3. **Frontend: BOM Tree Component**
```typescript
// frontend/src/components/BOMTree.tsx
import React from 'react';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { ExpandMore, ChevronRight } from '@mui/icons-material';

interface BOMTreeProps {
  bomData: any[];
}

const BOMTree: React.FC<BOMTreeProps> = ({ bomData }) => {
  const renderTree = (nodes: any) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node: any) => renderTree(node))
        : null}
    </TreeItem>
  );

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMore />}
      defaultExpandIcon={<ChevronRight />}
      sx={{ height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
    >
      {bomData.map((node) => renderTree(node))}
    </TreeView>
  );
};
```

---

### **WEEK 5-6: PRODUCTION ORDERS & MRP**

#### **Step 6: Production Order Management (Day 15-18)**

1. **Production Order Backend Logic**
```python
# backend/services/production_service.py
from sqlalchemy.orm import Session
from models import ProductionOrder, Material
from datetime import datetime, timedelta

class ProductionOrderService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_production_order(self, order_data):
        # Generate unique order ID
        order_id = f"PO{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Create production order
        production_order = ProductionOrder(
            order_id=order_id,
            material_id=order_data.material_id,
            quantity=order_data.quantity,
            status="CREATED",
            created_date=datetime.now(),
            due_date=order_data.due_date
        )
        
        self.db.add(production_order)
        self.db.commit()
        self.db.refresh(production_order)
        
        return production_order
    
    def release_production_order(self, order_id: str):
        order = self.db.query(ProductionOrder).filter(
            ProductionOrder.order_id == order_id
        ).first()
        
        if order:
            order.status = "RELEASED"
            self.db.commit()
            return order
        
        raise ValueError("Production order not found")
    
    def get_production_orders_by_status(self, status: str = None):
        query = self.db.query(ProductionOrder)
        if status:
            query = query.filter(ProductionOrder.status == status)
        return query.all()
```

2. **Frontend: Production Order Dashboard**
```typescript
// frontend/src/components/ProductionOrderDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Box
} from '@mui/material';

const ProductionOrderDashboard: React.FC = () => {
  const [orders, setOrders] = useState([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'primary';
      case 'DELAYED': return 'error';
      default: return 'default';
    }
  };

  const calculateProgress = (order: any) => {
    // Mock calculation - in real app, calculate from confirmations
    return Math.random() * 100;
  };

  return (
    <Grid container spacing={3}>
      {orders.map((order: any) => (
        <Grid item xs={12} md={6} lg={4} key={order.order_id}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {order.order_id}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {order.material.description}
              </Typography>
              
              <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="body2">
                  Quantity: {order.quantity.toLocaleString()}
                </Typography>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={calculateProgress(order)} 
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip 
                  label={order.status} 
                  color={getStatusColor(order.status)}
                  size="small"
                />
                <Typography variant="caption">
                  Due: {new Date(order.due_date).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
```

#### **Step 7: Material Requirement Planning (MRP) (Day 19-21)**

1. **MRP Calculation Engine**
```python
# backend/services/mrp_service.py
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import Material, BOMHeader, BOMItem, ProductionOrder

class MRPService:
    def __init__(self, db: Session):
        self.db = db
    
    def run_mrp(self, planning_horizon_days: int = 90):
        """Execute MRP calculation"""
        
        # Step 1: Collect all demand (production orders, sales forecasts)
        demand_data = self.collect_demand(planning_horizon_days)
        
        # Step 2: Explode BOMs to get component requirements
        material_requirements = {}
        
        for demand in demand_data:
            components = self.explode_bom(
                demand['material_id'], 
                demand['quantity']
            )
            
            for component_id, required_qty in components.items():
                if component_id in material_requirements:
                    material_requirements[component_id] += required_qty
                else:
                    material_requirements[component_id] = required_qty
        
        # Step 3: Check current inventory levels
        procurement_plan = []
        for material_id, required_qty in material_requirements.items():
            current_stock = self.get_current_stock(material_id)
            
            if current_stock < required_qty:
                shortage_qty = required_qty - current_stock
                procurement_plan.append({
                    'material_id': material_id,
                    'required_quantity': required_qty,
                    'current_stock': current_stock,
                    'shortage_quantity': shortage_qty,
                    'procurement_date': datetime.now() + timedelta(days=7)
                })
        
        return procurement_plan
    
    def explode_bom(self, parent_material_id: str, parent_quantity: int, level: int = 0):
        """Recursively explode BOM to get all component requirements"""
        components = {}
        
        # Get BOM for parent material
        bom_items = self.db.query(BOMItem).join(BOMHeader).filter(
            BOMHeader.parent_material_id == parent_material_id
        ).all()
        
        for item in bom_items:
            component_qty = item.quantity * parent_quantity
            component_id = item.component_material_id
            
            if component_id in components:
                components[component_id] += component_qty
            else:
                components[component_id] = component_qty
            
            # Recursively explode if component has its own BOM
            sub_components = self.explode_bom(component_id, component_qty, level + 1)
            for sub_comp_id, sub_comp_qty in sub_components.items():
                if sub_comp_id in components:
                    components[sub_comp_id] += sub_comp_qty
                else:
                    components[sub_comp_id] = sub_comp_qty
        
        return components
```

---

### **WEEK 7-8: DASHBOARDS & REAL-TIME FEATURES**

#### **Step 8: Executive Dashboard (Day 22-25)**

1. **Backend: Dashboard KPI Calculations**
```python
# backend/services/dashboard_service.py
class DashboardService:
    def __init__(self, db: Session):
        self.db = db
    
    async def get_production_kpis(self, date_range: dict):
        """Calculate key production metrics"""
        
        # Total production volume
        total_production = self.db.query(func.sum(ProductionOrder.quantity)).filter(
            ProductionOrder.status == 'COMPLETED',
            ProductionOrder.created_date >= date_range['start'],
            ProductionOrder.created_date <= date_range['end']
        ).scalar() or 0
        
        # Efficiency rate (completed orders / total orders)
        total_orders = self.db.query(ProductionOrder).filter(
            ProductionOrder.created_date >= date_range['start'],
            ProductionOrder.created_date <= date_range['end']
        ).count()
        
        completed_orders = self.db.query(ProductionOrder).filter(
            ProductionOrder.status == 'COMPLETED',
            ProductionOrder.created_date >= date_range['start'],
            ProductionOrder.created_date <= date_range['end']
        ).count()
        
        efficiency_rate = (completed_orders / total_orders * 100) if total_orders > 0 else 0
        
        # Active orders count
        active_orders = self.db.query(ProductionOrder).filter(
            ProductionOrder.status.in_(['CREATED', 'RELEASED', 'IN_PROGRESS'])
        ).count()
        
        return {
            'total_production': total_production,
            'efficiency_rate': round(efficiency_rate, 1),
            'active_orders': active_orders,
            'completed_orders': completed_orders
        }
```

2. **Frontend: KPI Cards Component**
```typescript
// frontend/src/components/KPICards.tsx
import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface KPICardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  unit?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  previousValue, 
  unit = '', 
  color = 'primary' 
}) => {
  const calculateTrend = () => {
    if (!previousValue) return null;
    const current = typeof value === 'string' ? parseFloat(value) : value;
    const change = ((current - previousValue) / previousValue) * 100;
    return {
      percentage: Math.abs(change).toFixed(1),
      isPositive: change > 0
    };
  };

  const trend = calculateTrend();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        
        <Typography variant="h3" component="div" color={`${color}.main`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
          <Typography variant="h5" component="span" color="text.secondary">
            {unit}
          </Typography>
        </Typography>
        
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Chip
              icon={trend.isPositive ? <TrendingUp /> : <TrendingDown />}
              label={`${trend.percentage}%`}
              color={trend.isPositive ? 'success' : 'error'}
              size="small"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
```

#### **Step 9: Real-Time WebSocket Integration (Day 26-28)**

1. **Backend: WebSocket Setup**
```python
# backend/websocket.py
import socketio
from fastapi import FastAPI
import asyncio
import json

# Create Socket.IO server
sio = socketio.AsyncServer(cors_allowed_origins="*")

# Mount Socket.IO app
socket_app = socketio.ASGIApp(sio)

@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")
    await sio.emit('connected', {'message': 'Connected to production system'}, sid)

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")

# Background task to send real-time updates
async def send_production_updates():
    while True:
        # Simulate production updates
        update_data = {
            'timestamp': datetime.now().isoformat(),
            'production_count': random.randint(1000, 1200),
            'efficiency_rate': round(random.uniform(85, 95), 1),
            'active_orders': random.randint(8, 15)
        }
        
        await sio.emit('production_update', update_data)
        await asyncio.sleep(5)  # Send update every 5 seconds

# Start background task
asyncio.create_task(send_production_updates())
```

2. **Frontend: Real-Time Dashboard Hook**
```typescript
// frontend/src/hooks/useRealTimeData.ts
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface ProductionData {
  timestamp: string;
  production_count: number;
  efficiency_rate: number;
  active_orders: number;
}

export const useRealTimeData = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [productionData, setProductionData] = useState<ProductionData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io('http://localhost:8000');
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to WebSocket server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket server');
    });

    socketInstance.on('production_update', (data: ProductionData) => {
      setProductionData(data);
    });

    return () => {
      socketInstance.close();
    };
  }, []);

  return { productionData, isConnected, socket };
};
```

---

### **WEEK 9-10: ADVANCED FEATURES**

#### **Step 10: Machine Learning Integration (Day 29-32)**

1. **Demand Forecasting Service**
```python
# backend/services/ml_service.py
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta

class DemandForecastService:
    def __init__(self):
        self.model = LinearRegression()
        self.scaler = StandardScaler()
    
    def generate_historical_data(self, material_id: str, days: int = 365):
        """Generate realistic historical demand data"""
        dates = pd.date_range(
            start=datetime.now() - timedelta(days=days),
            end=datetime.now(),
            freq='D'
        )
        
        # Simulate seasonal patterns and trends
        base_demand = 1000
        seasonal_factor = np.sin(2 * np.pi * np.arange(len(dates)) / 365) * 200
        trend_factor = np.arange(len(dates)) * 0.5
        noise = np.random.normal(0, 50, len(dates))
        
        demand = base_demand + seasonal_factor + trend_factor + noise
        demand = np.maximum(demand, 0)  # Ensure non-negative demand
        
        return pd.DataFrame({
            'date': dates,
            'demand': demand.astype(int),
            'day_of_week': dates.dayofweek,
            'month': dates.month,
            'is_weekend': dates.dayofweek >= 5
        })
    
    def train_model(self, historical_data: pd.DataFrame):
        """Train demand forecasting model"""
        features = ['day_of_week', 'month', 'is_weekend']
        X = historical_data[features]
        y = historical_data['demand']
        
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        
        return self.model.score(X_scaled, y)
    
    def forecast_demand(self, days_ahead: int = 30):
        """Generate demand forecast"""
        future_dates = pd.date_range(
            start=datetime.now() + timedelta(days=1),
            periods=days_ahead,
            freq='D'
        )
        
        future_features = pd.DataFrame({
            'day_of_week': future_dates.dayofweek,
            'month': future_dates.month,
            'is_weekend': future_dates.dayofweek >= 5
        })
        
        X_scaled = self.scaler.transform(future_features)
        forecast = self.model.predict(X_scaled)
        
        return pd.DataFrame({
            'date': future_dates,
            'forecasted_demand': np.maximum(forecast.astype(int), 0)
        })
```

#### **Step 11: Advanced Analytics Dashboard (Day 33-35)**

1. **Production Analytics Component**
```typescript
// frontend/src/components/ProductionAnalytics.tsx
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, Typography, Grid, Box, Tab, Tabs } from '@mui/material';

const ProductionAnalytics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [productionTrends, setProductionTrends] = useState([]);
  const [efficiencyData, setEfficiencyData] = useState([]);
  const [costBreakdown, setCostBreakdown] = useState([]);

  // Sample data - replace with real API calls
  useEffect(() => {
    setProductionTrends([
      { date: '2024-01', planned: 45000, actual: 42000 },
      { date: '2024-02', planned: 48000, actual: 47500 },
      { date: '2024-03', planned: 50000, actual: 51000 },
      { date: '2024-04', planned: 52000, actual: 49000 },
    ]);

    setEfficiencyData([
      { workCenter: 'Assembly', efficiency: 87 },
      { workCenter: 'Testing', efficiency: 92 },
      { workCenter: 'Packaging', efficiency: 89 },
      { workCenter: 'Quality', efficiency: 95 },
    ]);

    setCostBreakdown([
      { name: 'Materials', value: 65, color: '#8884d8' },
      { name: 'Labor', value: 20, color: '#82ca9d' },
      { name: 'Overhead', value: 10, color: '#ffc658' },
      { name: 'Quality', value: 5, color: '#ff7300' },
    ]);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Production Trends" />
        <Tab label="Efficiency Analysis" />
        <Tab label="Cost Breakdown" />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Production Trends (Planned vs Actual)
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={productionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="planned" stroke="#8884d8" strokeWidth={3} />
                    <Line type="monotone" dataKey="actual" stroke="#82ca9d" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Work Center Efficiency
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={efficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="workCenter" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="efficiency" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Manufacturing Cost Breakdown
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                    >
                      {costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
```