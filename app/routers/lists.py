from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas, security

router = APIRouter(
    prefix="/lists",
    tags=["Lists"]
)

@router.get("/", response_model=List[schemas.List])
def read_lists_for_board(board_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(security.get_current_user)):
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Tablero no encontrado")
    if board.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver las listas de este tablero")
    
    lists = db.query(models.List).filter(models.List.board_id == board_id).order_by(models.List.position).all()
    return lists
