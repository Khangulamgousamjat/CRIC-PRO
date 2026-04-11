from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import PlayerStats, Player
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/stats", tags=["stats"])

class LeaderboardEntry(BaseModel):
    player_id: int
    name: str
    total_runs: int
    total_wickets: int
    strike_rate: float
    economy: float

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(db: Session = Depends(get_db)):
    # Fetch top 100 players ordered by runs then wickets
    top_players = db.query(PlayerStats).join(Player).order_by(PlayerStats.total_runs.desc(), PlayerStats.total_wickets.desc()).limit(100).all()
    
    leaderboard = []
    for stat in top_players:
        leaderboard.append({
            "player_id": stat.player_id,
            "name": stat.player.name,
            "total_runs": stat.total_runs,
            "total_wickets": stat.total_wickets,
            "strike_rate": stat.strike_rate,
            "economy": stat.economy
        })
    return leaderboard
