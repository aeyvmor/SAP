# SAP Manufacturing System - Complete Technical Documentation

## 1. System Overview

### What is this System?
This is a **SAP-inspired Manufacturing Execution System (MES)** that simulates core SAP Production Planning (PP) module functionality. It provides a modern web-based interface for managing manufacturing operations, from material management to production order execution.

### Purpose
- **Production Planning**: Manage production orders from creation to completion
- **Material Management**: Track inventory, stock levels, and material movements
- **MRP Planning**: Automated material requirements planning and procurement
- **Real-time Monitoring**: Dashboard for production metrics and KPIs
- **Order Lifecycle Management**: Complete order tracking with status updates

### Main Modules/Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────┤
│  Dashboard │ Materials │ Orders │ MRP │ Analytics       │
└─────────────────────────────────────────────────────────┘
                            │
                     REST API + WebSocket
                            │
┌─────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                      │
├─────────────────────────────────────────────────────────┤
│  Routers: Materials, Orders, MRP, BOM, Work Centers     │
│  Business Logic: Order Processing, Stock Management      │
│  WebSocket Manager: Real-time Updates                    │
└─────────────────────────────────────────────────────────┘
                            │
                      PostgreSQL
                            │
┌─────────────────────────────────────────────────────────┐
│                    Database Layer                        │
├─────────────────────────────────────────────────────────┤
│  Tables: Materials, Production Orders, Stock, BOM,       │
│  Routings, Operations, Confirmations, Movements          │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15.5 | React-based UI framework |
| | TypeScript | Type-safe development |
| | TailwindCSS | Utility-first CSS |
| | Tanstack Query | Data fetching & caching |
| | Radix UI | Accessible component primitives |
| **Backend** | FastAPI | High-performance Python web framework |
| | SQLAlchemy 2.0 | ORM for database operations |
| | Pydantic | Data validation & serialization |
| | WebSockets | Real-time communication |
| **Database** | PostgreSQL 15 | Relational database |
| **Infrastructure** | Docker Compose | Container orchestration |

## 2. User Flows & Personas

### Personas

1. **Production Planner (Sarah)**
   - Creates and manages production orders
   - Monitors order progress
   - Runs MRP to plan material requirements

2. **Warehouse Manager (Mike)**
   - Manages material inventory
   - Handles goods movements
   - Monitors stock levels

3. **Shop Floor Supervisor (John)**
   - Confirms production operations
   - Updates order status
   - Reports production completion

### User Journeys

#### Journey 1: Creating a Production Order
```
Start → Home Page → Orders Page → Click "Create Order" 
→ Fill Order Details (Material, Quantity, Due Date, Priority)
→ Submit → Order Created → View in Orders List
```

#### Journey 2: Running MRP Planning
```
Start → Home Page → MRP Page → Set Planning Parameters
→ Click "Run MRP" → System Calculates Requirements
→ View Generated Planned Orders & Purchase Requisitions
→ Convert Planned Orders to Production Orders
```

#### Journey 3: Managing Materials
```
Start → Home Page → Materials Page → View Stock Levels
→ Click "Add Material" → Enter Material Details
→ Submit → Material Added to Inventory
→ Monitor Stock Status (Available/Low/Critical)
```

### Screen/API Interactions

```mermaid
graph TD
    A[User] --> B[Frontend Pages]
    B --> C[Dashboard /dashboard]
    B --> D[Materials /materials]
    B --> E[Orders /orders]
    B --> F[MRP /mrp]
    
    C --> G[GET /api/analytics/metrics]
    D --> H[GET/POST /api/materials]
    E --> I[GET/POST /api/production-orders]
    F --> J[POST /api/mrp/run]
    
    G --> K[(Database)]
    H --> K
    I --> K
    J --> K
```

## 3. Process Flowcharts

### Production Order Lifecycle
```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌───────────┐     ┌───────────┐
│ CREATED │ --> │ RELEASED │ --> │IN_PROGRESS │ --> │ COMPLETED │     │ CANCELLED │
└─────────┘     └──────────┘     └────────────┘     └───────────┘     └───────────┘
     │               │                  │                  │                 ↑
     │               │                  │                  │                 │
     └───────────────┴──────────────────┴──────────────────┴─────────────────┘
                                    (Can be cancelled at any stage)
```

