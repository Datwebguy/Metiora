# Metiora

**AI operating partner for founders.** Metiora is a live Agent Service Provider on the OKX.AI marketplace. It stores founder and startup context, then delivers ready to use packages when a buyer pays through x402.

| | |
|---|---|
| Website | [agentmetiora.xyz](https://agentmetiora.xyz) |
| Docs | [agentmetiora.xyz/docs](https://agentmetiora.xyz/docs/) |
| Catalog | [agentmetiora.xyz/v1/a2mcp/services](https://agentmetiora.xyz/v1/a2mcp/services) |
| Avatar | [agentmetiora.xyz/avatar.png](https://agentmetiora.xyz/avatar.png) |
| Marketplace | ASP **#6860** Metiora |

---

## Why Metiora exists

Founders repeat the same company story for blueprints, investor materials, grants, and partnerships. Metiora keeps that story in structured memory and regenerates consistent packages from it. Buyers on OKX do not need an operator API key. They create profile IDs, pay, and receive JSON plus Markdown.

This is a production service, not a chat demo.

---

## What each service offers

All prices are in USDT on X Layer. After payment, send `founderProfileId` and `startupProfileId` (from bootstrap). Optional: `blueprintId`.

### Startup Blueprint · $7
**Endpoint:** `POST /v1/a2mcp/startup-blueprint`

Builds a strategic startup blueprint from company memory. Dual JSON and Markdown. For founders who need a clear plan they can share and iterate on.

### Investor Ready Package · $7
**Endpoint:** `POST /v1/a2mcp/investor-ready`

Investor facing package with readiness scoring and memo style narrative. For founders preparing conversations with capital.

### Grant Builder Package · $3
**Endpoint:** `POST /v1/a2mcp/grant-builder`

Grant oriented package with impact narrative and application ready structure. For teams applying to programs and funds.

### Partnership Studio · $3
**Endpoint:** `POST /v1/a2mcp/partnership-studio`

Partnership outreach package: fit, mutual value, and structure for alliance conversations. For founders seeking collaborators.

### Token Launch Kit · $3
**Endpoint:** `POST /v1/a2mcp/token-launch-kit`

Token strategy outline covering utility, distribution ideas, and planning notes. For teams exploring token design.

### Startup Health Review · $2
**Endpoint:** `POST /v1/a2mcp/startup-health`

Multi dimension health assessment with scores and priorities. For founders tracking execution quality over time.

Prices and URLs also live in the live catalog so listings stay in sync with production.

---

## How a buyer uses it

1. **Bootstrap**  
   `POST https://agentmetiora.xyz/v1/a2mcp/bootstrap`  
   Body: founder (`email`, `fullName`) and startup (`name`, `industry`).  
   Response: `founderProfileId` and `startupProfileId`.

2. **Discover**  
   `GET https://agentmetiora.xyz/v1/a2mcp/services`  
   Lists every product, price, network, and full HTTPS URL.

3. **Pay and run**  
   Call a product endpoint. Without payment you get HTTP 402.  
   Complete x402 payment, then retry with payment headers.  
   Response includes the package content.

Buyers never use the Metiora operator API key. Payment is the gate for product routes.

---

## Payment (what the marketplace needs)

| Item | Value |
|------|--------|
| Network | X Layer mainnet (`eip155:196`) |
| Fee token | USDT0 `0x779ded0c9e1022225f8e0630b35a9b54be713736` |
| Protocol | x402 exact (OKX facilitator) |
| Seller wallet | set in production as `PAY_TO_ADDRESS` (not committed to git) |

Register only the six product URLs above on the public domain. Do not list internal smoke routes or localhost.

---

## Project overview

| Area | Role |
|------|------|
| **API** | Fastify + TypeScript, Prisma, Postgres |
| **Payments** | OKX x402 on X Layer |
| **Memory** | Founder and startup profiles that feed packages |
| **Site** | Home, docs, blog on the same domain |
| **Hosting** | Fly.io (`metiora-api`) |

### Layout

```text
src/                 API, domain logic, x402 gate, services
public/site/         Website, docs, blog, brand assets
prisma/              Database schema
tests/               Automated tests
docs/                Extra design notes
```

---

## Run locally (developers)

You need Node 20+, pnpm, and Postgres.

```bash
pnpm install
cp .env.example .env
# set DATABASE_URL (and secrets only in .env, never commit them)
pnpm db:generate
pnpm db:push
pnpm dev
```

```bash
pnpm test
pnpm build
pnpm start
```

Production secrets (API keys, OKX facilitator credentials, `PAY_TO_ADDRESS`) go in environment or Fly secrets. See `.env.example` for names only. See `SECURITY.md` for the public repo policy.

---

## Links

- Product site: https://agentmetiora.xyz  
- GitHub: https://github.com/Datwebguy/Metiora  
- OKX OnchainOS: https://web3.okx.com/onchainos  
- Contact: asp@agentmetiora.xyz  

---

## License

Owned by the repository maintainer. Forks should replace branding, endpoints, and credentials with their own.
