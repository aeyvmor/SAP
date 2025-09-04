from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models
import schemas
import database

router = APIRouter(prefix="/api/work-centers", tags=["Work Centers"])

@router.post("")
def create_wc(payload: schemas.WorkCenterCreate, db: Session = Depends(database.get_db)):
    if db.query(models.WorkCenter).filter(models.WorkCenter.work_center_id == payload.work_center_id).first():
        raise HTTPException(status_code=409, detail="exists")
    wc = models.WorkCenter(**payload.dict())
    db.add(wc)
    db.commit()
    return {"message": "created", "work_center_id": wc.work_center_id}

@router.get("")
def list_wcs(db: Session = Depends(database.get_db)):
    return db.query(models.WorkCenter).all()
