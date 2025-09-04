from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database
import uuid

router = APIRouter(prefix="/api/materials", tags=["Materials"])

@router.post("", response_model=schemas.MaterialResponse)
def create_material(payload: schemas.MaterialCreate, db: Session = Depends(database.get_db)):
    if db.query(models.Material).filter(models.Material.material_id == payload.material_id).first():
        raise HTTPException(status_code=409, detail="Material already exists")
    m = models.Material(**payload.dict())
    db.add(m)
    db.commit()
    db.refresh(m)
    return m

@router.get("", response_model=list[schemas.MaterialResponse])
def list_materials(db: Session = Depends(database.get_db)):
    return db.query(models.Material).all()

@router.get("/{material_id}", response_model=schemas.MaterialResponse)
def get_material(material_id: str, db: Session = Depends(database.get_db)):
    m = db.query(models.Material).filter(models.Material.material_id == material_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Not found")
    return m
