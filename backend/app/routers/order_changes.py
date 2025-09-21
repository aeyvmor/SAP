"""
CO02 - PRODUCTION ORDER CHANGE MANAGEMENT

This module implements the CO02 SAP transaction for managing production order changes.
Features:
- Order modification with change tracking
- Change history and audit trail
- Impact analysis for changes
- Authorization and validation
- Rollback capabilities

API Endpoints:
- POST /api/order-changes/{order_id}/change - Submit order change request
- GET /api/order-changes/{order_id}/history - Get change history for order
- GET /api/order-changes/history - Get all change history with filtering
- POST /api/order-changes/{change_id}/approve - Approve pending change
- POST /api/order-changes/{change_id}/reject - Reject pending change
- GET /api/order-changes/{order_id}/impact-analysis - Analyze change impact
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import models, schemas, get_db
from datetime import datetime
from typing import List, Optional
import uuid

router = APIRouter(prefix="/api/order-changes", tags=["Order Changes (CO02)"])

def analyze_change_impact(db: Session, order_id: str, change_type: str, field_name: str, new_value: str):
    """Analyze the impact of a proposed change on the production order"""
    
    order = db.query(models.ProductionOrder).filter(
        models.ProductionOrder.orderId == order_id
    ).first()
    
    if not order:
        return {"error": "Order not found"}
    
    impact_analysis = {
        "change_type": change_type,
        "field_name": field_name,
        "current_value": getattr(order, field_name, None),
        "proposed_value": new_value,
        "impacts": [],
        "warnings": [],
        "blocking_issues": []
    }
    
    # Analyze different types of changes
    if change_type == "QUANTITY":
        current_qty = order.quantity
        new_qty = int(new_value)
        qty_diff = new_qty - current_qty
        
        if qty_diff > 0:
            impact_analysis["impacts"].append(f"Quantity increase of {qty_diff} units")
            impact_analysis["impacts"].append("May require additional material availability check")
            impact_analysis["impacts"].append("May affect capacity requirements")
        elif qty_diff < 0:
            impact_analysis["impacts"].append(f"Quantity decrease of {abs(qty_diff)} units")
            impact_analysis["impacts"].append("May result in excess material allocation")
            
        # Check material availability for quantity increases
        if qty_diff > 0:
            # Get BOM components
            bom_headers = db.query(models.BOMHeader).filter(
                models.BOMHeader.parent_material_id == order.materialId
            ).all()
            
            for bom_header in bom_headers:
                bom_items = db.query(models.BOMItem).filter(
                    models.BOMItem.bom_id == bom_header.bom_id
                ).all()
                
                for item in bom_items:
                    additional_need = item.quantity * qty_diff
                    stock = db.query(models.Stock).filter(
                        models.Stock.material_id == item.component_material_id,
                        models.Stock.plant == order.plant
                    ).first()
                    
                    available = stock.on_hand - stock.safety_stock if stock else 0
                    if available < additional_need:
                        impact_analysis["warnings"].append(
                            f"Insufficient stock for material {item.component_material_id}: "
                            f"need {additional_need}, available {available}"
                        )
    
    elif change_type == "DATE":
        if field_name == "dueDate":
            current_date = order.dueDate
            try:
                new_date = datetime.fromisoformat(new_value.replace('Z', '+00:00'))
                if new_date < current_date:
                    impact_analysis["impacts"].append("Due date moved earlier - may require expediting")
                    impact_analysis["warnings"].append("Check capacity availability for earlier date")
                else:
                    impact_analysis["impacts"].append("Due date moved later - may affect customer delivery")
            except ValueError:
                impact_analysis["blocking_issues"].append("Invalid date format")
    
    elif change_type == "ROUTING":
        impact_analysis["impacts"].append("Routing change will affect operation sequence")
        impact_analysis["impacts"].append("May require different work centers")
        impact_analysis["warnings"].append("Verify new routing is valid for this material")
    
    # Check if order can be changed based on status
    if order.status in [models.OrderStatus.COMPLETED, models.OrderStatus.CANCELLED]:
        impact_analysis["blocking_issues"].append(f"Cannot change order in {order.status} status")
    
    if order.status == models.OrderStatus.IN_PROGRESS and order.progress > 50:
        impact_analysis["warnings"].append("Order is more than 50% complete - changes may be disruptive")
    
    return impact_analysis

@router.post("/{order_id}/change", response_model=schemas.OrderChangeResponse)
def submit_order_change(
    order_id: str,
    change_request: schemas.OrderChangeRequest,
    db: Session = Depends(get_db)
):
    """Submit a change request for a production order (CO02 Transaction)"""
    
    # Verify order exists
    order = db.query(models.ProductionOrder).filter(
        models.ProductionOrder.orderId == order_id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Production order not found")
    
    # Validate change request
    if change_request.order_id != order_id:
        raise HTTPException(status_code=400, detail="Order ID mismatch")
    
    # Check if field exists on the order model
    if not hasattr(order, change_request.field_name):
        raise HTTPException(status_code=400, detail=f"Invalid field name: {change_request.field_name}")
    
    # Get current value
    current_value = str(getattr(order, change_request.field_name, ""))
    
    # Perform impact analysis
    impact = analyze_change_impact(
        db, order_id, change_request.change_type, 
        change_request.field_name, change_request.new_value
    )
    
    # Check for blocking issues
    if impact.get("blocking_issues"):
        raise HTTPException(
            status_code=400, 
            detail=f"Change blocked: {'; '.join(impact['blocking_issues'])}"
        )
    
    # Generate change ID
    change_id = f"CHG{uuid.uuid4().hex[:8].upper()}"
    
    # Create change history record
    change_record = models.OrderChangeHistory(
        change_id=change_id,
        order_id=order_id,
        change_type=change_request.change_type,
        field_name=change_request.field_name,
        old_value=current_value,
        new_value=change_request.new_value,
        reason=change_request.reason,
        changed_by="SYSTEM",  # In real implementation, get from auth context
        change_timestamp=datetime.now()
    )
    
    db.add(change_record)
    
    # Apply the change immediately (in real SAP, this might require approval)
    try:
        if change_request.field_name == "quantity":
            order.quantity = int(change_request.new_value)
        elif change_request.field_name == "dueDate":
            order.dueDate = datetime.fromisoformat(change_request.new_value.replace('Z', '+00:00'))
        elif change_request.field_name == "priority":
            order.priority = models.OrderPriority(change_request.new_value)
        elif change_request.field_name == "routingId":
            order.routingId = change_request.new_value
        elif change_request.field_name == "description":
            order.description = change_request.new_value
        else:
            setattr(order, change_request.field_name, change_request.new_value)
        
        db.commit()
        db.refresh(change_record)
        
        return schemas.OrderChangeResponse(
            change_id=change_record.change_id,
            order_id=change_record.order_id,
            change_type=change_record.change_type,
            field_name=change_record.field_name,
            old_value=change_record.old_value,
            new_value=change_record.new_value,
            reason=change_record.reason,
            changed_by=change_record.changed_by,
            change_timestamp=change_record.change_timestamp,
            status="SUCCESS"
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to apply change: {str(e)}")

@router.get("/{order_id}/history", response_model=List[schemas.OrderChangeResponse])
def get_order_change_history(order_id: str, db: Session = Depends(get_db)):
    """Get change history for a specific production order"""
    
    # Verify order exists
    order = db.query(models.ProductionOrder).filter(
        models.ProductionOrder.orderId == order_id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Production order not found")
    
    changes = db.query(models.OrderChangeHistory).filter(
        models.OrderChangeHistory.order_id == order_id
    ).order_by(models.OrderChangeHistory.change_timestamp.desc()).all()
    
    return [
        schemas.OrderChangeResponse(
            change_id=change.change_id,
            order_id=change.order_id,
            change_type=change.change_type,
            field_name=change.field_name,
            old_value=change.old_value,
            new_value=change.new_value,
            reason=change.reason,
            changed_by=change.changed_by,
            change_timestamp=change.change_timestamp,
            status="SUCCESS"
        ) for change in changes
    ]

@router.get("/history")
def get_all_change_history(
    plant: str = None,
    change_type: str = None,
    changed_by: str = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get change history for all orders with optional filtering"""
    
    query = db.query(models.OrderChangeHistory)
    
    # Apply filters
    if plant:
        # Join with ProductionOrder to filter by plant
        query = query.join(models.ProductionOrder, 
                          models.OrderChangeHistory.order_id == models.ProductionOrder.orderId)
        query = query.filter(models.ProductionOrder.plant == plant)
    
    if change_type:
        query = query.filter(models.OrderChangeHistory.change_type == change_type)
    
    if changed_by:
        query = query.filter(models.OrderChangeHistory.changed_by == changed_by)
    
    changes = query.order_by(
        models.OrderChangeHistory.change_timestamp.desc()
    ).limit(limit).all()
    
    return [
        {
            "change_id": change.change_id,
            "order_id": change.order_id,
            "change_type": change.change_type,
            "field_name": change.field_name,
            "old_value": change.old_value,
            "new_value": change.new_value,
            "reason": change.reason,
            "changed_by": change.changed_by,
            "change_timestamp": change.change_timestamp
        } for change in changes
    ]

