from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from .database import Base

#Creación de las clases (heredan de Base)
class User(Base):
    __tablename__ = "users" #Nombre de la tabla
    
    #Definición de las columnas
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True) #Para desactivar usuarios sin borrarlos

    #Relación one - to - many con boards
    boards = relationship("Board", back_populates="owner")



class Board(Base):
    __tablename__ = "boards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    
    #Relación con la tabla users
    owner_id = Column(Integer, ForeignKey("users.id"))

    #Relación one - to - many con users
    owner = relationship("User", back_populates="boards")

    #Relación one - to - many con lists
    lists = relationship("List", back_populates="board")


class List(Base): 
    __tablename__ = "lists" 

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    position = Column(Integer)  #para saber en que orden mostrarlas
    
    #Relación con la tabla boards
    board_id = Column(Integer, ForeignKey("boards.id"))

    #Relación one - to - many con boards
    board = relationship("Board", back_populates="lists")