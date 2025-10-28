from fastapi import APIRouter, UploadFile, File
from openai import OpenAI
import os
from dotenv import load_dotenv
import base64

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

router = APIRouter()

@router.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image (like a timetable screenshot)
    Uses GPT-4 Vision to extract schedule information
    """
    try:
        # Read image
        contents = await file.read()
        
        # Convert to base64
        base64_image = base64.b64encode(contents).decode('utf-8')
        
        # Call GPT-4 Vision
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": """Analyze this image and extract any schedule/calendar information you find.
                            
Return your response in this exact format:

[REPLY]
Brief description of what you found
[/REPLY]

[ACTIONS]
[
  {
    "title": "Event name",
    "start": "2025-10-30T09:00:00",
    "end": "2025-10-30T10:00:00",
    "category": "work"
  }
]
[/ACTIONS]

Rules:
- Use 2025 as the year
- Category must be: work, personal, health, or study
- If it's a class schedule, use "study" category
- Extract ALL events you can see
- If no schedule info, return empty ACTIONS array
"""
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=2000
        )
        
        content = response.choices[0].message.content
        
        # Parse response
        reply = ""
        actions = []
        
        if "[REPLY]" in content and "[/REPLY]" in content:
            reply = content.split("[REPLY]")[1].split("[/REPLY]")[0].strip()
        
        if "[ACTIONS]" in content and "[/ACTIONS]" in content:
            import json
            actions_str = content.split("[ACTIONS]")[1].split("[/ACTIONS]")[0].strip()
            try:
                actions = json.loads(actions_str)
            except:
                actions = []
        
        return {
            "reply": reply,
            "actions": actions,
            "filename": file.filename
        }
        
    except Exception as e:
        return {
            "reply": f"Error processing image: {str(e)}",
            "actions": []
        }