"""
ROUTING/OPERATIONS 

1. Added Routing and Operations models for manufacturing step-by-step logic
2. Added PlannedOrder, PurchaseRequisition model for MRP order generation (MD01)
3. Added OrderChangeHistory model for production order changing (CO02)

Gagawin pa: (the specific transactions to implement)
- MD01: MRP Run with planned order/purchase generation
- CO02: Production Order Change Management 
- CO11N: Order Confirmation (Confirming the orders yourself para ma mark as completed)
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, Enum
from database import Base
import enum
from datetime import datetime

class OrderStatus(str, enum.Enum):
    CREATED = "CREATED"
    RELEASED = "RELEASED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    DELAYED = "DELAYED"

class OrderPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class ProductionOrder(Base):
    __tablename__ = "production_orders"

    id = Column(Integer, primary_key=True, index=True)
    orderId = Column(String, unique=True, index=True)
    materialId = Column(String)
    description = Column(String)
    quantity = Column(Integer)
    status = Column(Enum(OrderStatus))
    priority = Column(Enum(OrderPriority))
    progress = Column(Integer)
    plannedStartDate = Column(DateTime)
    plannedEndDate = Column(DateTime)
    actualStartDate = Column(DateTime, nullable=True)
    actualEndDate = Column(DateTime, nullable=True)
    dueDate = Column(DateTime)
    workCenterId = Column(String, nullable=True)
    routingId = Column(String, nullable=True)
    costCenter = Column(String)
    plant = Column(String)

class MaterialType(str, enum.Enum):
    RAW = "RAW"
    SEMI_FINISHED = "SEMI_FINISHED"
    FINISHED = "FINISHED"
    CONSUMABLE = "CONSUMABLE"

class StockStatus(str, enum.Enum):
    AVAILABLE = "Available"
    LOW_STOCK = "Low Stock"
    CRITICAL = "Critical"
    OUT_OF_STOCK = "Out of Stock"

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    materialId = Column(String, unique=True, index=True)
    description = Column(String)
    type = Column(Enum(MaterialType))
    currentStock = Column(Integer)
    minStock = Column(Integer)
    maxStock = Column(Integer)
    unitOfMeasure = Column(String)
    unitPrice = Column(Float)
    status = Column(Enum(StockStatus))
    plant = Column(String)
    storageLocation = Column(String)
    lastMovementDate = Column(DateTime, nullable=True)

class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    materialId = Column(String)
    movementType = Column(String)
    quantity = Column(Integer)
    reference = Column(String)
    plant = Column(String)
    storageLocation = Column(String)
    reason = Column(String, nullable=True)

class WorkCenterStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    MAINTENANCE = "MAINTENANCE"

class WorkCenter(Base):
    __tablename__ = "work_centers"

    id = Column(Integer, primary_key=True, index=True)
    workCenterId = Column(String, unique=True, index=True)
    name = Column(String)
    description = Column(String)
    capacity = Column(Integer)
    efficiency = Column(Float)
    status = Column(Enum(WorkCenterStatus))
    costCenter = Column(String)
    plant = Column(String)

class BOMHeader(Base):
    __tablename__ = "bom_headers"

    bom_id = Column(String, primary_key=True, index=True)
    parent_material_id = Column(String, index=True)
    version = Column(String, default="001")
    valid_from = Column(DateTime, nullable=True)
    valid_to = Column(DateTime, nullable=True)

class BOMItem(Base):
    __tablename__ = "bom_items"

    bom_item_id = Column(String, primary_key=True, index=True)
    bom_id = Column(String, index=True)
    component_material_id = Column(String, index=True)
    quantity = Column(Float)
    position = Column(Integer)

class Stock(Base):
    __tablename__ = "stock"

    id = Column(String, primary_key=True, index=True)
    material_id = Column(String, index=True)
    plant = Column(String)
    storage_location = Column(String)
    on_hand = Column(Float, default=0.0)
    safety_stock = Column(Float, default=0.0)

class Confirmation(Base):
    __tablename__ = "confirmations"

    id = Column(String, primary_key=True, index=True)
    order_id = Column(String, index=True)
    operation_no = Column(String)
    yield_qty = Column(Float)
    scrap_qty = Column(Float, default=0.0)
    work_center_id = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime)

class GoodsMovement(Base):
    __tablename__ = "goods_movements"

    id = Column(String, primary_key=True, index=True)
    movement_type = Column(String)  # ISSUE, RECEIPT, TRANSFER, ADJUSTMENT
    material_id = Column(String, index=True)
    qty = Column(Float)
    plant = Column(String)
    storage_loc = Column(String)
    order_id = Column(String, nullable=True)
    reference = Column(String, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now())

# Routing and Operations Models / Step-by-Step Logic 
class RoutingStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    DRAFT = "DRAFT"

class OperationStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    COMPLETED = "COMPLETED"

class Routing(Base):
    __tablename__ = "routings"

    id = Column(Integer, primary_key=True, index=True)
    routing_id = Column(String, unique=True, index=True)
    material_id = Column(String, index=True)  # Material this routing is for
    description = Column(String)
    version = Column(String, default="001")
    status = Column(Enum(RoutingStatus), default=RoutingStatus.ACTIVE)
    plant = Column(String)
    valid_from = Column(DateTime, nullable=True)
    valid_to = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now())
    updated_at = Column(DateTime, default=lambda: datetime.now(), onupdate=lambda: datetime.now())

class Operation(Base):
    __tablename__ = "operations"

    id = Column(Integer, primary_key=True, index=True)
    operation_id = Column(String, index=True)  # Operation number (e.g., "0010", "0020")
    routing_id = Column(String, index=True)  # Foreign key to routing
    work_center_id = Column(String, index=True)  # Work center where operation is performed
    description = Column(String)
    sequence = Column(Integer)  # Order of operations (10, 20, 30, etc.)
    setup_time = Column(Float, default=0.0)  # Setup time in minutes
    machine_time = Column(Float, default=0.0)  # Machine time per unit in minutes
    labor_time = Column(Float, default=0.0)  # Labor time per unit in minutes
    status = Column(Enum(OperationStatus), default=OperationStatus.ACTIVE)
    control_key = Column(String, default="PP01")  # Control key for operation type
    created_at = Column(DateTime, default=lambda: datetime.now())
    updated_at = Column(DateTime, default=lambda: datetime.now(), onupdate=lambda: datetime.now())

# Enhanced models for Phase 2 transactions
class PlannedOrder(Base):
    __tablename__ = "planned_orders"

    id = Column(Integer, primary_key=True, index=True)
    planned_order_id = Column(String, unique=True, index=True)
    material_id = Column(String, index=True)
    quantity = Column(Float)
    due_date = Column(DateTime)
    start_date = Column(DateTime)
    plant = Column(String)
    mrp_controller = Column(String, nullable=True)
    order_type = Column(String, default="PP")  # PP = Production, PR = Purchase Requisition
    status = Column(String, default="PLANNED")
    created_by_mrp_run = Column(String, nullable=True)  # MRP run ID that created this
    created_at = Column(DateTime, default=lambda: datetime.now())

class PurchaseRequisition(Base):
    __tablename__ = "purchase_requisitions"

    id = Column(Integer, primary_key=True, index=True)
    pr_number = Column(String, unique=True, index=True)
    material_id = Column(String, index=True)
    quantity = Column(Float)
    delivery_date = Column(DateTime)
    plant = Column(String)
    purchasing_group = Column(String, nullable=True)
    status = Column(String, default="OPEN")  # OPEN, RELEASED, ORDERED
    created_by_mrp_run = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now())

class OrderChangeHistory(Base):
    __tablename__ = "order_change_history"

    id = Column(Integer, primary_key=True, index=True)
    change_id = Column(String, unique=True, index=True)
    order_id = Column(String, index=True)
    change_type = Column(String)  # QUANTITY, DATE, COMPONENT, OPERATION
    field_name = Column(String)
    old_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)
    reason = Column(String, nullable=True)
    changed_by = Column(String, default="SYSTEM")
    change_timestamp = Column(DateTime, default=lambda: datetime.now())

class OperationConfirmation(Base):
    __tablename__ = "operation_confirmations"

    id = Column(Integer, primary_key=True, index=True)
    confirmation_id = Column(String, unique=True, index=True)
    order_id = Column(String, index=True)
    operation_id = Column(String, index=True)
    work_center_id = Column(String, index=True)
    yield_qty = Column(Float)
    scrap_qty = Column(Float, default=0.0)
    setup_time_actual = Column(Float, default=0.0)
    machine_time_actual = Column(Float, default=0.0)
    labor_time_actual = Column(Float, default=0.0)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    confirmation_type = Column(String, default="FINAL")  # PARTIAL, FINAL
    status = Column(String, default="CONFIRMED")
    confirmed_by = Column(String, default="SYSTEM")
    created_at = Column(DateTime, default=lambda: datetime.now())