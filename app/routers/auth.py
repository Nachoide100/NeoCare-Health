from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.models import Board, List
from app.security import (
    get_password_hash,
    create_access_token,
    verify_password
)

router = APIRouter(tags=["Auth"])


# ------------------------------------------------------------
# LOGIN FORM-DATA (NO LO USA TU FRONTEND)
# ------------------------------------------------------------
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(),
          db: Session = Depends(get_db)):

    user = db.query(models.User).filter(
        models.User.email == form_data.username
    ).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    access_token = create_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id
    }


# ------------------------------------------------------------
# LOGIN JSON (EL QUE USA TU FRONTEND)
# ------------------------------------------------------------
@router.post("/login-json")
def login_json(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email")
    password = payload.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Faltan credenciales")

    user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    access_token = create_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id
    }


# ------------------------------------------------------------
# REGISTER (CREA TABLERO Y LISTAS POR DEFECTO)
# ------------------------------------------------------------
@router.post("/register")
def register(email: str, password: str, db: Session = Depends(get_db)):

    existing_user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="El usuario ya existe")

    hashed_password = get_password_hash(password)
    new_user = models.User(email=email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Crear tablero por defecto
    default_board = Board(
        name="Mi primer tablero",
        user_id=new_user.id
    )
    db.add(default_board)
    db.commit()
    db.refresh(default_board)

    # Crear listas por defecto
    default_lists = [
        List(name="Por hacer", order=0, board_id=default_board.id),
        List(name="En curso", order=1, board_id=default_board.id),
        List(name="Hecho", order=2, board_id=default_board.id),
    ]

    db.add_all(default_lists)
    db.commit()

    access_token = create_access_token(data={"sub": new_user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": new_user.id
    }


