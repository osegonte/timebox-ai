from ics import Calendar, Event as ICSEvent
from datetime import datetime
import db

def generate_ics_file() -> str:
    """
    Generate an .ics file from all stored events
    Returns: ICS file content as string
    """
    calendar = Calendar()
    
    # Get all events from storage
    events = db.get_all_events()
    
    for event in events:
        # Create ICS event
        ics_event = ICSEvent()
        ics_event.name = event.title
        ics_event.begin = event.start
        ics_event.end = event.end
        ics_event.description = f"Category: {event.category}"
        
        # Add to calendar
        calendar.events.add(ics_event)
    
    # Return as string
    return str(calendar)