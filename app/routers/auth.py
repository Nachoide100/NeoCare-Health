"""
Módulo de autenticación.
Maneja el registro de usuarios, inicio de sesión y generación de tokens.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import database, models, schemas, security
from app.services.setup_service import create_default_lists

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """
    Registra un nuevo usuario y crea automáticamente su tablero principal y listas.
    """
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    hashed_pwd = security.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Crear tablero por defecto
    default_board = models.Board(title="Tablero Principal", owner_id=new_user.id)
    db.add(default_board)
    db.commit()

    # IMPORTANTE: Refrescar para obtener el ID del tablero creado
    db.refresh(default_board)

    # AUTOMATIZACIÓN: Crear listas por defecto para el nuevo tablero
    create_default_lists(db, default_board.id)

    return new_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    """
    Verifica las credenciales y devuelve un token de acceso JWT.
    """
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
