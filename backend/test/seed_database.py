from faker import Faker
import random
from sqlalchemy.orm import Session
import sys
import os
from datetime import timedelta

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
            currentStock=0,  # Set to 0 for MRP testing
            minStock=random.randint(10, 50),
            maxStock=random.randint(500, 2000),
            unitOfMeasure="EA",
            unitPrice=round(random.uniform(10, 500), 2),
            status=models.StockStatus.AVAILABLE,
            plant="1000",
            storageLocation="0001"
        ))
    
    # Add finished products as materials
    products = get_product_list()
    for product in products:
        material_id = product.replace(" ", "_").upper()
        materials.append(models.Material(
            materialId=material_id,
            description=product,
            type=models.MaterialType.FINISHED,
            currentStock=0,  # Set to 0 for MRP testing
            minStock=10,
            maxStock=100,
            unitOfMeasure="EA",
            unitPrice=round(random.uniform(500, 1500), 2),
            status=models.StockStatus.AVAILABLE,
            plant="1000",
            storageLocation="0002"  # Different storage location for finished goods
        ))
    return materials

def get_product_list():
    """Returns a list of iPhone product names"""
    return [
        "iPhone 13 Mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max",
        "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
        "iPhone SE (3rd Gen)", "iPhone 12 Mini", "iPhone 12", "iPhone 12 Pro",
        "iPhone 12 Pro Max", "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
        "iPhone XR", "iPhone XS", "iPhone XS Max", "iPhone X", "iPhone 8",
        "iPhone 8 Plus", "iPhone 7", "iPhone 7 Plus", "iPhone 6S", "iPhone 6S Plus",
        "iPhone 6", "iPhone 6 Plus", "iPhone 5S", "iPhone 5C", "iPhone 5",
        "iPhone 4S", "iPhone 4", "iPhone 3GS", "iPhone 3G", "iPhone (1st Gen)",
        "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
        "iPhone 15 Ultra", "iPhone 15 SE", "iPhone 15 Fold", "iPhone 15 Lite",
        "iPhone 15 Mini", "iPhone 15 Air", "iPhone 15 Dynamic", "iPhone 15 Edge",
        "iPhone 15 Compact", "iPhone 15 Max"
    ]

