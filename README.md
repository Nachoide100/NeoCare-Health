# NeoCare Health

Sistema de gestión de tableros tipo Kanban para la gestión interna de NeoCare Health. Permite a los usuarios crear tableros, organizar tareas en listas y gestionar tarjetas con funcionalidades completas de CRUD.

## 🚀 Tecnologías

### Backend
- **FastAPI**: Framework web moderno y rápido para Python
- **PostgreSQL**: Base de datos relacional
- **SQLAlchemy**: ORM para Python
- **JWT**: Autenticación con tokens
- **Pydantic**: Validación de datos

### Frontend
- **React 19**: Biblioteca de JavaScript para interfaces de usuario
- **TypeScript**: Superset tipado de JavaScript
- **Vite**: Build tool y servidor de desarrollo
- **Material-UI (MUI)**: Biblioteca de componentes React
- **React Router**: Enrutamiento para aplicaciones React
- **dnd-kit** (`@dnd-kit/core`, `@dnd-kit/utilities`): Librería moderna para Drag & Drop accesible en React

## 📁 Estructura del Proyecto

```
NeoCare-Health/
├── app/                    # Backend (FastAPI)
│   ├── routers/           # Rutas de la API
│   │   ├── auth.py        # Autenticación (registro, login)
│   │   ├── users.py       # Gestión de usuarios
│   │   ├── boards.py      # Gestión de tableros
│   │   ├── lists.py       # Gestión de listas
│   │   ├── cards.py       # Gestión de tarjetas
│   │   ├── worklogs.py    # Gestión de horas trabajadas
│   │   └── report.py      # Endpoints para informes
│   ├── services/          # Lógica de negocio (ej. setup_service, date_utils)
│   ├── models.py          # Modelos de base de datos (SQLAlchemy)
│   ├── schemas.py         # Esquemas de validación (Pydantic)
│   ├── database.py        # Configuración de base de datos
│   ├── security.py        # Utilidades de seguridad (JWT, hashing)
│   └── main.py            # Aplicación principal FastAPI
├── frontend/              # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/    # Componentes React reutilizables
│   │   ├── pages/         # Páginas de la aplicación (vistas)
│   │   ├── services/      # Servicios para consumir la API
│   │   └── types/         # Definiciones de tipos y interfaces
│   └── package.json
├── requirements.txt       # Dependencias Python
└── README.md
```

## ⚙️ Configuración del Entorno

### 1. Prerrequisitos

- Python 3.10 o superior
- Node.js 18 o superior
- PostgreSQL (o Docker para ejecutar PostgreSQL en contenedor)

### 2. Backend - Configuración del Entorno Virtual

Desde el directorio raíz `NeoCare-Health`, crea un entorno virtual:

```bash
python -m venv .venv
```

Actívalo según tu sistema operativo:

**En Windows:**
```bash
.\.venv\Scripts\activate
```

**En Windows PowerShell:**
```bash
.\.venv\Scripts\Activate.ps1
```

**En macOS/Linux:**
```bash
source .venv/bin/activate
```

### 3. Actualizar pip

Con el entorno virtual activado:

```bash
python.exe -m pip install --upgrade pip
```

### 4. Instalar Dependencias del Backend

Asegúrate de que tu entorno virtual esté activado y luego instala los paquetes necesarios:

```bash
pip install -r requirements.txt
```

### 5. Configuración de la Base de Datos

#### PostgreSQL Local

**Nota sobre la creación automática**: El sistema incluye una lógica de verificación en database.py. Si el servidor PostgreSQL está activo pero la base de datos especificada en DATABASE_URL no existe, el backend intentará crearla automáticamente mediante psycopg2 antes de inicializar los modelos.

Asegúrate de tener PostgreSQL instalado y crea una base de datos:

```sql
CREATE DATABASE necocare_health;
```

### 6. Archivo de Entorno `.env`

Crea un archivo `.env` en el directorio raíz del proyecto con el siguiente contenido:

```env
# URL de conexión a tu base de datos PostgreSQL
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/necocare_health"

# Clave secreta para la generación de tokens JWT (cambia por una clave segura)
SECRET_KEY="tu_clave_secreta_muy_segura_aqui_cambiar_en_produccion"
```

**⚠️ Importante:** En producción, utiliza una clave secreta fuerte y única. Puedes generar una con:

```python
import secrets
print(secrets.token_urlsafe(32))
```

## 🚀 Ejecución

### Backend (FastAPI)

Con el entorno virtual activado, desde el directorio raíz:

