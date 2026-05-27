# Backend README

## Slide 1: Backend Purpose
The backend implements the REST API for the Food Marketplace. It handles data storage, authentication, order processing, and admin management.

## Slide 2: Stack and Dependencies
- Node.js with `type: module`
- Express
- MySQL via `mysql2/promise`
- JWT authentication with `jsonwebtoken`
- Password hashing with `bcryptjs`
- CORS support
- Environment variable support with `dotenv`

## Slide 3: API Structure
Main routes:
- `/api/health`
- `/api/auth/*`
- `/api/restaurants/*`
- `/api/commandes/*`
- `/api/admin/*`

## Slide 4: Authentication
Authentication uses JWT tokens.
- Register new clients: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Current user: `GET /api/auth/me`

## Slide 5: Public Restaurant Endpoints
Public restaurant endpoints include:
- `GET /api/restaurants` with search and filters
- `GET /api/restaurants/cuisine-types`
- `GET /api/restaurants/:id`
- `GET /api/restaurants/:id/plats`
- `GET /api/restaurants/:id/avis`

## Slide 6: Order Endpoints
Protected order endpoints include:
- `POST /api/commandes` to create an order
- `GET /api/commandes/mine` to fetch current user orders

## Slide 7: Admin Endpoints
Admin endpoints require an authenticated admin user and cover:
- `/api/admin/dashboard`
- `/api/admin/restaurants`
- `/api/admin/plats`
- `/api/admin/commandes`

## Slide 8: Database Access
The backend uses `backend/src/db.js` to create a connection pool and expose helper functions:
- `query(sql, params)`
- `execute(sql, params)`

## Slide 9: Launch Instructions
1. `cd backend`
2. `npm install`
3. `npm run dev`

## Slide 10: Configuration
Set environment variables in `.env` or use defaults:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
