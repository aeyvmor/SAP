# SAP Manufacturing System API Routes & TypeScript Types

## TypeScript Types

```typescript
// Base Types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Production Order Types
export type OrderStatus = 'CREATED' | 'RELEASED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELAYED';
export type OrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ProductionOrder extends BaseEntity {
  orderId: string;
  materialId: string;
  description: string;
  quantity: number;
  status: OrderStatus;
  priority: OrderPriority;
  progress: number;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  dueDate: Date;
  workCenterId?: string;
  routingId?: string;
  costCenter: string;
  plant: string;
}

export interface CreateProductionOrderRequest {
  materialId: string;
  description: string;
  quantity: number;
  priority: OrderPriority;
  plannedStartDate: Date;
  plannedEndDate: Date;
  dueDate: Date;
  workCenterId?: string;
  routingId?: string;
  costCenter: string;
  plant: string;
}

export interface UpdateProductionOrderRequest {
  quantity?: number;
  status?: OrderStatus;
  priority?: OrderPriority;
  progress?: number;
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  dueDate?: Date;
}

// Material Types
export type MaterialType = 'RAW' | 'SEMI_FINISHED' | 'FINISHED' | 'CONSUMABLE';
export type StockStatus = 'Available' | 'Low Stock' | 'Critical' | 'Out of Stock';

export interface Material extends BaseEntity {
  materialId: string;
  description: string;
  type: MaterialType;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitOfMeasure: string;
  unitPrice: number;
  status: StockStatus;
  plant: string;
  storageLocation: string;
  lastMovementDate?: Date;
}

export interface CreateMaterialRequest {
  materialId: string;
  description: string;
  type: MaterialType;
  minStock: number;
  maxStock: number;
  unitOfMeasure: string;
  unitPrice: number;
  plant: string;
  storageLocation: string;
}

export interface UpdateMaterialRequest {
  description?: string;
  minStock?: number;
  maxStock?: number;
  unitPrice?: number;
  storageLocation?: string;
}

export interface StockMovement extends BaseEntity {
  materialId: string;
  movementType: 'GOODS_RECEIPT' | 'GOODS_ISSUE' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  reference: string;
  plant: string;
  storageLocation: string;
  reason?: string;
}

// Work Center Types
export interface WorkCenter extends BaseEntity {
  workCenterId: string;
  name: string;
  description: string;
  capacity: number;
  efficiency: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  costCenter: string;
  plant: string;
}

// Analytics Types
export interface ProductionMetrics {
  totalProduction: number;
  efficiencyRate: number;
  activeOrders: number;
  completedOrders: number;
  oee: number; // Overall Equipment Effectiveness
  qualityRate: number;
  averageLeadTime: number;
}

export interface ProductionTrend {
  period: string;
  planned: number;
  actual: number;
  efficiency: number;
}

export interface WorkCenterEfficiency {
  workCenterId: string;
  name: string;
  efficiency: number;
  utilization: number;
  downtime: number;
}

export interface CostBreakdown {
  materials: number;
  labor: number;
  overhead: number;
  quality: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  timestamp: Date;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

// Query Parameters
export interface ProductionOrderQuery {
  status?: OrderStatus;
  priority?: OrderPriority;
  materialId?: string;
  plant?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'orderId' | 'dueDate' | 'priority' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface MaterialQuery {
  type?: MaterialType;
  status?: StockStatus;
  plant?: string;
  storageLocation?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'materialId' | 'description' | 'currentStock' | 'unitPrice';
  sortOrder?: 'asc' | 'desc';
}
```

## API Routes

### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

### Production Orders
```
# Get all production orders with filtering and pagination
GET    /api/production-orders
       Query params: status, priority, materialId, plant, dateFrom, dateTo, page, limit, sortBy, sortOrder

# Create new production order
POST   /api/production-orders
       Body: CreateProductionOrderRequest

# Get specific production order
GET    /api/production-orders/:orderId

# Update production order
PUT    /api/production-orders/:orderId
       Body: UpdateProductionOrderRequest

# Delete production order
DELETE /api/production-orders/:orderId

# Start production order
POST   /api/production-orders/:orderId/start

# Complete production order
POST   /api/production-orders/:orderId/complete

# Cancel production order
POST   /api/production-orders/:orderId/cancel

# Update progress
PATCH  /api/production-orders/:orderId/progress
       Body: { progress: number }

# Get production order history
GET    /api/production-orders/:orderId/history
```

