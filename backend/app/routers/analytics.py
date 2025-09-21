from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import models, get_db

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/metrics")
def metrics(db: Session = Depends(get_db)):
    completed = db.query(models.ProductionOrder).filter(models.ProductionOrder.status == "COMPLETED").count()
    active = db.query(models.ProductionOrder).filter(models.ProductionOrder.status.in_(["CREATED","RELEASED","IN_PROGRESS"])).count()
    total_orders = db.query(models.ProductionOrder).count()
    return {"completed_orders": completed, "active_orders": active, "total_orders": total_orders}
