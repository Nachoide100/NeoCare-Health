"""
Módulo principal de la API de NeoCare Health.
Configura la aplicación FastAPI, CORS y las rutas de los controladores.
"""
from app.routers import labels
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importar engine y Base
from app.database import engine, Base

# Importar TODOS los modelos antes de create_all
from app.models import User
from app.routers.cards import models as card_models
from app.routers.lists import models as list_models
from app.routers.boards import models as board_models
from app.routers.worklogs import models as worklog_models

# Crear tablas en la base de datos si no existen
Base.metadata.create_all(bind=engine)

# Crear instancia de FastAPI
app = FastAPI(
    title="NeoCare Health API",
    description="API de gestión interna.",
    version="1.0.0"
)

# ---------------------------------------------------------
# ❌ ERROR ORIGINAL:
# allow_origins=["http://localhost:5176"]
# Esto bloqueaba el frontend porque tú estás usando 5173, 5174 o 5175.
# Resultado: errores CORS y "Failed to fetch".
# ---------------------------------------------------------

# ---------------------------------------------------------
# ✅ SOLUCIÓN:
# Agregar TODOS los posibles puertos donde corre tu frontend.
# Esto permite que el navegador no bloquee las peticiones.
# ---------------------------------------------------------

origins = [
    "http://localhost:5181",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5177",
    "http://127.0.0.1:5181",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:5177",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # ← AQUÍ SE ARREGLÓ EL PROBLEMA
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de Routers
from app.routers import auth, users, cards, lists, boards, worklogs, report

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(cards.router)
app.include_router(lists.router)
app.include_router(boards.router)
app.include_router(worklogs.router)
app.include_router(report.router)
app.include_router(labels.router)
# ---------------------------------------------------------
# Ruta raíz opcional (no afecta CORS ni autenticación)
# ---------------------------------------------------------
@app.get("/")
def read_root():
    """Ruta de bienvenida para verificar el estado de la API."""
    return {"message": "Bienvenidos a la API de NeoCare Health."}
