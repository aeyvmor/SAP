"""
ROUTING API ENDPOINTS

- POST /api/routing - Create routing with operations (like a recipe)
- GET /api/routing - List all routings
- GET /api/routing/{routing_id} - Get routing with operations
- POST /api/routing/{routing_id}/operations - Add operation to routing
- PUT /api/routing/{routing_id}/operations/{operation_id} - Update operation
- DELETE /api/routing/{routing_id} - Delete routing
- GET /api/routing/material/{material_id} - Get routings for material

"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import models, schemas, get_db
import uuid
from datetime import datetime
from typing import List

router = APIRouter(prefix="/api/routing", tags=["Routing"])

@router.post("", response_model=schemas.RoutingResponse)
def create_routing(payload: schemas.RoutingCreate, db: Session = Depends(get_db)):
    """Create a new routing with operations"""
    
    # Check if routing already exists
    if db.query(models.Routing).filter(models.Routing.routing_id == payload.routing_id).first():
        raise HTTPException(status_code=409, detail="Routing already exists")
    
    # Check if material exists
    material = db.query(models.Material).filter(models.Material.materialId == payload.material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Create routing
    routing = models.Routing(
        routing_id=payload.routing_id,
        material_id=payload.material_id,
        description=payload.description,
        version=payload.version,
        plant=payload.plant,
        status=models.RoutingStatus.ACTIVE
    )
    
    db.add(routing)
    db.flush()  # Get the routing ID
    
    # Create operations
    for op_data in payload.operations:
        # Validate work center exists
        work_center = db.query(models.WorkCenter).filter(
            models.WorkCenter.workCenterId == op_data.work_center_id
        ).first()
        if not work_center:
            raise HTTPException(
                status_code=404, 
                detail=f"Work center {op_data.work_center_id} not found"
            )
        
        operation = models.Operation(
            operation_id=op_data.operation_id,
            routing_id=payload.routing_id,
            work_center_id=op_data.work_center_id,
            description=op_data.description,
            sequence=op_data.sequence,
            setup_time=op_data.setup_time,
            machine_time=op_data.machine_time,
            labor_time=op_data.labor_time,
            control_key=op_data.control_key,
            status=models.OperationStatus.ACTIVE
        )
        db.add(operation)
    
    db.commit()
    db.refresh(routing)
    
    return routing

@router.get("", response_model=List[schemas.RoutingResponse])
def list_routings(
    material_id: str = None, 
    plant: str = None,
    db: Session = Depends(get_db)
):
    """List all routings with optional filtering"""
    query = db.query(models.Routing)
    
    if material_id:
        query = query.filter(models.Routing.material_id == material_id)
    if plant:
        query = query.filter(models.Routing.plant == plant)
    
    return query.all()

@router.get("/{routing_id}", response_model=schemas.RoutingWithOperations)
def get_routing_with_operations(routing_id: str, db: Session = Depends(get_db)):
    """Get routing with all its operations"""
    
    routing = db.query(models.Routing).filter(models.Routing.routing_id == routing_id).first()
    if not routing:
        raise HTTPException(status_code=404, detail="Routing not found")
    
    operations = db.query(models.Operation).filter(
        models.Operation.routing_id == routing_id
    ).order_by(models.Operation.sequence).all()
    
    return {
        "routing": routing,
        "operations": operations
    }

@router.get("/{routing_id}/operations", response_model=List[schemas.OperationResponse])
def get_routing_operations(routing_id: str, db: Session = Depends(get_db)):
    """Get all operations for a routing"""
    
    # Verify routing exists
    routing = db.query(models.Routing).filter(models.Routing.routing_id == routing_id).first()
    if not routing:
        raise HTTPException(status_code=404, detail="Routing not found")
    
    operations = db.query(models.Operation).filter(
        models.Operation.routing_id == routing_id
    ).order_by(models.Operation.sequence).all()
    
    return operations

@router.post("/{routing_id}/operations", response_model=schemas.OperationResponse)
def add_operation_to_routing(
    routing_id: str, 
    payload: schemas.OperationCreate, 
    db: Session = Depends(get_db)
):
    """Add a new operation to an existing routing"""
    
    # Verify routing exists
    routing = db.query(models.Routing).filter(models.Routing.routing_id == routing_id).first()
    if not routing:
        raise HTTPException(status_code=404, detail="Routing not found")
    
    # Validate work center exists
    work_center = db.query(models.WorkCenter).filter(
        models.WorkCenter.workCenterId == payload.work_center_id
    ).first()
    if not work_center:
        raise HTTPException(
            status_code=404, 
            detail=f"Work center {payload.work_center_id} not found"
        )
    
    # Check if operation already exists in this routing
    existing_op = db.query(models.Operation).filter(
        models.Operation.routing_id == routing_id,
        models.Operation.operation_id == payload.operation_id
    ).first()
    if existing_op:
        raise HTTPException(
            status_code=409, 
            detail=f"Operation {payload.operation_id} already exists in routing"
        )
    
    operation = models.Operation(
        operation_id=payload.operation_id,
        routing_id=routing_id,
        work_center_id=payload.work_center_id,
        description=payload.description,
        sequence=payload.sequence,
        setup_time=payload.setup_time,
        machine_time=payload.machine_time,
        labor_time=payload.labor_time,
        control_key=payload.control_key,
        status=models.OperationStatus.ACTIVE
    )
    
    db.add(operation)
    db.commit()
    db.refresh(operation)
    
    return operation

@router.put("/{routing_id}/operations/{operation_id}", response_model=schemas.OperationResponse)
def update_operation(
    routing_id: str,
    operation_id: str,
    payload: schemas.OperationCreate,
    db: Session = Depends(get_db)
):
    """Update an existing operation"""
    
    operation = db.query(models.Operation).filter(
        models.Operation.routing_id == routing_id,
        models.Operation.operation_id == operation_id
    ).first()
    
    if not operation:
        raise HTTPException(status_code=404, detail="Operation not found")
    
    # Validate work center exists if changed
    if payload.work_center_id != operation.work_center_id:
        work_center = db.query(models.WorkCenter).filter(
            models.WorkCenter.workCenterId == payload.work_center_id
        ).first()
        if not work_center:
            raise HTTPException(
                status_code=404, 
                detail=f"Work center {payload.work_center_id} not found"
            )
    
    # Update operation fields
    operation.work_center_id = payload.work_center_id
    operation.description = payload.description
    operation.sequence = payload.sequence
    operation.setup_time = payload.setup_time
    operation.machine_time = payload.machine_time
    operation.labor_time = payload.labor_time
    operation.control_key = payload.control_key
    operation.updated_at = datetime.now()
    
    db.commit()
    db.refresh(operation)
    
    return operation

@router.delete("/{routing_id}")
def delete_routing(routing_id: str, db: Session = Depends(get_db)):
    """Delete a routing and all its operations"""
    
    routing = db.query(models.Routing).filter(models.Routing.routing_id == routing_id).first()
    if not routing:
        raise HTTPException(status_code=404, detail="Routing not found")
    
    # Check if routing is used by any production orders
    orders_using_routing = db.query(models.ProductionOrder).filter(
        models.ProductionOrder.routingId == routing_id
    ).count()
    
    if orders_using_routing > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete routing. {orders_using_routing} production orders are using this routing"
        )
    
    # Delete operations first
    db.query(models.Operation).filter(models.Operation.routing_id == routing_id).delete()
    
    # Delete routing
    db.delete(routing)
    db.commit()
    
    return {"message": f"Routing {routing_id} deleted successfully"}

@router.get("/material/{material_id}", response_model=List[schemas.RoutingResponse])
def get_routings_for_material(material_id: str, db: Session = Depends(get_db)):
    """Get all routings for a specific material"""
    
    # Verify material exists
    material = db.query(models.Material).filter(models.Material.materialId == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    routings = db.query(models.Routing).filter(
        models.Routing.material_id == material_id,
        models.Routing.status == models.RoutingStatus.ACTIVE
    ).all()
    
    return routings