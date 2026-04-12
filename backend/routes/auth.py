from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Admin
from backend.auth import verify_password, create_access_token, get_password_hash
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

class AdminCreate(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == form_data.username).first()
    if not admin or not verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": admin.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Initial admin setup (for demonstration/first time)
@router.post("/setup-admin", status_code=status.HTTP_201_CREATED)
async def setup_admin(admin_data: AdminCreate, db: Session = Depends(get_db)):
    existing_admin = db.query(Admin).filter(Admin.username == admin_data.username).first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    new_admin = Admin(
        username=admin_data.username,
        hashed_password=get_password_hash(admin_data.password)
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return {"message": "Admin created successfully"}