```bash
uvicorn app.main:app --reload
```

El servidor backend se iniciará y estará disponible en:
- **API**: `http://127.0.0.1:8000`
- **Documentación interactiva (Swagger)**: `http://127.0.0.1:8000/docs`
- **Documentación alternativa (ReDoc)**: `http://127.0.0.1:8000/redoc`

### Frontend (React)
En una nueva terminal, navega al directorio `frontend`:

```bash
cd frontend
npm install
npm run dev
```
El frontend se iniciará y estará disponible en `http://localhost:5173` (o un puerto similar que Vite indique).

## 📋 Funcionalidades Destacadas

### Gestión Dinámica de Tableros

- **Visualización por Columnas**: Las tarjetas se agrupan automáticamente por su estado (Listas) en una disposición horizontal con scroll independiente.

- **Contador de Tarjetas**: Cada columna muestra mediante un Chip la cantidad de tareas activas que posee.

### Control Total de Tarjetas (CRUD)

- **Formulario Unificado**: Un único componente CardForm gestiona tanto la creación como la edición, adaptando sus campos dinámicamente.

- **Fecha Límite y Alertas**: Soporte para fechas de vencimiento (due_date). El sistema resalta visualmente en color rojo las tarjetas atrasadas mediante validación de fechas en tiempo real.

### Seguridad y UX

- **Rutas Protegidas**: Implementación de un componente ProtectedRoute que actúa como guardián, impidiendo el acceso al tablero si no existe una sesión activa.

- **Layout Adaptativo**: Barra lateral (Sidebar) colapsable y encabezado (Header) fijo para maximizar el espacio de trabajo en el tablero.

## ⚙️ Configuración del Entorno

En una nueva terminal, navega al directorio `frontend`:

```bash
cd frontend
npm install
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

El frontend se iniciará y estará disponible en `http://localhost:5173` (o un puerto similar que Vite indique).

## 🛠️ Detalles de Implementación Técnica

- **Sincronización de Estados**: Al crear, editar o eliminar una tarjeta, el estado de React se actualiza localmente de forma inmediata tras recibir la respuesta exitosa del servidor, garantizando una interfaz fluida.

- **Interacción con la API**: Los servicios (cardService.ts, etc.) encapsulan la lógica de las peticiones fetch, manejando automáticamente los headers de autorización con el token JWT almacenado.

- **Tipado Estricto**: Se utilizan interfaces de TypeScript para asegurar que los datos de Tarjetas, Listas y Usuarios coincidan exactamente con la estructura definida en el Backend.

## 🔒 Seguridad del Sistema

- **Persistencia de Sesión**: El token JWT se gestiona a través de servicios dedicados, permitiendo una validación constante de la identidad del usuario.

- **Validación de Formularios**: Los campos obligatorios (como el título de la tarjeta) están validados en el cliente para prevenir peticiones fallidas al backend.

- **Truncado de Seguridad**: Las contraseñas en el registro son procesadas para cumplir con los estándares de hashing definidos en el backend (bcrypt).
  
## 📚 API Endpoints

Todos los endpoints requieren autenticación JWT excepto los de autenticación. Incluye el token en el header:
```
Authorization: Bearer <tu_token_jwt>
```

### Autenticación (`/auth`)

#### POST `/auth/register` - Registro de Usuario
Registra un nuevo usuario y crea automáticamente su tablero principal con listas por defecto.

