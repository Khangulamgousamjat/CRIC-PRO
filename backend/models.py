from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Boolean, Enum
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Tournament(Base):
    __tablename__ = "tournaments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    teams = relationship("Team", back_populates="tournament")

class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), index=True)
    tournament = relationship("Tournament", back_populates="teams")
    players = relationship("Player", back_populates="team")

class Player(Base):
    __tablename__ = "players"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(String) # Batsman, Bowler, All-rounder, Wicketkeeper
    team_id = Column(Integer, ForeignKey("teams.id"), index=True)
    team = relationship("Team", back_populates="players")
    stats = relationship("PlayerStats", back_populates="player", uselist=False)

class Match(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True, index=True)
    team1_id = Column(Integer, ForeignKey("teams.id"), index=True)
    team2_id = Column(Integer, ForeignKey("teams.id"), index=True)
    match_date = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    venue = Column(String)
    status = Column(String, default="upcoming", index=True) # upcoming, live, finished
    winner_id = Column(Integer, ForeignKey("teams.id"), nullable=True, index=True)
    
    team1 = relationship("Team", foreign_keys=[team1_id])
    team2 = relationship("Team", foreign_keys=[team2_id])
    winner = relationship("Team", foreign_keys=[winner_id])
    
    team1_score = Column(Integer, default=0)
    team1_wickets = Column(Integer, default=0)
    team1_overs = Column(Float, default=0.0)
    
    team2_score = Column(Integer, default=0)
    team2_wickets = Column(Integer, default=0)
    team2_overs = Column(Float, default=0.0)
    
    current_innings = Column(Integer, default=1) # 1 or 2
    
    balls = relationship("BallByBall", back_populates="match")

class BallByBall(Base):
    __tablename__ = "balls"
    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"), index=True)
    over_no = Column(Integer)
    ball_no = Column(Integer)
    bowler_id = Column(Integer, ForeignKey("players.id"), index=True)
    batsman_id = Column(Integer, ForeignKey("players.id"), index=True)
    non_striker_id = Column(Integer, ForeignKey("players.id"), index=True)
    runs = Column(Integer)
    is_wicket = Column(Boolean, default=False)
    wicket_type = Column(String, nullable=True)
    extra_runs = Column(Integer, default=0)
    extra_type = Column(String, nullable=True) # wide, noball, etc.
    match = relationship("Match", back_populates="balls")

class PlayerStats(Base):
    __tablename__ = "player_stats"
    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), index=True)
    matches_played = Column(Integer, default=0)
    total_runs = Column(Integer, default=0)
    total_wickets = Column(Integer, default=0)
    runs_given = Column(Integer, default=0)
    balls_faced = Column(Integer, default=0)
    balls_bowled = Column(Integer, default=0)
    fifties = Column(Integer, default=0)
    hundreds = Column(Integer, default=0)
    highest_score = Column(Integer, default=0)
    economy = Column(Float, default=0.0)
    average = Column(Float, default=0.0)
    strike_rate = Column(Float, default=0.0)
    player = relationship("Player", back_populates="stats")

