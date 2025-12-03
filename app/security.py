from datetime import datetime, timedelta
from typing import Optional
from jose import jwt # Librería para generar el token
from passlib.context import CryptContext # Librería para encriptar passwords
import os
from dotenv import load_dotenv

load_dotenv() #Permite acceder a las variables de entorno

# -- CONFIGURACIÓN --
#Leer la clave secreta del .env
SECRET_KEY = os.getenv("SECRET_KEY")
#Asegurarnos primero de que haya clave
if not SECRET_KEY: 
    raise ValueError("No se ha configurado la SECRET_KEY.")
#Definir el algoritmo de encriptación
ALGORITHM = "HS256" #El estándar industrial
#Tiempo de vida del token (min)
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# -- HASHING --
#Uso del esquema "bcrypt", lento pero seguro
#deprecated="auto" -> permite actualizar hashes viejos si cambiamos la seguridad en el futuro
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -- FUNCIONES PASSWORD --

#Verificar: comparar la contraseña plana con el hash guardado en la DB
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

#Hash: toma la contraseña plana y devuelve el string encriptado
def get_password_hash(password):
    return pwd_context.hash(password)

# -- FUNCIONES TOKEN --

#Genera token con los datos del usuario y la fecha de expiración
def create_access_token(data: dict, expires_time: Optional[timedelta] = None):
    to_encode = data.copy() #Copia de los datos para no modificar el original por error
    if expires_time: #Calculamos cuando caduca el token
        expire = datetime.utcnow() + expires_time
    else: #usar el tiempo por defecto sino
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire}) #añadimos la expiración del diccionario de datos
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) #generamos el token codificado
    return encoded_jwt


