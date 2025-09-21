from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import json
import asyncio
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_info: Dict[WebSocket, Dict[str, Any]] = {}

    async def connect(self, websocket: WebSocket, client_id: str = None):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        self.connection_info[websocket] = {
            "client_id": client_id,
            "connected_at": asyncio.get_event_loop().time()
        }
        logger.info(f"WebSocket connection established. Client ID: {client_id}")
        
        # Send welcome message
        await self.send_personal_message({
            "type": "connection_established",
            "message": "Connected to SAP Manufacturing System",
            "client_id": client_id
        }, websocket)

    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            client_info = self.connection_info.pop(websocket, {})
            client_id = client_info.get("client_id", "unknown")
            logger.info(f"WebSocket connection closed. Client ID: {client_id}")

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Send a message to a specific WebSocket connection"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            self.disconnect(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast a message to all connected clients"""
        if not self.active_connections:
            logger.debug("No active connections for broadcast")
            return

        # Add timestamp to message
        message["timestamp"] = asyncio.get_event_loop().time()
        
        disconnected_connections = []
        
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except WebSocketDisconnect:
                disconnected_connections.append(connection)
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {e}")
                disconnected_connections.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected_connections:
            self.disconnect(connection)

    async def send_to_client(self, client_id: str, message: Dict[str, Any]):
        """Send a message to a specific client by ID"""
        for websocket, info in self.connection_info.items():
            if info.get("client_id") == client_id:
                await self.send_personal_message(message, websocket)
                return True
        return False

    def get_connection_count(self) -> int:
        """Get the number of active connections"""
        return len(self.active_connections)

    def get_connected_clients(self) -> List[str]:
        """Get list of connected client IDs"""
        return [info.get("client_id") for info in self.connection_info.values() if info.get("client_id")]

# Global connection manager instance
manager = ConnectionManager()

# WebSocket endpoint handler
async def websocket_endpoint(websocket: WebSocket, client_id: str = None):
    """Main WebSocket endpoint handler"""
    await manager.connect(websocket, client_id)
    try:
        while True:
            # Wait for messages from client
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                await handle_client_message(websocket, message)
            except json.JSONDecodeError:
                await manager.send_personal_message({
                    "type": "error",
                    "message": "Invalid JSON format"
                }, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

async def handle_client_message(websocket: WebSocket, message: Dict[str, Any]):
    """Handle incoming messages from clients"""
    message_type = message.get("type")
    
    if message_type == "ping":
        await manager.send_personal_message({
            "type": "pong",
            "timestamp": asyncio.get_event_loop().time()
        }, websocket)
    
    elif message_type == "subscribe":
        # Handle subscription to specific events
        topics = message.get("topics", [])
        await manager.send_personal_message({
            "type": "subscription_confirmed",
            "topics": topics
        }, websocket)
    
    elif message_type == "get_status":
        # Send current system status
        await manager.send_personal_message({
            "type": "system_status",
            "active_connections": manager.get_connection_count(),
            "connected_clients": manager.get_connected_clients()
        }, websocket)
    
    else:
        await manager.send_personal_message({
            "type": "error",
            "message": f"Unknown message type: {message_type}"
        }, websocket)

# Utility functions for broadcasting specific events
async def broadcast_production_update(order_data: Dict[str, Any]):
    """Broadcast production order updates"""
    await manager.broadcast({
        "type": "production_update",
        "data": order_data
    })

async def broadcast_material_update(material_data: Dict[str, Any]):
    """Broadcast material updates"""
    await manager.broadcast({
        "type": "material_update",
        "data": material_data
    })

async def broadcast_system_alert(alert_data: Dict[str, Any]):
    """Broadcast system alerts"""
    await manager.broadcast({
        "type": "system_alert",
        "data": alert_data,
        "priority": alert_data.get("priority", "normal")
    })