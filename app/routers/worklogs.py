"""
Módulo de rutas para la gestión de Worklogs (registro de horas).
Maneja la creación, consulta, actualización y borrado de registros de tiempo.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app import database, models, schemas, security

router = APIRouter(
    prefix="/worklogs",
    tags=["Worklogs"]
)

@router.get("/card/{card_id}", response_model=List[schemas.WorklogResponse])
def get_worklogs_by_card(
    card_id: int,
    db: Session = Depends(database.get_db),
    _current_user: models.User = Depends(security.get_current_user)
):
    """
    Obtiene todos los registros de horas asociados a una tarjeta específica.
    """
    worklogs = db.query(models.Worklog).filter(models.Worklog.card_id == card_id).all()

    # Enriquecer cada worklog con el título de la tarjeta
    result = []
    for worklog in worklogs:
        card = db.query(models.Card).filter(models.Card.id == worklog.card_id).first()
        result.append({
            "id": worklog.id,
            "card_id": worklog.card_id,
            "card_title": card.title if card else "Tarjeta desconocida",
            "date": worklog.date,
            "hours": worklog.hours,
            "note": worklog.note,
            "user_id": worklog.user_id,
            "created_at": worklog.created_at,
            "updated_at": worklog.updated_at,
        })

    return result

@router.get("/me", response_model=List[schemas.WorklogResponse])
def get_my_worklogs(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """
    Obtiene la lista de todos los registros de horas del usuario autenticado,
    incluyendo el título de la tarjeta para cada registro.
    """
    worklogs = db.query(models.Worklog).filter(models.Worklog.user_id == current_user.id).all()

    # Enriquecer cada worklog con el título de la tarjeta
    result = []
    for worklog in worklogs:
        card = db.query(models.Card).filter(models.Card.id == worklog.card_id).first()
        result.append({
            "id": worklog.id,
            "card_id": worklog.card_id,
            "card_title": card.title if card else "Tarjeta desconocida",
            "date": worklog.date,
            "hours": worklog.hours,
            "note": worklog.note,
            "user_id": worklog.user_id,
            "created_at": worklog.created_at,
            "updated_at": worklog.updated_at,
        })

    return result

@router.post("/", response_model=schemas.Worklog)
def create_worklog(
    worklog: schemas.WorklogCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """
    Crea un nuevo registro de horas vinculado al usuario actual.
    """
    try:
        db_worklog = models.Worklog(**worklog.model_dump(), user_id=current_user.id)
        db.add(db_worklog)
        db.commit()
        db.refresh(db_worklog)
        return db_worklog
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al crear registro") from exc

@router.patch("/{worklog_id}", response_model=schemas.Worklog)
def update_worklog(
    worklog_id: int,
    worklog_update: dict = Body(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """
    Actualiza un registro de horas existente si el usuario es el propietario.
    Acepta: date (YYYY-MM-DD), hours (float), note (str)
    """
    db_worklog = db.query(models.Worklog).filter(models.Worklog.id == worklog_id).first()
    if not db_worklog:
        raise HTTPException(status_code=404, detail="No encontrado")
    if db_worklog.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    try:
        # Procesar solo los campos que vienen en la solicitud
        if "date" in worklog_update and worklog_update["date"]:
            db_worklog.date = worklog_update["date"]
        if "hours" in worklog_update and worklog_update["hours"]:
            db_worklog.hours = worklog_update["hours"]
        if "note" in worklog_update:
            db_worklog.note = worklog_update["note"]
        
        db.commit()
        db.refresh(db_worklog)
        return db_worklog
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al actualizar") from exc

@router.delete("/{worklog_id}")
def delete_worklog(
    worklog_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    """
    Elimina un registro de horas si el usuario es el propietario.
    """
    db_worklog = db.query(models.Worklog).filter(models.Worklog.id == worklog_id).first()
    if not db_worklog:
        raise HTTPException(status_code=404, detail="No encontrado")
    if db_worklog.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    db.delete(db_worklog)
    db.commit()
    return {"detail": "Eliminado"}
