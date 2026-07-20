# Metiora — Production Deployment & Operations Guide

This document details the production build, database configuration, security hardening, containerization, and public deployment procedures for **Metiora**.

---

## 1. Production Architecture Overview

```
+--------------------------------------------------------------------------+
|                            OKX.AI Marketplace                            |
|             (Public Agent Service Provider (ASP) Consumer)               |
+--------------------------------------------------------------------------+
                                     │
                                     ▼ (HTTPS Request / A2A Webhook)
+--------------------------------------------------------------------------+
|                       Metiora Production Backend                         |
|                                                                          |
|  [ Helmet Headers ] -> [ CORS ] -> [ Rate Limit ] -> [ Compression ]     |
|                                                                          |
|  ├── GET /health       (System Health Check & Uptime)                    |
|  ├── GET /ready        (Database & Engine Readiness Verification)         |
|  ├── GET /version      (Release & Commit Build Info)                     |
|  ├── GET /metrics      (Observability & Request Telemetry)               |
|                                                                          |
|  ├── /user-memory/*    (User Memory Engine)                              |
|  ├── /startup-memory/* (Startup Memory Engine)                           |
|  ├── /bi/*             (Business Intelligence Engine)                    |
|  ├── /conversation/*   (Conversation Engine)                             |
|  ├── /services/*       (6 Core ASP Deliverable Services)                 |
|  ├── /okx/*            (OnchainOS & A2A Task Handlers)                   |
|  └── /okx/marketplace/*(Marketplace Discovery & Catalog Registry)        |
+--------------------------------------------------------------------------+
                                     │
                                     ▼ (Connection Pool & Retries)
+--------------------------------------------------------------------------+
|                     PostgreSQL Production Database                       |
|               (Prisma ORM Managed Models & Versioning)                   |
+--------------------------------------------------------------------------+
```

---

## 2. Environment Configuration & Validation

All production environment variables are validated at startup using Zod schemas (`src/shared/config/environment.ts`).

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Production mode execution. |
| `PORT` | Yes | `3000` | Server HTTP port. |
| `HOST` | Yes | `0.0.0.0` | Server listen host interface. |
| `DATABASE_URL` | Yes | `postgresql://...` | PostgreSQL connection string. |
| `LOG_LEVEL` | Yes | `info` | Structured logging verbosity level. |
| `API_BASE_URL` | Yes | `https://api.metiora.ai` | Live public API HTTPS base URL. |
| `RATE_LIMIT_MAX` | Yes | `100` | Max requests per rate-limit window per IP. |
| `RATE_LIMIT_WINDOW_MS` | Yes | `60000` | Rate-limiting window in milliseconds. |

---

## 3. Production Build & Execution Commands

```bash
# 1. Install Dependencies
pnpm install --frozen-lockfile

# 2. Generate Prisma Client
pnpm exec prisma generate

# 3. Apply Production Database Migrations
pnpm exec prisma db push

# 4. Compile TypeScript Production Build
pnpm run build

# 5. Execute Vitest Test Suite
pnpm run test

# 6. Launch Production Backend
pnpm start
```

---

## 4. Docker & Containerized Deployment

### Single-Command Deployment via Docker Compose
```bash
docker-compose up -d --build
```

### Healthcheck Verification
```bash
docker inspect --format='{{json .State.Health}}' metiora-backend
```

---

## 5. Live Production Endpoints

- **Live Public Base URL**: `https://api.metiora.ai` (or container exposed port `3000`)
- **Health Check**: `GET /health`
- **Readiness Check**: `GET /ready`
- **Version Endpoint**: `GET /version`
- **Metrics Endpoint**: `GET /metrics`

---

## 6. Security Hardening Measures

1. **Helmet Security Headers**: Suppresses DNS prefetching, enforces `nosniff`, `xssFilter`, and frameguard protection.
2. **CORS Policy**: Configured to restrict allowed origins for public API requests.
3. **Response Compression**: Gzip/Brotli compression applied via `@fastify/compress`.
4. **Rate Limiting**: Protected against DDoS via `@fastify/rate-limit` (100 req/min).
5. **Database Connection Safety**: Automatic retry handling and connection pooling via Prisma Client.
6. **Graceful Shutdown**: Intercepts `SIGTERM` and `SIGINT` signals to flush logger and safely close database connections.
