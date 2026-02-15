import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Cargar variables del archivo .env
load_dotenv()

# Obtener la URL de la base de datos
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("No se ha encontrado la variable DATABASE_URL en el archivo .env")

# Configuración para PostgreSQL (NO SQLite)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=False
)

# Sesión de base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()

# Dependencia para obtener la sesión en los endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

