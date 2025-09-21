"""
ROUTING/OPERATIONS SCHEMAS

Added schemas fo routing and operations functionality:
1. RoutingCreate/Response - For creating manufacturing routings (step-by-step)
2. OperationCreate/Response - For individual operations within routings
3. PlannedOrderCreate/Response - For MRP planned orders (MD01)
4. PurchaseRequisitionCreate/Response - For MRP purchase requisitions (MD01)
5. OrderChangeRequest/Response - For tracking production order changes (CO02)
6. OperationConfirmationCreate/Response - For operation confirmations (CO11N)

"""

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

# Routing and Operations Enums
class RoutingStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    DRAFT = "DRAFT"

class OperationStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    COMPLETED = "COMPLETED"

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

# Routing and Operations Schemas
class OperationCreate(BaseModel):
    operation_id: str
    work_center_id: str
    description: str
    sequence: int
    setup_time: Optional[float] = 0.0
    machine_time: Optional[float] = 0.0
    labor_time: Optional[float] = 0.0
    control_key: Optional[str] = "PP01"

class OperationResponse(BaseModel):
    id: int
    operation_id: str
    routing_id: str
    work_center_id: str
    description: str
    sequence: int
    setup_time: float
    machine_time: float
    labor_time: float
    status: OperationStatus
    control_key: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RoutingCreate(BaseModel):
    routing_id: str
    material_id: str
    description: str
    version: Optional[str] = "001"
    plant: str
    operations: List[OperationCreate]

class RoutingResponse(BaseModel):
    id: int
    routing_id: str
    material_id: str
    description: str
    version: str
    status: RoutingStatus
    plant: str
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RoutingWithOperations(BaseModel):
    routing: RoutingResponse
    operations: List[OperationResponse]

# Phase 2 Transaction Schemas
class PlannedOrderCreate(BaseModel):
    material_id: str
    quantity: float
    due_date: datetime
    start_date: datetime
    plant: str
    order_type: Optional[str] = "PP"
    mrp_controller: Optional[str] = None

class PlannedOrderResponse(BaseModel):
    id: int
    planned_order_id: str
    material_id: str
    quantity: float
    due_date: datetime
    start_date: datetime
    plant: str
    mrp_controller: Optional[str] = None
    order_type: str
    status: str
    created_by_mrp_run: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PurchaseRequisitionCreate(BaseModel):
    material_id: str
    quantity: float
    delivery_date: datetime
    plant: str
    purchasing_group: Optional[str] = None

class PurchaseRequisitionResponse(BaseModel):
    id: int
    pr_number: str
    material_id: str
    quantity: float
    delivery_date: datetime
    plant: str
    purchasing_group: Optional[str] = None
    status: str
    created_by_mrp_run: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Enhanced MRP Schemas for MD01
class MRPRunRequest(BaseModel):
    planning_horizon_days: Optional[int] = 90
    plant: Optional[str] = "1000"
    material_filter: Optional[List[str]] = None  # Specific materials to plan
    create_planned_orders: Optional[bool] = True
    create_purchase_reqs: Optional[bool] = True

class MRPRunResponse(BaseModel):
    run_id: str
    planning_horizon_days: int
    plant: str
    materials_processed: int
    planned_orders_created: int
    purchase_reqs_created: int
    exceptions: List[str]
    run_timestamp: datetime

# Order Change Management Schemas for CO02
class OrderChangeRequest(BaseModel):
    order_id: str
    change_type: str  # QUANTITY, DATE, COMPONENT, OPERATION
    field_name: str
    new_value: str
    reason: Optional[str] = None

class OrderChangeResponse(BaseModel):
    change_id: str
    order_id: str
    change_type: str
    field_name: str
    old_value: Optional[str] = None
    new_value: str
    reason: Optional[str] = None
    changed_by: str
    change_timestamp: datetime
    status: str  # SUCCESS, FAILED, PENDING

    class Config:
        from_attributes = True

# Advanced Confirmation Schemas for CO11N
class OperationConfirmationCreate(BaseModel):
    order_id: str
    operation_id: str
    work_center_id: str
    yield_qty: float
    scrap_qty: Optional[float] = 0.0
    setup_time_actual: Optional[float] = 0.0
    machine_time_actual: Optional[float] = 0.0
    labor_time_actual: Optional[float] = 0.0
    start_time: datetime
    end_time: datetime
    confirmation_type: Optional[str] = "FINAL"  # PARTIAL, FINAL

class OperationConfirmationResponse(BaseModel):
    id: int
    confirmation_id: str
    order_id: str
    operation_id: str
    work_center_id: str
    yield_qty: float
    scrap_qty: float
    setup_time_actual: float
    machine_time_actual: float
    labor_time_actual: float
    start_time: datetime
    end_time: datetime
    confirmation_type: str
    status: str
    confirmed_by: str
    created_at: datetime

    class Config:
        from_attributes = True

# Enhanced Production Order Schema with Routing
class ProductionOrderCreateWithRouting(BaseModel):
    material_id: str
    quantity: int
    due_date: datetime
    priority: OrderPriority
    routing_id: Optional[str] = None  # Auto-assign if not provided
    description: Optional[str] = None
    costCenter: Optional[str] = None
    plant: Optional[str] = "1000"