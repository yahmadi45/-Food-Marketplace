# Food Marketplace

Full-stack application for restaurant discovery and food ordering. It uses React, Express, MySQL, Docker Compose, and GitHub Actions.

- **Interface:** French
- **Currency:** Tunisian dinar (TND)
- **Demo catalog:** Restaurants around Tunis

## Project status

This repository now includes local Docker Compose, backend and frontend unit tests, browser E2E tests, GitHub Actions CI, Docker Hub image publishing, and a single-server HTTPS deployment template. **The public-server deployment is not performed yet.**

## Evolution milestones

These milestones identify commits in the `main` branch; they are not Git tags unless marked as such.

| Milestone | Commit | Main change |
| --- | --- | --- |
| **1. Marketplace foundation** | [`7fc857a`](https://github.com/yahmadi45/-Food-Marketplace/commit/7fc857aed72d362d0f8b7e7518a1b451459b616d) | Existing React/Vite UI, Express REST API, MySQL schema, customer flows, orders, admin area. |
| **2. Reproducible local stack** | [`c8ad710`](https://github.com/yahmadi45/-Food-Marketplace/commit/c8ad710b99a0a10fb959174117836b276c27c978) | Frontend/backend Dockerfiles, Nginx proxy, Compose stack, first GitHub Actions smoke workflow. |
| **3. Runtime hardening** | [`acb8d46`](https://github.com/yahmadi45/-Food-Marketplace/commit/acb8d46716515885c47e679774e33466e82dd94a) | Non-root/minimal runtime settings, least-privilege MySQL app account, liveness/readiness checks, API tests. |
| **4. Reliable CI and image publishing** | [`313f20a`](https://github.com/yahmadi45/-Food-Marketplace/commit/313f20a6c36c4185a90371f1eb4c83dcb6f02728) | Retried HTTP smoke checks and updated checkout action; workflow run passed and image publishing completed. |
| **5. Repeatable demo data** | [`45b07b6`](https://github.com/yahmadi45/-Food-Marketplace/commit/45b07b67f117c11d58578511120f57ad990124ea) | Added a non-destructive demo seeder for restaurants, dishes, and reviews. |
| **6. Product polish** | [`f8f68a3`](https://github.com/yahmadi45/-Food-Marketplace/commit/f8f68a3dee458630a45340ea219005492d76db53) | Redesigned customer pages, lazy-loaded routes, hardened API validation, improved docs and seed safety. |
| **7. Testing and deployment preparation** | Current working changes | Vitest component tests, Playwright E2E, database utility cleanup, production Compose/Caddy template, release guidance. These changes are not pushed yet. |

## Features

- Restaurant search and cuisine, rating, and delivery-time filters.
- Restaurant menus grouped by category, customer reviews, and cart.
- JWT customer registration/login, checkout, order history, and admin pages.
- Demo data seeding without dropping existing tables.

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

There is one current branch, `main`; milestone names above are descriptions of commits, not existing tags. After the current work is merged/pushed and CI passes, create a tag on the verified commit and publish it through GitHub **Releases**:

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
frontend/src/pages/HomePage.test.jsx  Vitest component tests
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
