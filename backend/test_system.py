"""
Test script to verify SAP Manufacturing System functionality
"""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

def test_api_endpoints():
    """Test all major API endpoints"""
    print("🧪 TESTING SAP MANUFACTURING SYSTEM")
    print("=" * 50)
    
    # Test 1: Root endpoint
    print("1. Testing root endpoint...")
    response = requests.get(f"{BASE_URL}/")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    # Test 2: Health check
    print("\n2. Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    # Test 3: Create a material
    print("\n3. Testing material creation...")
    material_data = {
        "material_id": "IPHONE15PRO256",
        "description": "iPhone 15 Pro 256GB Natural Titanium",
        "type": "FINISHED",
        "unitOfMeasure": "EA",
        "unitPrice": 999.99,
        "plant": "1000",
        "storageLocation": "0001",
        "currentStock": 100,
        "minStock": 10,
        "maxStock": 1000
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/materials", json=material_data)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   ✅ Material created successfully!")
            print(f"   Response: {response.json()}")
        else:
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 4: List materials
    print("\n4. Testing material listing...")
    try:
        response = requests.get(f"{BASE_URL}/api/materials")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            materials = response.json()
            print(f"   ✅ Found {len(materials)} materials")
            for material in materials:
                print(f"   - {material.get('material_id', 'N/A')}: {material.get('description', 'N/A')}")
        else:
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 5: Create production order
    print("\n5. Testing production order creation...")
    order_data = {
        "material_id": "IPHONE15PRO256",
        "quantity": 1000,
        "due_date": (datetime.now() + timedelta(days=30)).isoformat(),
        "priority": "HIGH",
        "description": "Rush order for iPhone 15 Pro",
        "plant": "1000"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/production-orders", json=order_data)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   ✅ Production order created successfully!")
            order = response.json()
            print(f"   Order ID: {order.get('orderId', 'N/A')}")
            print(f"   Status: {order.get('status', 'N/A')}")
        else:
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 6: List production orders
    print("\n6. Testing production order listing...")
    try:
        response = requests.get(f"{BASE_URL}/api/production-orders")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            orders = response.json()
            print(f"   ✅ Found {len(orders)} production orders")
            for order in orders:
                print(f"   - {order.get('orderId', 'N/A')}: {order.get('quantity', 0)} units, Status: {order.get('status', 'N/A')}")
        else:
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 7: Analytics
    print("\n7. Testing analytics endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/analytics/metrics")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            metrics = response.json()
            print(f"   ✅ Analytics working!")
            print(f"   - Total Orders: {metrics.get('total_orders', 0)}")
            print(f"   - Active Orders: {metrics.get('active_orders', 0)}")
            print(f"   - Completed Orders: {metrics.get('completed_orders', 0)}")
        else:
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 TESTING COMPLETE!")
    print("If you see ✅ marks above, your system is working correctly!")

if __name__ == "__main__":
    test_api_endpoints()