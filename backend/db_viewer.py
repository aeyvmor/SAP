"""
Simple database viewer to see what's in your SAP database
"""
from sqlalchemy import create_engine, text
from config import settings
import pandas as pd

def view_database():
    """View all tables and their contents"""
    engine = create_engine(settings.database_url)
    
    print("🗄️  SAP DATABASE VIEWER")
    print("=" * 50)
    
    # Get all table names
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """))
        tables = [row[0] for row in result]
    
    print(f"📊 Found {len(tables)} tables:")
    for table in tables:
        print(f"   - {table}")
    
    print("\n" + "=" * 50)
    
    # Show contents of each table
    for table in tables:
        print(f"\n📋 TABLE: {table.upper()}")
        print("-" * 30)
        
        try:
            with engine.connect() as conn:
                result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                
                if count > 0:
                    # Show first 5 records
                    df = pd.read_sql(f"SELECT * FROM {table} LIMIT 5", conn)
                    print(f"Records: {count}")
                    print(df.to_string(index=False))
                else:
                    print("No records found")
                    
        except Exception as e:
            print(f"Error reading table: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Database view complete!")

if __name__ == "__main__":
    view_database()