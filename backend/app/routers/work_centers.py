"""
Endpoints:
- POST /api/work-centers - Create work center
- GET /api/work-centers - List work centers
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import models, schemas, get_db

router = APIRouter(prefix="/api/work-centers", tags=["Work Centers"])

@router.post("")
def create_wc(payload: schemas.WorkCenterCreate, db: Session = Depends(get_db)):
    if db.query(models.WorkCenter).filter(models.WorkCenter.workCenterId == payload.work_center_id).first():
        raise HTTPException(status_code=409, detail="exists")
    wc = models.WorkCenter(
        workCenterId=payload.work_center_id,
        name=payload.name,
        description=payload.description,
        capacity=payload.capacity,
        efficiency=payload.efficiency,
        status=payload.status,
        costCenter=payload.costCenter,
        plant=payload.plant
    )
    db.add(wc)
    db.commit()
    return {"message": "created", "work_center_id": wc.workCenterId}

@router.get("")
def list_wcs(db: Session = Depends(get_db)):
    return db.query(models.WorkCenter).all()
