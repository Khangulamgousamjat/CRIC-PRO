from fastapi import FastAPI
from backend.database import engine, Base
from backend.routes import auth, teams, players, matches, scoring, stats
from fastapi.middleware.cors import CORSMiddleware

# Initialize the database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CRIC PRO API", description="Cricket Tournament Management System Backend")

# --- CORS CONFIGURATION --- 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(teams.router)
app.include_router(players.router)
app.include_router(matches.router)
app.include_router(scoring.router)
app.include_router(stats.router)

@app.get("/")
async def root():
    return {"message": "Welcome to CRIC PRO API. Visit /docs for Swagger UI."}

if __name__ == "__main__":
    import uvicorn
    import os
    # For production, we use the PORT env var provided by the hosting service
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
