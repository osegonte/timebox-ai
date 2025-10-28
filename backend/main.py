from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, events, ics, upload, insights

app = FastAPI(title="TimeBox API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(events.router, prefix="/api", tags=["events"])
app.include_router(ics.router, prefix="/api", tags=["export"])
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(insights.router, prefix="/api", tags=["insights"])

@app.get("/")
def read_root():
    return {"message": "TimeBox API is running", "status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}