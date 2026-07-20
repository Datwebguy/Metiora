# OKX Onchain OS — Official Docs Map for Metiora

**Status:** Planning reference for payment + ASP listing  
**Do not commit real API keys / secrets / passphrases.**

## Official links (source of truth)

| Topic | URL |
|--------|-----|
| Agent Payments Protocol (APP) | https://web3.okx.com/onchainos/dev-docs/payments/app |
| Payment SDK overview | https://web3.okx.com/onchainos/dev-docs/payments/sdk-overview |
| A2MCP how-to | https://web3.okx.com/onchainos/dev-docs/okxai/howtomcp |
| HTTP Seller SDK integrate | https://web3.okx.com/onchainos/dev-docs/payments/service-seller-sdk |
| Register as ASP | https://web3.okx.com/onchainos/dev-docs/okxai/registerasp |
| Agent Seller (A2A messaging) | https://web3.okx.com/onchainos/dev-docs/payments/agent-seller |

---

## Two ASP modes Metiora can use

| | **A2MCP** (tool / API) | **A2A** (negotiated agent tasks) |
|--|------------------------|----------------------------------|
| Fit for Metiora | Single-call deliverables (blueprint, health, etc.) | Multi-turn, memory-heavy partner work |
| Buyer flow | Call HTTPS endpoint → pay if required → get JSON | Negotiate → escrow (when available) → deliver |
| Payment | **x402** via OKX Payment SDK (`exact` / charge / etc.) | Agent Payments Protocol on IM channel; escrow coming soon |
| Needs public HTTPS | **Yes** | Optional (IM channel can be enough for pure A2A seller) |
| Endpoint must | Free `200` **or** unpaid call → **HTTP 402** + `PAYMENT-REQUIRED` | Profile + messaging / task protocol |

Metiora already has HTTPS: `https://metiora-api.fly.dev`  
Health stays public for probes; business routes are API-key locked (may need a **dedicated public x402 path** for marketplace buyers).

---

## Credentials — what each set is for

### 1) Metiora API key (ours — already live)

| Field | Purpose |
|-------|---------|
| `METIORA_API_KEY` | Protects **our** server / founder data |

Stored in Fly secrets + local `.metiora-api-key.local`. **Not** an OKX credential.

### 2) OKX Developer Portal keys (for x402 Facilitator / HTTP Seller SDK)

Official SDK examples use:

```ts
new OKXFacilitatorClient({
  apiKey: process.env.OKX_API_KEY,
  secretKey: process.env.OKX_SECRET_KEY,
  passphrase: process.env.OKX_PASSPHRASE,
});
```

| Field | Purpose |
|-------|---------|
| `OKX_API_KEY` | Developer Portal project key |
| `OKX_SECRET_KEY` | Signs requests to OKX facilitator |
| `OKX_PASSPHRASE` | Completes OKX API auth |

**Apply at:** [OKX Developer Portal](https://web3.okx.com/zh-hans/onchainos/dev-portal) (or regional portal).

These are **not** for random trading of the whole account if scoped correctly — but treat them like production secrets.  
**Never paste them into chat, git, or Telegram.**

### 3) Wallet address (`PAY_TO`)

| Field | Purpose |
|-------|---------|
| `PAY_TO_ADDRESS` | Your **X Layer** receiving wallet (must match marketplace listing) |

Network in docs: **`eip155:196`** (X Layer mainnet).  
Stablecoin example in A2MCP docs: USDT0  
`0x779ded0c9e1022225f8e0630b35a9b54be713736`

Token address in the live **402 challenge** must match what the marketplace registered — mismatch was a common delist reason.

### 4) Optional later

| Item | When |
|------|------|
| Telegram bot token | Pure A2A Agent Seller via messaging |
| Agentic Wallet login (email) | Onchain OS identity / listing skills |

---

## Payment primitives (from APP whitepaper docs)

| Intent | Use case | Settlement |
|--------|----------|------------|
| `charge` / `exact` | One-shot fixed price API | Instant |
| `escrow` | Task hold until acceptance | After accept / dispute |
| `session` | Metered streaming | On channel close |
| `upto` | Capped metered | After usage report |

**Metiora fixed packages** map best to **`exact` / charge** per service (e.g. $50 blueprint).  
Full multi-day escrow is **A2A / Agent Seller** oriented; docs note escrow for agent sellers is still evolving.

---

## Compliant x402 unpaid response (A2MCP checklist)

Without payment header, paid endpoint must return **HTTP 402** with challenge in **`PAYMENT-REQUIRED`** header (v2 base64 — SDK places it correctly).

Shape (conceptual):

- `x402Version`: 2  
- `resource.url`: **exact public endpoint** registered  
- `accepts[].network`: `eip155:196`  
- `accepts[].asset`: marketplace USDT0 address  
- `accepts[].payTo`: **your** wallet  
- `accepts[].amount`: min units (6 decimals for USDT)  

Self-check:

```bash
curl -i -X POST https://metiora-api.fly.dev/<paid-path>
# Paid ✅ → HTTP 402 + PAYMENT-REQUIRED
# Free  ✅ → HTTP 200 + body
```

---

## Recommended Metiora integration order

1. **Get OKX Dev Portal** `API_KEY` + `SECRET_KEY` + `PASSPHRASE` (store only in Fly secrets).  
2. **Confirm `PAY_TO_ADDRESS`** on X Layer (Agentic Wallet).  
3. **Add Node x402 middleware** (`@okxweb3/x402-express` or Fastify adapter) on dedicated public routes, e.g.  
   - `POST /v1/services/startup-blueprint` (paid, no Metiora API key — payment is the gate)  
   - Keep internal admin routes behind `METIORA_API_KEY`.  
4. **Self-check 402** with curl.  
5. **Register A2MCP ASP** with that endpoint + price.  
6. Optionally also **A2A ASP** for negotiated multi-step work.

---

## Security rules

1. Never commit `OKX_*` or `PAY_TO` private keys.  
2. Fly: `fly secrets set OKX_API_KEY=... OKX_SECRET_KEY=... OKX_PASSPHRASE=... PAY_TO_ADDRESS=0x...`  
3. Public paid routes: **payment-gated only**; do not expose list-all-founders.  
4. `/health` stays public for Fly probes.  
5. Rotate any secret that ever appears in chat or a screenshot.
