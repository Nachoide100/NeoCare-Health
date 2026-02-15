"""
Módulo de rutas para la gestión de Tarjetas (Cards).
Maneja la creación, lectura, actualización, eliminación y movimiento (Drag & Drop).
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app import database, models, schemas, security

router = APIRouter(
    prefix="/cards",
    tags=["Cards"],
)

@router.post("/", response_model=schemas.Card)
def create_card(
    card: schemas.CardCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """Crea una tarjeta y la pone al final de la lista."""
    board = db.query(models.Board).filter(models.Board.id == card.board_id).first()
    if not board:
        raise HTTPException(status_code=400, detail="Tablero no encontrado")
    if board.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para este tablero")

    last_card = (
        db.query(models.Card)
        .filter(models.Card.list_id == card.list_id)
        .order_by(models.Card.order.desc())
        .first()
    )
    new_order = (last_card.order + 1) if last_card else 0

    try:
        db_card = models.Card(
            **card.model_dump(),
            user_id=current_user.id,
            order=new_order,
        )
        db.add(db_card)
        db.commit()
        db.refresh(db_card)
        return db_card
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al crear la tarjeta")


@router.get("/", response_model=List[schemas.Card])
def read_cards(
    board_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """
    Obtiene todas las tarjetas de un tablero, ORDENADAS correctamente.
    Primero por list_id (columna), luego por order (posición dentro de la columna).
    """
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board or board.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Tablero no encontrado o sin permiso")

    return (
        db.query(models.Card)
        .filter(models.Card.board_id == board_id)
        .order_by(models.Card.list_id, models.Card.order)
        .all()
    )


@router.patch("/{card_id}", response_model=schemas.Card)
def update_card(
    card_id: int,
    card_update: schemas.CardUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """Guarda cambios en título, descripción o fecha."""
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    if db_card.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso")

    update_data = card_update.model_dump(exclude_unset=True)

    try:
        for key, value in update_data.items():
            setattr(db_card, key, value)

        db.commit()
        db.refresh(db_card)
        return db_card
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al guardar cambios")


@router.get("/{card_id}", response_model=schemas.Card)
def get_card(
    card_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")

    board = db.query(models.Board).filter(models.Board.id == db_card.board_id).first()
    if not board or board.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta tarjeta")

    return db_card


# 🟦 FUNCIÓN MOVE_CARD CORREGIDA
@router.patch("/{card_id}/move", response_model=schemas.Card)
def move_card(
    card_id: int,
    move_data: schemas.CardMove,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """
    Mueve una tarjeta entre listas o dentro de la misma lista.
    El backend recalcula automáticamente el 'order'.
    El frontend NO necesita enviar 'order'.
    """
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card or db_card.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")

    old_list_id = db_card.list_id
    new_list_id = move_data.list_id

    try:
        # 1) Quitar la tarjeta de su lista original
        old_list_cards = (
            db.query(models.Card)
            .filter(models.Card.list_id == old_list_id, models.Card.id != card_id)
            .order_by(models.Card.order)
            .all()
        )

        # Recalcular orden en lista original
        for i, card in enumerate(old_list_cards):
            card.order = i

        # 2) Insertar la tarjeta en la nueva lista al final
        new_list_cards = (
            db.query(models.Card)
            .filter(models.Card.list_id == new_list_id, models.Card.id != card_id)
            .order_by(models.Card.order)
            .all()
        )

        db_card.list_id = new_list_id
        db_card.order = len(new_list_cards)

        # 3) Guardar cambios
        db.commit()
        db.refresh(db_card)

        return db_card

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al mover la tarjeta")


@router.delete("/{card_id}")
def delete_card(
    card_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404)

    old_list_id = db_card.list_id
    old_order = db_card.order

    db.delete(db_card)
    db.query(models.Card).filter(
        models.Card.list_id == old_list_id,
        models.Card.order > old_order,
    ).update({"order": models.Card.order - 1}, synchronize_session=False)

    db.commit()

    from fastapi import Response
    return Response(status_code=204)

