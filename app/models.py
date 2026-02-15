from sqlalchemy import (
    Boolean, Column, ForeignKey, Integer, String, DateTime, Date, Float
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    boards = relationship("Board", back_populates="owner")
    cards = relationship("Card", back_populates="user")
    worklogs = relationship("Worklog", back_populates="user")

class Board(Base):
    __tablename__ = "boards"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="boards")
    lists = relationship("List", back_populates="board")
    cards = relationship("Card", back_populates="board", cascade="all, delete-orphan")

class List(Base):
    __tablename__ = "lists"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    position = Column(Integer, default=0) # Para el orden de las columnas
    board_id = Column(Integer, ForeignKey("boards.id"))
    board = relationship("Board", back_populates="lists")
    cards = relationship("Card", back_populates="list", cascade="all, delete-orphan")

class Card(Base):
    __tablename__ = "cards"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    order = Column(Integer, default=0)    # Para el orden vertical
    due_date = Column(Date, nullable=True) # 👈 Coincide con tu esquema 'date'

    list_id = Column(Integer, ForeignKey("lists.id"))
    board_id = Column(Integer, ForeignKey("boards.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    list = relationship("List", back_populates="cards")
    board = relationship("Board", back_populates="cards")
    user = relationship("User", back_populates="cards")
    worklogs = relationship("Worklog", back_populates="card", cascade="all, delete-orphan")
    labels = relationship("Label", back_populates="card", cascade="all, delete")

class Worklog(Base):
    __tablename__ = "worklogs"
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    hours = Column(Float, nullable=False)
    note = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    card = relationship("Card", back_populates="worklogs")
    user = relationship("User", back_populates="worklogs")
class Label(Base):
    __tablename__ = "labels"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id", ondelete="CASCADE"))
    name = Column(String(30), nullable=False)
    color = Column(String(20), nullable=False)

    card = relationship("Card", back_populates="labels")
