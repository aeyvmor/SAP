from faker import Faker
import random
from sqlalchemy.orm import Session
import sys
import os

# Add the app directory to the Python path so we can import from it
sys.path.append('/app/app')

from database.database import get_db, engine, Base
from database import models

fake = Faker()

# Add diagnostic logging
def check_database_setup():
    """Check if database tables exist and log diagnostic information"""
    print("=== DATABASE DIAGNOSTIC INFORMATION ===")
    
    # Check if we can connect to the database
    try:
        with engine.connect() as conn:
            print("✓ Database connection successful")
            
            # Check if tables exist
            from sqlalchemy import inspect
            inspector = inspect(engine)
            existing_tables = inspector.get_table_names()
            print(f"Existing tables in database: {existing_tables}")
            
            # Check specifically for our required tables
            required_tables = ['materials', 'production_orders', 'work_centers', 'stock_movements']
            missing_tables = [table for table in required_tables if table not in existing_tables]
            
            if missing_tables:
                print(f"❌ MISSING TABLES: {missing_tables}")
                print("This is the root cause of the 'relation does not exist' error")
                return False
            else:
                print("✓ All required tables exist")
                return True
                
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def create_tables_if_missing():
    """Create database tables if they don't exist"""
    print("Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables created successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        return False

def generate_materials():
    materials = []
    parts = [
        "A17 Pro Bionic Chip",
        "6.1-inch Super Retina XDR Display",
        "4323mAh Lithium-Ion Battery",
        "Stainless Steel Frame",
        "12MP Ultra Wide Camera",
        "Lightning Charging Port",
        "Ceramic Shield Front Cover",
        "Glass Back",
        "LiDAR Scanner",
        "Haptic Touch Engine",
        "Wi-Fi 6 Module",
        "5G mmWave Antenna",
        "Face ID Module",
        "TrueDepth Camera System",
        "Dual SIM Tray",
        "A16 Bionic Chip",
        "OLED Display Panel",
        "MagSafe Ring",
        "Titanium Alloy Frame",
        "ProMotion Display",
        "Dynamic Island Module",
        "Stereo Speaker System",
        "Nano SIM Tray",
        "eSIM Module",
        "UWB Chip",
        "Bluetooth 5.3 Module",
        "NFC Antenna",
        "Taptic Engine",
        "Dual Lens Camera System",
        "Wide Angle Lens",
        "Telephoto Lens",
        "Macro Lens",
        "Periscope Lens",
        "A15 Bionic Chip",
        "Battery Management System",
        "Wireless Charging Coil",
        "Graphene Battery",
        "Ceramic Back Cover",
        "Aluminum Alloy Frame",
        "Liquid Retina Display",
        "Mini-LED Display",
        "True Tone Display",
        "Barometer Module",
        "Gyroscope Module",
        "Accelerometer Module"
    ]
    for part in parts:
        material_id = part.replace(" ", "_").upper()
        materials.append(models.Material(
            materialId=material_id,
            description=part,
            type=models.MaterialType.RAW,
            currentStock=random.randint(50, 1000),
            minStock=random.randint(10, 50),
            maxStock=random.randint(500, 2000),
            unitOfMeasure="EA",
            unitPrice=round(random.uniform(10, 500), 2),
            status=models.StockStatus.AVAILABLE,
            plant="1000",
            storageLocation="0001"
        ))
    return materials

def generate_production_orders():
    orders = []
    products = [
        "iPhone 13 Mini",
        "iPhone 13",
        "iPhone 13 Pro",
        "iPhone 13 Pro Max",
        "iPhone 14",
        "iPhone 14 Plus",
        "iPhone 14 Pro",
        "iPhone 14 Pro Max",
        "iPhone SE (3rd Gen)",
        "iPhone 12 Mini",
        "iPhone 12",
        "iPhone 12 Pro",
        "iPhone 12 Pro Max",
        "iPhone 11",
        "iPhone 11 Pro",
        "iPhone 11 Pro Max",
        "iPhone XR",
        "iPhone XS",
        "iPhone XS Max",
        "iPhone X",
        "iPhone 8",
        "iPhone 8 Plus",
        "iPhone 7",
        "iPhone 7 Plus",
        "iPhone 6S",
        "iPhone 6S Plus",
        "iPhone 6",
        "iPhone 6 Plus",
        "iPhone 5S",
        "iPhone 5C",
        "iPhone 5",
        "iPhone 4S",
        "iPhone 4",
        "iPhone 3GS",
        "iPhone 3G",
        "iPhone (1st Gen)",
        "iPhone 15",
        "iPhone 15 Plus",
        "iPhone 15 Pro",
        "iPhone 15 Pro Max",
        "iPhone 15 Ultra",
        "iPhone 15 SE",
        "iPhone 15 Fold",
        "iPhone 15 Lite",
        "iPhone 15 Mini",
        "iPhone 15 Air",
        "iPhone 15 Dynamic",
        "iPhone 15 Edge",
        "iPhone 15 Compact",
        "iPhone 15 Max"
    ]
    for product in products:
        material_id = product.replace(" ", "_").upper()
        orders.append(models.ProductionOrder(
            orderId=fake.unique.bothify(text="PO######"),
            materialId=material_id,
            quantity=random.randint(100, 1000),
            status=random.choice([models.OrderStatus.CREATED, models.OrderStatus.IN_PROGRESS, models.OrderStatus.COMPLETED]),
            priority=random.choice([models.OrderPriority.HIGH, models.OrderPriority.MEDIUM, models.OrderPriority.LOW]),
            progress=random.randint(0, 100),
            dueDate=fake.date_between(start_date="today", end_date="+30d"),
            plant="1000",
            description=product
        ))
    return orders

def generate_work_centers():
    work_centers = []
    centers = [
        ("WC001", "Assembly Line 1", "Main iPhone assembly line", 100, 95.0),
        ("WC002", "Assembly Line 2", "Secondary iPhone assembly line", 80, 92.0),
        ("WC003", "Testing Station 1", "Quality testing and inspection", 50, 98.0),
        ("WC004", "Testing Station 2", "Final quality control", 40, 99.0),
        ("WC005", "Packaging Line 1", "Primary packaging station", 120, 90.0),
        ("WC006", "Packaging Line 2", "Secondary packaging station", 100, 88.0),
        ("WC007", "Component Prep", "Component preparation area", 60, 85.0),
        ("WC008", "Final Inspection", "Final inspection before shipping", 30, 99.5),
    ]
    
    for wc_id, name, desc, capacity, efficiency in centers:
        work_centers.append(models.WorkCenter(
            workCenterId=wc_id,
            name=name,
            description=desc,
            capacity=capacity,
            efficiency=efficiency,
            status=models.WorkCenterStatus.ACTIVE,
            costCenter="CC001",
            plant="1000"
        ))
    return work_centers

def seed_materials(db: Session):
    materials = generate_materials()
    db.add_all(materials)
    db.commit()
    print(f"Seeded {len(materials)} materials.")

def seed_production_orders(db: Session):
    orders = generate_production_orders()
    db.add_all(orders)
    db.commit()
    print(f"Seeded {len(orders)} production orders.")

def seed_work_centers(db: Session):
    work_centers = generate_work_centers()
    db.add_all(work_centers)
    db.commit()
    print(f"Seeded {len(work_centers)} work centers.")

def main():
    print("Starting database seeding process...")
    
    # First, run diagnostic checks
    if not check_database_setup():
        print("\n⚠️  Database tables are missing. Attempting to create them...")
        if not create_tables_if_missing():
            print("❌ Failed to create database tables. Exiting.")
            return
        
        # Verify tables were created
        if not check_database_setup():
            print("❌ Tables still missing after creation attempt. Exiting.")
            return
    
    print("\n=== STARTING DATA SEEDING ===")
    db = next(get_db())
    
    try:
        seed_materials(db)
        seed_production_orders(db)
        seed_work_centers(db)
        print("✓ Database seeding completed successfully!")
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()