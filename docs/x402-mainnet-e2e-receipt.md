# Metiora x402 mainnet E2E receipt

**Status:** SUCCESS  
**Date (UTC):** 2026-07-19T12:35:29Z  
**App version:** 1.0.6-prod  
**Protocol:** OKX Agent Payments Protocol / x402 v2 `exact`

## Charge

| Field | Value |
|--------|--------|
| Endpoint | `POST https://metiora-api.fly.dev/v1/a2mcp/smoke-test` |
| Network | `eip155:196` (X Layer mainnet) |
| Token (asset) | `0x779ded0c9e1022225f8e0630b35a9b54be713736` (USD₮0) |
| Amount | `10000` base units = **0.01 USDT0** |
| payTo | `0x2d41c223c43ca15fbab5d25b6279d518ed4593fd` |
| payer | `0x2d41c223c43ca15fbab5d25b6279d518ed4593fd` |
| Note | Buyer = seller (self-pay). Still validates real facilitator settle + delivery. |

## Settlement

| Field | Value |
|--------|--------|
| HTTP after pay | **200 OK** |
| `payment-response` status | **success** |
| txHash | `0x67593a62e57767e300fe2c87820a7956b9a06e411b013d44def09f628535f30c` |
| Explorer | https://web3.okx.com/explorer/x-layer/tx/0x67593a62e57767e300fe2c87820a7956b9a06e411b013d44def09f628535f30c |

## Delivery body (excerpt)

```json
{
  "success": true,
  "service": "smoke_test",
  "operation": "smoke_test",
  "message": "Metiora x402 mainnet smoke delivery OK",
  "deliveredAt": "2026-07-19T12:35:29.804Z",
  "paymentNetwork": "eip155:196",
  "feeToken": "0x779ded0c9e1022225f8e0630b35a9b54be713736"
}
```

## Flow used

1. Unpaid POST → `HTTP 402` + `payment-required` (asset = official USDT0)  
2. `onchainos payment pay --payload <PAYMENT-REQUIRED>` (TEE sign, CLI v4.1.0)  
3. Replay POST with `PAYMENT-SIGNATURE` → **200** + delivery JSON + `payment-response` success  

## Not covered by this smoke

- Full `$50` blueprint delivery (needs more USDT0 + founder/startup UUIDs)  
- Distinct buyer ≠ seller wallets (here payTo == payer)  
- Marketplace `task-402-pay` against a listed service ID  

For product listings, still register only production service URLs (not smoke-test).
