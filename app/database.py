import os
import psycopg2
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

# --- LÓGICA DE CREACIÓN DE BASE DE DATOS AUTOMÁTICA ---

# Usamos una conexión de bajo nivel (psycopg2) para crear la DB si no existe,
# ya que SQLAlchemy solo crea tablas.

# 1. Extraer detalles de conexión del string de URL para psycopg2
try:
    # Separar la parte de la base de datos para obtener el nombre
    base_url_no_db = SQLALCHEMY_DATABASE_URL.rsplit('/', 1)[0]
    db_name = SQLALCHEMY_DATABASE_URL.rsplit('/', 1)[1]
    
    # Extraer usuario y password
    # (Asumiendo que el formato es 'postgresql://user:password@host:port/...')
    user_pass = base_url_no_db.split('//')[1].split('@')[0]
    user = user_pass.split(':')[0]
    password = user_pass.split(':')[1]

    # Extraer host y puerto
    host_port = base_url_no_db.split('@')[1].split(':')[0:2]
    host = host_port[0]
    port = host_port[1]

except IndexError as e:
    raise ValueError(f"Error al parsear DATABASE_URL. Asegúrese del formato: {SQLALCHEMY_DATABASE_URL}. Error: {e}")

try:
    # 2. Nos conectamos al servidor usando la base de datos 'postgres' (que siempre existe)
    conn = psycopg2.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        dbname='postgres' # Conexión a una DB existente para crear la nueva
    )
    conn.autocommit = True
    cursor = conn.cursor()

    # 3. Comprobar si la base de datos ya existe (Método seguro para PostgreSQL)
    cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
    exists = cursor.fetchone()

    # 4. Crear la base de datos SÓLO si no existe
    if not exists:
        print(f"PostgreSQL: Creando la base de datos: {db_name}...")
        # Ejecutamos CREATE DATABASE
        cursor.execute(f"CREATE DATABASE {db_name}")
        print(f"PostgreSQL: Base de datos '{db_name}' creada exitosamente.")
    else:
        print(f"PostgreSQL: Base de datos '{db_name}' ya existe. Continuando...")
        
    # 5. Cerramos la conexión temporal
    cursor.close()
    conn.close()

except psycopg2.OperationalError as e:
    # Captura errores de conexión o autenticación
    error_message = str(e)
    if "password authentication failed for user" in error_message or "could not connect to server" in error_message:
        print("ERROR CRÍTICO DE CONEXIÓN A POSTGRESQL:")
        print(f"  Asegúrese de que el servidor PostgreSQL esté corriendo y las credenciales sean correctas ({user}:{password} en el puerto {port})")
    else:
        print(f"Error inesperado al intentar conectar y crear la base de datos: {e}")

# --- FIN DE LÓGICA DE CREACIÓN DE BASE DE DATOS AUTOMÁTICA ---


# Crear el Motor (punto de entrada con la base de datos)
# Ahora, 'neocare_db' debería existir, y SQLAlchemy puede conectarse.
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