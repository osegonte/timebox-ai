from fastapi import APIRouter
from pydantic import BaseModel
from services.chatgpt_service import chat_with_gpt
import db

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: list[Message] = []

class ChatResponse(BaseModel):
    reply: str
    actions: list = []

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Chat endpoint - Stage 4: With conversation history and smart updates
    """
    print(f"\n{'='*60}")
    print(f"📨 New message: {request.message}")
    
    # Get all existing events for context
    existing_events = db.get_all_events()
    print(f"📅 Existing events in calendar: {len(existing_events)}")
    
    # Detect if this is an update/move request
    update_keywords = ['move', 'change', 'update', 'reschedule', 'shift', 'make it', 'make that']
    is_update = any(keyword in request.message.lower() for keyword in update_keywords)
    
    # Call ChatGPT with context and history
    result = await chat_with_gpt(
        request.message, 
        existing_events,
        request.conversation_history,
        is_update=is_update
    )
    
    print(f"💬 AI Reply: {result['reply']}")
    print(f"📝 Actions to process: {len(result['actions'])} events")
    print(f"🔄 Is update request: {is_update}")
    
    # Auto-save any new events
    saved_events = []
    
    for i, action in enumerate(result["actions"]):
        try:
            print(f"   {i+1}. Processing: {action.get('title', 'Unknown')} at {action.get('start', 'Unknown')}")
            
            # If it's an update, try to find and delete the old version
            if is_update and existing_events:
                title = action.get('title', '')
                # Find events with similar title
                for old_event in existing_events:
                    if old_event.title.lower() == title.lower():
                        db.delete_event(old_event.id)
                        print(f"   🗑️  Deleted old version: {old_event.title} at {old_event.start}")
                        break
            
            # Create the new/updated event
            event = db.create_event(action)
            saved_events.append(event)
            print(f"   ✅ Saved successfully!")
            
        except Exception as e:
            print(f"   ❌ Error processing event: {e}")
    
    total_events = len(db.get_all_events())
    print(f"📊 Total events in calendar now: {total_events}")
    print(f"{'='*60}\n")
    
    return ChatResponse(
        reply=result["reply"],
        actions=saved_events
    )