from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from .. import database, models, schemas, security

#1. Instanciar el router
router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

# -- Endpoint de registro --
@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    #Consulta de un usuario cuyo email coincida con el que envían
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user: #Comprobación de que el email no existe aún
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    #Crear usuario y tablero por defecto
    #1. Hashear la contraseña
    hashed_pwd = security.get_password_hash(user.password)
    #2. Crear instancia del modelo User
    new_user = models.User(email=user.email, hashed_password=hashed_pwd)
    #3. Guardar en la base de datos
    db.add(new_user)
    db.commit()
    db.refresh(new_user) #recarga el new_user con el ID asignado por la DB

    #Tablero por defecto
    #1. Instanciar
    default_board = models.Board(
        title="Tablero Principal",
        owner_id = new_user.id
    )
    #2. Guardar en base de datos
    db.add(default_board)
    db.commit()

    return new_user

@router.post("/login", response_model = schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    #1. Buscar el usuario por email 
    user = db.query(models.User).filter(models.User.email == form_data.username).first()

    #2. Verificar si el usuario existe y si la contraseña es correcta
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Credenciales incorrectas", 
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    #3. Crear el token de accesoo
    access_token = security.create_access_token(data={"sub": user.email})

    #4. Devolver el token según el esquema
    return {"access_token": access_token, "token_type": "bearer"}






