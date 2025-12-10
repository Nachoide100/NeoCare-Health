import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Cargar el archivo .env para obtener la URL
load_dotenv()

# Obtener la URL de conexión 
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Verificación de seguridad para que no se rompa el código
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("No se ha encontrado la variable DATABASE_URL en el archivo .env")

# Crear el Motor (punto de entrada con la base de datos)
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Crear la fábrica de sesiones (SessionLocal)
# Cada instancia de 'SessionLocal' será una sesión de base de datos.
SessionLocal = sessionmaker(autocommit=False, 
                            autoflush=False, 
                            bind=engine)

# Crear la clase Base (de la que luego heredarán los modelos)
Base = declarative_base()

# 6. Obtener la db
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()