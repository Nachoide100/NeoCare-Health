from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.models import Board, List   # 👈 IMPORTANTE
from app.security import get_password_hash, create_access_token, verify_password

router = APIRouter(tags=["Auth"])

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer","user_id": user.id}


# ✅ RUTA /auth/register CON TABLERO Y LISTAS POR DEFECTO
@router.post("/register")
def register(email: str, password: str, db: Session = Depends(get_db)):
    # 1. Verificar si el usuario ya existe
    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="El usuario ya existe")

    # 2. Crear usuario
    hashed_password = get_password_hash(password)
    new_user = models.User(email=email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 3. Crear tablero por defecto
    default_board = Board(
        name="Mi primer tablero",
        user_id=new_user.id
    )
    db.add(default_board)
    db.commit()
    db.refresh(default_board)

    # 4. Crear listas por defecto
    default_lists = [
        List(name="Por hacer", order=0, board_id=default_board.id),
        List(name="En curso", order=1, board_id=default_board.id),
        List(name="Hecho", order=2, board_id=default_board.id),
    ]

    db.add_all(default_lists)
    db.commit()

    # 5. Devolver token
    access_token = create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}


