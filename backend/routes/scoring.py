from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
try:
    from backend.database import get_db
    from backend.models import Match, BallByBall, PlayerStats
    from backend.auth import get_current_admin
except ImportError:
    from database import get_db
    from models import Match, BallByBall, PlayerStats
    from auth import get_current_admin
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/scoring", tags=["scoring"])

class BallEntry(BaseModel):
    match_id: int
    over_no: int
    ball_no: int
    batsman_id: int
    bowler_id: int
    non_striker_id: int
    runs: int
    extra_runs: int = 0
    extra_type: Optional[str] = None
    is_wicket: bool = False
    wicket_type: Optional[str] = None

@router.post("/ball")
async def add_ball(entry: BallEntry, db: Session = Depends(get_db), current_admin: str = Depends(get_current_admin)):
    # 1. Fetch match and players
    match = db.query(Match).filter(Match.id == entry.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # 2. Add BallByBall entry
    db_ball = BallByBall(**entry.model_dump())
    db.add(db_ball)
    
    # 3. Update Match Score
    if match.current_innings == 1:
        match.team1_score += (entry.runs + entry.extra_runs)
        if entry.is_wicket:
            match.team1_wickets += 1
        # Simple over calculation (just for display)
        match.team1_overs = entry.over_no + (entry.ball_no / 6.0)
    else:
        match.team2_score += (entry.runs + entry.extra_runs)
        if entry.is_wicket:
            match.team2_wickets += 1
        match.team2_overs = entry.over_no + (entry.ball_no / 6.0)
    
    # 4. Update PlayerStats (Batsman)
    batsman_stats = db.query(PlayerStats).filter(PlayerStats.player_id == entry.batsman_id).first()
    if not batsman_stats:
        batsman_stats = PlayerStats(player_id=entry.batsman_id)
        db.add(batsman_stats)
    
    if batsman_stats:
        batsman_stats.total_runs += entry.runs
        # Wide is not counted as ball faced for batsman in some rules, but simplified here
        if entry.extra_type != "wide":
            batsman_stats.balls_faced += 1
        
        # Update strike rate
        if batsman_stats.balls_faced > 0:
            batsman_stats.strike_rate = round((batsman_stats.total_runs / batsman_stats.balls_faced) * 100, 2)
            
    # 5. Update PlayerStats (Bowler)
    bowler_stats = db.query(PlayerStats).filter(PlayerStats.player_id == entry.bowler_id).first()
    if not bowler_stats:
        bowler_stats = PlayerStats(player_id=entry.bowler_id)
        db.add(bowler_stats)

    if bowler_stats:
        if entry.is_wicket:
            bowler_stats.total_wickets += 1
        
        # Runs given by bowler (excluding leg byes and byes usually, but simplified here)
        bowler_stats.runs_given += (entry.runs + entry.extra_runs)
        
        if entry.extra_type not in ["wide", "noball"]:
            bowler_stats.balls_bowled += 1
            
        # Update economy
        if bowler_stats.balls_bowled > 0:
            overs = bowler_stats.balls_bowled / 6.0
            bowler_stats.economy = round(bowler_stats.runs_given / overs, 2)

    db.commit()
    return {"message": "Ball added and stats updated"}

@router.get("/live/{match_id}")
async def get_live_score(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    def format_overs(total_overs_float):
        overs = int(total_overs_float)
        balls = round((total_overs_float - overs) * 6)
        return f"{overs}.{balls}"

    return {
        "match_id": match.id,
        "team1_name": match.team1.name if match.team1 else "Team 1",
        "team2_name": match.team2.name if match.team2 else "Team 2",
        "team1_score": f"{match.team1_score}/{match.team1_wickets} ({format_overs(match.team1_overs)} ov)",
        "team2_score": f"{match.team2_score}/{match.team2_wickets} ({format_overs(match.team2_overs)} ov)",
        "current_innings": match.current_innings,
        "status": match.status
    }
