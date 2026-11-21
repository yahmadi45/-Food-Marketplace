# Food Marketplace

Full-stack application for restaurant discovery and food ordering. It uses React, Express, MySQL, Docker Compose, and GitHub Actions.

- **Interface:** French
- **Currency:** Tunisian dinar (TND)
- **Demo catalog:** Restaurants around Tunis

## Project status

This repository now includes local Docker Compose, backend and frontend unit tests, browser E2E tests, GitHub Actions CI, Docker Hub image publishing, and a single-server HTTPS deployment template. A November 2026 product iteration added a dark interface, order tracking, and more complete account forms. **The public-server deployment is not performed yet.**

## Evolution milestones

The Git history starts on **May 27, 2026** and shows the project growing from an initial code upload into a tested, containerized application. The very first commit (`b3c68b8`) only added a short project description. The next commit (`7fc857a`) is the first full application upload: the marketplace already had its React/Vite frontend, Express API, MySQL schema, customer ordering flow, and admin pages. In other words, the project did not start as an empty repository.

The stages below follow the named commits on `main`. They are commit-history milestones, not Git tags. Automatic Copilot checkpoint commits are left out because they record workspace state rather than product changes.

| Stage | Commit | What changed and why |
| --- | --- | --- |
| **1. First upload: project note** | [`b3c68b8`](https://github.com/yahmadi45/-Food-Marketplace/commit/b3c68b80aa9bb35e2d102b2b0243d4dfc379aa10) | Created the repository README with the project name and a short description. |
| **2. First working application** | [`7fc857a`](https://github.com/yahmadi45/-Food-Marketplace/commit/7fc857aed72d362d0f8b7e7518a1b451459b616d) | Added the React/Vite storefront, Express/MySQL backend, authentication, restaurant and menu browsing, cart and checkout, orders, and admin management. This is the original product baseline. |
| **3. Docker and first CI workflow** | [`c8ad710`](https://github.com/yahmadi45/-Food-Marketplace/commit/c8ad710b99a0a10fb959174117836b276c27c978) | Added frontend and backend Dockerfiles, an Nginx reverse proxy, Docker Compose, and an initial GitHub Actions workflow so the app could be built and smoke-tested consistently. |
| **4. CI/CD expansion** | [`60f3887`](https://github.com/yahmadi45/-Food-Marketplace/commit/60f38871b4f9a67f9f180dd5b01a8b70c269b965) | Expanded CI to run backend tests and check API/database readiness. Added an optional Docker Hub publishing job for successful pushes to `main`, controlled by repository variables and a secret. |
| **5. Container and database hardening** | [`acb8d46`](https://github.com/yahmadi45/-Food-Marketplace/commit/acb8d46716515885c47e679774e33466e82dd94a) | Reduced container privileges, added a dedicated least-privilege MySQL application account, separated liveness from database readiness checks, and introduced API tests. |
| **6. More reliable CI checks** | [`313f20a`](https://github.com/yahmadi45/-Food-Marketplace/commit/313f20a6c36c4185a90371f1eb4c83dcb6f02728) | Made HTTP smoke checks retry during service startup and updated the checkout action to reduce flaky pipeline runs. |
| **7. Safe demo data** | [`45b07b6`](https://github.com/yahmadi45/-Food-Marketplace/commit/45b07b67f117c11d58578511120f57ad990124ea) | Added a repeatable seeder for demo users, restaurants, dishes, and reviews that preserves the existing database instead of recreating it. |
| **8. Customer experience and API improvements** | [`f8f68a3`](https://github.com/yahmadi45/-Food-Marketplace/commit/f8f68a3dee458630a45340ea219005492d76db53) | Refreshed the customer-facing pages and responsive layout, added lazy-loaded routes and a not-found page, tightened API input handling, and expanded seed-safety tests and setup documentation. |
| **9. Milestone documentation** | [`eddd2a1`](https://github.com/yahmadi45/-Food-Marketplace/commit/eddd2a1673fa49109d1eb1e18b658bfc44114c8e) | Recorded the main development milestones in the README so the project history and current deployment status were easier to understand. |
| **10. Testing and deployment preparation** | [`0030166`](https://github.com/yahmadi45/-Food-Marketplace/commit/003016650b3a600e6b8562e1928b72749961b861) | Added frontend component tests and Playwright browser tests, included them in CI, organized database inspection tooling, and added a single-server production Compose/Caddy template and release guidance. This prepares deployment but does not mean a public server has been deployed. |

## Features

- Restaurant search and cuisine, rating, and delivery-time filters.
- Restaurant menus grouped by category, customer reviews, and cart.
- Responsive dark theme across the customer and admin interfaces.
- JWT customer registration/login with password visibility, confirmation, and strength guidance.
- Checkout with payment on delivery; online card and mobile-money payments are not enabled.
- Customer order history with delivery-status progress.
- Admin pages for managing restaurants, dishes, users, and orders.
- Demo data seeding without dropping existing tables.

## Current account and payment limitations

Registration requires a password of at least eight characters, matching the backend rule. The strength indicator is guidance rather than an extra password policy. Email-based password reset is not configured. Checkout currently records payment on delivery; card and mobile-money options are displayed as unavailable until a payment provider is integrated. The app does not collect card details or charge customers online.

The latest frontend changes were checked with the component test suite, Playwright smoke tests, a production build, and a Docker Compose frontend image build. These checks do not mean the production deployment template or a public server has been deployed.

## Architecture

```text
Browser -> React/Vite -> Nginx (:8080) -> Express API (:4000) -> MySQL 8.4
```

Nginx serves built frontend assets and forwards `/api/*` to Express. Compose provides a private service network and persistent MySQL volume.

## Run locally with Docker

Requirements: Docker Desktop or Docker Engine with Compose.

```powershell
docker compose up --pull always -d
```

- Web application: <http://localhost:8080>
- API liveness: <http://localhost:4000/api/health>
- API/database readiness: <http://localhost:4000/api/health/ready>

The database is stored in the `mysql_data` volume. Stop services without deleting it:

```powershell
docker compose down
```

Avoid `docker compose down --volumes` when you want to keep local MySQL data.

## Seed demo data

The seed is repeatable and does not recreate the schema. It requires a unique local demo password of at least 12 characters and refuses to run when `NODE_ENV=production`:

```powershell
$env:DEMO_USER_PASSWORD = Read-Host "Demo account password (12 characters minimum)"
docker compose run --rm --no-deps `
  -e DB_HOST=database `
  -e DB_PORT=3306 `
  -e DB_USER=marketplace_app `
  -e DB_PASSWORD=local_app_password `
  -e DB_NAME=food_marketplace `
  -e DEMO_USER_PASSWORD=$env:DEMO_USER_PASSWORD `
  backend npm run db:seed
Remove-Item Env:DEMO_USER_PASSWORD
```

The demo account email is `client@demo.local`; its password is the value entered above. Never use demo credentials in production.

## Run without Docker

Start MySQL, create `food_marketplace`, and apply `backend/scripts/schema.sql`. Copy `backend/.env.example` to `backend/.env` and configure the database connection and `JWT_SECRET`.

Backend terminal:

```powershell
cd backend
npm ci
npm run dev
```

Frontend terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open <http://localhost:5173>. Vite proxies `/api` to `http://localhost:4000`. Once MySQL is initialized, seed demo data from `backend/` with `DEMO_USER_PASSWORD` set.

Read-only database inspection is available as `npm run db:inspect` from `backend/` when its `.env` points to a reachable MySQL instance.

## Tests and build

Backend API and seed-safety tests:

```powershell
cd backend
npm ci
npm test
```

Frontend component tests and production bundle:

```powershell
cd frontend
npm ci
npm test
npm run build
```

Playwright browser tests:

```powershell
npx playwright install chromium
npm run test:e2e
```

E2E tests start Vite and mock API responses; they cover the homepage, restaurant cards, search, and clearing empty results. GitHub Actions installs Chromium and runs these checks before the image-publish job.

## Database scripts

Database inspection utilities are grouped under `backend/scripts/db/`:

- `npm run db:inspect` prints table and record summaries using `backend/.env`.
- `show-db.js`, `view-db.js`, and `show-data.js` are retained as older manual inspection utilities.

`npm run db:setup` is destructive: `setupDb.js` drops and recreates the configured database. Use it only for disposable local data; prefer `npm run db:seed` to add demo rows.

## CI/CD and Docker Hub

`.github/workflows/ci.yml` runs on pushes to `main` and pull requests. It executes backend tests, frontend unit tests/build, Playwright E2E, starts Compose for integration smoke checks, then cleans up. After successful checks on a push to `main`, it publishes backend and frontend images to Docker Hub.

Required repository Actions configuration:

- Variable `dockerhubuser`: Docker Hub account username.
- Variable `publishdockerhub`: `true`.
- Secret `DOCKERHUB_TOKEN`: Docker Hub read/write token. Never commit or share it.

Images are tagged `latest` and with the commit SHA:

- `<dockerhub-user>/food-marketplace-backend:<tag>`
- `<dockerhub-user>/food-marketplace-frontend:<tag>`

Pushing images to Docker Hub is not the same as deploying a public website; a server still needs to run the application.

## Production Compose template

`docker-compose.prod.yml`, `Caddyfile`, and `.env.prod.example` provide an **untested single-server deployment template**. MySQL is not published publicly; Caddy routes the domain to the frontend and handles HTTPS certificates.

Before using it, provision a Linux host and domain, point DNS to the host, allow inbound TCP ports 80 and 443, copy `.env.prod.example` to a private `.env.prod`, and replace every example value with unique strong secrets. Start the stack with:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up --pull always -d
```

Only the Compose configuration syntax was validated locally. No VPS, domain, DNS, HTTPS certificate, backups, or public deployment has been set up or tested. Review secrets, demo accounts, firewall rules, and database backup/restore before production use. Compose here targets one server, not a multi-node cluster.

## Git branches and release tags

The milestone names above are descriptions of commits, not existing tags. `main` is the project’s default branch. After changes reach `main` and CI passes, create a tag on the verified commit and publish it through GitHub **Releases**:

```powershell
git pull origin main
git tag -a v2.0.0 -m "Food Marketplace v2.0.0"
git push origin v2.0.0
```

Use the next version tag for later releases. Do not mark an earlier commit as the current release.

## Repository layout

```text
backend/scripts/       Schema, demo seed, DB user setup, database inspection
backend/src/           Express app, routes, middleware, database pool
backend/test/          API and seed safety tests
frontend/src/          React pages, components, contexts, and styles
frontend/src/pages/*.test.jsx         Vitest component tests
frontend/e2e/          Playwright browser tests
frontend/Dockerfile     Vite build and unprivileged Nginx image
backend/Dockerfile      Multi-stage API image
docker-compose.yml      Local development and CI stack
docker-compose.prod.yml Single-host deployment template
Caddyfile              HTTPS reverse proxy configuration
.github/workflows/     CI and Docker Hub publishing
```

## Security notes

- `.env.example` and `.env.prod.example` are templates; keep real environment files, passwords, and tokens out of Git.
- The backend uses a restricted MySQL account. Root is only used to initialize that account.
- The seeder requires a supplied demo password and blocks `NODE_ENV=production`.
- Before public deployment, replace all secrets, disable demo credentials, review demo data, restrict network exposure, and test database backups and restores.
