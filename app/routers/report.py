from typing import List, Optional
from datetime import datetime, time

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct

from app import database, models
from app.security import get_current_user
from app.services.date_utils import week_str_to_range

router = APIRouter(prefix="/report", tags=["Report"])


def week_bounds_to_datetimes(start_date, end_date):
    # start at 00:00:00, end at 23:59:59
    start_dt = datetime.combine(start_date, time.min)
    end_dt = datetime.combine(end_date, time.max)
    return start_dt, end_dt


# ============================================================
# SUMMARY
# ============================================================
@router.get("/{board_id}/summary")
def get_summary(
    board_id: int,
    week: str = Query(..., description="Formato YYYY-WW"),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Validar permisos
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board or board.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para ver este tablero")

    # Validar semana ISO
    try:
        start_date, end_date = week_str_to_range(week)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    start_dt, end_dt = week_bounds_to_datetimes(start_date, end_date)

    # Completadas (lista "Hecho")
    done_list = (
        db.query(models.List)
        .filter(models.List.board_id == board_id, models.List.title.ilike("Hecho"))
        .first()
    )

    if done_list:
        completed_q = db.query(models.Card).filter(models.Card.list_id == done_list.id)
        completed_count = (
            completed_q.filter(
                models.Card.updated_at != None,
                models.Card.updated_at >= start_dt,
                models.Card.updated_at <= end_dt,
            ).count()
        )
    else:
        completed_count = 0

    # Vencidas
    overdue_q = (
        db.query(models.Card)
        .join(models.List, models.Card.list_id == models.List.id)
        .filter(models.Card.board_id == board_id)
    )

    if done_list:
        overdue_q = overdue_q.filter(models.List.id != done_list.id)

    overdue_q = overdue_q.filter(
        models.Card.due_date != None,
        models.Card.due_date >= start_date,
        models.Card.due_date <= end_date,
    )

    overdue_count = overdue_q.count()

    # Nuevas
    new_q = (
        db.query(models.Card)
        .filter(
            models.Card.created_at != None,
            models.Card.created_at >= start_dt,
            models.Card.created_at <= end_dt,
            models.Card.board_id == board_id,
        )
    )

    new_count = new_q.count()

    # Listas cortas
    def short_list_from_query(q):
        items = []
        for c in q.limit(10).all():
            items.append(
                {
                    "id": c.id,
                    "title": c.title,
                    "responsible": c.user.email if c.user else None,
                    "state": c.list.title if c.list else None,
                }
            )
        return items

    completed_items = (
        short_list_from_query(completed_q.order_by(models.Card.updated_at.desc()))
        if done_list
        else []
    )
    overdue_items = short_list_from_query(
        overdue_q.order_by(models.Card.due_date.asc())
    )
    new_items = short_list_from_query(
        new_q.order_by(models.Card.created_at.desc())
    )

    return {
        "week": week,
        "start_date": start_date,
        "end_date": end_date,
        "completed": {"count": completed_count, "items": completed_items},
        "overdue": {"count": overdue_count, "items": overdue_items},
        "new": {"count": new_count, "items": new_items},
    }


# ============================================================
# HOURS BY USER
# ============================================================
@router.get("/{board_id}/hours-by-user")
def hours_by_user(
    board_id: int,
    week: str = Query(..., description="Formato YYYY-WW"),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Permisos
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board or board.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para ver este tablero")

    # Validar semana
    try:
        start_date, end_date = week_str_to_range(week)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    q = (
        db.query(
            models.Worklog.user_id.label("user_id"),
            func.coalesce(func.sum(models.Worklog.hours), 0).label("total_hours"),
            func.count(distinct(models.Worklog.card_id)).label("tasks_count"),
        )
        .join(models.Card, models.Worklog.card_id == models.Card.id)
        .filter(models.Card.board_id == board_id)
        .filter(models.Worklog.date >= start_date, models.Worklog.date <= end_date)
        .group_by(models.Worklog.user_id)
    )

    results = []
    for row in q.all():
        user = db.query(models.User).filter(models.User.id == row.user_id).first()
        results.append(
            {
                "user_id": row.user_id,
                "user_email": user.email if user else None,
                "total_hours": float(row.total_hours),
                "tasks_count": int(row.tasks_count),
            }
        )

    return {"week": week, "start_date": start_date, "end_date": end_date, "data": results}


# ============================================================
# HOURS BY CARD (CORREGIDO)
# ============================================================
@router.get("/{board_id}/hours-by-card")
def hours_by_card(
    board_id: int,
    week: str = Query(..., description="Formato YYYY-WW"),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
    order_desc: Optional[bool] = Query(True, description="Ordenar por horas desc"),
):
    # Permisos
    board = db.query(models.Board).filter(models.Board.id == board_id).first()
    if not board or board.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para ver este tablero")

    # Validar semana
    try:
        start_date, end_date = week_str_to_range(week)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # Agrupar por tarjeta (CORREGIDO: solo horas dentro del rango)
    q = (
        db.query(
            models.Card.id.label("card_id"),
            models.Card.title.label("title"),
            models.Card.user_id.label("responsible_id"),
            models.List.title.label("state"),
            func.coalesce(func.sum(models.Worklog.hours), 0).label("total_hours"),
        )
        .outerjoin(models.Worklog, models.Worklog.card_id == models.Card.id)
        .outerjoin(models.List, models.Card.list_id == models.List.id)
        .filter(models.Card.board_id == board_id)
        .filter(
            (models.Worklog.date == None)
            | (
                (models.Worklog.date >= start_date)
                & (models.Worklog.date <= end_date)
            )
        )
        .group_by(models.Card.id, models.Card.title, models.Card.user_id, models.List.title)
    )

    q = q.order_by(
        func.sum(models.Worklog.hours).desc()
        if order_desc
        else func.sum(models.Worklog.hours).asc()
    )

    results = []
    for row in q.all():
        user = (
            db.query(models.User)
            .filter(models.User.id == row.responsible_id)
            .first()
            if row.responsible_id
            else None
        )
        results.append(
            {
                "card_id": row.card_id,
                "title": row.title,
                "responsible": user.email if user else None,
                "state": row.state,
                "total_hours": float(row.total_hours),
            }
        )

    return {"week": week, "start_date": start_date, "end_date": end_date, "data": results}

