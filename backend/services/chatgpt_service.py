import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Get current date dynamically
current_date = datetime.now().strftime("%B %d, %Y")

def get_system_prompt(is_update: bool = False):
    """Generate system prompt with update instructions if needed"""
    
    base_prompt = f"""You are TimeBox AI, a helpful assistant that helps users plan their day and week.

IMPORTANT: Today's date is {current_date}. Always use the correct year when creating events.

When users describe their schedule or plans, you should:
1. Respond naturally in [REPLY] 
2. Generate structured calendar events in [ACTIONS]

Your response MUST follow this exact format:

[REPLY]
Your natural, helpful response here
[/REPLY]

[ACTIONS]
[
  {{
    "title": "Event name",
    "start": "2025-10-30T15:00:00",
    "end": "2025-10-30T16:00:00",
    "category": "work"
  }}
]
[/ACTIONS]

Rules:
- CRITICAL: Use the correct year (2025) for all dates
- Use ISO 8601 datetime format (YYYY-MM-DDTHH:MM:SS)
- If no specific time is mentioned, use reasonable defaults
- If user just chats, return empty array in ACTIONS
- Category must be one of: work, personal, health, study
- Always include both [REPLY] and [ACTIONS] sections
- Remember conversation context
- Be natural and conversational
"""

    if is_update:
        base_prompt += """
- USER IS UPDATING/MOVING AN EVENT: Use the EXACT SAME title as the existing event
- When user says "move it", "change it", "make it" - keep the same title, only change time
- This allows the system to replace the old event with the new one
"""
    
    return base_prompt

async def chat_with_gpt(user_message: str, existing_events: list = None, conversation_history: list = None, is_update: bool = False) -> dict:
    """
    Send user message to ChatGPT with calendar context and conversation history
    Returns: {"reply": str, "actions": list}
    """
    try:
        # Build context about existing events
        context = ""
        if existing_events:
            context = "\n\nCURRENT CALENDAR:\n"
            for event in existing_events:
                context += f"- {event.title}: {event.start} to {event.end} ({event.category})\n"
        
        # Get system prompt
        system_prompt = get_system_prompt(is_update)
        
        # Build messages array with history
        messages = [
            {"role": "system", "content": system_prompt + context}
        ]
        
        # Add conversation history
        if conversation_history:
            for msg in conversation_history:
                # Handle both dict and Pydantic model
                if hasattr(msg, 'role'):
                    messages.append({
                        "role": msg.role,
                        "content": msg.content
                    })
                else:
                    messages.append({
                        "role": msg.get("role", "user"),
                        "content": msg.get("content", "")
                    })
        
        # Add current message
        messages.append({"role": "user", "content": user_message})
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
        )
        
        content = response.choices[0].message.content
        
        # Parse the response - extract only the reply text (hide tags)
        reply = ""
        actions = []
        
        # Extract reply (remove tags from display)
        if "[REPLY]" in content and "[/REPLY]" in content:
            reply = content.split("[REPLY]")[1].split("[/REPLY]")[0].strip()
        else:
            # Fallback: clean up any stray tags
            reply = content.replace("[REPLY]", "").replace("[/REPLY]", "").replace("[ACTIONS]", "").replace("[/ACTIONS]", "").strip()
            # Remove JSON arrays if they leaked into reply
            if reply.startswith("[") and reply.endswith("]"):
                reply = "I've processed your request!"
        
        # Extract actions
        if "[ACTIONS]" in content and "[/ACTIONS]" in content:
            actions_str = content.split("[ACTIONS]")[1].split("[/ACTIONS]")[0].strip()
            try:
                actions = json.loads(actions_str)
            except json.JSONDecodeError as e:
                print(f"❌ Failed to parse actions: {actions_str}")
                print(f"Error: {e}")
                actions = []
        
        return {
            "reply": reply,
            "actions": actions
        }
        
    except Exception as e:
        print(f"❌ Error calling ChatGPT: {e}")
        return {
            "reply": f"Sorry, I encountered an error: {str(e)}",
            "actions": []
        }