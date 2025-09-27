from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import models, schemas, get_db
from datetime import datetime, timedelta
from typing import List
import uuid

router = APIRouter(prefix="/api/mrp", tags=["MRP"])

def explode_bom(db: Session, parent_material_id: str, qty: float, accumulator: dict):
    """Recursively explode BOM to calculate component requirements"""
    headers = db.query(models.BOMHeader).filter(models.BOMHeader.parent_material_id == parent_material_id).all()
    if not headers:
        return accumulator
    for h in headers:
        items = db.query(models.BOMItem).filter(models.BOMItem.bom_id == h.bom_id).all()
        for it in items:
            need = it.quantity * qty
            accumulator[it.component_material_id] = accumulator.get(it.component_material_id, 0.0) + need
            explode_bom(db, it.component_material_id, need, accumulator)
    return accumulator

def create_planned_order(db: Session, material_id: str, quantity: float, due_date: datetime, plant: str, mrp_run_id: str):
    """Create a planned order for FINISHED/SEMI_FINISHED materials"""
    planned_order_id = f"PL{uuid.uuid4().hex[:8].upper()}"
    
    # Calculate start date (simple lead time calculation - can be enhanced later)
    start_date = due_date - timedelta(days=7)  # Default 7-day lead time
    
    planned_order = models.PlannedOrder(
        planned_order_id=planned_order_id,
        material_id=material_id,
        quantity=quantity,
        due_date=due_date,
        start_date=start_date,
        plant=plant,
        order_type="PP",  # Production Planning
        status="PLANNED",
        created_by_mrp_run=mrp_run_id
    )
    
    db.add(planned_order)
    return planned_order

def create_purchase_requisition(db: Session, material_id: str, quantity: float, delivery_date: datetime, plant: str, mrp_run_id: str):
    """Create a purchase requisition for RAW materials"""
    pr_number = f"PR{uuid.uuid4().hex[:8].upper()}"
    
    purchase_req = models.PurchaseRequisition(
        pr_number=pr_number,
        material_id=material_id,
        quantity=quantity,
        delivery_date=delivery_date,
        plant=plant,
        status="OPEN",
        created_by_mrp_run=mrp_run_id
    )
    
    db.add(purchase_req)
    return purchase_req

@router.post("/run", response_model=schemas.MRPRunResponse)
def run_mrp_enhanced(payload: schemas.MRPRunRequest, db: Session = Depends(get_db)):
    """Enhanced MRP Run (MD01 Transaction) - Creates planned orders and purchase requisitions"""
    
    # Generate unique MRP run ID
    mrp_run_id = f"MRP{datetime.now().strftime('%Y%m%d%H%M%S')}"
    run_timestamp = datetime.now()
    
    # Initialize counters
    materials_processed = 0
    planned_orders_created = 0
    purchase_reqs_created = 0
    exceptions = []
    
    try:
        # Calculate planning horizon
        horizon_end = datetime.utcnow() + timedelta(days=payload.planning_horizon_days or 90)
        
        # Get all production orders within planning horizon
        orders_query = db.query(models.ProductionOrder).filter(
            models.ProductionOrder.dueDate <= horizon_end,
            models.ProductionOrder.status.in_(["CREATED", "RELEASED", "IN_PROGRESS"])
        )
        
        # Apply plant filter
        if payload.plant:
            orders_query = orders_query.filter(models.ProductionOrder.plant == payload.plant)
            
        orders = orders_query.all()
        
        # Calculate material requirements
        material_reqs = {}
        for order in orders:
            material_reqs[order.materialId] = material_reqs.get(order.materialId, 0.0) + order.quantity
            explode_bom(db, order.materialId, order.quantity, material_reqs)
        
        # Filter materials if specified
        if payload.material_filter:
            material_reqs = {k: v for k, v in material_reqs.items() if k in payload.material_filter}
        
        # Process each material requirement
        for material_id, required_qty in material_reqs.items():
            try:
                materials_processed += 1
                
                # Get material master data
                material = db.query(models.Material).filter(
                    models.Material.materialId == material_id
                ).first()
                
                if not material:
                    exceptions.append(f"Material {material_id} not found in master data")
                    continue
                
                # Get current stock
                stock = db.query(models.Stock).filter(
                    models.Stock.material_id == material_id,
                    models.Stock.plant == (payload.plant or "1000")
                ).first()
                
                on_hand = stock.on_hand if stock else 0.0
                safety_stock = stock.safety_stock if stock else 0.0
                available = on_hand - safety_stock
                
                # Check if procurement is needed
                if available < required_qty:
                    shortage = required_qty - available
                    
                    # Determine procurement type based on material type
                    if material.type in [models.MaterialType.FINISHED, models.MaterialType.SEMI_FINISHED]:
                        # Create planned order for production
                        if payload.create_planned_orders:
                            due_date = horizon_end  # Simplified - use horizon end as due date
                            planned_order = create_planned_order(
                                db, material_id, shortage, due_date,
                                payload.plant or "1000", mrp_run_id
                            )
                            planned_orders_created += 1
                            
                    elif material.type == models.MaterialType.RAW:
                        # Create purchase requisition for procurement
                        if payload.create_purchase_reqs:
                            delivery_date = horizon_end - timedelta(days=3)  # Simplified lead time
                            purchase_req = create_purchase_requisition(
                                db, material_id, shortage, delivery_date,
                                payload.plant or "1000", mrp_run_id
                            )
                            purchase_reqs_created += 1
                    
                    else:
                        exceptions.append(f"Unknown material type for {material_id}: {material.type}")
                        
            except Exception as e:
                exceptions.append(f"Error processing material {material_id}: {str(e)}")
                continue
        
        # Commit all changes
        db.commit()
        
        return schemas.MRPRunResponse(
            run_id=mrp_run_id,
            planning_horizon_days=payload.planning_horizon_days or 90,
            plant=payload.plant or "1000",
            materials_processed=materials_processed,
            planned_orders_created=planned_orders_created,
            purchase_reqs_created=purchase_reqs_created,
            exceptions=exceptions,
            run_timestamp=run_timestamp
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"MRP run failed: {str(e)}")

