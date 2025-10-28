from datetime import datetime, timedelta
import db

def detect_conflicts(events: list) -> list:
    """
    Detect overlapping events
    Returns list of conflict pairs
    """
    conflicts = []
    sorted_events = sorted(events, key=lambda x: x.start)
    
    for i in range(len(sorted_events)):
        for j in range(i + 1, len(sorted_events)):
            event1 = sorted_events[i]
            event2 = sorted_events[j]
            
            start1 = datetime.fromisoformat(event1.start)
            end1 = datetime.fromisoformat(event1.end)
            start2 = datetime.fromisoformat(event2.start)
            end2 = datetime.fromisoformat(event2.end)
            
            # Check overlap
            if start1 < end2 and start2 < end1:
                conflicts.append({
                    "event1": {"id": event1.id, "title": event1.title, "start": event1.start},
                    "event2": {"id": event2.id, "title": event2.title, "start": event2.start}
                })
    
    return conflicts

def find_gaps(events: list, date: datetime) -> list:
    """
    Find free time gaps in a day
    Returns list of available time slots
    """
    # Work hours: 8am to 6pm
    day_start = date.replace(hour=8, minute=0, second=0)
    day_end = date.replace(hour=18, minute=0, second=0)
    
    # Get events for this day
    day_events = [e for e in events if date.date() == datetime.fromisoformat(e.start).date()]
    
    if not day_events:
        return [{
            "start": day_start.isoformat(),
            "end": day_end.isoformat(),
            "duration_minutes": 600
        }]
    
    # Sort events by start time
    sorted_events = sorted(day_events, key=lambda x: x.start)
    
    gaps = []
    current_time = day_start
    
    for event in sorted_events:
        event_start = datetime.fromisoformat(event.start)
        
        if current_time < event_start:
            gap_minutes = int((event_start - current_time).total_seconds() / 60)
            if gap_minutes >= 30:  # Only report gaps of 30+ minutes
                gaps.append({
                    "start": current_time.isoformat(),
                    "end": event_start.isoformat(),
                    "duration_minutes": gap_minutes
                })
        
        event_end = datetime.fromisoformat(event.end)
        current_time = max(current_time, event_end)
    
    # Check for gap after last event
    if current_time < day_end:
        gap_minutes = int((day_end - current_time).total_seconds() / 60)
        if gap_minutes >= 30:
            gaps.append({
                "start": current_time.isoformat(),
                "end": day_end.isoformat(),
                "duration_minutes": gap_minutes
            })
    
    return gaps

def get_schedule_insights() -> dict:
    """
    Analyze entire schedule and provide insights
    """
    events = db.get_all_events()
    
    if not events:
        return {
            "total_events": 0,
            "conflicts": [],
            "upcoming_gaps": [],
            "insights": ["Your calendar is empty. Start planning!"]
        }
    
    # Detect conflicts
    conflicts = detect_conflicts(events)
    
    # Find gaps in next 7 days
    today = datetime.now()
    all_gaps = []
    for i in range(7):
        date = today + timedelta(days=i)
        gaps = find_gaps(events, date)
        for gap in gaps:
            all_gaps.append({
                "date": date.strftime("%Y-%m-%d"),
                **gap
            })
    
    # Generate insights
    insights = []
    if conflicts:
        insights.append(f"⚠️ You have {len(conflicts)} scheduling conflicts that need attention")
    
    if all_gaps:
        large_gaps = [g for g in all_gaps if g['duration_minutes'] >= 120]
        if large_gaps:
            insights.append(f"✨ You have {len(large_gaps)} blocks of 2+ hours free time this week")
    
    # Category breakdown
    category_count = {}
    for event in events:
        category_count[event.category] = category_count.get(event.category, 0) + 1
    
    most_common = max(category_count.items(), key=lambda x: x[1]) if category_count else None
    if most_common:
        insights.append(f"📊 Most scheduled: {most_common[0]} ({most_common[1]} events)")
    
    return {
        "total_events": len(events),
        "conflicts": conflicts,
        "upcoming_gaps": all_gaps[:5],  # Top 5 gaps
        "category_breakdown": category_count,
        "insights": insights if insights else ["Your schedule looks good!"]
    }