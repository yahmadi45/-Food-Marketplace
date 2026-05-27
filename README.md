# Food Marketplace

## Slide 1: Project Overview
This project is a full-stack food marketplace built with a React frontend and an Express / MySQL backend. It allows customers to browse restaurants, view menus, add dishes to a cart, and place orders. Administrators can manage restaurants, dishes, orders, and users.

## Slide 2: Problem Statement
Online food marketplaces need a simple way to connect local restaurants with customers. This app solves the problem by providing a clean customer experience and a separate admin area for managing data.

## Slide 3: Solution
The solution includes:
- A public restaurant browsing experience.
- User authentication and protected checkout flow.
- Shopping cart with single-restaurant enforcement.
- Order placement and order history.
- Admin dashboard with analytics and CRUD management.

## Slide 4: Architecture
The architecture is divided into three parts:
- `backend/`: Express server with REST APIs and MySQL integration.
- `frontend/`: React + Vite single-page application.
- `show_db.js` and `view_db.js`: database utilities for inspection.

## Slide 5: Backend Features
The backend provides:
- Authentication endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Restaurant catalog endpoints: `/api/restaurants`, `/api/restaurants/:id`, `/api/restaurants/:id/plats`
- Ordering endpoints: `/api/commandes` and `/api/commandes/mine`
- Admin endpoints under `/api/admin/*` for restaurants, dishes, orders, and statistics.
- JWT-based auth middleware and role-based admin protection.

## Slide 6: Frontend Features
The frontend includes:
- Restaurant listing and filters.
- Restaurant detail page with menu and reviews.
- Cart drawer and checkout page.
- Login / registration pages.
- Admin pages for dashboard, restaurants, dishes, orders, users, and statistics.

## Slide 7: Database
The database uses MySQL and includes tables for:
- `users`
- `restaurants`
- `plats`
- `commandes`
- `commande_items`
- `avis`

The backend uses `mysql2/promise` with a connection pool.

## Slide 8: How to Run Locally
### Backend
1. Open `backend/`.
2. Install dependencies: `npm install`.
3. Configure `.env` or use defaults for `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`.
4. Run the server:
   - `npm run dev`

### Frontend
1. Open `frontend/`.
2. Install dependencies: `npm install`.
3. Run the app:
   - `npm run dev`
4. Open the browser at `http://localhost:5173`.

## Slide 9: Notes
- The backend listens on port `4000` by default.
- The frontend calls the backend API through `/api/*` endpoints.
- The cart enforces a single restaurant per order.
- Admin functionality requires a user with `role = 'admin'.`

## Slide 10: Recommended Enhancements
- Add real payment integration.
- Add restaurant reviews creation.
- Improve restaurant search and filtering.
- Add order status notifications and delivery tracking.

