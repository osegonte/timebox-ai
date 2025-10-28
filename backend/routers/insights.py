from fastapi import APIRouter
from services.smart_scheduler import get_schedule_insights

router = APIRouter()

@router.get("/insights")
async def get_insights():
    """
    Get AI insights about schedule:
    - Conflicts
    - Available gaps
    - Recommendations
    """
    return get_schedule_insights()