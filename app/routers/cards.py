from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas, security

router = APIRouter(
    prefix="/cards",
    tags=["Cards"]
)

@router.post("/", response_model=schemas.Card)
def create_card(card: schemas.CardCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(security.get_current_user)):
    board = db.query(models.Board).filter(models.Board.id == card.board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Tablero no encontrado")
    
    db_card = models.Card(**card.dict())
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

@router.get("/", response_model=List[schemas.Card])
def read_cards(board_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(security.get_current_user)):
    cards = db.query(models.Card).filter(models.Card.board_id == board_id).all()
    return cards

@router.put("/{card_id}", response_model=schemas.Card)
def update_card(card_id: int, card_update: schemas.CardUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(security.get_current_user)):
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")

    update_data = card_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_card, key, value)

    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

@router.delete("/{card_id}")
def delete_card(card_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(security.get_current_user)):
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    db.delete(db_card)
    db.commit()
    return {"detail": "Tarjeta eliminada"}