**Body (JSON):**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña_segura"
}
```

#### POST `/auth/login` - Inicio de Sesión
Autentica un usuario y devuelve un token JWT.

**Body (form-data):**
- `username`: Email del usuario
- `password`: Contraseña

**Respuesta:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Usuarios (`/users`)

#### GET `/users/me` - Obtener Usuario Actual
Devuelve los datos del usuario autenticado.

**Requiere:** Token JWT

### Tableros (`/boards`)

#### POST `/boards` - Crear Tablero
Crea un nuevo tablero para el usuario actual e inicializa listas por defecto.

**Requiere:** Token JWT

**Body (JSON):**
```json
{
  "title": "Mi Nuevo Tablero"
}
```

#### GET `/boards` - Listar Tableros
Obtiene todos los tableros del usuario autenticado.

**Requiere:** Token JWT

### Listas (`/lists`)

#### GET `/lists?board_id={board_id}` - Listar Listas de un Tablero
Obtiene todas las listas de un tablero específico con sus tarjetas.

**Requiere:** Token JWT

**Parámetros:**
- `board_id` (query): ID del tablero

### Tarjetas (`/cards`)

#### POST `/cards` - Crear Tarjeta
Crea una nueva tarjeta en un tablero y lista específicos.

**Requiere:** Token JWT

**Body (JSON):**
```json
{
  "title": "Título de la Nueva Tarjeta",
  "description": "Descripción detallada de la tarea a realizar.",
  "list_id": 1,
  "board_id": 1,
  "due_date": "2025-12-31"
}
```

#### GET `/cards?board_id={board_id}` - Listar Tarjetas
Obtiene todas las tarjetas de un tablero específico.

**Requiere:** Token JWT

**Parámetros:**
- `board_id` (query): ID del tablero

#### GET `/cards/{card_id}` - Ver Detalle de Tarjeta
Obtiene los detalles de una tarjeta específica por su ID.

**Requiere:** Token JWT

#### PATCH `/cards/{card_id}` - Editar Tarjeta
Actualiza parcialmente los campos de una tarjeta específica.

**Requiere:** Token JWT

**Body (JSON - campos opcionales):**
```json
{
  "title": "Título Actualizado",
  "description": "Nueva descripción.",
  "due_date": "2026-01-15"
}
```

> **Nota:** El cambio de columna y orden de una tarjeta se realiza exclusivamente mediante el endpoint `/cards/{card_id}/move` descrito a continuación, para mantener la integridad del orden.
#### PATCH `/cards/{card_id}/move` - Mover/Reordenar Tarjeta
Mueve una tarjeta a una nueva lista o cambia su posición dentro de la misma lista. El sistema reordena automáticamente los índices de las tarjetas afectadas para mantener la integridad.

**Body (JSON):**
```json
{
  "list_id": 2,
  "order": 1
}
```
**Requiere:** Token JWT

#### DELETE `/cards/{card_id}` - Eliminar Tarjeta
Elimina una tarjeta específica.

**Requiere:** Token JWT

### Worklogs (Registro de Horas) (`/worklogs` y `/cards/{card_id}/worklogs`)

#### POST `/cards/{card_id}/worklogs` - Crear Registro de Horas
Crea un nuevo registro de horas trabajadas para una tarjeta específica.

**Requiere:** Token JWT

**Body (JSON):**
```json
{
  "card_id": 1,
  "date": "2025-12-22",
  "hours": 2.5,
  "note": "Revisión de código y pruebas"
}
```

**Validaciones:**
- `hours` debe ser mayor a 0 (mínimo recomendado: 0.25)
- `date` no puede ser una fecha futura
- `note` máximo 200 caracteres

#### GET `/cards/{card_id}/worklogs` - Listar Horas por Tarjeta
Obtiene todos los registros de horas de una tarjeta específica, ordenados por fecha descendente.

**Requiere:** Token JWT

**Parámetros:**
- `card_id` (path): ID de la tarjeta

#### PATCH `/worklogs/{worklog_id}` - Editar Registro de Horas
Actualiza un registro de horas existente. Solo el autor puede editar su propio registro.

**Requiere:** Token JWT

**Body (JSON - campos opcionales):**
```json
{
  "date": "2025-12-22",
  "hours": 3.0,
  "note": "Nota actualizada"
}
```

#### DELETE `/worklogs/{worklog_id}` - Eliminar Registro de Horas
Elimina un registro de horas. Solo el autor puede eliminar su propio registro.

**Requiere:** Token JWT

#### GET `/users/me/worklogs` - Obtener Mis Horas (Vista Semanal)
Obtiene los registros de horas del usuario actual, filtrados por semana.

**Requiere:** Token JWT

**Parámetros (query):**
- `week` (opcional): Semana en formato `YYYY-WW` (ej: `2025-01`). Si no se proporciona, devuelve la semana actual.

**Ejemplo:**
```
GET /users/me/worklogs?week=2025-01
```

## 🧪 Ejemplos de Uso con cURL

### 1. Registrar un nuevo usuario
```bash
curl -X POST "http://127.0.0.1:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"test@ejemplo.com\", \"password\": \"mi_contraseña\"}"
```

### 2. Iniciar sesión
```bash
curl -X POST "http://127.0.0.1:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@ejemplo.com&password=mi_contraseña"
```

### 3. Crear una tarjeta (con token JWT)
```bash
curl -X POST "http://127.0.0.1:8000/cards" \
  -H "accept: application/json" \
  -H "Authorization: Bearer <TU_TOKEN_JWT>" \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"Nueva Tarea\", \"description\": \"Descripción de la tarea\", \"list_id\": 1, \"board_id\": 1}"
