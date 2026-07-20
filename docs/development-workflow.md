# Metiora Development Workflow

## Prerequisites
- Node.js >= 20.x
- PostgreSQL database
- pnpm package manager

## Setup Commands

1. **Environment Initialization**:
   ```bash
   cp .env.example .env
   ```

2. **Install Dependencies**:
   ```bash
   npx pnpm install
   ```

3. **Compile Foundation Architecture**:
   ```bash
   npm run build
   ```

4. **Run Linter & Formatter**:
   ```bash
   npm run lint
   npm run format
   ```
