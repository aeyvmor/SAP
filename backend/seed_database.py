from faker import Faker
import random
from sqlalchemy.orm import Session
from database import get_db
import models

fake = Faker()

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
            type="RAW",
            currentStock=random.randint(50, 1000),
            minStock=random.randint(10, 50),
            maxStock=random.randint(500, 2000),
            unitOfMeasure="EA",
            unitPrice=round(random.uniform(10, 500), 2),
            status="Available",
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
            status=random.choice(["CREATED", "IN_PROGRESS", "COMPLETED"]),
            priority=random.choice(["HIGH", "MEDIUM", "LOW"]),
            progress=random.randint(0, 100),
            dueDate=fake.date_between(start_date="today", end_date="+30d"),
            plant="1000",
            description=product
        ))
    return orders

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

def main():
    db = next(get_db())
    seed_materials(db)
    seed_production_orders(db)

if __name__ == "__main__":
    main()