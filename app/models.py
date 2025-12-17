"""
Módulo de modelos de base de datos para la aplicación NeoCare Health.
Define las tablas de Usuarios, Tableros, Listas y Tarjetas.
"""
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    """Modelo que representa a un usuario en el sistema."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    boards = relationship("Board", back_populates="owner")
    cards = relationship("Card", back_populates="user")

class Board(Base):
    """Modelo que representa un tablero de trabajo."""
    __tablename__ = "boards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="boards")
    lists = relationship("List", back_populates="board")
    cards = relationship("Card", back_populates="board", cascade="all, delete-orphan")

class List(Base):
    """Modelo que representa una columna (lista) dentro de un tablero."""
    __tablename__ = "lists"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    position = Column(Integer)
    board_id = Column(Integer, ForeignKey("boards.id"))

    board = relationship("Board", back_populates="lists")
    cards = relationship("Card", back_populates="list", cascade="all, delete-orphan")

class Card(Base):
    """Modelo que representa una tarea o tarjeta individual."""
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(80), nullable=False, index=True)
    description = Column(String, nullable=True)
    due_date = Column(Date, nullable=True)

    list_id = Column(Integer, ForeignKey("lists.id"))
    board_id = Column(Integer, ForeignKey("boards.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    # server_default asegura que la DB asigne la fecha al crear
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # onupdate asigna la fecha cada vez que se modifica la fila
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    list = relationship("List", back_populates="cards")
    board = relationship("Board", back_populates="cards")
    user = relationship("User", back_populates="cards")

# Fin de app/models.py