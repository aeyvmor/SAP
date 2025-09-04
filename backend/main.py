from fastapi import FastAPI
from dotenv import load_dotenv
from .database import engine
from . import models

load_dotenv()

models.Base.metadata.create_all(bind=engine)

from .routers import auth, analytics, bom, goods_movements, materials, mrp, production_orders, work_centers

app = FastAPI()

app.include_router(auth.router)
app.include_router(analytics.router)
app.include_router(bom.router)
app.include_router(goods_movements.router)
app.include_router(materials.router)
app.include_router(mrp.router)
app.include_router(production_orders.router)
app.include_router(work_centers.router)