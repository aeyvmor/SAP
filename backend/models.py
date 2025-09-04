from sqlalchemy import Column, Integer, String, DateTime, Float, Enum
from .database import Base
import enum

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