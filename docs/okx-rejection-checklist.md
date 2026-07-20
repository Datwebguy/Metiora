# OKX ASP Rejection Feedback → Metiora Controls

Source: OKX team emails (Isheno / Coast, Jul 2026) against other ASPs.  
Live base: `https://metiora-api.fly.dev`

## Feedback matrix

| # | What failed on other ASPs | Metiora control | Status |
|---|---------------------------|-----------------|--------|
| 1 | **Token mismatch**: marketplace `0x779ded…` (X Layer USDT0) vs live `0x1E4a…` (wrong chain USDT) | SDK on `eip155:196` quotes `0x779ded0c9e1022225f8e0630b35a9b54be713736`; constant `XLAYER_USDT0_ASSET` | **PASS** (live decode) |
| 2 | x402-validate passes symbol but pay enforces **address equality** | Never register a different fee token than live accepts[].asset | **PASS** |
| 3 | 402 works but paid POST **connection error / timeout / hang** | Fly `min_machines_running=1`, `auto_stop_machines=off`; 25s generation timeout → JSON error | **HARDENED** |
| 4 | Required body fields not published → 400 after pay | `requiredBodyFields` on `/v1/a2mcp/services` + unpaid 402 body | **HARDENED** |
| 5 | Advertised tool names **not on live endpoint** (TOOL_NOT_FOUND) | Fixed paths only; `validOperations` list; no inventing MCP tool aliases | **PASS** |
| 6 | Discovery only via unpaid GET; pay channel can't list tools | `POST /v1/a2mcp/tools` + services catalog public | **HARDENED** |
| 7 | Endpoint **404** (not deployed / wrong path) | All 6 `/v1/a2mcp/*` return **402**, not 404 | **PASS** |
| 8 | Registered URL ≠ live URL | `resource.url` = exact Fly URL; register the same strings | **PASS** (operator must copy exactly) |
| 9 | No uptime monitoring | Fly HTTP checks on `/health` every 15s | **PASS** |

## Register ONLY these endpoints

| Operation | Method | Full URL | Price |
|-----------|--------|----------|-------|
| startup_blueprint | POST | https://agentmetiora.xyz/v1/a2mcp/startup-blueprint | $3 |
| investor_ready | POST | https://agentmetiora.xyz/v1/a2mcp/investor-ready | $3 |
| grant_builder | POST | https://agentmetiora.xyz/v1/a2mcp/grant-builder | $2 |
| partnership_studio | POST | https://agentmetiora.xyz/v1/a2mcp/partnership-studio | $1 |
| token_launch_kit | POST | https://agentmetiora.xyz/v1/a2mcp/token-launch-kit | $0.3 |
| startup_health | POST | https://agentmetiora.xyz/v1/a2mcp/startup-health | $0.3 |

**Fee token on registration:** `0x779ded0c9e1022225f8e0630b35a9b54be713736`  
**Network / chainId:** X Layer **196** (`eip155:196`)  
**payTo:** same as Fly secret `PAY_TO_ADDRESS`  
**Required body (after pay):**

```json
{
  "founderProfileId": "<uuid>",
  "startupProfileId": "<uuid>"
}
```

## Pre-live self-test (do before listing)

```powershell
# 1) Must be 402 with payment-required header
curl.exe -i -X POST "https://metiora-api.fly.dev/v1/a2mcp/startup-blueprint" `
  -H "Content-Type: application/json" `
  -d "{\"founderProfileId\":\"00000000-0000-0000-0000-000000000001\",\"startupProfileId\":\"00000000-0000-0000-0000-000000000002\"}"

# 2) Decode payment-required base64 → asset MUST be 0x779ded…

# 3) Catalog
curl.exe -s "https://metiora-api.fly.dev/v1/a2mcp/services"

# 4) Real paid path: task-402-pay / agent wallet against YOUR listing before go-live
```

## Do NOT register

- Old internal paths: `/services/*` (API-key protected, not x402)
- Fake tool names: `reputation_audit`, `escrow_check`, etc.
- Non-HTTPS or localhost
- Wrong USDT contract from another chain