```

### 4. Listar tarjetas de un tablero
```bash
curl -X GET "http://127.0.0.1:8000/cards?board_id=1" \
  -H "accept: application/json" \
  -H "Authorization: Bearer <TU_TOKEN_JWT>"
```

### 5. Añadir horas trabajadas a una tarjeta
```bash
curl -X POST "http://127.0.0.1:8000/cards/1/worklogs" \
  -H "accept: application/json" \
  -H "Authorization: Bearer <TU_TOKEN_JWT>" \
  -H "Content-Type: application/json" \
  -d "{\"card_id\": 1, \"date\": \"2025-12-22\", \"hours\": 2.5, \"note\": \"Desarrollo de funcionalidad\"}"
```

### 6. Obtener mis horas de la semana actual
```bash
curl -X GET "http://127.0.0.1:8000/users/me/worklogs" \
  -H "accept: application/json" \
  -H "Authorization: Bearer <TU_TOKEN_JWT>"
```

### 7. Obtener mis horas de una semana específica
```bash
curl -X GET "http://127.0.0.1:8000/users/me/worklogs?week=2025-01" \
  -H "accept: application/json" \
  -H "Authorization: Bearer <TU_TOKEN_JWT>"
```

## 📖 Documentación de la API

Una vez que el servidor backend esté en funcionamiento, puedes acceder a la documentación interactiva:

- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

Estas interfaces te permiten probar todos los endpoints directamente desde el navegador.

## 🗄️ Modelos de Base de Datos

El sistema utiliza los siguientes modelos principales:

| Entidad | Descripción | Atributos Clave |
| :--- | :--- | :--- |
| **User** | Usuarios del sistema. | `email`, `hashed_password`. |
| **Board** | Tableros de trabajo de un usuario. | `title`, `owner_id`. |
| **List** | Columnas dentro de un tablero (estados). | `title`, `position`, `board_id`. |
| **Card** | Tareas individuales con detalles. | `title`, `description`, `due_date`, `order`. |
| **Worklog**| Registro de horas trabajadas en una tarjeta. | `card_id`, `user_id`, `date`, `hours`. |

Las tablas se crean automáticamente al iniciar la aplicación si no existen.

## 🔒 Seguridad

- Las contraseñas se almacenan hasheadas usando bcrypt
- **Truncado de contraseñas:** Debido a las especificaciones del algoritmo `bcrypt` utilizado en `security.py`, las contraseñas se truncan internamente a los primeros 72 caracteres para garantizar un proceso de hashing correcto y evitar errores de desbordamiento.
- La autenticación utiliza tokens JWT
- Los endpoints protegidos validan la propiedad de recursos (usuarios solo pueden acceder a sus propios tableros, informes, listas y tarjetas)
- CORS configurado para permitir comunicación del frontend

## 🛠️ Desarrollo

### Comandos útiles del Frontend

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview

# Ejecutar linter
npm run lint
```



### Estructura de la Base de Datos

La base de datos se inicializa automáticamente al iniciar la aplicación. Las relaciones principales son:

- Un **User** puede tener múltiples **Boards**
- Un **Board** puede tener múltiples **Lists** y **Cards**
- Una **List** puede tener múltiples **Cards**
- Una **Card** pertenece a un **User**, un **Board** y una **List**

## 📝 Notas Adicionales

- **Flujo de trabajo inicial:** Al registrar un nuevo usuario o crear un tablero, el servicio `setup_service` genera automáticamente las listas: **"Por hacer"**, **"En proceso"** y **"Finalizado"**.
- Al crear un nuevo tablero, se inicializan automáticamente listas por defecto
- Las tarjetas incluyen timestamps automáticos (`created_at`, `updated_at`)
- **Gestión de Orden:** Las tarjetas se insertan automáticamente al final de la lista con un valor `order` calculado (`max + 1`). Al eliminar una tarjeta, el sistema ejecuta un "shift down" de los índices superiores para no dejar huecos en la secuencia. Al mover una tarjeta entre listas o dentro de la misma, el backend ajusta los `order` afectados siguiendo una estrategia incremental (0, 1, 2, ...) con desplazamientos hacia arriba/abajo según el movimiento.

