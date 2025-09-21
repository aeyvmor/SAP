from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import Base, engine, models
from utils.websocket_manager import websocket_endpoint

load_dotenv()

models.Base.metadata.create_all(bind=engine)

# Added routing router for routing/operations functionality
from routers import auth, analytics, bom, goods_movements, materials, mrp, production_orders, work_centers, routing

app = FastAPI(title="SAP Manufacturing System API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(analytics.router)
app.include_router(bom.router)
app.include_router(goods_movements.router)
app.include_router(materials.router)
app.include_router(mrp.router)
app.include_router(production_orders.router)
app.include_router(work_centers.router)
app.include_router(routing.router)

# WebSocket endpoint
@app.websocket("/ws/{client_id}")
async def websocket_endpoint_route(websocket: WebSocket, client_id: str):
    await websocket_endpoint(websocket, client_id)

@app.get("/")
def read_root():
    return {"message": "SAP Manufacturing System API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}