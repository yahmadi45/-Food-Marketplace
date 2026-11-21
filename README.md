# Food Marketplace

Application web full-stack de commande de repas : découvrez des restaurants, consultez leurs menus, composez un panier et passez commande. Le projet utilise React, Express, MySQL, Docker Compose et GitHub Actions.

**Interface :** français · **Devise :** dinar tunisien (TND) · **Données :** restaurants de démonstration à Tunis et alentours.

## Évolution du projet — jalons de version

Les intitulés ci-dessous sont des **jalons de développement basés sur les commits Git**, pas des branches Git ni des releases numérotées. Les comparer permet de montrer l’évolution réelle du code, étape par étape.

| Jalon | Commit | Évolution |
| --- | --- | --- |
| **1. Socle marketplace** | [`7fc857a`](https://github.com/yahmadi45/-Food-Marketplace/commit/7fc857aed72d362d0f8b7e7518a1b451459b616d) | Application initiale React/Vite, API Express, MySQL, catalogue, comptes, panier, commandes et administration. |
| **2. Lancement reproductible** | [`c8ad710`](https://github.com/yahmadi45/-Food-Marketplace/commit/c8ad710b99a0a10fb959174117836b276c27c978) | Dockerfiles frontend/backend, Nginx pour servir React et relayer `/api`, Compose avec MySQL persistante, premiers smoke checks GitHub Actions. |
| **3. Exécution et tests renforcés** | [`acb8d46`](https://github.com/yahmadi45/-Food-Marketplace/commit/acb8d46716515885c47e679774e33466e82dd94a) | Images multi-stage, exécution avec moins de privilèges, compte MySQL applicatif limité, endpoints liveness/readiness et tests API. |
| **4. CI fiable et images publiées** | [`313f20a`](https://github.com/yahmadi45/-Food-Marketplace/commit/313f20a6c36c4185a90371f1eb4c83dcb6f02728) | Réessais des contrôles HTTP pour absorber les démarrages lents; CI vérifie l’application avant publication. Le workflow #4 a terminé avec succès. |
| **5. Démonstration avec données sûres** | [`45b07b6`](https://github.com/yahmadi45/-Food-Marketplace/commit/45b07b67f117c11d58578511120f57ad990124ea) | Ajout d’un seed idempotent pour restaurants, plats et avis, sans recréer ni vider la base. |
| **6. Présentation et qualité finale** | [`f8f68a3`](https://github.com/yahmadi45/-Food-Marketplace/commit/f8f68a3dee458630a45340ea219005492d76db53) | Refonte visuelle de l’accueil et des fiches restaurant, lazy-loading des pages, corrections validation/API/panier, README complet et protection du seed de démonstration. |

### Résumé de l’état final

Le dépôt conserve **une seule branche, `main`** : les jalons sont retrouvables dans l’historique des commits et comparables dans GitHub, mais ne sont pas des branches ou tags de release. Le code applicatif reste en React, Node.js/Express et MySQL; Docker le conditionne et Compose le fait tourner ensemble. GitHub Actions teste l’API, construit et vérifie les services, puis publie les images frontend/backend sur Docker Hub. La version locale a été vérifiée avec **huit tests backend réussis**, un build frontend réussi, trois services Compose sains, une API qui renvoie les trois restaurants demo et le site HTTP 200 sur `http://localhost:8080`.

Le pipeline publie des **images**, pas une application hébergée publiquement : aucun serveur public n’est configuré dans ce dépôt.

## Fonctionnalités

- Catalogue de restaurants avec recherche et filtres par cuisine, note et délai de livraison.
- Fiches restaurants, menus classés par catégorie et avis clients.
- Inscription, authentification JWT, panier et validation des commandes.
- Espace d’administration pour gérer les restaurants, plats, commandes, utilisateurs et statistiques.
- Images Docker multi-stage, services Compose avec healthchecks et stockage MySQL persistant.
- Pipeline GitHub Actions pour tester, construire, vérifier et publier les images sur Docker Hub.

## Architecture

```text
Navigateur
└── React + Vite, servi par Nginx non-root (:8080)
    └── /api/* → reverse proxy Nginx
        └── Express / Node.js (:4000)
            └── MySQL 8.4 (réseau interne Compose)
```

| Partie | Technologies | Rôle |
| --- | --- | --- |
| Frontend | React, Vite, React Router | Parcours client et administration |
| Serveur web | Nginx non-root | Fichiers statiques et proxy `/api` |
| API | Node.js, Express, JWT | Authentification, catalogue, commandes, administration |
| Données | MySQL 8.4, `mysql2/promise` | Comptes, restaurants, plats, commandes, avis |
| DevOps | Docker, Compose, GitHub Actions | Images, orchestration locale, tests et publication |

## Démarrage avec Docker

Prérequis : Docker Desktop ou Docker Engine avec le plugin Compose. Depuis la racine du dépôt :

```powershell
docker compose up --pull always -d
```

- Site : <http://localhost:8080>
- API liveness : <http://localhost:4000/api/health>
- API readiness et connexion MySQL : <http://localhost:4000/api/health/ready>

Compose démarre MySQL, attend son healthcheck, initialise un compte applicatif MySQL aux droits limités, puis lance l’API et le frontend. Le volume `mysql_data` conserve les données à travers l’arrêt et la recréation des conteneurs.

Arrêter les conteneurs sans supprimer la base :

```powershell
docker compose down
```

Éviter `docker compose down --volumes` si les données locales doivent être conservées.

## Données de démonstration

Après le premier démarrage, insérer les restaurants, plats, avis et le compte client de démonstration. La commande est idempotente et n’efface pas les données :

```powershell
$env:DEMO_USER_PASSWORD = Read-Host "Mot de passe local du compte demo (12 caracteres minimum)"
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

Le compte client utilise l’adresse `client@demo.local` et le mot de passe que vous fournissez à la commande ci-dessus. Choisissez un mot de passe de démonstration unique ; ne le réutilisez pas en production.

## Développement sans Docker

Démarrer d’abord un serveur MySQL, créer la base `food_marketplace` et exécuter `backend/scripts/schema.sql`. Copier `backend/.env.example` vers `backend/.env`, puis configurer la connexion et `JWT_SECRET`.

Terminal 1, API :

```powershell
cd backend
npm ci
npm run dev
```

Terminal 2, frontend :

```powershell
cd frontend
npm ci
npm run dev
```

Ouvrir <http://localhost:5173>. Vite redirige `/api` vers `http://localhost:4000`. Une fois la base initialisée, le seed local se lance avec `npm run db:seed` depuis `backend/`.

## Tests et build

Tests backend avec le runner natif Node.js :

```powershell
cd backend
npm ci
npm test
```

Build de production du frontend :

```powershell
cd frontend
npm ci
npm run build
```

Routes de diagnostic : `GET /api/health` vérifie que le serveur API répond ; `GET /api/health/ready` vérifie également l’accès à la base.

## GitHub Actions et Docker Hub

Le workflow `.github/workflows/ci.yml` s’exécute sur les pushes vers `main` et les pull requests. Il lance les tests backend, construit et démarre l’environnement Compose, vérifie l’API et le frontend, puis supprime son environnement temporaire de CI.

Après succès des tests, un push sur `main` publie les images si les valeurs Actions du dépôt sont définies :

- Variable `dockerhubuser` : nom d’utilisateur Docker Hub.
- Variable `publishdockerhub` : valeur `true`.
- Secret `DOCKERHUB_TOKEN` : token Docker Hub Read & Write. Ne jamais le committer.

Tags produits :

- `<dockerhub-user>/food-marketplace-backend:latest`
- `<dockerhub-user>/food-marketplace-backend:<commit-sha>`
- `<dockerhub-user>/food-marketplace-frontend:latest`
- `<dockerhub-user>/food-marketplace-frontend:<commit-sha>`

Publier les images ne rend pas le site public. Il faut encore un serveur ou une plateforme d’hébergement pour exécuter l’application.

## Structure du dépôt

```text
backend/
  scripts/       Schéma MySQL, seed non destructif et initialisation du compte applicatif
  src/           Application Express, routes, middleware, connexion DB
  test/          Tests API avec node:test
  Dockerfile     Image API multi-stage
frontend/
  src/           Pages, composants, contexte et styles React
  Dockerfile     Build Vite et runtime Nginx non-root
  nginx.conf     Site statique, headers et proxy API
docker-compose.yml
.github/workflows/ci.yml
```

## Sécurité et maintenance

- `.env.example` contient des valeurs réservées au développement local ; les remplacer par des secrets robustes hors local.
- Ne jamais committer `.env`, mots de passe, tokens ou secrets de production.
- Le backend se connecte à MySQL avec un utilisateur applicatif limité ; root sert uniquement à initialiser ce compte.
- `backend/scripts/setupDb.js` supprime et recrée la base. Ne pas exécuter `npm run db:setup` sur des données à conserver ; utiliser `npm run db:seed` pour ajouter les données de démonstration.
- Avant d’exposer l’application sur Internet, modifier les secrets, revoir le compte de démonstration et les données, limiter l’accès réseau et configurer HTTPS.
