import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models
import schemas
import database
import websocket_manager

router = APIRouter(prefix="/api/goods-movements", tags=["Goods Movements"])

@router.post("/issue")
def goods_issue(payload: schemas.GoodsIssueCreate, db: Session = Depends(database.get_db)):
    po = db.query(models.ProductionOrder).filter(models.ProductionOrder.order_id == payload.order_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="order not found")
    for mv in payload.movements:
        stock = db.query(models.Stock).filter(models.Stock.material_id == mv.material_id, models.Stock.plant == mv.plant).first()
        if not stock or stock.on_hand < mv.qty:
            raise HTTPException(status_code=400, detail=f"insufficient stock for {mv.material_id}")
        stock.on_hand -= mv.qty
        gm = models.GoodsMovement(id=str(uuid.uuid4()), movement_type="ISSUE", material_id=mv.material_id, qty=mv.qty, plant=mv.plant, storage_loc=mv.storage_loc, order_id=payload.order_id)
        db.add(gm)
    db.commit()
    import asyncio
    asyncio.create_task(websocket_manager.manager.broadcast({"type": "goods_issue", "order_id": payload.order_id}))
    return {"message": "issued"}

@router.post("/receipt")
def goods_receipt(payload: schemas.GoodsReceiptCreate, db: Session = Depends(database.get_db)):
    po = db.query(models.ProductionOrder).filter(models.ProductionOrder.order_id == payload.order_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="order not found")
    stock = db.query(models.Stock).filter(models.Stock.material_id == payload.material_id, models.Stock.plant == payload.plant).first()
    if not stock:
        stock = models.Stock(id=str(uuid.uuid4()), material_id=payload.material_id, plant=payload.plant, storage_location=payload.storage_loc, on_hand=payload.qty)
        db.add(stock)
    else:
        stock.on_hand += payload.qty
    gm = models.GoodsMovement(id=str(uuid.uuid4()), movement_type="RECEIPT", material_id=payload.material_id, qty=payload.qty, plant=payload.plant, storage_loc=payload.storage_loc, order_id=payload.order_id)
    db.add(gm)
    # if qty >= order qty, mark completed
    if payload.qty >= po.quantity:
        po.status = models.OrderStatus.COMPLETED
    db.commit()
    import asyncio
    asyncio.create_task(websocket_manager.manager.broadcast({"type": "goods_receipt", "order_id": payload.order_id, "material_id": payload.material_id, "qty": payload.qty}))
    return {"message": "received", "order_status": po.status.value}