### Materials Management
```
# Get all materials with filtering and pagination
GET    /api/materials
       Query params: type, status, plant, storageLocation, lowStock, page, limit, sortBy, sortOrder

# Create new material master
POST   /api/materials
       Body: CreateMaterialRequest

# Get specific material
GET    /api/materials/:materialId

# Update material master
PUT    /api/materials/:materialId
       Body: UpdateMaterialRequest

# Delete material
DELETE /api/materials/:materialId

# Get material stock movements
GET    /api/materials/:materialId/movements
       Query params: dateFrom, dateTo, movementType, page, limit

# Post goods receipt
POST   /api/materials/:materialId/goods-receipt
       Body: { quantity: number, reference: string, plant: string, storageLocation: string }

# Post goods issue
POST   /api/materials/:materialId/goods-issue
       Body: { quantity: number, reference: string, plant: string, storageLocation: string }

# Transfer stock
POST   /api/materials/:materialId/transfer
       Body: { quantity: number, fromLocation: string, toLocation: string, reference: string }

# Adjust stock
POST   /api/materials/:materialId/adjustment
       Body: { quantity: number, reason: string, reference: string, plant: string, storageLocation: string }

# Get low stock alerts
GET    /api/materials/alerts/low-stock
```

### Work Centers
```
# Get all work centers
GET    /api/work-centers
       Query params: status, plant, page, limit

# Create work center
POST   /api/work-centers
       Body: WorkCenter (without id, createdAt, updatedAt)

# Get specific work center
GET    /api/work-centers/:workCenterId

# Update work center
PUT    /api/work-centers/:workCenterId

# Delete work center
DELETE /api/work-centers/:workCenterId

# Get work center capacity
GET    /api/work-centers/:workCenterId/capacity
       Query params: dateFrom, dateTo

# Update work center status
PATCH  /api/work-centers/:workCenterId/status
       Body: { status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' }
```

### Analytics & Reporting
```
# Get production metrics dashboard
GET    /api/analytics/metrics
       Query params: dateFrom, dateTo, plant

# Get production trends
GET    /api/analytics/production-trends
       Query params: period ('daily' | 'weekly' | 'monthly'), dateFrom, dateTo, plant

# Get work center efficiency
GET    /api/analytics/work-center-efficiency
       Query params: dateFrom, dateTo, plant

# Get cost breakdown
GET    /api/analytics/cost-breakdown
       Query params: dateFrom, dateTo, plant, orderId

# Get quality metrics
GET    /api/analytics/quality-metrics
       Query params: dateFrom, dateTo, plant

# Get OEE (Overall Equipment Effectiveness)
GET    /api/analytics/oee
       Query params: workCenterId, dateFrom, dateTo

# Export production report
GET    /api/analytics/reports/production
       Query params: format ('pdf' | 'excel'), dateFrom, dateTo, plant

# Export material report
GET    /api/analytics/reports/materials
       Query params: format ('pdf' | 'excel'), plant, lowStock
```

### System & Configuration
```
# Get system health
GET    /api/system/health

# Get configuration
GET    /api/system/config

# Update configuration
PUT    /api/system/config
       Body: { key: string, value: any }

# Get audit logs
GET    /api/system/audit-logs
       Query params: userId, action, resource, dateFrom, dateTo, page, limit

# Backup system
POST   /api/system/backup

# Get plants
GET    /api/system/plants

# Get cost centers
GET    /api/system/cost-centers
```

## HTTP Status Codes

- `200 OK` - Successful GET, PUT requests
- `201 Created` - Successful POST requests
- `204 No Content` - Successful DELETE requests
- `400 Bad Request` - Invalid request data

- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate material ID)
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Server errors

## Example API Responses

### Successful Response
```json
{
  "success": true,
  "data": {
    "orderId": "PO20241201001",
    "materialId": "IPHONE15PRO256",
    "description": "iPhone 15 Pro 256GB Natural Titanium",
    "quantity": 5000,
    "status": "IN_PROGRESS",
    "progress": 68,
    "dueDate": "2024-12-15T00:00:00Z"
  },
  "timestamp": "2024-12-01T10:30:00Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  },
  "timestamp": "2024-12-01T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid production order data",
    "details": {
      "quantity": "must be a positive number",
      "dueDate": "must be a future date"
    }
  },
  "timestamp": "2024-12-01T10:30:00Z"
}
```