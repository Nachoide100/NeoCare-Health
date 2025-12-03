from pydantic import BaseModel, EmailStr
from typing import Optional, List

# --- ESQUEMAS USER ---
class UserBase(BaseModel): 
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserGet(UserBase):
    id: int
    is_active: bool

    class Config: 
        from_attributes = True #permite leer los datos en formato SQLAlchemy

# --- ESQUEMAS BOARD ---
class BoardBase(BaseModel):
    title: str

class BoardCreate(BoardBase):
    pass

class BoardGet(BoardBase):
    id: int
    owner_id: int

    class Config: 
        from_attributes = True

# --- ESQUEMAS TOKEN ---
class Token(BaseModel):
    access_token: str
    token_type: str