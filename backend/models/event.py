from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Event(BaseModel):
    id: Optional[str] = None
    title: str
    start: str  # ISO format: "2025-10-29T08:00:00"
    end: str
    category: str  # work, personal, health, study
    created_at: Optional[str] = None

class EventCreate(BaseModel):
    title: str
    start: str
    end: str
    category: str