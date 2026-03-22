# NestJS Microservices Architecture

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

This is a production-ready **NestJS microservices monorepo** that demonstrates a scalable distributed system architecture. The project implements communication patterns using **RabbitMQ** (AMQP) for event-based messaging and **TCP** for direct microservice communication.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Clients                                    │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Gateway Service (Port 4000)                                        │
│  ├── JWT Authentication (Clerk)                                     │
│  ├── User Management (MongoDB)                                     │
│  ├── Products API                                                  │
│  └── Routes requests to microservices via RabbitMQ/TCP             │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │    Catalog    │ │     Media     │ │    Search     │
    │   Service    │ │   Service    │ │   Service    │
    │  (TCP:4011)  │ │  (TCP:4013)  │ │  (TCP:4012)  │
    └───────────────┘ └───────────────┘ └───────────────┘
```

## Services

| Service | Type | Port | Description |
|---------|------|------|-------------|
| **Gateway** | API Gateway | 4000 | Main entry point, handles auth, routes to microservices |
| **Catalog** | Microservice | 4011 | TCP consumer for catalog/product operations |
| **Media** | Microservice | 4013 | TCP consumer for media operations |
| **Search** | Microservice | 4012 | TCP consumer for search operations |

## Technology Stack

- **Framework**: [NestJS](https://nestjs.com/) v11
- **Language**: TypeScript
- **Message Broker**: RabbitMQ (AMQP)
- **Transport**: TCP + RabbitMQ
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk (JWT)
- **Architecture**: Microservices with TCP/RabbitMQ transport
- **Shared Library**: `@app/rpc` - RPC helpers and exception filters

## Prerequisites

Before running this project, ensure you have the following installed:

- Node.js (v18+)
- npm or yarn
- RabbitMQ (running on localhost:5672)
- MongoDB (local or Atlas)

## Project Structure

```
microservices/
├── apps/
│   ├── gateway/          # API Gateway with auth & routing
│   │   └── src/
│   │       ├── auth/     # JWT authentication (Clerk)
│   │       ├── users/    # User management (MongoDB)
│   │       └── products/ # Product API endpoints
│   ├── catalog/          # Catalog microservice (TCP port 4011)
│   ├── media/            # Media microservice (TCP port 4013)
│   ├── search/           # Search microservice (TCP port 4012)
│   └── microservices/    # Base microservice app
├── libs/
│   └── rpc/              # Shared RPC library
│       └── src/
│           ├── rpc-exception.filter.ts  # Exception handling
│           ├── rpc.helpers.ts           # RPC utilities
│           └── http/                   # HTTP error mapping
├── .env                  # Environment variables
├── nest-cli.json         # NestJS CLI configuration (monorepo)
└── package.json          # Root dependencies
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Gateway
GATEWAY_PORT=4000

# Microservices (TCP Ports)
CATALOG_TCP_PORT=4011
SEARCH_TCP_PORT=4012
MEDIA_TCP_PORT=4013

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
CATALOG_QUEUE=catalog_queue
MEDIA_QUEUE=media_queue
SEARCH_QUEUE=search_queue

# Database
MONGODB_URL=mongodb://localhost:27017/your-database
MONGODB_URL_CATALOG=mongodb://localhost:27017/catalog-database

# Authentication (Clerk)
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Installation

```bash
# Install dependencies
$ npm install
```

## Running the Application

### Development Mode

Start all services with watch mode:
```bash
$ npm run start:dev
```

Start individual services:
```bash
# Start Gateway (must be run first)
$ npm run start --project=gateway

# Start Catalog Service
$ npm run start --project=catalog

# Start Media Service
$ npm run start --project=media

# Start Search Service
$ npm run start --project=search
```

### Production Mode

```bash
# Build all projects
$ npm run build

# Start in production
$ npm run start:prod
```

### Health Check

Once running, verify all services are healthy:

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "ok": true,
  "gateway": { ... },
  "services": {
    "catalog": { "ok": true, ... },
    "media": { "ok": true, ... },
    "search": { "ok": true, ... }
  }
}
```

## Testing

```bash
# Unit tests
$ npm run test

