from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import time
import logging
from sqlalchemy.exc import OperationalError
from database import Base, engine, models
from utils.websocket_manager import websocket_endpoint

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database connection retry logic
def create_tables_with_retry(max_retries=30, delay=2):
    """Create database tables with retry logic for Docker startup"""
    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting to connect to database (attempt {attempt + 1}/{max_retries})")
            models.Base.metadata.create_all(bind=engine)
            logger.info("Database tables created successfully!")
            return True
        except OperationalError as e:
            if attempt < max_retries - 1:
                logger.warning(f"Database connection failed, retrying in {delay} seconds... Error: {e}")
                time.sleep(delay)
            else:
                logger.error(f"Failed to connect to database after {max_retries} attempts")
                raise e
    return False

# Create tables with retry
create_tables_with_retry()

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