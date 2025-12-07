# NeoCare Health API

Esta es la API para el sistema de gestión interna de NeoCare Health.

## Configuración del Entorno

Sigue estos pasos para configurar tu entorno de desarrollo local.

### 1. Crear y Activar Entorno Virtual

Desde el directorio `NeoCare-Health-frontend`, crea un entorno virtual:

```bash
python -m venv venv
```

Actívalo:

**En Windows:**
```bash
.\venv\Scripts\activate
```

**En Windows PowerShell:**
```bash
.\.venv\Scripts\Activate.ps1
```

**En macOS/Linux:**
```bash
source venv/bin/activate
```
### 2. Actualizar pip en tu entorno virtual
python.exe -m pip install --upgrade pip

### 3. Instalar Dependencias

Asegúrate de que tu entorno virtual esté activado y luego instala los paquetes necesarios:

```bash
pip install -r requirements.txt
```

## Configuración del Proyecto

### 1. Archivo de Entorno `.env`

El proyecto utiliza un archivo `.env` en el directorio `NeoCare-Health-frontend` para gestionar las variables de configuración. Debes crear este archivo si no existe.

Copia el siguiente contenido y ajústalo a tu configuración local:

```env
# URL de conexión a tu base de datos PostgreSQL
DATABASE_URL="postgresql://tu_usuario:tu_contraseña@localhost:5432/tu_basededatos"

# Clave secreta para la generación de tokens JWT (puedes cambiarla por cualquier valor seguro)
SECRET_KEY="tu_clave_secreta_aqui"
```

## Ejecución y Pruebas

### 1. Iniciar el Servidor Web

Con el entorno virtual activado y desde el directorio `NeoCare-Health-frontend`, ejecuta el siguiente comando para iniciar la aplicación:

```bash
uvicorn app.main:app --reload
```

El servidor se iniciará y quedará escuchando en `http://127.0.0.1:8000`.

### 2. Probar la Conexión a la Base de Datos

Al iniciar, la aplicación intentará conectarse a la base de datos especificada en tu archivo `.env`. Si hay un error de conexión (por ejemplo, credenciales incorrectas, base de datos no existente o el servidor de base de datos no está en ejecución), verás un error detallado en la consola donde ejecutaste `uvicorn`.

Si la aplicación se inicia correctamente sin errores de base de datos, ¡la conexión ha sido exitosa!

### 3. Acceder a la Documentación de la API

Una vez que el servidor esté en funcionamiento, puedes acceder a la documentación interactiva de la API (generada por Swagger UI) en tu navegador visitando:

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
