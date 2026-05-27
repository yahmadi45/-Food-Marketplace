# Frontend README

## Slide 1: Frontend Purpose
The frontend delivers the user interface for the Food Marketplace. It handles restaurant browsing, cart interactions, authentication, checkout, and admin pages.

## Slide 2: Stack and Dependencies
- React 18
- Vite
- React Router DOM
- Axios for API requests
- Recharts for admin statistics charts

## Slide 3: App Structure
Key folders:
- `src/components` for reusable UI components
- `src/context` for auth and cart state
- `src/layout` for page layout wrappers
- `src/pages` for public and admin page views

## Slide 4: Authentication Flow
The frontend stores JWT tokens in local storage and refreshes the current user on load. It provides:
- Login page
- Registration page
- Protected checkout route
- Admin-only route guard

## Slide 5: Cart and Checkout
The cart supports:
- Adding dishes from a restaurant
- Quantity changes and item removal
- Single-restaurant cart enforcement
- Delivery fee and total calculation
- Checkout page with order submission

## Slide 6: Public User Experience
Public pages include:
- Home page with restaurant list and filters
- Restaurant detail page with menu and reviews
- Cart drawer for quick access
- Search and category filtering

## Slide 7: Admin Experience
Admin pages include:
- Dashboard with KPIs and charts
- Restaurants management
- Dish management
- Orders list and detail management
- Users view
- Statistics and sales data

## Slide 8: API Integration
The frontend uses `frontend/src/api.js` to call backend endpoints with Axios. Auth tokens are attached automatically when present.

## Slide 9: Launch Instructions
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:5173`

## Slide 10: Notes
- Protected routes redirect to `/connexion` if the user is not logged in.
- Admin pages require a user with `role='admin'`.
- The cart will prompt if the user switches restaurants while items are in the cart.
