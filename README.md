# Metiora

Metiora is an AI operating partner for founders, built as an Agent Service Provider for the OKX.AI marketplace. It turns founder and startup memory into practical packages: blueprints, investor materials, grants, partnerships, token planning, and health reviews. Buyers pay with x402 on X Layer. Operators keep private admin routes behind an API key.

**Live product:** [https://agentmetiora.xyz](https://agentmetiora.xyz)  
**Repository:** [https://github.com/Datwebguy/Metiora](https://github.com/Datwebguy/Metiora)  
**Marketplace agent:** ASP #6860 (listing goes through OKX review after activate)

---

## What you get

- Production API on Fly (Node, Fastify, Prisma, Postgres)
- Public marketing site on the same domain (home, docs, blog, dark and light theme)
- Six paid A2MCP services with real x402 mainnet payments
- Public bootstrap so buyers can create profile IDs without your operator key
- Hardened auth, CORS defaults, readiness checks, and generation timeouts

This is not a demo chat wrapper. Packages are dual JSON and Markdown, driven by structured memory.

---

## Live public routes

| Purpose | URL |
|--------|-----|
| Website | https://agentmetiora.xyz/ |
| Docs | https://agentmetiora.xyz/docs/ |
| Blog | https://agentmetiora.xyz/blog/ |
| Health | https://agentmetiora.xyz/health |
| Services catalog | https://agentmetiora.xyz/v1/a2mcp/services |
| Bootstrap profiles | POST https://agentmetiora.xyz/v1/a2mcp/bootstrap |
| Avatar | https://agentmetiora.xyz/avatar.png |

### Paid products (register only these)

| Service | Price | Endpoint |
|--------|-------|----------|
| Startup Blueprint | 7 USDT | POST /v1/a2mcp/startup-blueprint |
| Investor Ready Package | 7 USDT | POST /v1/a2mcp/investor-ready |
| Grant Builder Package | 3 USDT | POST /v1/a2mcp/grant-builder |
| Partnership Studio | 3 USDT | POST /v1/a2mcp/partnership-studio |
| Token Launch Kit | 3 USDT | POST /v1/a2mcp/token-launch-kit |
| Startup Health Review | 2 USDT | POST /v1/a2mcp/startup-health |

**Network:** eip155:196 (X Layer mainnet)  
**Fee token:** `0x779ded0c9e1022225f8e0630b35a9b54be713736` (USDT0)  
**payTo:** set only via secrets (`PAY_TO_ADDRESS`), never hardcode real wallets in commits if you rotate them

After payment, body fields:

```json
{
  "founderProfileId": "uuid",
  "startupProfileId": "uuid",
  "blueprintId": "uuid"
}
```

`blueprintId` is optional. Create the two profile IDs with bootstrap first.

---

## Buyer flow

1. Call bootstrap with founder and startup details.
2. Read the services catalog for exact URLs and prices.
3. POST a product without payment and expect HTTP 402.
4. Complete x402 payment through the OKX agent wallet path.
5. Replay the request with payment headers and receive the package.

Buyers never need the Metiora API key. Payment is the gate.

---

## Operator flow

Protected routes (founder memory admin, internal service helpers, metrics by default) require:

```http
x-api-key: YOUR_KEY
```

or

```http
Authorization: Bearer YOUR_KEY
```

In production the process refuses to start without a long enough `METIORA_API_KEY`.

---

## Stack

- **Runtime:** Node 22, TypeScript, Fastify
- **Data:** PostgreSQL + Prisma
- **Payments:** `@okxweb3/x402-core` and `@okxweb3/x402-evm` on X Layer
- **Deploy:** Fly.io app `metiora-api`, region iad
- **Site:** static pages under `public/site`, served by the API

Monorepo style layout includes `src/` (API and domain), `public/` (assets and website), `tests/`, and docs under `docs/`.

---

## Local development

### Prerequisites

- Node 20+ (22 recommended)
- pnpm
- PostgreSQL (or Docker Compose if you use the included compose file)

### Setup

```bash
pnpm install
cp .env.example .env
# edit .env with a local DATABASE_URL and optional METIORA_API_KEY
pnpm db:generate
pnpm db:push
pnpm dev
```

Useful scripts:

```bash
pnpm build
pnpm test
pnpm start
```

### Environment

Copy `.env.example` only. Real secrets stay out of git.

Required for full x402 in production:

- `DATABASE_URL`
- `METIORA_API_KEY`
- `OKX_API_KEY`
- `OKX_SECRET_KEY`
- `OKX_PASSPHRASE`
- `PAY_TO_ADDRESS`
- `OKX_PAYMENT_NETWORK=eip155:196`
- `API_BASE_URL=https://agentmetiora.xyz`

Optional AI provider keys exist in the schema for future LLM wiring. Current package generators are deterministic from memory snapshots.

---

## Deploy (Fly)

```bash
flyctl deploy -a metiora-api
flyctl secrets set METIORA_API_KEY=... PAY_TO_ADDRESS=0x... \
  OKX_API_KEY=... OKX_SECRET_KEY=... OKX_PASSPHRASE=...
```

The machine stays warm (`min_machines_running = 1`) so marketplace probes and paid calls avoid cold start timeouts.

---

## Security and privacy for this public repo

**Do not commit:**

- `.env` or any filled secret file
- `.metiora-api-key.local` or rotated key files
- real OKX facilitator credentials
- wallet private keys or seed phrases
- temporary payment payloads under `tmp-*`

`.gitignore` is written to block those paths. Before every push, run:

```bash
git status
# confirm no .env, no *key*, no tmp payment dumps
```

If a secret ever ships by mistake, rotate it on Fly and in the OKX developer portal immediately.

---

## Project map

```text
src/api          Fastify server, auth, routes
src/okx/x402     Payment server and Fastify gate
src/services     Package generators
src/memory       Founder and startup memory use cases
public/site      Marketing site, docs, blog
docs/            Deeper internal design notes
tests/           Vitest suites
```

---

## Website

The site at the domain root includes:

- Home with services, how to use, FAQ, connect links
- Docs for buyers and operators
- Blog posts on payments, bootstrap, and security
- Dark and light theme (saved in local storage)
- Motion that respects reduced motion preferences

Source files live in `public/site/`.

---

## Contributing

Issues and pull requests are welcome for docs, tests, and product polish. Do not open PRs that include secrets or environment files. Prefer small changes with a clear description of behavior.

---

## License

Private or to be declared by the repository owner. If you fork this for your own ASP, replace branding, payTo, and OKX credentials with your own production values.

---

## Credits

Built for founders shipping on OKX.AI. Payments use the official OKX x402 seller path on X Layer. Product name and lime mark: Metiora.
