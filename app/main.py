from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import engine, get_db
from . import models
from .routers import auth, users, cards

# Crear tablas si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NeoCare Health API",
    description="API de gestión interna.",
    version="1.0.0"
)

# Configuración CORS 
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los Routers 
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(cards.router)

@app.get("/")
def read_root():
    return {"message": "Bienvenidos a la API de NeoCare Health."}

# --- ENDPOINT SETUP PARA CREAR COLUMNAS ---
@app.post("/setup-lists")
def setup_default_lists(db: Session = Depends(get_db)):
    board = db.query(models.Board).first()
    if not board:
        return {"error": "Primero debes registrarte para tener un tablero."}
    
    if db.query(models.List).filter(models.List.board_id == board.id).count() > 0:
        return {"message": "El tablero ya tiene listas."}

    lists = [
        models.List(title="Por Hacer", position=1, board_id=board.id),
        models.List(title="En Progreso", position=2, board_id=board.id),
        models.List(title="Hecho", position=3, board_id=board.id)
    ]
    db.add_all(lists)
    db.commit()
    return {"message": "¡Columnas creadas con éxito!"}
