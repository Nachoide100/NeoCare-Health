"""
Módulo principal de la API de NeoCare Health.
Configura la aplicación FastAPI, CORS y las rutas de los controladores.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models
from app.routers import auth, users, cards, lists, boards, worklogs
from app.routers import report

# Crear tablas en la base de datos si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NeoCare Health API",
    description="API de gestión interna.",
    version="1.0.0"
)

# Configuración de CORS - DEBE SER EL PRIMER MIDDLEWARE
# Permite que el Frontend se comunique con el Backend sin bloqueos de seguridad
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de Routers (Rutas de la API)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(cards.router)
app.include_router(lists.router)
app.include_router(boards.router)
app.include_router(worklogs.router)
app.include_router(report.router)

@app.get("/")
def read_root():
    """Ruta de bienvenida para verificar el estado de la API."""
    return {"message": "Bienvenidos a la API de NeoCare Health."}
