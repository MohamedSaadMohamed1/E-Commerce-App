# E-Commerce Backend API

A production-ready, scalable e-commerce backend API built with NestJS, PostgreSQL, and Redis.

## Features

### Authentication & Authorization
- **Role-Based Access Control (RBAC)** with Admin and Customer roles
- **Email/Password Authentication** with JWT tokens
- **Extensible Authentication Architecture** ready for future OAuth providers
- Strict password validation (min 8 chars, letter, number, special character)
- Email format validation
- Name length validation (min 3 characters)

### Product Management
- **CRUD Operations** for products (Admin only)
- **Advanced Filtering** by category, price range, and availability
- **Redis Caching** for frequently accessed product lists (5-minute TTL)
- **Bulk Import** endpoint for CSV/JSON product imports

### Order System
- **Order Placement** with multiple products and quantities
- **Server-Side Total Calculation** for order integrity
- **Order Status Workflow**: Pending → Processing → Shipped → Delivered
- **Real-Time Updates** via WebSocket for order status changes
- **Email Notifications** when order status changes

### Technical Features
- Rate limiting to prevent API abuse
- Password hashing with bcrypt
- Global exception filters for consistent error responses
- Structured logging for debugging and monitoring
- Swagger/OpenAPI documentation
- Comprehensive unit and integration tests
- Docker support for easy deployment

## Technology Stack

- **Backend Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Cache**: Redis
- **Authentication**: Passport.js + JWT
- **WebSockets**: Socket.IO
- **Email**: Nodemailer
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

## Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (optional)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project
```

### 2. Environment Configuration

Copy the example environment file and update the values:

```bash
cd api
cp .env.example .env
```

Edit `.env` and configure:

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ecommerce

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (Nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-email-password
MAIL_FROM=noreply@ecommerce.com

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

### 3. Installation

#### Option A: Local Development

```bash
cd api
npm install
```

#### Option B: Docker (Recommended)

```bash
# From project root
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- API (port 3000)

### 4. Database Setup

#### If Running Locally:

Ensure PostgreSQL and Redis are running, then:

```bash
# The database will be created automatically by TypeORM
npm run start:dev
```

#### If Using Docker:

The database is automatically created when containers start.

### 5. Seed the Database

```bash
npm run seed
```

This will create:
- Admin user: `admin@ecommerce.com` / `Admin123!`
- Customer user: `customer@example.com` / `Customer123!`
- 10 sample products

### 6. Run the Application

#### Local Development:

```bash
npm run start:dev
```

#### Production:

```bash
npm run build
npm run start:prod
```

#### Docker:

```bash
docker-compose up
```

The API will be available at:
- **API Base URL**: `http://localhost:3000/api`
- **Swagger Documentation**: `http://localhost:3000/api/docs`
- **WebSocket**: `ws://localhost:3000/orders`

## API Documentation

Access the interactive Swagger documentation at: `http://localhost:3000/api/docs`

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login with email/password | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |

### Product Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/products` | Create a product | Yes | Admin |
| POST | `/api/products/bulk-import` | Bulk import products | Yes | Admin |
| GET | `/api/products` | Get all products (with filters) | No | - |
| GET | `/api/products/:id` | Get product by ID | No | - |
| PATCH | `/api/products/:id` | Update a product | Yes | Admin |
| DELETE | `/api/products/:id` | Delete a product | Yes | Admin |

#### Product Filtering

Query parameters for `/api/products`:
- `category`: Filter by category
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `isAvailable`: Filter by availability (true/false)
- `search`: Search by product name

Example:
```
GET /api/products?category=Electronics&minPrice=50&maxPrice=500&isAvailable=true
```

### Order Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/orders` | Create a new order | Yes | Customer/Admin |
| GET | `/api/orders` | Get all orders | Yes | Customer (own) / Admin (all) |
| GET | `/api/orders/:id` | Get order by ID | Yes | Customer (own) / Admin (any) |
| PATCH | `/api/orders/:id/status` | Update order status | Yes | Admin |

