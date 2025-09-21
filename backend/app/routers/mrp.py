from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import models, schemas, get_db
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/mrp", tags=["MRP"])

def explode_bom(db: Session, parent_material_id: str, qty: float, accumulator: dict):
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

@router.post("/run")
def run_mrp(payload: schemas.MRPRequest, db: Session = Depends(get_db)):
    horizon_end = datetime.utcnow() + timedelta(days=payload.planning_horizon_days or 90)
    orders = db.query(models.ProductionOrder).filter(models.ProductionOrder.due_date <= horizon_end, models.ProductionOrder.status.in_(["CREATED","RELEASED","IN_PROGRESS"])).all()
    material_reqs = {}
    for o in orders:
        material_reqs[o.material_id] = material_reqs.get(o.material_id, 0.0) + o.quantity
        explode_bom(db, o.material_id, o.quantity, material_reqs)
    procurement_plan = []
    for mat, req in material_reqs.items():
        stock = db.query(models.Stock).filter(models.Stock.material_id == mat, models.Stock.plant == payload.plant).first()
        on_hand = stock.on_hand if stock else 0.0
        safety = stock.safety_stock if stock else 0.0
        available = on_hand - safety
        if available < req:
            procurement_plan.append({"material_id": mat, "required_qty": req, "on_hand": on_hand, "shortage": req - available})
    return {"planning_horizon_days": payload.planning_horizon_days, "procurement_plan": procurement_plan}
