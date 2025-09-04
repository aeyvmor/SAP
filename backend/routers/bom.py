from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models
import schemas
import database
import websocket_manager
import uuid

router = APIRouter(prefix="/api/bom", tags=["BOM"])

@router.post("")
def create_bom(payload: schemas.BOMCreate, db: Session = Depends(database.get_db)):
    if db.query(models.BOMHeader).filter(models.BOMHeader.bom_id == payload.bom_id).first():
        raise HTTPException(status_code=409, detail="BOM exists")
    bh = models.BOMHeader(bom_id=payload.bom_id, parent_material_id=payload.parent_material_id, version=payload.version)
    db.add(bh)
    for item in payload.items:
        bi = models.BOMItem(bom_item_id=str(uuid.uuid4()), bom_id=payload.bom_id, component_material_id=item.component_material_id, quantity=item.quantity, position=item.position)
        db.add(bi)
    db.commit()
    return {"message": "BOM created", "bom_id": payload.bom_id}

@router.get("/{parent_material_id}")
def get_bom(parent_material_id: str, db: Session = Depends(database.get_db)):
    headers = db.query(models.BOMHeader).filter(models.BOMHeader.parent_material_id == parent_material_id).all()
    out = []
    for h in headers:
        items = db.query(models.BOMItem).filter(models.BOMItem.bom_id == h.bom_id).all()
        out.append({"bom_id": h.bom_id, "version": h.version, "items": [{"component": i.component_material_id, "qty": i.quantity} for i in items]})
    return out