## WebSocket Events

Connect to `ws://localhost:3000/orders` to receive real-time order updates.

### Events

**`orderStatusUpdate`** - Emitted when an order status changes

```json
{
  "orderId": "uuid",
  "userId": "uuid",
  "status": "processing|shipped|delivered",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Testing

### Run Unit Tests

```bash
npm run test
```

### Run Integration Tests

```bash
npm run test:e2e
```

### Run Tests with Coverage

```bash
npm run test:cov
```

## Architecture Decisions

### ORM Choice: TypeORM

**Why TypeORM:**
- Native TypeScript support with decorators
- Active Record and Data Mapper patterns
- Excellent integration with NestJS
- Robust migration system
- Wide community support

**Alternatives Considered:**
- Prisma: Modern but less mature at the time
- Drizzle: Lightweight but smaller ecosystem

### Folder Structure

```
api/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── guards/           # Auth guards
│   │   ├── strategies/       # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/                # User management
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── enums/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── products/             # Product management
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── products.module.ts
│   ├── orders/               # Order management
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── enums/
│   │   ├── gateways/         # WebSocket gateway
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   └── orders.module.ts
│   ├── email/                # Email service
│   ├── common/               # Shared resources
│   │   ├── decorators/       # Custom decorators
│   │   ├── filters/          # Exception filters
│   │   ├── guards/           # RBAC guards
│   │   └── interceptors/
│   ├── config/               # Configuration files
│   ├── database/
│   │   └── seeders/          # Database seeders
│   ├── app.module.ts
│   └── main.ts
├── test/                     # E2E tests
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── package.json
```

### Extensible Authentication

The authentication system is designed to be modular and extensible:

1. **Strategy Pattern**: Uses Passport.js strategies
2. **Current Implementation**: JWT + Email/Password
3. **Future-Ready**: Structure supports adding OAuth providers (Google, GitHub, etc.)

To add a new provider:
1. Create a new strategy in `auth/strategies/`
2. Register it in `auth.module.ts`
3. Add corresponding endpoints in `auth.controller.ts`

Example structure:
```typescript
// auth/strategies/google.strategy.ts
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  // Implementation
}
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: 10 requests per 60 seconds (configurable)
- **Input Validation**: Class-validator on all DTOs
- **SQL Injection Protection**: TypeORM parameterized queries
- **CORS**: Enabled for cross-origin requests
- **Environment Variables**: Sensitive data in .env files

## Performance Optimizations

- **Redis Caching**: 5-minute TTL for product lists
- **Database Indexing**: Primary keys and foreign keys indexed
- **Lazy Loading**: TypeORM relations loaded on demand
- **Connection Pooling**: PostgreSQL connection pool
- **Eager Loading**: Strategic use for order items/products

## Development Workflow

### Database Migrations

TypeORM automatically syncs schema in development mode. For production:

```bash
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
```

### Linting

```bash
npm run lint
```

### Code Formatting

```bash
npm run format
```

## Deployment

### Docker Deployment

1. Build and run with Docker Compose:
```bash
docker-compose up -d
```

2. Run migrations and seed:
```bash
docker-compose exec api npm run seed
```

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables

3. Run the application:
```bash
npm run start:prod
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running on the correct port
- Check `.env` database credentials
- Verify firewall settings

### Redis Connection Issues

- Ensure Redis is running on port 6379
- Check Redis configuration in `.env`
- Test Redis connection: `redis-cli ping`

### Email Not Sending

- Verify SMTP credentials in `.env`
- For Gmail, enable "Less secure app access" or use App Passwords
- Check email service logs in application console

### WebSocket Connection Failed

- Ensure the WebSocket namespace is correct (`/orders`)
- Check CORS configuration
- Verify Socket.IO client version compatibility

## License

UNLICENSED

## Support

For issues and questions, please open an issue on the GitHub repository.

---

Built with ❤️ using NestJS
