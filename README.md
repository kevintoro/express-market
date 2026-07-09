# Express Market API

API REST para la gestión de inventario de un supermercado construida con NestJS y una arquitectura hexagonal. Permite registrar productos, ajustar inventario, gestionar alertas de stock bajo y generar órdenes de compra.

## Tecnologías

| Tecnología | Versión | Propósito |
|---|---|---|
| **NestJS** | 11 | Framework backend con inyección de dependencias y módulos |
| **TypeScript** | 5.7 | Tipado estático y seguridad en tiempo de compilación |
| **TypeORM** | 1.0 | ORM para la capa de persistencia con PostgreSQL |
| **PostgreSQL** | 16 | Base de datos relacional |
| **Zod** | 4.4 | Validación de esquemas DTO |
| **Jest** | 30 | Framework de testing (unitario y E2E) |
| **Docker** | — | Contenerización de la aplicación y base de datos |
| **@nestjs/event-emitter** | 3.1 | Eventos de dominio para desacoplar flujos |

## Arquitectura

El proyecto sigue una **Arquitectura Hexagonal** con cuatro capas:

```
src/
├── domain/       → Entidades, value objects, puertos (interfaces) y excepciones
├── application/  → Casos de uso o servicios de aplicación
├── infrastructure/ → Adaptadores concretos (TypeORM, mappers, repositorios)
└── interface/    → Controladores HTTP, DTOs, pipes de validación, filtros
```

### Justificación

Este tipo de arquitectura nos da independencia tecnológica y facilidad para mantenimiento, ya que, si se requiere cambiar alguna tecnología, sólo necesitamos crear un adaptador y evitamos que el dominio (o núcleo) sufra cambios.

### Flujo de ejemplo

```
POST /api/v1/products/:id/stock
  → ProductController (interface)
    → InventoryService.adjustStock (application)
      → Product.adjustStock (domain)
      → InventoryMovement.create (domain)
      → ProductRepository.save (puerto)
        → TypeORM adapter (infrastructure)
      → stock.adjusted (evento)
        → StockAlertService.handleStockAdjusted
          → StockAlert.create / resolve (domain)
```

## Requisitos Previos

- **Node.js** 22 o superior
- **Docker** y **Docker Compose**
- **npm** 10 o superior

## Instalación y Ejecución

### Opción 1: Docker (recomendado)

```bash
# Clonar e instalar dependencias
npm install

# Iniciar la aplicación con PostgreSQL
docker-compose up -d

# Ejecutar seed de datos iniciales
docker-compose exec app npm run seed

# La API estará disponible en http://localhost:3000/api/v1
```

### Opción 2: Local (sin Docker)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario (DB_HOST, DB_PORT, etc.)

# 3. Asegurarse de tener PostgreSQL corriendo en localhost:5432
#    y crear la base de datos 'express_market'

# 4. Iniciar en modo desarrollo
npm run start:dev

# 5. (Opcional) Poblar la base de datos con datos iniciales
npm run seed
```

### Variables de Entorno

Todas las variables tienen valores por defecto. Ver `.env.example`:

| Variable | Default | Descripción |
|---|---|---|
| `PORT` | 3000 | Puerto del servidor |
| `NODE_ENV` | development | Entorno |
| `API_PREFIX` | api/v1 | Prefijo de rutas |
| `DB_HOST` | localhost | Host de PostgreSQL |
| `DB_PORT` | 5432 | Puerto de PostgreSQL |
| `DB_USERNAME` | postgres | Usuario BD |
| `DB_PASSWORD` | postgres | Contraseña BD |
| `DB_NAME` | express_market | Nombre BD |
| `DB_SYNCHRONIZE` | true | Auto-sincronizar esquema |

## Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run start:dev` | Iniciar en modo desarrollo con hot-reload |
| `npm run build` | Compilar a JavaScript |
| `npm run start:prod` | Iniciar en producción |
| `npm run test` | Ejecutar pruebas unitarias |
| `npm run test:e2e` | Ejecutar pruebas E2E (inicia/limpia contenedor PostgreSQL) |
| `npm run seed` | Poblar base de datos con datos iniciales |
| `npm run lint` | Verificar estilo de código |

## Endpoints Principales

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/v1/categories` | Crear categoría |
| `GET` | `/api/v1/categories` | Listar categorías |
| `POST` | `/api/v1/products` | Registrar producto |
| `GET` | `/api/v1/products` | Listar productos (filtros: `categoryId`, `supplier`, `hasActiveAlert`, `stockMin`, `stockMax`) |
| `GET` | `/api/v1/products/:id` | Obtener producto por ID |
| `PATCH` | `/api/v1/products/:id/stock` | Ajustar stock |
| `GET` | `/api/v1/products/:id/movements` | Historial de movimientos |
| `GET` | `/api/v1/products/:id/alerts` | Alertas de un producto |
| `GET` | `/api/v1/alerts` | Listar alertas (filtros: `status`, `productId`) |
| `POST` | `/api/v1/orders` | Crear orden de compra |
| `PATCH` | `/api/v1/orders/:id/approve` | Aprobar orden |
| `PATCH` | `/api/v1/orders/:id/reject` | Rechazar orden |
| `PATCH` | `/api/v1/orders/:id/receive` | Recibir orden |

## Testing

```bash
# Pruebas unitarias (50 tests)
npm run test

# Pruebas E2E (18 tests) — inicia PostgreSQL en Docker automáticamente
npm run test:e2e
```

Las pruebas unitarias cubren entidades de dominio, value objects, servicios de aplicación y casos de borde. Las pruebas E2E verifican todos los flujos completos contra una base de datos PostgreSQL real en un contenedor Docker.
