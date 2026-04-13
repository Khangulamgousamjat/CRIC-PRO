import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Universal import bridge
try:
    from backend.database import engine, Base
    from backend.routes import auth, teams, players, matches, scoring, stats
except ImportError:
    try:
        from database import engine, Base
        from routes import auth, teams, players, matches, scoring, stats
    except ImportError:
        import sys
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from database import engine, Base
        from routes import auth, teams, players, matches, scoring, stats

# Initialize the database
Base.metadata.create_all(bind=engine)

# --- DEFAULT ADMIN SETUP ---
def create_default_admin():
    from database import SessionLocal
    from models import Admin
    from auth import get_password_hash
    
    db = SessionLocal()
    try:
        admin_username = "admin"
        admin_password = "Pass@123"
        hashed_password = get_password_hash(admin_password)
        
        admin = db.query(Admin).filter(Admin.username == admin_username).first()
        if admin:
            # Update existing admin to ensure it's permanent
            admin.hashed_password = hashed_password
            db.commit()
            print(f"Default admin '{admin_username}' updated with permanent password.")
        else:
            # Create new admin
            new_admin = Admin(username=admin_username, hashed_password=hashed_password)
            db.add(new_admin)
            db.commit()
            print(f"Default admin '{admin_username}' created successfully.")
    except Exception as e:
        print(f"Error creating/updating default admin: {e}")
        db.rollback()
    finally:
        db.close()

# Run admin setup
create_default_admin()

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
    return {"message": "Welcome to CRIC PRO API. Backend is fully stabilized."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

