"""
Comprehensive diagnostic tool for SAP Manufacturing System
"""
import requests
import json
from sqlalchemy import create_engine, text, inspect
from config import settings
import models

def diagnose_system():
    print("🔍 COMPREHENSIVE SAP SYSTEM DIAGNOSTICS")
    print("=" * 60)
    
    # 1. Database Connection Test
    print("\n1. 🗄️ DATABASE CONNECTION TEST")
    print("-" * 30)
    try:
        engine = create_engine(settings.database_url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"✅ PostgreSQL Connected: {version}")
            
            # Check tables
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            print(f"✅ Found {len(tables)} tables: {', '.join(tables)}")
            
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
    
    # 2. Model Schema Analysis
    print("\n2. 📊 MODEL SCHEMA ANALYSIS")
    print("-" * 30)
    
    # Check Material model fields
    material_fields = [column.name for column in models.Material.__table__.columns]
    print(f"Material model fields: {material_fields}")
    
    # Check ProductionOrder model fields
    po_fields = [column.name for column in models.ProductionOrder.__table__.columns]
    print(f"ProductionOrder model fields: {po_fields}")
    
    # 3. API Endpoint Tests
    print("\n3. 🌐 API ENDPOINT DIAGNOSTICS")
    print("-" * 30)
    
    base_url = "http://localhost:8000"
    
    # Test material creation with different payloads
    print("\nTesting Material Creation:")
    
    # Test 1: Current failing payload
    payload1 = {
        "material_id": "TEST001",
        "description": "Test Material",
        "type": "FINISHED",
        "unitOfMeasure": "EA",
        "unitPrice": 100.0,
        "plant": "1000",
        "storageLocation": "0001",
        "currentStock": 50,
        "minStock": 10,
        "maxStock": 500
    }
    
    try:
        response = requests.post(f"{base_url}/api/materials", json=payload1)
        print(f"Payload 1 (material_id): Status {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")
    
    # Test 2: Try with materialId
    payload2 = {
        "materialId": "TEST002",
        "description": "Test Material 2",
        "type": "FINISHED",
        "unitOfMeasure": "EA",
        "unitPrice": 100.0,
        "plant": "1000",
        "storageLocation": "0001",
        "currentStock": 50,
        "minStock": 10,
        "maxStock": 500
    }
    
    try:
        response = requests.post(f"{base_url}/api/materials", json=payload2)
        print(f"Payload 2 (materialId): Status {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")
    
    # 4. Schema Validation Test
    print("\n4. 📋 SCHEMA VALIDATION TEST")
    print("-" * 30)
    
    # Test FastAPI schema generation
    try:
        response = requests.get(f"{base_url}/openapi.json")
        if response.status_code == 200:
            openapi_spec = response.json()
            
            # Check material schema
            if 'components' in openapi_spec and 'schemas' in openapi_spec['components']:
                schemas = openapi_spec['components']['schemas']
                
                if 'MaterialCreate' in schemas:
                    material_schema = schemas['MaterialCreate']
                    print("MaterialCreate schema properties:")
                    for prop, details in material_schema.get('properties', {}).items():
                        required = prop in material_schema.get('required', [])
                        print(f"  - {prop}: {details.get('type', 'unknown')} {'(required)' if required else '(optional)'}")
                
                if 'ProductionOrderResponse' in schemas:
                    po_schema = schemas['ProductionOrderResponse']
                    print("\nProductionOrderResponse schema properties:")
                    for prop, details in po_schema.get('properties', {}).items():
                        required = prop in po_schema.get('required', [])
                        print(f"  - {prop}: {details.get('type', 'unknown')} {'(required)' if required else '(optional)'}")
            
    except Exception as e:
        print(f"Schema analysis failed: {e}")
    
    # 5. Database Content Analysis
    print("\n5. 📊 DATABASE CONTENT ANALYSIS")
    print("-" * 30)
    
    try:
        engine = create_engine(settings.database_url)
        with engine.connect() as conn:
            # Check materials table
            result = conn.execute(text("SELECT COUNT(*) FROM materials"))
            material_count = result.scalar()
            print(f"Materials in database: {material_count}")
            
            if material_count > 0:
                result = conn.execute(text("SELECT * FROM materials LIMIT 3"))
                materials = result.fetchall()
                print("Sample materials:")
                for material in materials:
                    print(f"  - ID: {material[0]}, MaterialId: {material[1]}, Description: {material[2]}")
            
            # Check production orders
            result = conn.execute(text("SELECT COUNT(*) FROM production_orders"))
            po_count = result.scalar()
            print(f"Production Orders in database: {po_count}")
            
            if po_count > 0:
                result = conn.execute(text("SELECT id, \"orderId\", \"materialId\", status, priority FROM production_orders LIMIT 3"))
                orders = result.fetchall()
                print("Sample production orders:")
                for order in orders:
                    print(f"  - ID: {order[0]}, OrderId: {order[1]}, MaterialId: {order[2]}, Status: {order[3]}, Priority: {order[4]}")
                    
    except Exception as e:
        print(f"Database content analysis failed: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 DIAGNOSTIC COMPLETE!")
    print("Review the output above to identify the exact issues.")

if __name__ == "__main__":
    diagnose_system()