### MRP Process Flow
```
Start MRP Run
     │
     ▼
Calculate Planning Horizon
     │
     ▼
Get Active Production Orders
     │
     ▼
Explode BOM (Bill of Materials)
     │
     ▼
Calculate Material Requirements
     │
     ▼
Check Current Stock Levels
     │
     ▼
Identify Shortages
     │
     ├─── Finished/Semi-Finished Materials
     │              │
     │              ▼
     │     Create Planned Orders
     │
     └─── Raw Materials
                    │
                    ▼
           Create Purchase Requisitions
                    │
                    ▼
                End MRP Run
```

### Order Completion Process
```
Complete Order Button Clicked
            │
            ▼
    Goods Issue (Components)
            │
            ├─── For each BOM component:
            │     • Reduce component stock
            │     • Create ISSUE movement record
            │     • Update material master
            │
            ▼
    Goods Receipt (Finished Product)
            │
            ├─── Increase finished product stock
            │     Create RECEIPT movement record
            │     Update material master
            │
            ▼
    Update Order Status
            │
            ├─── Set status = COMPLETED
            │     Set progress = 100%
            │     Set actual end date
            │
            ▼
    Broadcast WebSocket Update
```

## 4. Backend Architecture Flowchart

```
                    Client Request
                          │
                          ▼
                 ┌─────────────────┐
                 │   FastAPI App    │
                 │   (main.py)      │
                 └─────────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
    ┌──────────────┐           ┌──────────────┐
    │   Routers    │           │  WebSocket   │
    │              │           │   Manager    │
    └──────────────┘           └──────────────┘
            │
    ┌───────┴────────────────────────┐
    │                                 │
    ▼                                 ▼
┌─────────────┐              ┌──────────────┐
│  Business   │              │   Database   │
│    Logic    │              │    Models    │
└─────────────┘              └──────────────┘
        │                            │
        └──────────┬─────────────────┘
                   ▼
           ┌──────────────┐
           │  SQLAlchemy  │
           │    Engine    │
           └──────────────┘
                   │
                   ▼
           ┌──────────────┐
           │  PostgreSQL  │
           │   Database   │
           └──────────────┘
```

### Request Handling Flow
```
1. HTTP Request arrives at FastAPI endpoint
2. Router validates request using Pydantic schema
3. Router calls appropriate business logic
4. Business logic interacts with database via SQLAlchemy
5. Database operations are performed
6. Response is serialized and returned
7. WebSocket broadcasts updates if needed
```

## 5. Database Schema / Data Model Overview

### Core Entities and Relationships

```
┌─────────────────┐         ┌──────────────────┐
│   Materials     │         │ Production Orders│
├─────────────────┤         ├──────────────────┤
│ materialId (PK) │◄────────│ orderId (PK)     │
│ description     │         │ materialId (FK)  │
│ type            │         │ quantity         │
│ currentStock    │         │ status           │
│ minStock        │         │ priority         │
│ maxStock        │         │ dueDate          │
└─────────────────┘         └──────────────────┘
        │                            │
        │                            │
        ▼                            ▼
┌─────────────────┐         ┌──────────────────┐
│   BOM Header    │         │   Confirmations  │
├─────────────────┤         ├──────────────────┤
│ bom_id (PK)     │         │ id (PK)          │
│ parent_material │         │ order_id (FK)    │
│ version         │         │ operation_no     │
└─────────────────┘         │ yield_qty        │
        │                   └──────────────────┘
        │
        ▼
┌─────────────────┐         ┌──────────────────┐
│   BOM Items     │         │  Goods Movements │
├─────────────────┤         ├──────────────────┤
│ bom_item_id(PK) │         │ id (PK)          │
│ bom_id (FK)     │         │ movement_type    │
│ component_mat   │         │ material_id      │
│ quantity        │         │ qty              │
└─────────────────┘         └──────────────────┘
```

### Key Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| Material → Production Order | 1:N | One material can have many production orders |
| Material → BOM Header | 1:N | One material can have multiple BOM versions |
| BOM Header → BOM Items | 1:N | One BOM has multiple component items |
| Production Order → Confirmations | 1:N | One order can have multiple operation confirmations |
| Material → Goods Movements | 1:N | One material can have many stock movements |
| Production Order → Operations | 1:N | One order follows a routing with multiple operations |

