# NestJS Microservices Architecture

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

This is a production-ready **NestJS microservices monorepo** that demonstrates a scalable distributed system architecture. The project implements a communication pattern using **RabbitMQ** (AMQP) for inter-service messaging, with an API Gateway acting as the entry point for all client requests.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Clients                                    │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Gateway Service (Port 3000)                                        │
│  ├── JWT Authentication (Clerk)                                     │
│  ├── User Management (MongoDB)                                     │
│  └── Routes requests to microservices via RabbitMQ                 │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │    Catalog    │ │     Media     │ │    Search     │
    │   Service    │ │   Service     │ │   Service    │
    │  (RabbitMQ)  │ │  (RabbitMQ)  │ │  (RabbitMQ)  │
    └───────────────┘ └───────────────┘ └───────────────┘
```

## Services

| Service | Type | Port | Description |
|---------|------|------|-------------|
| **Gateway** | API Gateway | 3000 | Main entry point, handles auth, routes to microservices |
| **Catalog** | Microservice | - | RabbitMQ consumer for catalog operations |
| **Media** | Microservice | - | RabbitMQ consumer for media operations |
| **Search** | Microservice | - | RabbitMQ consumer for search operations |

## Technology Stack

- **Framework**: [NestJS](https://nestjs.com/) v11
- **Language**: TypeScript
- **Message Broker**: RabbitMQ (AMQP)
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk (JWT)
- **Architecture**: Microservices with RabbitMQ transport

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
│   │       └── users/    # User management (MongoDB)
│   ├── catalog/          # Catalog microservice
│   ├── media/            # Media microservice
│   ├── search/           # Search microservice
│   └── microservices/    # Base microservice app
├── .env                  # Environment variables
├── nest-cli.json         # NestJS CLI configuration (monorepo)
└── package.json          # Root dependencies
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Gateway
GATEWAY_PORT=3000

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
CATALOG_QUEUE=catalog_queue
MEDIA_QUEUE=media_queue
SEARCH_QUEUE=search_queue

# Database
MONGODB_URL=mongodb://localhost:27017/your-database

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

Start the Gateway (must be run first):
```bash
$ npm run start:gateway
# or with watch mode
$ npm run start:gateway --watch
```

Start individual microservices:

```bash
# Start Catalog Service
$ npm run start:catalog

# Start Media Service
$ npm run start:media

# Start Search Service
$ npm run start:search
```

Or start all services using NestJS CLI:

```bash
# Start all apps in development
$ npm run start:dev

# Start a specific app
$ npm run start --project=gateway
```

### Health Check

Once running, verify all services are healthy:

```bash
curl http://localhost:3000/health
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

The Gateway communicates with microservices via **RabbitMQ** message patterns:

```typescript
// Example: Sending message to Catalog service
this.catalogClient.send('catalog.operation', { data: 'payload' });
```

### Message Patterns

- **Request-Response**: `client.send(pattern, data)` - await response
- **Event Broadcasting**: `client.emit(event, data)` - fire and forget

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
| GET | `/catalog/*` | Proxy to Catalog service | Yes |
| GET | `/media/*` | Proxy to Media service | Yes |
| GET | `/search/*` | Proxy to Search service | Yes |

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
    command: npm run start:gateway
    ports:
      - "3000:3000"
    environment:
      - RABBITMQ_URL=amqp://rabbitmq:5672
      - MONGODB_URL=mongodb://mongodb:27017/app

  catalog:
    build: .
    command: npm run start:catalog
    environment:
      - RABBITMQ_URL=amqp://rabbitmq:5672

  media:
    build: .
    command: npm run start:media
    environment:
      - RABBITMQ_URL=amqp://rabbitmq:5672

  search:
    build: .
    command: npm run start:search
    environment:
      - RABBITMQ_URL=amqp://rabbitmq:5672
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
- [Clerk Authentication](https://clerk.com)
