
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from . import models

def seed_data():
    # Create tables if they don't exist
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Create Default Routes (Including Kangra as requested)
        routes = [
            models.Route(name="Kangra Main Express", code="KNG-01", base_fee=1800.0, distance_km=15.0),
            models.Route(name="North Zone Express", code="NZ-01", base_fee=1500.0, distance_km=12.5),
            models.Route(name="South City Route", code="SC-02", base_fee=1200.0, distance_km=8.2),
            models.Route(name="East Highland", code="EH-03", base_fee=2000.0, distance_km=20.0),
        ]
        for r in routes:
            existing = db.query(models.Route).filter(models.Route.code == r.code).first()
            if not existing:
                db.add(r)
        
        # 2. Create Admin User
        admin = models.User(
            email="admin@school.com",
            full_name="System Admin",
            role=models.UserRole.ADMIN,
            password_hash="admin123" 
        )
        existing_admin = db.query(models.User).filter(models.User.email == admin.email).first()
        if not existing_admin:
            db.add(admin)
            
        db.commit()
        print("✅ Seeding completed successfully. Kangra route is now available.")
    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