- **Sistema de Timesheets (Registro de Horas):** Los usuarios pueden registrar las horas trabajadas en cada tarjeta mediante el módulo de Worklogs. Cada registro incluye fecha, horas (mínimo 0.25h), y una nota opcional (máximo 200 caracteres). Los usuarios solo pueden editar o eliminar sus propios registros. La vista "Mis Horas" permite consultar las horas trabajadas por semana con totales diarios y semanales.

## ⏱️ Sistema de Timesheets (Registro de Horas)

### Funcionalidades

El sistema permite a los usuarios registrar las horas trabajadas en cada tarjeta del tablero, facilitando el seguimiento del tiempo invertido en cada tarea.

#### Vista de Detalle de Tarjeta

Al hacer clic en una tarjeta, se abre un diálogo que muestra:
- Información completa de la tarjeta (título, descripción, fecha límite)
- Sección "Horas Trabajadas" con:
  - Listado cronológico de todos los registros de horas
  - Total de horas registradas en la tarjeta
  - Botones para editar/eliminar solo los registros propios

#### Añadir Horas

1. Abrir el detalle de una tarjeta
2. Hacer clic en "Añadir Horas"
3. Completar el formulario:
   - **Fecha**: Seleccionar la fecha (no puede ser futura)
   - **Horas**: Número decimal (mínimo 0.25)
   - **Nota**: Opcional, máximo 200 caracteres
4. Guardar

#### Vista "Mis Horas"

Accesible desde el menú lateral, muestra:
- Listado de todas las horas registradas por el usuario
- Filtro por semana (formato YYYY-WW)
- Totales por día
- Total semanal destacado
- Información de la tarjeta asociada a cada registro

### Validaciones

**Cliente (Frontend):**
- Horas > 0 y mínimo 0.25
- Fecha no futura
- Nota máximo 200 caracteres

**Servidor (Backend):**
- Mismas validaciones que el cliente
- Solo el autor puede editar/eliminar sus registros
- Acceso a tarjetas del mismo tablero del usuario

### Permisos

- **Visualizar worklogs**: Todos los miembros del tablero pueden ver los registros de horas de una tarjeta
- **Crear worklog**: Cualquier miembro del tablero puede añadir horas
- **Editar/Eliminar**: Solo el autor del registro puede modificar o eliminar sus propias horas

## 🎯 Drag & Drop en el Frontend

### Flujo de funcionamiento

1. El usuario arrastra una tarjeta (`CardItem`) dentro del tablero.
2. `dnd-kit` detecta el inicio del arrastre y asocia la tarjeta a su lista origen.
3. Al soltar sobre una columna (`ListColumn`), se calcula la nueva `list_id` y un `order` al final de la columna destino.
4. El frontend actualiza el estado local de forma optimista para que el cambio se vea inmediatamente.
5. Se invoca al endpoint `PATCH /cards/{id}/move` con `{ "list_id": <destino>, "order": <nuevo_orden> }`.
6. Si la API responde correctamente, se sincroniza la tarjeta con los datos devueltos por el backend.
7. Si ocurre un error, el frontend revierte el estado al valor anterior y muestra un mensaje visual de error.

### Estrategia de ordenamiento elegida

- Cada columna mantiene sus tarjetas con un `order` entero incremental (`0, 1, 2, ...`).
- Al crear una tarjeta nueva, se inserta al final de la lista (`max(order) + 1`).
- Al eliminar una tarjeta, los `order` de las tarjetas siguientes se decrementan en 1 (estrategia "shift down").
- Al mover una tarjeta, el backend:
  - Cierra el hueco en la lista origen.
  - Abre espacio en la lista destino si es necesario.
  - Asigna el nuevo `order` a la tarjeta movida.
- El sistema utiliza migraciones automáticas de SQLAlchemy para crear/actualizar tablas

### 📊 Informe Semanal

El módulo de informes semanales proporciona una vista consolidada para analizar el progreso, la carga de trabajo y la eficiencia del equipo. Se accede a través de la ruta `/report`.

#### Funcionalidades Principales

*   **Selector de Semana**: Permite filtrar el informe por cualquier semana del año. Por defecto, muestra la semana actual.
*   **Resumen Visual**: Muestra tarjetas de resumen para tareas **Completadas** (verde), **Vencidas** (rojo) y **Nuevas** (azul), incluyendo un contador y una lista desplegable con los detalles de cada tarea.
*   **Análisis de Horas**: Incluye dos tablas detalladas:
    *   **Horas por Persona**: Muestra el total de horas y tareas por usuario.
    *   **Horas por Tarjeta**: Muestra el total de horas por tarea, con opción de ordenamiento.
