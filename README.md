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

El proyecto utiliza un archivo `.env` en el directorio `NeoCare-Health` para gestionar las variables de configuración. Debes crear este archivo si no existe.

Copia el siguiente contenido y ajústalo a tu configuración local:

```env
# URL de conexión a tu base de datos PostgreSQL
DATABASE_URL="postgresql://tu_usuario:tu_contraseña@localhost:5432/tu_basededatos"

# Clave secreta para la generación de tokens JWT (puedes cambiarla por cualquier valor seguro)
SECRET_KEY="tu_clave_secreta_aqui"
```

---

## Frontend (React + Vite)

### 1. Instalar Dependencias

Navega al directorio `frontend` e instala las dependencias de Node.js:

```bash
cd frontend
npm install
```

### 2. Ejecutar el Servidor de Desarrollo

Desde el directorio `frontend`, inicia el servidor de desarrollo de Vite:

```bash
npm run dev
```

El frontend se iniciará y estará disponible en `http://localhost:5173` (o un puerto similar).

---

## PostgreSQL

Para que el backend funcione correctamente, necesitas tener una instancia de PostgreSQL ejecutándose. Puedes instalar PostgreSQL directamente en tu sistema o usar Docker.

**Recomendación:** Si no tienes PostgreSQL instalado, puedes usar Docker:

1.  **Instala Docker Desktop:** [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2.  **Inicia PostgreSQL con Docker:**
    ```bash
    docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
    ```
    *   `--name some-postgres`: Nombre de tu contenedor.
    *   `-e POSTGRES_PASSWORD=mysecretpassword`: Establece la contraseña para el usuario `postgres`. ¡Cambia `mysecretpassword` por una contraseña segura!
    *   `-p 5432:5432`: Mapea el puerto 5432 de tu máquina al puerto 5432 del contenedor.
    *   `-d postgres`: Ejecuta el contenedor en segundo plano usando la imagen oficial de PostgreSQL.

    Asegúrate de que el `DATABASE_URL` en tu archivo `.env` coincida con estas credenciales (ej. `postgresql://postgres:mysecretpassword@localhost:5432/tu_basededatos`).

---

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

### 4. Endpoints de Tarjetas (Cards)

Los siguientes endpoints gestionan las operaciones CRUD para las tarjetas del tablero. Requieren autenticación JWT.

#### **POST /cards - Crear Tarjeta**
Crea una nueva tarjeta en un tablero y lista específicos.

*   **Método:** `POST`
*   **URL:** `/cards`
*   **Requiere:** Token JWT de autenticación en el header `Authorization: Bearer <token_jwt>`
*   **Body (JSON):**
    ```json
    {
      "title": "Título de la Nueva Tarjeta",
      "description": "Descripción detallada de la tarea a realizar.",
      "list_id": 1,
      "board_id": 1,
      "due_date": "2025-12-31"
    }
    ```
*   **Ejemplo con cURL:**
    ```bash
    curl -X POST "http://127.0.0.1:8000/cards" \
      -H "accept: application/json" \
      -H "Authorization: Bearer <TU_TOKEN_JWT>" \
      -H "Content-Type: application/json" \
      -d "{ \"title\": \"Investigar nueva tecnología\", \"description\": \"Buscar soluciones para integrar IA.\", \"list_id\": 1, \"board_id\": 1, \"due_date\": \"2025-12-31\" }"
    ```

#### **GET /cards - Listar Tarjetas por Tablero**
Obtiene todas las tarjetas para un `board_id` específico.

*   **Método:** `GET`
*   **URL:** `/cards?board_id={board_id}`
*   **Requiere:** Token JWT de autenticación
*   **Parámetros de Query:**
    *   `board_id` (entero, requerido): ID del tablero.
*   **Ejemplo con cURL:**
    ```bash
    curl -X GET "http://127.00.1:8000/cards?board_id=1" \
      -H "accept: application/json" \
      -H "Authorization: Bearer <TU_TOKEN_JWT>"
    ```

#### **GET /cards/{card_id} - Ver Detalle de Tarjeta**
Obtiene los detalles de una tarjeta específica por su ID.

*   **Método:** `GET`
*   **URL:** `/cards/{card_id}`
*   **Requiere:** Token JWT de autenticación
*   **Parámetros de Path:**
    *   `card_id` (entero): ID de la tarjeta.
*   **Ejemplo con cURL:**
    ```bash
    curl -X GET "http://127.0.0.1:8000/cards/1" \
      -H "accept: application/json" \
      -H "Authorization: Bearer <TU_TOKEN_JWT>"
    ```

#### **PATCH /cards/{card_id} - Editar Tarjeta**
Actualiza parcialmente los campos de una tarjeta específica.

*   **Método:** `PATCH`
*   **URL:** `/cards/{card_id}`
*   **Requiere:** Token JWT de autenticación
*   **Parámetros de Path:**
    *   `card_id` (entero): ID de la tarjeta a actualizar.
*   **Body (JSON - campos opcionales):**
    ```json
    {
      "title": "Título Actualizado",
      "description": "Nueva descripción.",
      "list_id": 2,
      "due_date": "2026-01-15"
    }
    ```
*   **Ejemplo con cURL:**
    ```bash
    curl -X PATCH "http://127.0.0.1:8000/cards/1" \
      -H "accept: application/json" \
      -H "Authorization: Bearer <TU_TOKEN_JWT>" \
      -H "Content-Type: application/json" \
      -d "{ \"description\": \"Descripción actualizada de la tarea.\", \"list_id\": 2 }"
    ```

#### **DELETE /cards/{card_id} - Eliminar Tarjeta**
Elimina una tarjeta específica.

*   **Método:** `DELETE`
*   **URL:** `/cards/{card_id}`
*   **Requiere:** Token JWT de autenticación
*   **Parámetros de Path:**
    *   `card_id` (entero): ID de la tarjeta a eliminar.
*   **Ejemplo con cURL:**
    ```bash
    curl -X DELETE "http://127.0.0.1:8000/cards/1" \
      -H "accept: application/json" \
      -H "Authorization: Bearer <TU_TOKEN_JWT>"
    ```