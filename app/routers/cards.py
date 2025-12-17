"""
Módulo de rutas para la gestión de Tarjetas (Cards).
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app import database, models, schemas, security

router = APIRouter(
    prefix="/cards",
    tags=["Cards"],
    redirect_slashes=False
)

@router.post("/", response_model=schemas.Card)
def create_card(
    card: schemas.CardCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """
    Crea una nueva tarjeta verificando que el tablero pertenezca al usuario.
    """
    board = db.query(models.Board).filter(models.Board.id == card.board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Tablero no encontrado")

    if board.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para crear tarjetas en este tablero"
        )

    try:
        db_card = models.Card(**card.dict(), user_id=current_user.id)
        db.add(db_card)
        db.commit()
        db.refresh(db_card)
        return db_card
    except SQLAlchemyError as e:
        db.rollback()
        # Se usa 'from e' para cumplir con la convención W0707 de Pylint
        raise HTTPException(
            status_code=500,
            detail="Error interno al guardar la tarjeta"
        ) from e

@router.get("/", response_model=List[schemas.Card])
def read_cards(
    board_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """Lista las tarjetas del usuario en un tablero."""
    return db.query(models.Card).filter(
        models.Card.board_id == board_id,
        models.Card.user_id == current_user.id
    ).all()

@router.get("/{card_id}", response_model=schemas.Card)
def read_card(
    card_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """Obtiene una tarjeta específica."""
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    if db_card.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso")
    return db_card

@router.patch("/{card_id}", response_model=schemas.Card)
def update_card(
    card_id: int,
    card_update: schemas.CardUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """Actualiza datos de una tarjeta."""
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    if db_card.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar esta tarjeta")

    update_data = card_update.dict(exclude_unset=True)
    
    # Si se está cambiando el list_id, verificar que la lista pertenezca al mismo tablero
    if "list_id" in update_data and update_data["list_id"] != db_card.list_id:
        new_list = db.query(models.List).filter(models.List.id == update_data["list_id"]).first()
        if not new_list:
            raise HTTPException(status_code=404, detail="Lista no encontrada")
        if new_list.board_id != db_card.board_id:
            raise HTTPException(
                status_code=400,
                detail="La lista seleccionada no pertenece al mismo tablero de la tarjeta"
            )

    try:
        for key, value in update_data.items():
            setattr(db_card, key, value)

        db.add(db_card)
        db.commit()
        db.refresh(db_card)
        return db_card
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error interno al actualizar la tarjeta"
        ) from e

@router.delete("/{card_id}")
def delete_card(
    card_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """Elimina una tarjeta."""
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card or db_card.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")

    db.delete(db_card)
    db.commit()
    return {"detail": "Tarjeta eliminada"}
