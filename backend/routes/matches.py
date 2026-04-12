from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
try:
    from backend.database import get_db
    from backend.models import Match
    from backend.auth import get_current_admin
except ImportError:
    from database import get_db
    from models import Match
    from auth import get_current_admin
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/matches", tags=["matches"])

class MatchBase(BaseModel):
    team1_id: int
    team2_id: int
    venue: str
    match_date: datetime

class MatchCreate(MatchBase):
    pass

class MatchResponse(MatchBase):
    id: int
    status: str
    team1_score: int
    team1_wickets: int
    team1_overs: float
    team2_score: int
    team2_wickets: int
    team2_overs: float
    current_innings: int
    winner_id: Optional[int] = None
    team1_name: Optional[str] = None
    team2_name: Optional[str] = None
    class Config:
        from_attributes = True

@router.post("/", response_model=MatchResponse)
async def create_match(match: MatchCreate, db: Session = Depends(get_db), current_admin: str = Depends(get_current_admin)):
    db_match = Match(**match.model_dump())
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

@router.get("/", response_model=List[MatchResponse])
async def get_matches(db: Session = Depends(get_db)):
    matches = db.query(Match).all()
    for m in matches:
        m.team1_name = m.team1.name if m.team1 else "Team 1"
        m.team2_name = m.team2.name if m.team2 else "Team 2"
    return matches

@router.get("/{match_id}", response_model=MatchResponse)
async def get_match(match_id: int, db: Session = Depends(get_db)):
    db_match = db.query(Match).filter(Match.id == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    db_match.team1_name = db_match.team1.name if db_match.team1 else "Team 1"
    db_match.team2_name = db_match.team2.name if db_match.team2 else "Team 2"
    return db_match

@router.put("/{match_id}", response_model=MatchResponse)
async def update_match(match_id: int, match: MatchCreate, db: Session = Depends(get_db), current_admin: str = Depends(get_current_admin)):
    db_match = db.query(Match).filter(Match.id == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    for key, value in match.model_dump().items():
        setattr(db_match, key, value)
    db.commit()
    db.refresh(db_match)
    return db_match

@router.delete("/{match_id}")
async def delete_match(match_id: int, db: Session = Depends(get_db), current_admin: str = Depends(get_current_admin)):
    db_match = db.query(Match).filter(Match.id == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    db.delete(db_match)
    db.commit()
    return {"message": "Match deleted"}

