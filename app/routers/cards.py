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
    Crea una nueva tarjeta.
    La coloca automáticamente al final de la lista (max order + 1).
    """
    board = db.query(models.Board).filter(models.Board.id == card.board_id).first()
    if not board:
        raise HTTPException(status_code=404, detail="Tablero no encontrado")

    if board.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="No tienes permiso para crear tarjetas en este tablero"
        )

    # Lógica para calcular el nuevo 'order' (ponerla al final de la lista actual)
    last_card = db.query(models.Card).filter(
        models.Card.list_id == card.list_id
    ).order_by(models.Card.order.desc()).first()
    
    new_order = (last_card.order + 1) if last_card else 0

    try:
        db_card = models.Card(
            **card.dict(), 
            user_id=current_user.id,
            order=new_order # Asignamos el orden calculado
        )
        db.add(db_card)
        db.commit()
        db.refresh(db_card)
        return db_card
    except SQLAlchemyError as e:
        db.rollback()
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
    """Lista las tarjetas ordenadas por 'order'."""
    return db.query(models.Card).filter(
        models.Card.board_id == board_id,
        models.Card.user_id == current_user.id
    ).order_by(models.Card.order.asc()).all() # Importante: Siempre devolver ordenadas

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

# --- ENDPOINT PARA REORDENAR (DRAG & DROP) ---
@router.patch("/{card_id}/move", response_model=schemas.Card)
def move_card(
    card_id: int,
    move_data: schemas.CardMove,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """
    Mueve una tarjeta a una nueva lista o nueva posición.
    Maneja el reordenamiento automático de las tarjetas afectadas.
    """
    # 1. Obtener la tarjeta
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    # 2. Validar permiso
    if db_card.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para mover esta tarjeta")

    # 3. Validar lista destino
    target_list = db.query(models.List).filter(models.List.id == move_data.list_id).first()
    if not target_list:
        raise HTTPException(status_code=404, detail="Lista destino no encontrada")
    
    # Comprobación de seguridad: ¿La lista destino es del mismo tablero?
    if target_list.board_id != db_card.board_id:
         raise HTTPException(status_code=400, detail="No puedes mover una tarjeta a un tablero diferente")

    old_list_id = db_card.list_id
    old_order = db_card.order
    new_list_id = move_data.list_id
    new_order = move_data.order

    # Si no hay cambios reales, retornar
    if old_list_id == new_list_id and old_order == new_order:
        return db_card

    try:
        if old_list_id == new_list_id:
            # CASO A: Movimiento dentro de la misma lista
            if new_order > old_order:
                # Bajamos la tarjeta (e.g., de pos 1 a 5) -> Las intermedias suben (-1)
                db.query(models.Card).filter(
                    models.Card.list_id == old_list_id,
                    models.Card.order > old_order,
                    models.Card.order <= new_order
                ).update({"order": models.Card.order - 1}, synchronize_session=False)
            else:
                # Subimos la tarjeta (e.g., de pos 5 a 1) -> Las intermedias bajan (+1)
                db.query(models.Card).filter(
                    models.Card.list_id == old_list_id,
                    models.Card.order >= new_order,
                    models.Card.order < old_order
                ).update({"order": models.Card.order + 1}, synchronize_session=False)
        
        else:
            # CASO B: Movimiento a otra lista
            
            # 1. Cerrar el hueco en la lista origen (Shift Down a las que estaban abajo)
            db.query(models.Card).filter(
                models.Card.list_id == old_list_id,
                models.Card.order > old_order
            ).update({"order": models.Card.order - 1}, synchronize_session=False)

            # 2. Abrir hueco en la lista destino (Shift Up a las que estorban)
            db.query(models.Card).filter(
                models.Card.list_id == new_list_id,
                models.Card.order >= new_order
            ).update({"order": models.Card.order + 1}, synchronize_session=False)

        # Finalmente aplicamos el cambio a la tarjeta protagonista
        db_card.list_id = new_list_id
        db_card.order = new_order
        
        db.commit()
        db.refresh(db_card)
        return db_card

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al mover la tarjeta") from e

@router.patch("/{card_id}", response_model=schemas.Card)
def update_card(
    card_id: int,
    card_update: schemas.CardUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """Actualiza título, descripción o fecha (NO USAR PARA MOVER)."""
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    
    if db_card.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar esta tarjeta")

    update_data = card_update.dict(exclude_unset=True)
    
    # IMPORTANTE: Ignorar list_id aquí, se debe usar /move para mantener integridad del orden
    if "list_id" in update_data:
        del update_data["list_id"]

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
    """Elimina una tarjeta y reordena la lista para no dejar huecos."""
    db_card = db.query(models.Card).filter(models.Card.id == card_id).first()
    if not db_card or db_card.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")

    old_list_id = db_card.list_id
    old_order = db_card.order

    try:
        db.delete(db_card)
        
        # Cerrar el hueco que deja la tarjeta eliminada en su lista
        db.query(models.Card).filter(
            models.Card.list_id == old_list_id,
            models.Card.order > old_order
        ).update({"order": models.Card.order - 1}, synchronize_session=False)

        db.commit()
        return {"detail": "Tarjeta eliminada"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al eliminar tarjeta") from e
