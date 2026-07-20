# Pre-listing test report

**Date (UTC):** 2026-07-19  
**App:** `https://metiora-api.fly.dev` · version live at test time  
**Seller payTo:** `0xd4a80cdda4d12896ea3af9d210477c014758aa9d`  
**Fee token:** `0x779ded0c9e1022225f8e0630b35a9b54be713736` (USDT0)  
**Network:** `eip155:196`

## Test fixtures

| Field | Value |
|--------|--------|
| founderProfileId | `46b695d8-4247-450e-aae3-e136560ac5b8` |
| startupProfileId | `f2b86399-c740-417d-95d4-bc452637f469` |

## 1) x402 preflight (all paths → HTTP 402)

| Service | Price | amount (base) | payTo | asset | Result |
|---------|-------|---------------|-------|-------|--------|
| smoke_test | $0.01 | 10000 | 0xd4a8… | 0x779ded… | **PASS** |
| startup_blueprint | $3 | 3000000 | 0xd4a8… | 0x779ded… | **PASS** (price updated 2026-07-20) |
| investor_ready | $3 | 3000000 | 0xd4a8… | 0x779ded… | **PASS** (price updated 2026-07-20) |
| grant_builder | $2 | 2000000 | 0xd4a8… | 0x779ded… | **PASS** (price updated 2026-07-20) |
| partnership_studio | $1 | 1000000 | 0xd4a8… | 0x779ded… | **PASS** (price updated 2026-07-20) |
| token_launch_kit | $0.3 | 300000 | 0xd4a8… | 0x779ded… | **PASS** (price updated 2026-07-20) |
| startup_health | $0.3 | 300000 | 0xd4a8… | 0x779ded… | **PASS** (price updated 2026-07-20) |

**7/7 PASS**

## 2) Service generation (internal API + Metiora API key)

| Service | Result | Latency | contentMarkdown |
|---------|--------|---------|-----------------|
| Startup Blueprint | **PASS** | ~1.1s | ~1984 chars |
| Investor Ready | **PASS** | ~0.7s | ~1909 chars |
| Grant Builder | **PASS** | ~0.9s | ~2207 chars |
| Partnership Studio | **PASS** | ~0.9s | ~2185 chars |
| Token Launch Kit | **PASS** | ~0.7s | ~502 chars |
| Startup Health | **PASS** | ~0.8s | ~3295 chars |

**6/6 PASS** (all under 2s — no hang / timeout)

## 3) Mainnet paid charge + delivery

| Item | Result |
|------|--------|
| Path | `POST /v1/a2mcp/smoke-test` |
| Amount | $0.01 USDT0 |
| HTTP after pay | **200** |
| Settlement | **success** |
| txHash | `0xc5e4ca7a90d540d95bfd8cc9250e312d0bda6eca7804e0bcae20ab077b91cc99` |

Buyer wallet balance at original test was below product prices, so paid E2E for product packages was not run then. Smoke ($0.01) paid path has been re-verified after price changes. Current ladder: $3 / $3 / $2 / $1 / $0.3 / $0.3.

## Avatar

Pending user upload for marketplace listing asset.
