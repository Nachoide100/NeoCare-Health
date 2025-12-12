import os
import psycopg2
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Cargar el archivo .env
load_dotenv()

# Obtener la URL de conexión 
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("No se ha encontrado la variable DATABASE_URL en el archivo .env")

# --- LÓGICA DE CREACIÓN DE BASE DE DATOS AUTOMÁTICA ---
try:
    # 1. Extraer detalles de conexión
    base_url_no_db = SQLALCHEMY_DATABASE_URL.rsplit('/', 1)[0]
    db_name = SQLALCHEMY_DATABASE_URL.rsplit('/', 1)[1]
    
    user_pass = base_url_no_db.split('//')[1].split('@')[0]
    user = user_pass.split(':')[0]
    password = user_pass.split(':')[1]

    host_port = base_url_no_db.split('@')[1].split(':')[0:2]
    host = host_port[0]
    port = host_port[1]

    # 2. Conexión temporal a 'postgres' para crear la DB propia
    conn = psycopg2.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        dbname='postgres'
    )
    conn.autocommit = True
    cursor = conn.cursor()

    # 3. Comprobar si existe
    cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
    exists = cursor.fetchone()

    # 4. Crear si no existe
    if not exists:
        print(f"PostgreSQL: Creando la base de datos: {db_name}...")
        cursor.execute(f"CREATE DATABASE {db_name}")
        print(f"PostgreSQL: Base de datos '{db_name}' creada exitosamente.")
    else:
        print(f"PostgreSQL: Base de datos '{db_name}' ya existe. Continuando...")
        
    cursor.close()
    conn.close()

except Exception as e:
    # Si falla esta parte (ej. usuario sin permisos), avisamos pero no rompemos el programa
    print(f"Nota: Verificación automática de DB omitida: {e}")

# --- FIN LÓGICA AUTOMÁTICA ---

# Crear el Motor
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Crear la fábrica de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase Base
Base = declarative_base()

# Dependencia para obtener la DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
