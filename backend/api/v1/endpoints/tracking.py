
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ....database import get_db
from .... import models, schemas
import datetime

router = APIRouter()

@router.post("/trip/start")
def start_trip(bus_id: int, route_id: int, driver_id: int, db: Session = Depends(get_db)):
    active = db.query(models.Trip).filter(
        models.Trip.bus_id == bus_id, 
        models.Trip.status == models.TripStatus.ACTIVE
    ).first()
    if active:
        return active
    
    trip = models.Trip(bus_id=bus_id, route_id=route_id, driver_id=driver_id)
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip

@router.post("/trip/{trip_id}/end")
def end_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    trip.status = models.TripStatus.COMPLETED
    trip.end_time = datetime.datetime.utcnow()
    db.commit()
    return {"status": "success"}

@router.post("/location")
def update_location(payload: dict, db: Session = Depends(get_db)):
    loc = models.BusLocation(
        trip_id=payload['trip_id'], 
        bus_id=payload['bus_id'], 
        latitude=payload['lat'], 
        longitude=payload['lng'], 
        speed=payload.get('speed', 0)
    )
    db.add(loc)
    db.commit()
    return {"status": "success"}

@router.post("/pickup")
def log_pickup(payload: dict, db: Session = Depends(get_db)):
    log = models.PickupLog(
        trip_id=payload['trip_id'],
        student_id=payload['student_id'],
        action_type=payload['action_type'] # 'PICKED_UP' or 'DROPPED_OFF'
    )
    db.add(log)
    db.commit()
    return {"status": "success"}

@router.get("/bus/{bus_id}/live")
def get_live_location(bus_id: int, db: Session = Depends(get_db)):
    loc = db.query(models.BusLocation).filter(models.BusLocation.bus_id == bus_id).order_by(models.BusLocation.timestamp.desc()).first()
    if not loc:
        raise HTTPException(status_code=404, detail="No location found")
    return loc
