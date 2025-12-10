from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from .routers import auth, users

# 1. Crear las tablas en la Base de Datos (si no existen)
models.Base.metadata.create_all(bind=engine)

# 2. Inicializar la aplicación
app = FastAPI(
    title="NeoCare Health API",
    description="API de gestión interna.",
    version="1.0.0"
)

# 3. Configuración CORS 
origins = [
    "http://localhost:5173", # Puerto estándar de Vite
    "http://localhost:3000", # Puerto alternativo
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Incluir los Routers 
app.include_router(auth.router)
app.include_router(users.router)

# 5. Endpoint de prueba
@app.get("/")
def read_root():
    return {"message": "Bienvenidos a la API de NeoCare Health."}