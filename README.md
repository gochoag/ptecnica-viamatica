# TiendaExpress — Sistema de gestión de pedidos (OMS)

TiendaExpress es una empresa de e-commerce que necesita automatizar el flujo de sus pedidos: validar stock disponible, verificar el pago de forma asíncrona y notificar al cliente una vez confirmado. Tu tarea es implementar ese flujo, exponerlo mediante una API y consumirlo desde una interfaz web protegida con autenticación JWT.

## Stack

**Backend**
- Python + Django + Django REST Framework
- PostgreSQL
- Celery + RabbitMQ (procesamiento asíncrono)
- djangorestframework-simplejwt (autenticación JWT)

**Frontend**
- React (Vite)
- Tailwind CSS
- React Router
- Axios

## Estructura del proyecto

```
backend/
  accounts/   -> usuario y autenticación (login y registro)
  catalog/    -> productos
  orders/     -> pedidos, ítems y tareas de Celery
  core/       -> settings, urls, configuración de Celery
frontend/
  src/
    api/        -> cliente Axios y llamadas a la API
    components/ -> componentes reutilizables (sidebar, header, badges, etc.)
    pages/      -> pantallas (login/registro, productos, pedidos)
    layouts/    -> layout principal (sidebar + header)
```

## Endpoints de la API

**Autenticación**
- `POST /api/auth/login/` — obtiene access y refresh token
- `POST /api/auth/refresh/` — renueva el access token
- `POST /api/auth/register/` — crea un usuario nuevo. No lo pedía el enunciado, pero lo agregué ya que no cargo cuentas preexistentes y lo necesitaba para tener alguna forma de crear cuentas para probar el flujo.

**Productos**
- `GET /api/products/` — listado paginado

**Pedidos**
- `POST /api/orders/` — crea un pedido, valida stock y dispara la verificación de pago asíncrona
- `GET /api/orders/` — listado paginado, filtrable por status (`?status=PENDING|CONFIRMED|FAILED`)
- `GET /api/orders/{id}/` — detalle con ítems y estado actual

## Cómo levantar el proyecto

### 1. Con Docker Compose

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker compose up --build
```

Levanta todo: PostgreSQL, RabbitMQ, backend, worker de Celery y frontend. Las migraciones se aplican solas al arrancar.

- Frontend: http://localhost:5173
- Backend: http://localhost:8000/api
- RabbitMQ (panel de administración): http://localhost:15672 (usuario/clave: `tiendaexpress` / `tiendaexpress`)

### 2. Manual (sin Docker Compose)

Requisitos: Python 3.12+, [uv](https://docs.astral.sh/uv/), Node 18+, PostgreSQL corriendo localmente (con la base `bdpoms` ya creada), y Docker solo para RabbitMQ.

**RabbitMQ** (única pieza que corre en Docker en este modo):
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

**Backend** (una terminal):
```bash
cd backend
cp .env.example .env   # completar con los datos de la bd local

uv sync
uv run manage.py migrate
uv run manage.py runserver
```

**Worker de Celery** (en otra terminal):
```bash
cd backend
uv run celery -A core worker --loglevel=info --pool=solo
```
`--pool=solo` solo si tiene Windows, sin embargo en Mac/Linux ignorelo.

**Frontend** (otra terminal):
```bash
cd frontend
cp .env.example .env

npm install
npm run dev
```

## Decisiones de diseño

- El stock no se descuenta al crear el pedido, sino recién cuando la tarea de Celery confirma el pago. Al crear el pedido solo se valida que haya stock suficiente en ese momento.
- El descuento real de stock usa `select_for_update()` para evitar sobreventa si dos pedidos se confirman al mismo tiempo.
- Usuario personalizado con login con email en vez de username, porque el modelo de la prueba no incluye username.
- Las pantallas de Productos y Pedidos no se actualizan solas cuando el pago se confirma en segundo plano: hay que apretar "Refrescar". 

## Qué haría distinto con más tiempo

- Polling o WebSocket para que el estado del pedido se actualice solo.
- Tests unitarios (backend con pytest).
