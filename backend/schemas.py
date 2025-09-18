from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums - matching models exactly
class OrderStatus(str, Enum):
    CREATED = "CREATED"
    RELEASED = "RELEASED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    DELAYED = "DELAYED"

class OrderPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class MaterialType(str, Enum):
    RAW = "RAW"
    SEMI_FINISHED = "SEMI_FINISHED"
    FINISHED = "FINISHED"
    CONSUMABLE = "CONSUMABLE"

class StockStatus(str, Enum):
    AVAILABLE = "Available"
    LOW_STOCK = "Low Stock"
    CRITICAL = "Critical"
    OUT_OF_STOCK = "Out of Stock"

class WorkCenterStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    MAINTENANCE = "MAINTENANCE"

# Material Schemas - Fixed to accept material_id from tests
class MaterialCreate(BaseModel):
    material_id: str
    description: str
    type: MaterialType
    unitOfMeasure: str
    unitPrice: float
    plant: str
    storageLocation: str
    currentStock: Optional[int] = 0
    minStock: Optional[int] = 0
    maxStock: Optional[int] = 1000

class MaterialResponse(BaseModel):
    id: int
    materialId: str
    description: str
    type: MaterialType
    currentStock: int
    minStock: int
    maxStock: int
    unitOfMeasure: str
    unitPrice: float
    status: StockStatus
    plant: str
    storageLocation: str
    lastMovementDate: Optional[datetime] = None

    class Config:
        from_attributes = True

# Production Order Schemas - Fixed to match model fields exactly
class ProductionOrderCreate(BaseModel):
    material_id: str
    quantity: int
    due_date: datetime
    priority: OrderPriority
    description: Optional[str] = None
    costCenter: Optional[str] = None
    plant: Optional[str] = "1000"

class ProductionOrderResponse(BaseModel):
    id: int
    orderId: str
    materialId: str
    description: Optional[str] = None
    quantity: int
    status: Optional[OrderStatus] = None
    priority: Optional[OrderPriority] = None
    progress: Optional[int] = None
    plannedStartDate: Optional[datetime] = None
    plannedEndDate: Optional[datetime] = None
    actualStartDate: Optional[datetime] = None
    actualEndDate: Optional[datetime] = None
    dueDate: Optional[datetime] = None
    workCenterId: Optional[str] = None
    routingId: Optional[str] = None
    costCenter: Optional[str] = None
    plant: Optional[str] = None

    class Config:
        from_attributes = True

# Work Center Schemas
class WorkCenterCreate(BaseModel):
    work_center_id: str
    name: str
    description: str
    capacity: int
    efficiency: float
    costCenter: str
    plant: str
    status: Optional[WorkCenterStatus] = WorkCenterStatus.ACTIVE

class WorkCenterResponse(BaseModel):
    id: int
    workCenterId: str
    name: str
    description: str
    capacity: int
    efficiency: float
    status: WorkCenterStatus
    costCenter: str
    plant: str

    class Config:
        from_attributes = True

# BOM Schemas
class BOMItemCreate(BaseModel):
    component_material_id: str
    quantity: float
    position: int

class BOMCreate(BaseModel):
    bom_id: str
    parent_material_id: str
    version: Optional[str] = "001"
    items: List[BOMItemCreate]

# Confirmation Schemas
class ConfirmationCreate(BaseModel):
    operation_no: str
    yield_qty: float
    scrap_qty: Optional[float] = 0.0
    work_center_id: str
    start_time: str  # Accept string datetime
    end_time: str    # Accept string datetime

# Goods Movement Schemas
class MovementItem(BaseModel):
    material_id: str
    qty: float
    plant: str
    storage_loc: str

class GoodsIssueCreate(BaseModel):
    order_id: str
    movements: List[MovementItem]

class GoodsReceiptCreate(BaseModel):
    order_id: str
    material_id: str
    qty: float
    plant: str
    storage_loc: str

# MRP Schemas
class MRPRequest(BaseModel):
    planning_horizon_days: Optional[int] = 90
    plant: Optional[str] = "1000"

# Stock Schemas
class StockCreate(BaseModel):
    material_id: str
    plant: str
    storage_location: str
    on_hand: float
    safety_stock: Optional[float] = 0.0

class StockResponse(BaseModel):
    id: str
    material_id: str
    plant: str
    storage_location: str
    on_hand: float
    safety_stock: float

    class Config:
        from_attributes = True