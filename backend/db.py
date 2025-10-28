from models.event import Event
from datetime import datetime
import uuid

# In-memory storage (will reset when server restarts)
events_store = []

def create_event(event_data: dict) -> Event:
    """Create and store a new event"""
    event = Event(
        id=str(uuid.uuid4()),
        title=event_data["title"],
        start=event_data["start"],
        end=event_data["end"],
        category=event_data["category"],
        created_at=datetime.now().isoformat()
    )
    events_store.append(event)
    print(f"✅ Event stored: {event.title} | Total events: {len(events_store)}")
    return event

def get_all_events() -> list[Event]:
    """Retrieve all stored events"""
    return events_store

def get_events_by_date_range(start_date: str, end_date: str) -> list[Event]:
    """Get events within a date range"""
    return [e for e in events_store if start_date <= e.start <= end_date]

def delete_event(event_id: str) -> bool:
    """Delete an event by ID"""
    global events_store
    initial_length = len(events_store)
    events_store = [e for e in events_store if e.id != event_id]
    return len(events_store) < initial_length

def clear_all_events():
    """Clear all events (for testing)"""
    global events_store
    events_store = []
    print("🗑️  All events cleared")