*   **Exportación a CSV**: Permite descargar los datos de las tablas de horas en formato CSV.

#### Endpoints del API (`/report`)

##### `GET /report/{board_id}/summary`

Obtiene un resumen de la actividad del tablero para una semana específica.

*   **Parámetros**:
    *   `week` (query, requerido): Semana en formato `YYYY-WW` (ej. `2025-51`).
*   **Respuesta de Ejemplo**:
    ```json
    {
      "week": "2025-51",
      "start_date": "2025-12-15",
      "end_date": "2025-12-21",
      "completed": {
        "count": 1,
        "items": [
          {
            "id": 10,
            "title": "Finalizar pruebas de integración",
            "responsible": "test@ejemplo.com",
            "state": "Hecho"
          }
        ]
      },
      "overdue": { "count": 0, "items": [] },
      "new": {
        "count": 2,
        "items": [
          { "id": 12, "title": "Nueva tarea", "responsible": null, "state": "Por hacer" },
          { "id": 11, "title": "Otra tarea", "responsible": "test@ejemplo.com", "state": "En proceso" }
        ]
      }
    }
    ```

##### `GET /report/{board_id}/hours-by-user`

Obtiene las horas totales y el número de tareas por usuario para una semana.

*   **Parámetros**:
    *   `week` (query, requerido): Semana en formato `YYYY-WW`.
*   **Respuesta de Ejemplo**:
    ```json
    {
      "week": "2025-51",
      "start_date": "2025-12-15",
      "end_date": "2025-12-21",
      "data": [
        {
          "user_id": 1,
          "user_email": "test@ejemplo.com",
          "total_hours": 8.5,
          "tasks_count": 3
        }
      ]
    }
    ```

##### `GET /report/{board_id}/hours-by-card`

Obtiene las horas totales por tarjeta para una semana, con detalles de la tarjeta.

*   **Parámetros**:
    *   `week` (query, requerido): Semana en formato `YYYY-WW`.
    *   `order_desc` (query, opcional): `true` para ordenar por horas descendente (defecto), `false` para ascendente.
*   **Respuesta de Ejemplo**:
    ```json
    {
      "week": "2025-51",
      "start_date": "2025-12-15",
      "end_date": "2025-12-21",
      "data": [
        {
          "card_id": 10,
          "title": "Finalizar pruebas de integración",
          "responsible": "test@ejemplo.com",
          "state": "Hecho",
          "total_hours": 5.0
        },
        {
          "card_id": 11,
          "title": "Otra tarea",
          "responsible": "test@ejemplo.com",
          "state": "En proceso",
          "total_hours": 3.5
        }
      ]
    }
    ```

#### Lógica y Consultas SQL

*   **Cálculo de la Semana**:
    *   **Frontend**: Utiliza un `input` de tipo `week` y funciones de `Date` para construir el formato `YYYY-Www`.
    *   **Backend**: La función `week_str_to_range` en `app/services/date_utils.py` convierte el string `YYYY-WW` a un rango de fechas (lunes a domingo) usando `date.fromisocalendar`.
*   **Consultas (SQLAlchemy)**:
    *   **Resumen**: Se realizan tres consultas separadas sobre el modelo `Card` filtrando por `board_id` y el rango de fechas en `created_at` (para nuevas), `updated_at` (para completadas en lista "Hecho") y `due_date` (para vencidas fuera de "Hecho").
    *   **Horas por Usuario**: Se agrupan los `Worklog` por `user_id`, sumando `hours` y contando los `card_id` distintos, todo dentro del rango de fechas.
    *   **Horas por Tarjeta**: Se agrupan los `Worklog` por `card_id`, sumando las `hours` y uniendo con `Card` y `List` para obtener los detalles.

#### Casos Límite Manejados

*   **Semana sin datos**: Los endpoints devuelven contadores en `0` y listas `[]` vacías. El frontend muestra mensajes como "No hay datos".
*   **Tareas sin responsable**: El campo `responsible` en las respuestas será `null`. El frontend lo muestra como 'N/A' o 'Sin responsable'.
*   **Tarjetas sin horas**: Aparecerán en el informe "Horas por Tarjeta" con `total_hours` de `0.0`.

## 🤝 Contribuir

Este es un proyecto interno de NeoCare Health. Para contribuir:

1. Crea una rama para tu feature
2. Realiza tus cambios
3. Asegúrate de que todo funcione correctamente
4. Envía un pull request

## 📄 Licencia

Proyecto interno de NeoCare Health.
# Línea modificada en main
