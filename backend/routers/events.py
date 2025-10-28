from fastapi import APIRouter, HTTPException
from models.event import Event, EventCreate
import db

router = APIRouter()

@router.get("/events")
async def get_events():
    """Get all stored events"""
    events = db.get_all_events()
    return {"events": events}

@router.post("/events")
async def create_event(event: EventCreate):
    """Create a new event"""
    new_event = db.create_event(event.dict())
    return {"event": new_event, "message": "Event created successfully"}

@router.delete("/events/{event_id}")
async def delete_event(event_id: str):
    """Delete an event by ID"""
    success = db.delete_event(event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}

@router.delete("/events")
async def clear_events():
    """Clear all events (for testing)"""
    db.clear_all_events()
    return {"message": "All events cleared"}