from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
try:
    from backend.database import get_db
    from backend.models import Team
    from backend.auth import get_current_admin
except ImportError:
    from database import get_db
    from models import Team
    from auth import get_current_admin
from pydantic import BaseModel

router = APIRouter(prefix="/teams", tags=["teams"])

class TeamBase(BaseModel):
    name: str
    tournament_id: int

class TeamCreate(TeamBase):
    pass

class TeamResponse(TeamBase):
    id: int
    class Config:
        from_attributes = True

@router.post("/", response_model=TeamResponse)
async def create_team(team: TeamCreate, db: Session = Depends(get_db), current_admin: str = Depends(get_current_admin)):
    db_team = Team(**team.model_dump())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

@router.get("/", response_model=List[TeamResponse])
async def get_teams(db: Session = Depends(get_db)):
    return db.query(Team).all()

@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(team_id: int, db: Session = Depends(get_db)):
    db_team = db.query(Team).filter(Team.id == team_id).first()
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    return db_team

@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(team_id: int, team: TeamCreate, db: Session = Depends(get_db), current_admin: str = Depends(get_current_admin)):
    db_team = db.query(Team).filter(Team.id == team_id).first()
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    for key, value in team.model_dump().items():
        setattr(db_team, key, value)
    db.commit()
    db.refresh(db_team)
    return db_team

@router.delete("/{team_id}")
async def delete_team(team_id: int, db: Session = Depends(get_db), current_admin: str = Depends(get_current_admin)):
    db_team = db.query(Team).filter(Team.id == team_id).first()
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    db.delete(db_team)
    db.commit()
    return {"message": "Team deleted"}