### Data Types & Enums

```python
# Order Status Lifecycle
OrderStatus: CREATED → RELEASED → IN_PROGRESS → COMPLETED | CANCELLED

# Material Types
MaterialType: RAW | SEMI_FINISHED | FINISHED | CONSUMABLE

# Stock Status
StockStatus: Available | Low Stock | Critical | Out of Stock

# Movement Types
MovementType: ISSUE | RECEIPT | TRANSFER | ADJUSTMENT
```

## 6. Integration & Component Connections

### Frontend ↔ Backend Communication

```
Frontend (Next.js)
    │
    ├── REST API Calls (Axios + Tanstack Query)
    │   │
    │   ├── GET requests for data fetching
    │   ├── POST requests for creating resources
    │   ├── PUT/PATCH for updates
    │   └── DELETE for removals
    │
    └── WebSocket Connection
        │
        └── Real-time updates for:
            • Order status changes
            • Stock level updates
            • MRP run completions
```

### API Endpoint Structure

```
/api/
├── /materials
│   ├── GET    /           # List all materials
│   ├── POST   /           # Create material
│   └── GET    /{id}       # Get specific material
│
├── /production-orders
│   ├── GET    /           # List orders
│   ├── POST   /           # Create order
│   ├── POST   /{id}/release
│   ├── POST   /{id}/confirm
│   └── POST   /{id}/complete
│
├── /mrp
│   ├── POST   /run        # Execute MRP run
│   ├── GET    /planned-orders
│   ├── GET    /purchase-requisitions
│   └── POST   /planned-orders/{id}/convert
│
└── /analytics
    └── GET    /metrics    # Dashboard metrics
```

### Database Access Pattern

```
Application Layer
       │
       ▼
SQLAlchemy ORM
       │
   ┌───┴───┐
   │Models │ ← Pydantic Schemas (validation)
   └───┬───┘
       │
Database Session
       │
PostgreSQL Database
```

## 7. Pseudocode for Key Operations

### Create Production Order
```pseudocode
FUNCTION createProductionOrder(material_id, quantity, due_date, priority):
    // Generate unique order ID
    order_id = "PO" + generateRandomHex(8)
    
    // Create order object
    order = NEW ProductionOrder {
        orderId: order_id,
        materialId: material_id,
        quantity: quantity,
        dueDate: due_date,
        priority: priority,
        status: "CREATED",
        progress: 0,
        plant: "1000"
    }
    
    // Save to database
    database.add(order)
    database.commit()
    
    // Broadcast via WebSocket
    websocket.broadcast({
        type: "order_created",
        order_id: order_id,
        material_id: material_id
    })
    
    RETURN order
```

### MRP Run Process
```pseudocode
FUNCTION runMRP(planning_horizon_days, plant):
    // Initialize
    mrp_run_id = "MRP" + currentTimestamp()
    materials_processed = 0
    planned_orders = []
    purchase_reqs = []
    
    // Get all active orders in horizon
    horizon_end = today + planning_horizon_days
    active_orders = database.query(ProductionOrders)
        .filter(dueDate <= horizon_end)
        .filter(status IN ["CREATED", "RELEASED", "IN_PROGRESS"])
    
    // Calculate requirements
    material_requirements = {}
    FOR EACH order IN active_orders:
        // Add direct material requirement
        material_requirements[order.materialId] += order.quantity
        
        // Explode BOM to get component requirements
        components = explodeBOM(order.materialId, order.quantity)
        FOR EACH component IN components:
            material_requirements[component.id] += component.qty
    
    // Check stock and create procurement
    FOR EACH material, required_qty IN material_requirements:
        current_stock = getStock(material)
        shortage = required_qty - current_stock
        
        IF shortage > 0:
            material_type = getMaterialType(material)
            
            IF material_type IN ["FINISHED", "SEMI_FINISHED"]:
                // Create planned production order
                planned_order = createPlannedOrder(material, shortage, horizon_end)
                planned_orders.append(planned_order)
            
            ELSE IF material_type == "RAW":
                // Create purchase requisition
                purchase_req = createPurchaseRequisition(material, shortage, horizon_end)
                purchase_reqs.append(purchase_req)
    
    // Save and return results
    database.commit()
    RETURN {
        run_id: mrp_run_id,
        planned_orders_created: planned_orders.length,
        purchase_reqs_created: purchase_reqs.length
    }
```