# Legacy endpoint for backward compatibility
@router.post("/run-legacy")
def run_mrp_legacy(payload: schemas.MRPRequest, db: Session = Depends(get_db)):
    """Legacy MRP run for backward compatibility"""
    horizon_end = datetime.utcnow() + timedelta(days=payload.planning_horizon_days or 90)
    orders = db.query(models.ProductionOrder).filter(
        models.ProductionOrder.dueDate <= horizon_end,
        models.ProductionOrder.status.in_(["CREATED","RELEASED","IN_PROGRESS"])
    ).all()
    material_reqs = {}
    for o in orders:
        material_reqs[o.materialId] = material_reqs.get(o.materialId, 0.0) + o.quantity
        explode_bom(db, o.materialId, o.quantity, material_reqs)
    procurement_plan = []
    for mat, req in material_reqs.items():
        stock = db.query(models.Stock).filter(
            models.Stock.material_id == mat,
            models.Stock.plant == (payload.plant or "1000")
        ).first()
        on_hand = stock.on_hand if stock else 0.0
        safety = stock.safety_stock if stock else 0.0
        available = on_hand - safety
        if available < req:
            procurement_plan.append({
                "material_id": mat,
                "required_qty": req,
                "on_hand": on_hand,
                "shortage": req - available
            })
    return {"planning_horizon_days": payload.planning_horizon_days, "procurement_plan": procurement_plan}

@router.get("/planned-orders", response_model=List[schemas.PlannedOrderResponse])
def get_planned_orders(
    plant: str = None,
    material_id: str = None,
    mrp_run_id: str = None,
    status: str = None,
    db: Session = Depends(get_db)
):
    """Get planned orders with optional filtering"""
    query = db.query(models.PlannedOrder)
    
    if plant:
        query = query.filter(models.PlannedOrder.plant == plant)
    if material_id:
        query = query.filter(models.PlannedOrder.material_id == material_id)
    if mrp_run_id:
        query = query.filter(models.PlannedOrder.created_by_mrp_run == mrp_run_id)
    if status:
        query = query.filter(models.PlannedOrder.status == status)
    
    return query.order_by(models.PlannedOrder.due_date).all()

@router.get("/purchase-requisitions", response_model=List[schemas.PurchaseRequisitionResponse])
def get_purchase_requisitions(
    plant: str = None,
    material_id: str = None,
    mrp_run_id: str = None,
    status: str = None,
    db: Session = Depends(get_db)
):
    """Get purchase requisitions with optional filtering"""
    query = db.query(models.PurchaseRequisition)
    
    if plant:
        query = query.filter(models.PurchaseRequisition.plant == plant)
    if material_id:
        query = query.filter(models.PurchaseRequisition.material_id == material_id)
    if mrp_run_id:
        query = query.filter(models.PurchaseRequisition.created_by_mrp_run == mrp_run_id)
    if status:
        query = query.filter(models.PurchaseRequisition.status == status)
    
    return query.order_by(models.PurchaseRequisition.delivery_date).all()

@router.post("/planned-orders/{planned_order_id}/convert")
def convert_planned_order_to_production_order(
    planned_order_id: str,
    db: Session = Depends(get_db)
):
    """Convert a planned order to a production order"""
    planned_order = db.query(models.PlannedOrder).filter(
        models.PlannedOrder.planned_order_id == planned_order_id
    ).first()
    
    if not planned_order:
        raise HTTPException(status_code=404, detail="Planned order not found")
    
    if planned_order.status != "PLANNED":
        raise HTTPException(status_code=400, detail="Only PLANNED orders can be converted")
    
    # Create production order
    production_order_id = f"PO{uuid.uuid4().hex[:8].upper()}"
    
    production_order = models.ProductionOrder(
        orderId=production_order_id,
        materialId=planned_order.material_id,
        quantity=int(planned_order.quantity),
        dueDate=planned_order.due_date,
        plannedStartDate=planned_order.start_date,
        status=models.OrderStatus.CREATED,
        priority=models.OrderPriority.MEDIUM,
        progress=0,
        plant=planned_order.plant,
        costCenter="CC001",
        description=f"Converted from planned order {planned_order_id}"
    )
    
    db.add(production_order)
    
    # Update planned order status
    planned_order.status = "CONVERTED"
    
    db.commit()
    
    return {
        "message": "Planned order converted successfully",
        "planned_order_id": planned_order_id,
        "production_order_id": production_order_id
    }

