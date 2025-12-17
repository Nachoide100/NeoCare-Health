#3. app/schemas.py
#modificado


from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# --- USER ---
class UserBase(BaseModel): 
    email: EmailStr
class UserCreate(UserBase):
    password: str
class User(UserBase):
    id: int
    is_active: bool
    class Config: from_attributes = True

# --- BOARD ---
class BoardBase(BaseModel):
    title: str
class BoardCreate(BoardBase):
    pass
class BoardGet(BoardBase):
    id: int
    owner_id: int
    class Config: from_attributes = True

# --- TOKEN ---
class Token(BaseModel):
    access_token: str
    token_type: str

# --- CARD (NUEVO) ---
class CardBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=80)
    description: Optional[str] = None
    deadline: Optional[datetime] = None

class CardCreate(CardBase):
    list_id: int
    board_id: int

class CardUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=80)
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    list_id: Optional[int] = None

class Card(CardBase):
    id: int
    list_id: int
    board_id: int
    class Config:
        from_attributes = True