def generate_production_orders():
    orders = []
    products = get_product_list()

    # iPhone models that have routings
    routable_products = [
        "IPHONE_13_MINI", "IPHONE_13", "IPHONE_13_PRO", "IPHONE_13_PRO_MAX",
        "IPHONE_14", "IPHONE_14_PLUS", "IPHONE_14_PRO", "IPHONE_14_PRO_MAX",
        "IPHONE_15", "IPHONE_15_PLUS", "IPHONE_15_PRO", "IPHONE_15_PRO_MAX",
        "IPHONE_12", "IPHONE_12_PRO", "IPHONE_11", "IPHONE_11_PRO"
    ]

    for product in products:
        material_id = product.replace(" ", "_").upper()

        # Assign routing if this product has one
        routing_id = None
        if material_id in routable_products:
            # Find the routing index for this material
            routing_index = routable_products.index(material_id) + 1
            routing_id = f"RT{str(routing_index).zfill(3)}"

        orders.append(models.ProductionOrder(
            orderId=fake.unique.bothify(text="PO######"),
            materialId=material_id,
            quantity=random.randint(100, 1000),
            status=random.choice([models.OrderStatus.CREATED, models.OrderStatus.RELEASED, models.OrderStatus.IN_PROGRESS, models.OrderStatus.COMPLETED]),
            priority=random.choice([models.OrderPriority.HIGH, models.OrderPriority.MEDIUM, models.OrderPriority.LOW]),
            progress=random.randint(0, 100),
            dueDate=fake.date_between(start_date="today", end_date="+30d"),
            routingId=routing_id,  # Assign routing if available
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

def generate_routings():
    """Generate routings for iPhone products"""
    routings = []
    operations_data = []
    
    # Define standard iPhone production routing operations
    standard_operations = [
        ("0010", "WC007", "Component Preparation", 10, 10.0, 30.0, 20.0),
        ("0020", "WC001", "Main Assembly", 20, 15.0, 60.0, 45.0),
        ("0030", "WC003", "Quality Testing", 30, 5.0, 30.0, 15.0),
        ("0040", "WC005", "Packaging", 40, 8.0, 20.0, 25.0),
        ("0050", "WC008", "Final Inspection", 50, 3.0, 10.0, 12.0)
    ]
    
    # iPhone models that should have routings (finished products)
    iphone_models = [
        "IPHONE_13_MINI", "IPHONE_13", "IPHONE_13_PRO", "IPHONE_13_PRO_MAX",
        "IPHONE_14", "IPHONE_14_PLUS", "IPHONE_14_PRO", "IPHONE_14_PRO_MAX",
        "IPHONE_15", "IPHONE_15_PLUS", "IPHONE_15_PRO", "IPHONE_15_PRO_MAX",
        "IPHONE_12", "IPHONE_12_PRO", "IPHONE_11", "IPHONE_11_PRO"
    ]
    
    for i, material_id in enumerate(iphone_models):
        routing_id = f"RT{str(i+1).zfill(3)}"
        
        # Create routing header
        routing = models.Routing(
            routing_id=routing_id,
            material_id=material_id,
            description=f"Production routing for {material_id.replace('_', ' ')}",
            version="001",
            status=models.RoutingStatus.ACTIVE,
            plant="1000"
        )
        routings.append(routing)
        
        # Create operations for this routing
        for op_id, wc_id, desc, seq, setup, machine, labor in standard_operations:
            operation = models.Operation(
                operation_id=op_id,
                routing_id=routing_id,
                work_center_id=wc_id,
                description=desc,
                sequence=seq,
                setup_time=setup,
                machine_time=machine,
                labor_time=labor,
                status=models.OperationStatus.ACTIVE,
                control_key="PP01"
            )
            operations_data.append(operation)
    
    return routings, operations_data

def generate_operation_confirmations(db: Session):
    """Generate operation confirmations for existing production orders"""
    confirmations = []
    
    # Get all production orders and their operations
    orders = db.query(models.ProductionOrder).all()
    
    for order in orders:
        # Only create confirmations for orders that are in progress
        if order.status != models.OrderStatus.IN_PROGRESS:
            continue
            
        routing = db.query(models.Routing).filter(models.Routing.material_id == order.materialId).first()
        if not routing:
            continue
            
        operations = db.query(models.Operation).filter(models.Operation.routing_id == routing.routing_id).all()
        
        for op in operations:
            # Randomly decide whether to create a confirmation for this operation
            if random.random() < 0.7:  # 70% chance
                confirmation = models.OperationConfirmation(
                    order_id=order.orderId,
                    operation_id=op.operation_id,
                    work_center_id=op.work_center_id,
                    yield_qty=random.randint(int(order.quantity * 0.8), order.quantity),
                    scrap_qty=random.randint(0, int(order.quantity * 0.05)),
                    setup_time_actual=op.setup_time * random.uniform(0.9, 1.2),
                    machine_time_actual=op.machine_time * random.uniform(0.95, 1.3),
                    labor_time_actual=op.labor_time * random.uniform(0.9, 1.1),
                    # confirmation_text=f"Confirmation for op {op.operation_id} of order {order.orderId}",
                    # personnel_number=fake.numerify(text="########")
                )
                confirmations.append(confirmation)
                
    return confirmations

def generate_order_change_history(db: Session):
    """Generate change history for existing production orders"""
    change_history = []
    
    orders = db.query(models.ProductionOrder).all()
    
    for order in orders:
        # Create a few random change events for each order
        for _ in range(random.randint(0, 3)):
            field_changed = random.choice(["quantity", "dueDate", "priority"])
            old_value = str(getattr(order, field_changed))
            
            if field_changed == "quantity":
                new_value = str(order.quantity + random.randint(-20, 20))
            elif field_changed == "dueDate":
                new_value = str(order.dueDate + timedelta(days=random.randint(-5, 5)))
            else: # priority
                new_value = random.choice([p.value for p in models.OrderPriority if p.value != order.priority])

            change = models.OrderChangeHistory(
                order_id=order.orderId,
                field_name=field_changed,
                old_value=old_value,
                new_value=new_value,
                change_reason=fake.sentence(nb_words=4),
                changed_by="system_seed"
            )
            change_history.append(change)
            
    return change_history

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

def seed_routings(db: Session):
    routings, operations = generate_routings()
    db.add_all(routings)
    db.commit()
    db.add_all(operations)
    db.commit()
    print(f"Seeded {len(routings)} routings with {len(operations)} operations.")

def seed_operation_confirmations(db: Session):
    confirmations = generate_operation_confirmations(db)
    db.add_all(confirmations)
    db.commit()
    print(f"Seeded {len(confirmations)} operation confirmations.")

def generate_boms():
    """Generate BOMs for multiple iPhone finished products using a standard component set"""
    bom_headers = []
    bom_items = []

    # Standard components used across iPhone models (genericized for demo)
    components = [
        ("6.1-INCH_SUPER_RETINA_XDR_DISPLAY", 1.0),
        ("A17_PRO_BIONIC_CHIP", 1.0),
        ("4323MAH_LITHIUM-ION_BATTERY", 1.0),
        ("STAINLESS_STEEL_FRAME", 1.0),
        ("12MP_ULTRA_WIDE_CAMERA", 2.0),
        ("LIGHTNING_CHARGING_PORT", 1.0),
        ("CERAMIC_SHIELD_FRONT_COVER", 1.0),
        ("GLASS_BACK", 1.0),
    ]

    # Finished goods we want BOMs for (align with routings and common products)
    iphone_models = [
        "IPHONE_13_MINI", "IPHONE_13", "IPHONE_13_PRO", "IPHONE_13_PRO_MAX",
        "IPHONE_14", "IPHONE_14_PLUS", "IPHONE_14_PRO", "IPHONE_14_PRO_MAX",
        "IPHONE_15", "IPHONE_15_PLUS", "IPHONE_15_PRO", "IPHONE_15_PRO_MAX"
    ]

    for fg in iphone_models:
        bom_id = f"BOM_{fg}_001"
        header = models.BOMHeader(
            bom_id=bom_id,
            parent_material_id=fg,
            version="001"
        )
        bom_headers.append(header)

        pos = 10
        for component_id, qty in components:
            item = models.BOMItem(
                bom_item_id=f"{bom_id}_{component_id}",
                bom_id=bom_id,
                component_material_id=component_id,
                quantity=qty,
                position=pos
            )
            bom_items.append(item)
            pos += 10

    return bom_headers, bom_items

def generate_stock(db: Session):
    """Generate stock records for all materials"""
    stock_records = []

    # Get all materials
    materials = db.query(models.Material).all()

    for material in materials:
        # Create stock record for each material
        stock_record = models.Stock(
            id=f"{material.materialId}_1000_0001",  # Unique ID combining material, plant, storage
            material_id=material.materialId,
            plant=material.plant,
            storage_location=material.storageLocation,
            on_hand=float(material.currentStock),  # Now 0 for all materials
            safety_stock=float(material.minStock)  # Use min stock as safety stock
        )
        stock_records.append(stock_record)

    return stock_records

def seed_boms(db: Session):
    bom_headers, bom_items = generate_boms()
    db.add_all(bom_headers)
    db.commit()
    db.add_all(bom_items)
    db.commit()
    print(f"Seeded {len(bom_headers)} BOM headers with {len(bom_items)} BOM items.")

def seed_stock(db: Session):
    stock_records = generate_stock(db)
    db.add_all(stock_records)
    db.commit()
    print(f"Seeded {len(stock_records)} stock records.")

def seed_order_change_history(db: Session):
    change_history = generate_order_change_history(db)
    db.add_all(change_history)
    db.commit()
    print(f"Seeded {len(change_history)} order change history records.")

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
        seed_boms(db)
        seed_stock(db)
        seed_work_centers(db)
        seed_routings(db)
        # NOTE: Production orders, confirmations, and change history are NOT seeded initially
        # This allows for a clean demo where users create their own demand first
        print("✓ Database seeding completed successfully!")
        print("📝 Note: No production orders seeded - create your own demand to test MRP!")
        print("🔧 BOMs seeded - MRP will now analyze component requirements!")
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()