@router.get("/runs/history")
def get_mrp_run_history(
    plant: str = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get MRP run history by analyzing created planned orders and purchase requisitions"""
    
    # Get unique MRP run IDs from planned orders and purchase requisitions
    planned_order_runs = db.query(
        models.PlannedOrder.created_by_mrp_run,
        models.PlannedOrder.plant,
        models.PlannedOrder.created_at
    ).filter(
        models.PlannedOrder.created_by_mrp_run.isnot(None)
    ).distinct().all()
    
    purchase_req_runs = db.query(
        models.PurchaseRequisition.created_by_mrp_run,
        models.PurchaseRequisition.plant,
        models.PurchaseRequisition.created_at
    ).filter(
        models.PurchaseRequisition.created_by_mrp_run.isnot(None)
    ).distinct().all()
    
    # Combine and deduplicate runs
    all_runs = {}
    
    for run_id, run_plant, created_at in planned_order_runs:
        if run_id not in all_runs:
            all_runs[run_id] = {
                "run_id": run_id,
                "plant": run_plant,
                "run_timestamp": created_at,
                "planned_orders_created": 0,
                "purchase_reqs_created": 0
            }
    
    for run_id, run_plant, created_at in purchase_req_runs:
        if run_id not in all_runs:
            all_runs[run_id] = {
                "run_id": run_id,
                "plant": run_plant,
                "run_timestamp": created_at,
                "planned_orders_created": 0,
                "purchase_reqs_created": 0
            }
    
    # Count planned orders and purchase reqs for each run
    for run_id in all_runs.keys():
        planned_count = db.query(models.PlannedOrder).filter(
            models.PlannedOrder.created_by_mrp_run == run_id
        ).count()
        
        purchase_count = db.query(models.PurchaseRequisition).filter(
            models.PurchaseRequisition.created_by_mrp_run == run_id
        ).count()
        
        all_runs[run_id]["planned_orders_created"] = planned_count
        all_runs[run_id]["purchase_reqs_created"] = purchase_count
    
    # Filter by plant if specified
    if plant:
        all_runs = {k: v for k, v in all_runs.items() if v["plant"] == plant}
    
    # Sort by timestamp and limit
    sorted_runs = sorted(all_runs.values(), key=lambda x: x["run_timestamp"], reverse=True)
    
    return sorted_runs[:limit]

@router.get("/runs/{run_id}")
def get_mrp_run_details(run_id: str, db: Session = Depends(get_db)):
    """Get detailed information about a specific MRP run"""
    
    # Get planned orders for this run
    planned_orders = db.query(models.PlannedOrder).filter(
        models.PlannedOrder.created_by_mrp_run == run_id
    ).all()
    
    # Get purchase requisitions for this run
    purchase_reqs = db.query(models.PurchaseRequisition).filter(
        models.PurchaseRequisition.created_by_mrp_run == run_id
    ).all()
    
    if not planned_orders and not purchase_reqs:
        raise HTTPException(status_code=404, detail="MRP run not found")
    
    # Calculate summary statistics
    total_planned_orders = len(planned_orders)
    total_purchase_reqs = len(purchase_reqs)
    total_planned_qty = sum(po.quantity for po in planned_orders)
    total_purchase_qty = sum(pr.quantity for pr in purchase_reqs)
    
    # Get run timestamp from first record
    run_timestamp = planned_orders[0].created_at if planned_orders else purchase_reqs[0].created_at
    plant = planned_orders[0].plant if planned_orders else purchase_reqs[0].plant
    
    return {
        "run_id": run_id,
        "plant": plant,
        "run_timestamp": run_timestamp,
        "summary": {
            "planned_orders_created": total_planned_orders,
            "purchase_reqs_created": total_purchase_reqs,
            "total_planned_quantity": total_planned_qty,
            "total_purchase_quantity": total_purchase_qty
        },
        "planned_orders": [
            {
                "planned_order_id": po.planned_order_id,
                "material_id": po.material_id,
                "quantity": po.quantity,
                "due_date": po.due_date,
                "status": po.status
            } for po in planned_orders
        ],
        "purchase_requisitions": [
            {
                "pr_number": pr.pr_number,
                "material_id": pr.material_id,
                "quantity": pr.quantity,
                "delivery_date": pr.delivery_date,
                "status": pr.status
            } for pr in purchase_reqs
        ]
    }
