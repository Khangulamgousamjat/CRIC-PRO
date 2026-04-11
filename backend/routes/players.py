from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Player, PlayerStats
from ..auth import get_current_admin
from pydantic import BaseModel, field_validator

router = APIRouter(prefix="/players", tags=["players"])

class PlayerBase(BaseModel):
    name: str
    role: str
    team_id: int

class PlayerCreate(PlayerBase):
    pass

class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    team_id: Optional[int] = None

    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        if v is not None:
            # Normalize: lowercase and remove spaces/hyphens
            normalized = v.lower().replace(' ', '').replace('-', '')
            valid_roles = ['batsman', 'bowler', 'allrounder', 'wicketkeeper']
            if normalized not in valid_roles:
                raise ValueError(f'Role must be one of {valid_roles}')
            return normalized
        return v

class PlayerResponse(PlayerBase):
    id: int
    class Config:
        from_attributes = True

@router.post("/", response_model=PlayerResponse)
async def create_player(player: PlayerCreate, db: Session = Depends(get_db), current_admin: str = Depends(get_current_admin)):
    db_player = Player(**player.model_dump())
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    
    # Initialize empty stats for the player
    db_stats = PlayerStats(player_id=db_player.id)
    db.add(db_stats)
    db.commit()
    
    return db_player

@router.get("/", response_model=List[PlayerResponse])
async def get_players(db: Session = Depends(get_db)):
    return db.query(Player).all()

@router.get("/{player_id}", response_model=PlayerResponse)
async def get_player(player_id: int, db: Session = Depends(get_db)):
    db_player = db.query(Player).filter(Player.id == player_id).first()
    if not db_player:
        raise HTTPException(status_code=404, detail="Player not found")
    return db_player

@router.put("/{player_id}", response_model=PlayerResponse)
async def update_player(player_id: int, player_update: PlayerUpdate, db: Session = Depends(get_db), current_admin: str = Depends(get_current_admin)):
    db_player = db.query(Player).filter(Player.id == player_id).first()
    if not db_player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    update_data = player_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_player, key, value)
    
    db.commit()
    db.refresh(db_player)
    return db_player

@router.delete("/{player_id}")
async def delete_player(player_id: int, db: Session = Depends(get_db), current_admin: str = Depends(get_current_admin)):
    db_player = db.query(Player).filter(Player.id == player_id).first()
    if not db_player:
        raise HTTPException(status_code=404, detail="Player not found")
    db.delete(db_player)
    db.commit()
    return {"message": "Player deleted"}
