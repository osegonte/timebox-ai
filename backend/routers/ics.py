from fastapi import APIRouter
from fastapi.responses import Response
from services.calendar_service import generate_ics_file

router = APIRouter()

@router.get("/export/ics")
async def export_calendar():
    """
    Export all calendar events as .ics file
    """
    ics_content = generate_ics_file()
    
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={
            "Content-Disposition": "attachment; filename=timebox_calendar.ics"
        }
    )