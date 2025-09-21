import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import models, schemas, get_db
import utils.websocket_manager as websocket_manager

router = APIRouter(prefix="/api/production-orders", tags=["Production Orders"])

@router.post("", response_model=schemas.ProductionOrderResponse)
def create_order(payload: schemas.ProductionOrderCreate, db: Session = Depends(get_db)):
    order_id = f"PO{uuid.uuid4().hex[:8].upper()}"
    
    # Map payload to model fields with proper enum handling
    po = models.ProductionOrder(
        orderId=order_id,
        materialId=payload.material_id,
        quantity=payload.quantity,
        dueDate=payload.due_date,
        priority=payload.priority,  # This should work now
        status=models.OrderStatus.CREATED,  # Explicit enum value
        progress=0,
        description=getattr(payload, 'description', None),
        plant=getattr(payload, 'plant', '1000'),
        costCenter=getattr(payload, 'costCenter', 'CC001')
    )
    
    db.add(po)
    db.commit()
    db.refresh(po)
    
    # notify websocket clients
    message = {"type": "order_created", "order_id": po.orderId, "material_id": po.materialId, "quantity": po.quantity, "status": po.status.value}
    # best-effort broadcast
    try:
        import asyncio
        asyncio.create_task(websocket_manager.manager.broadcast(message))
    except Exception:
        pass
    return po

@router.get("", response_model=list[schemas.ProductionOrderResponse])
def list_orders(status: str = None, db: Session = Depends(get_db)):
    q = db.query(models.ProductionOrder)
    if status:
        q = q.filter(models.ProductionOrder.status == status)
    return q.all()

@router.post("/{order_id}/release")
def release_order(order_id: str, db: Session = Depends(get_db)):
    po = db.query(models.ProductionOrder).filter(models.ProductionOrder.orderId == order_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="order not found")
    if po.status != models.OrderStatus.CREATED:
        raise HTTPException(status_code=400, detail="only CREATED orders can be released")
    po.status = models.OrderStatus.RELEASED
    db.commit()
    # TODO: Add websocket broadcast back later
    # import asyncio
    # asyncio.create_task(websocket_manager.manager.broadcast({"type": "order_released", "order_id": po.orderId, "status": po.status.value}))
    return {"order_id": po.orderId, "status": po.status.value}

@router.post("/{order_id}/confirm")
def confirm_order(order_id: str, payload: schemas.ConfirmationCreate, db: Session = Depends(get_db)):
    po = db.query(models.ProductionOrder).filter(models.ProductionOrder.orderId == order_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="order not found")
    conf = models.Confirmation(id=str(uuid.uuid4()), order_id=order_id, operation_no=payload.operation_no, yield_qty=payload.yield_qty, scrap_qty=payload.scrap_qty or 0.0, work_center_id=payload.work_center_id, start_time=payload.start_time, end_time=payload.end_time)
    db.add(conf)
    db.commit()
    # check total yield
    total_yield = sum(c.yield_qty for c in db.query(models.Confirmation).filter(models.Confirmation.order_id == order_id).all())
    if total_yield >= po.quantity:
        po.status = models.OrderStatus.COMPLETED
        db.commit()
    import asyncio
    asyncio.create_task(websocket_manager.manager.broadcast({"type": "confirmation", "order_id": order_id, "yield_total": total_yield, "order_status": po.status.value}))
    return {"message": "confirmation posted", "order_status": po.status.value}