# Test coverage
$ npm run test:cov

# E2E tests
$ npm run test:e2e
```

## Inter-Service Communication

The Gateway communicates with microservices via **TCP** and **RabbitMQ** message patterns:

```typescript
// Example: Sending message to Catalog service via TCP
this.catalogClient.send('catalog.operation', { data: 'payload' });

// Example: Emitting event via RabbitMQ
this.catalogClient.emit('catalog.event', { data: 'payload' });
```

### Message Patterns

- **Request-Response**: `client.send(pattern, data)` - await response via TCP
- **Event Broadcasting**: `client.emit(event, data)` - fire and forget via RabbitMQ

### RPC Library

The project includes a shared RPC library (`@app/rpc`) with:

- [`rpc-exception.filter.ts`](libs/rpc/src/rpc-exception.filter.ts) - Global exception filter for RPC
- [`rpc.helpers.ts`](libs/rpc/src/rpc.helpers.ts) - Helper utilities
- [`rpc.types.ts`](libs/rpc/src/rpc.types.ts) - TypeScript types

## Authentication

The Gateway implements JWT authentication using **Clerk**:

- [`auth.service.ts`](apps/gateway/src/auth/auth.service.ts) - Auth logic
- [`jwt-auth-guard.ts`](apps/gateway/src/auth/jwt-auth-guard.ts) - Route protection
- [`users.service.ts`](apps/gateway/src/users/users.service.ts) - User data management

### Protected Routes

Use the `@Public()` decorator for routes that don't require authentication:
```typescript
@Controller()
export class ExampleController {
  @Public()
  @Get('public')
  publicRoute() {}
  
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  protectedRoute() {}
}
```

## API Documentation

### Gateway Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check for all services | No |
| GET | `/products` | List products | Yes |
| GET | `/products/:id` | Get product by ID | Yes |
| POST | `/products` | Create product | Yes (Admin) |
| PUT | `/products/:id` | Update product | Yes (Admin) |
| DELETE | `/products/:id` | Delete product | Yes (Admin) |
| GET | `/catalog/*` | Proxy to Catalog service | Yes |
| GET | `/media/*` | Proxy to Media service | Yes |
| GET | `/search/*` | Proxy to Search service | Yes |

### Admin-Only Routes

Use the `@Admin()` decorator to restrict routes to admin users:
```typescript
@Controller('products')
export class ProductController {
  @Admin()
  @Post()
  createProduct() {}
}
```

## Deployment

### Docker Compose (Recommended)

Create a `docker-compose.yml` for easy deployment:

```yaml
version: '3.8'
services:
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
  
  mongodb:
    image: mongo
    ports:
      - "27017:27017"

  gateway:
    build: .
    command: npm run start --project=gateway
    ports:
      - "4000:4000"
    environment:
      - RABBITMQ_URL=amqp://rabbitmq:5672
      - MONGODB_URL=mongodb://mongodb:27017/app

  catalog:
    build: .
    command: npm run start --project=catalog
    environment:
      - RABBITMQ_URL=amqp://rabbitmq:5672
      - CATALOG_TCP_PORT=4011

  media:
    build: .
    command: npm run start --project=media
    environment:
      - RABBITMQ_URL=amqp://rabbitmq:5672
      - MEDIA_TCP_PORT=4013

  search:
    build: .
    command: npm run start --project=search
    environment:
      - RABBITMQ_URL=amqp://rabbitmq:5672
      - SEARCH_TCP_PORT=4012
```

### Production Considerations

1. **RabbitMQ**: Use a cluster for high availability
2. **MongoDB**: Use replica set for production
3. **Gateway**: Add rate limiting and caching
4. **Monitoring**: Integrate with Prometheus/Grafana
5. **Logging**: Use structured logging (e.g., Pino)

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [NestJS Microservices](https://docs.nestjs.com/microservices/microservices-basics)
- [RabbitMQ Transport](https://docs.nestjs.com/microservices/rabbitmq)
- [TCP Transport](https://docs.nestjs.com/microservices/tcp)
- [Clerk Authentication](https://clerk.com)
