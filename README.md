# Sistema de Gestión de Federaciones de Fútbol

Aplicación web full-stack para la gestión de federaciones, equipos y jugadores de fútbol.

| Capa | Tecnología |
|------|-----------|
| Backend | PHP 8.2 · Laravel 11 |
| Frontend | React 19 · TypeScript · Vite |
| Base de datos | MySQL / MariaDB |

---

## Requisitos previos

Asegúrate de tener instalado lo siguiente antes de comenzar:

- **PHP** ≥ 8.2 con extensiones: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`
- **Composer** ≥ 2.x — [getcomposer.org](https://getcomposer.org)
- **Node.js** ≥ 20.x y **npm** ≥ 10.x — [nodejs.org](https://nodejs.org)
- **MySQL** ≥ 8.0 o **MariaDB** ≥ 10.6
- **Git**

---

## Estructura del repositorio

```
Proyecto-CDS-Federaciones-de-futbol/
├── Backend/     ← API REST (Laravel)
├── Frontend/    ← SPA (React + TypeScript)
└── README.md    ← este archivo
```

---

## 1 · Instalación del Backend (Laravel)

### 1.1 Entrar a la carpeta

```bash
cd Backend
```

### 1.2 Instalar dependencias PHP

```bash
composer install
```

### 1.3 Crear el archivo de entorno

Copia el archivo de ejemplo y renómbralo:

```bash
# Linux / Mac
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

Luego **abre `.env`** con cualquier editor y edita las siguientes variables:

```env
APP_NAME="Federaciones Futbol"
APP_ENV=local
APP_KEY=                        # se genera en el paso 1.4
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=federaciones_db     # nombre de tu base de datos
DB_USERNAME=root                # tu usuario de MySQL
DB_PASSWORD=                    # tu contraseña de MySQL

# CORS: permite peticiones desde el frontend
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```


### 1.4 Generar la clave de la aplicación

```bash
php artisan key:generate
```

Esto rellena automáticamente `APP_KEY` en el `.env`.


### 1.5 Ejecutar las migraciones

```bash
php artisan migrate
```

Esto crea la base de datos y todas las tablas: `federaciones`, `equipos`, `jugadores`, `users`, `sessions`, etc.

Si quieres poblar la base de datos con datos de prueba (si existen seeders):

```bash
php artisan migrate:fresh --seed
```

```bash
php artisan db:seed
```

### 1.6 Iniciar el servidor de desarrollo

```bash
php artisan serve
```

El backend queda disponible en **http://localhost:8000**

La API es accesible en **http://localhost:8000/api/v1/**

---

## 2 · Instalación del Frontend (React)

### 2.1 Abrir una nueva terminal y entrar a la carpeta

```bash
cd Frontend
```

### 2.2 Instalar dependencias de Node

```bash
npm install
```

### 2.3 Crear el archivo de entorno

```bash
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

Si no existe `.env.example`, crea un archivo llamado **`.env`** con el siguiente contenido:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

> Esta variable le indica al frontend en qué dirección está corriendo el backend.
> Si cambias el puerto del backend, actualiza este valor.

### 2.4 Iniciar el servidor de desarrollo

```bash
npm run dev
```

El frontend queda disponible en **http://localhost:5173**

---

## 3 · Resumen de comandos

### Backend

| Comando | Descripción |
|---------|-------------|
| `composer install` | Instala dependencias PHP |
| `php artisan key:generate` | Genera la clave de la aplicación |
| `php artisan migrate` | Ejecuta las migraciones (crea tablas) |
| `php artisan migrate:fresh` | Elimina y recrea todas las tablas |
| `php artisan migrate:fresh --seed` | Recrea las tablas y carga datos de prueba |
| `php artisan db:seed` | Solo ejecuta los seeders |
| `php artisan serve` | Inicia el servidor en puerto 8000 |
| `php artisan route:list` | Lista todas las rutas registradas |
| `php artisan migrate:rollback` | Revierte la última migración |

### Frontend

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instala dependencias de Node |
| `npm run dev` | Servidor de desarrollo (puerto 5173) |
| `npm run build` | Compila para producción |
| `npm run preview` | Vista previa del build de producción |

---

## 4 · Endpoints disponibles

Base URL: `http://localhost:8000/api/v1`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/federaciones` | Listar federaciones |
| POST | `/federaciones` | Crear federación |
| GET | `/federaciones/{id}` | Ver federación |
| PUT | `/federaciones/{id}` | Actualizar federación |
| DELETE | `/federaciones/{id}` | Eliminar federación |
| GET | `/federaciones/{id}/equipos` | Equipos de una federación |
| POST | `/federaciones/{id}/equipos` | Agregar equipo a federación |
| GET | `/equipos` | Listar equipos |
| POST | `/equipos` | Crear equipo |
| GET | `/equipos/{id}` | Ver equipo |
| PUT | `/equipos/{id}` | Actualizar equipo |
| DELETE | `/equipos/{id}` | Eliminar equipo |
| GET | `/equipos/{id}/jugadores` | Jugadores de un equipo |
| POST | `/equipos/{id}/jugadores` | Agregar jugador a equipo |
| GET | `/jugadores` | Listar jugadores |
| POST | `/jugadores` | Crear jugador |
| GET | `/jugadores/{id}` | Ver jugador |
| PUT | `/jugadores/{id}` | Actualizar jugador |
| DELETE | `/jugadores/{id}` | Eliminar jugador |

---

## 5 · Solución de problemas comunes

**`php artisan` no se reconoce**
> Verifica que PHP esté en el PATH del sistema. Ejecuta `php -v` para confirmarlo.

**Error de conexión a la base de datos**
> Revisa que `DB_HOST`, `DB_PORT`, `DB_USERNAME` y `DB_PASSWORD` en el `.env` sean correctos.
> Asegúrate de que el servicio MySQL/MariaDB esté corriendo.

**`SQLSTATE[42000]: Syntax error` al migrar**
> Verifica que la versión de MySQL sea ≥ 8.0 o MariaDB ≥ 10.6.

**El frontend no puede conectarse al backend (CORS)**
> Confirma que `VITE_API_URL` en el `.env` del frontend apunta al puerto correcto
> y que `SANCTUM_STATEFUL_DOMAINS=localhost:5173` está en el `.env` del backend.

**Puerto 8000 o 5173 ya en uso**
> Cambia el puerto con:
> ```bash
> php artisan serve --port=8001
> npm run dev -- --port=5174
> ```
> Recuerda actualizar `VITE_API_URL` si cambias el puerto del backend.

---

## 6 · Flujo de trabajo recomendado

```
1. Clonar el repositorio
2. Configurar Backend/.env  →  composer install  →  migrate  →  serve
3. Configurar Frontend/.env  →  npm install  →  npm run dev
4. Abrir http://localhost:5173
```

---

## Licencia

Proyecto académico — Institución Don Bosco · CDS 2026