### Complete Order (with Goods Issue/Receipt)
```pseudocode
FUNCTION completeOrder(order_id):
    // Get order details
    order = database.getOrder(order_id)
    
    // 1. GOODS ISSUE - Consume BOM components
    bom = getBOM(order.materialId)
    FOR EACH component IN bom.items:
        required_qty = component.quantity * order.quantity
        
        // Reduce component stock
        component_stock = getStock(component.material_id)
        component_stock.on_hand -= required_qty
        
        // Create goods issue record
        createGoodsMovement({
            type: "ISSUE",
            material: component.material_id,
            quantity: required_qty,
            order_id: order_id
        })
    
    // 2. GOODS RECEIPT - Receive finished product
    finished_stock = getStock(order.materialId)
    finished_stock.on_hand += order.quantity
    
    // Create goods receipt record
    createGoodsMovement({
        type: "RECEIPT",
        material: order.materialId,
        quantity: order.quantity,
        order_id: order_id
    })
    
    // 3. Update order status
    order.status = "COMPLETED"
    order.progress = 100
    order.actualEndDate = now()
    
    // Save all changes
    database.commit()
    
    // Notify via WebSocket
    websocket.broadcast({
        type: "order_completed",
        order_id: order_id
    })
    
    RETURN success
```

## 8. Summary / Cheat Sheet

### Quick Reference - Key Modules

| Module | Purpose | Key Features |
|--------|---------|--------------|
| **Dashboard** | Real-time monitoring | Order counts, production metrics, status overview |
| **Materials** | Inventory management | Add materials, track stock, monitor levels |
| **Orders** | Production control | Create, release, confirm, complete orders |
| **MRP** | Planning automation | Generate planned orders, purchase requisitions |

### System Flow Overview

```
1. Materials Setup
   └── Define materials (RAW, SEMI_FINISHED, FINISHED)
   └── Set stock levels and parameters

2. BOM Configuration
   └── Define product structure
   └── Component relationships

3. Production Planning
   └── Create production orders
   └── Run MRP for requirements

4. Order Execution
   └── Release orders
   └── Confirm operations
   └── Complete with goods movements

5. Monitoring
   └── Dashboard metrics
   └── Stock status
   └── Order progress
```

### Key API Patterns

```javascript
// Frontend API Call Pattern
const { data, isLoading, error } = useQuery({
    queryKey: ["resource-name"],
    queryFn: async () => {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/endpoint`
        );
        return response.data;
    }
});

// Backend Endpoint Pattern
@router.post("/endpoint", response_model=ResponseSchema)
def endpoint_handler(payload: RequestSchema, db: Session = Depends(get_db)):
    # Business logic
    result = process_request(payload)
    db.commit()
    return result
```

### Database Quick Reference

```sql
-- Key Tables
Materials           -- Material master data
ProductionOrders    -- Production order management
Stock              -- Current inventory levels
BOMHeader/Items    -- Bill of materials
GoodsMovements     -- Stock transactions
PlannedOrders      -- MRP-generated orders
PurchaseRequisitions -- Procurement requests

-- Common Queries (conceptual)
SELECT * FROM production_orders WHERE status = 'IN_PROGRESS';
SELECT * FROM materials WHERE currentStock < minStock;
SELECT * FROM planned_orders WHERE created_by_mrp_run = 'MRP20241227';
```

### Docker Commands

```bash
# Start system
docker compose up --build

# Seed database
docker exec -it backend_service bash
python ./test/seed_database.py

# Stop system
docker compose down -v
```

### Environment URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: postgresql://postgres:admin@localhost:5432/sap

---

## Conclusion

This SAP Manufacturing System provides a modern, containerized implementation of core manufacturing execution functionality. It demonstrates:

- **Clean Architecture**: Separation of concerns between frontend, backend, and database
- **Modern Tech Stack**: Using current best practices and frameworks
- **Real-time Updates**: WebSocket integration for live status updates
- **Complete Workflow**: From material management through production completion
- **Educational Value**: Clear structure suitable for learning manufacturing systems concepts

The system successfully simulates key SAP PP module transactions while maintaining simplicity for educational purposes.