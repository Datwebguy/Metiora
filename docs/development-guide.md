# Metiora Development Guide

## Prerequisites
- Node.js >= 20.x
- pnpm >= 8.15.0
- Docker & Docker Compose (for PostgreSQL & Redis)

## Setup Steps

1. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```

2. **Start Infrastructure Containers**:
   ```bash
   docker-compose up -d
   ```

3. **Install Workspace Dependencies**:
   ```bash
   pnpm install
   ```

4. **Build All Packages**:
   ```bash
   pnpm build
   ```

5. **Run API Server**:
   ```bash
   pnpm dev:api
   ```
   *Health Endpoints*:
   - Version: `http://localhost:3001/version`
   - Status: `http://localhost:3001/status`

6. **Run Web Client**:
   ```bash
   pnpm dev:web
   ```
   - App URL: `http://localhost:3000`
