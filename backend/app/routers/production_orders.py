import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import models, schemas, get_db
import utils.websocket_manager as websocket_manager
from datetime import datetime

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

@router.post("/{order_id}/complete")
def complete_order(order_id: str, db: Session = Depends(get_db)):
    """
    One-click completion for demo:
    - Goods Issue: issue BOM components (reduces component stock)
    - Goods Receipt: receive finished product (increases FG stock)
    - Mark order COMPLETED, progress=100, set actualEndDate
    """
    po = db.query(models.ProductionOrder).filter(models.ProductionOrder.orderId == order_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="order not found")

    finished_mat = db.query(models.Material).filter(models.Material.materialId == po.materialId).first()
    if not finished_mat:
        raise HTTPException(status_code=404, detail=f"Finished material {po.materialId} not found")

    now = datetime.now()

    # 1) Goods Issue for BOM components (if any)
    bom_headers = db.query(models.BOMHeader).filter(models.BOMHeader.parent_material_id == po.materialId).all()
    if bom_headers:
        for bh in bom_headers:
            bom_items = db.query(models.BOMItem).filter(models.BOMItem.bom_id == bh.bom_id).all()
            for item in bom_items:
                comp_id = item.component_material_id
                issue_qty = float(item.quantity) * float(po.quantity)

                # Stock record for component
                comp_stock = db.query(models.Stock).filter(
                    models.Stock.material_id == comp_id,
                    models.Stock.plant == po.plant
                ).first()
                if not comp_stock:
                    comp_stock = models.Stock(
                        id=f"{comp_id}_{po.plant}_0001",
                        material_id=comp_id,
                        plant=po.plant,
                        storage_location="0001",
                        on_hand=0.0,
                        safety_stock=0.0
                    )
                    db.add(comp_stock)
                    db.flush()

                comp_stock.on_hand = float(comp_stock.on_hand) - issue_qty

                comp_mat = db.query(models.Material).filter(models.Material.materialId == comp_id).first()
                if comp_mat:
                    comp_mat.currentStock = int((comp_mat.currentStock or 0) - issue_qty)

                gi = models.GoodsMovement(
                    id=f"GI{uuid.uuid4().hex[:8].upper()}",
                    movement_type="ISSUE",
                    material_id=comp_id,
                    qty=issue_qty,
                    plant=po.plant,
                    storage_loc=comp_stock.storage_location,
                    order_id=po.orderId,
                    reference=f"Auto issue by complete for order {po.orderId}",
                    timestamp=now
                )
                db.add(gi)

    # 2) Goods Receipt for Finished Good
    fg_storage = finished_mat.storageLocation or "0002"
    fg_stock = db.query(models.Stock).filter(
        models.Stock.material_id == po.materialId,
        models.Stock.plant == po.plant
    ).first()
    if not fg_stock:
        fg_stock = models.Stock(
            id=f"{po.materialId}_{po.plant}_{fg_storage}",
            material_id=po.materialId,
            plant=po.plant,
            storage_location=fg_storage,
            on_hand=0.0,
            safety_stock=0.0
        )
        db.add(fg_stock)
        db.flush()

    fg_stock.on_hand = float(fg_stock.on_hand) + float(po.quantity)
    finished_mat.currentStock = int((finished_mat.currentStock or 0) + int(po.quantity))

    gr = models.GoodsMovement(
        id=f"GR{uuid.uuid4().hex[:8].upper()}",
        movement_type="RECEIPT",
        material_id=po.materialId,
        qty=float(po.quantity),
        plant=po.plant,
        storage_loc=fg_storage,
        order_id=po.orderId,
        reference=f"Auto receipt by complete for order {po.orderId}",
        timestamp=now
    )
    db.add(gr)

    # 3) Mark order completed
    po.status = models.OrderStatus.COMPLETED
    po.progress = 100
    po.actualEndDate = now
    db.commit()

    # Best-effort broadcast
    try:
        import asyncio
        asyncio.create_task(websocket_manager.manager.broadcast({
            "type": "order_completed",
            "order_id": po.orderId,
            "material_id": po.materialId,
            "quantity": po.quantity,
            "status": po.status.value
        }))
    except Exception:
        pass

    return {
        "message": "order completed",
        "order_id": po.orderId,
        "status": po.status.value
    }