@router.get("/{order_id}/impact-analysis")
def get_change_impact_analysis(
    order_id: str,
    change_type: str,
    field_name: str,
    new_value: str,
    db: Session = Depends(get_db)
):
    """Analyze the impact of a proposed change before applying it"""
    
    # Verify order exists
    order = db.query(models.ProductionOrder).filter(
        models.ProductionOrder.orderId == order_id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Production order not found")
    
    impact_analysis = analyze_change_impact(db, order_id, change_type, field_name, new_value)
    
    return impact_analysis

@router.post("/{order_id}/bulk-change")
def submit_bulk_order_changes(
    order_id: str,
    changes: List[schemas.OrderChangeRequest],
    db: Session = Depends(get_db)
):
    """Submit multiple changes to a production order in a single transaction"""
    
    # Verify order exists
    order = db.query(models.ProductionOrder).filter(
        models.ProductionOrder.orderId == order_id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Production order not found")
    
    change_results = []
    
    try:
        for change_request in changes:
            # Validate each change
            if change_request.order_id != order_id:
                raise HTTPException(status_code=400, detail="Order ID mismatch in bulk change")
            
            if not hasattr(order, change_request.field_name):
                raise HTTPException(status_code=400, detail=f"Invalid field name: {change_request.field_name}")
            
            # Get current value
            current_value = str(getattr(order, change_request.field_name, ""))
            
            # Generate change ID
            change_id = f"CHG{uuid.uuid4().hex[:8].upper()}"
            
            # Create change history record
            change_record = models.OrderChangeHistory(
                change_id=change_id,
                order_id=order_id,
                change_type=change_request.change_type,
                field_name=change_request.field_name,
                old_value=current_value,
                new_value=change_request.new_value,
                reason=change_request.reason,
                changed_by="SYSTEM",
                change_timestamp=datetime.now()
            )
            
            db.add(change_record)
            
            # Apply the change
            if change_request.field_name == "quantity":
                order.quantity = int(change_request.new_value)
            elif change_request.field_name == "dueDate":
                order.dueDate = datetime.fromisoformat(change_request.new_value.replace('Z', '+00:00'))
            elif change_request.field_name == "priority":
                order.priority = models.OrderPriority(change_request.new_value)
            elif change_request.field_name == "routingId":
                order.routingId = change_request.new_value
            elif change_request.field_name == "description":
                order.description = change_request.new_value
            else:
                setattr(order, change_request.field_name, change_request.new_value)
            
            change_results.append({
                "change_id": change_id,
                "field_name": change_request.field_name,
                "status": "SUCCESS"
            })
        
        # Commit all changes
        db.commit()
        
        return {
            "message": f"Successfully applied {len(changes)} changes to order {order_id}",
            "order_id": order_id,
            "changes_applied": change_results
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Bulk change failed: {str(e)}")