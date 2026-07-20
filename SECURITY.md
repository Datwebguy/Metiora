# Security

## Reporting

If you find a vulnerability in Metiora, email the operator at asp@agentmetiora.xyz with steps to reproduce. Do not open a public issue for active secrets exposure.

## Secrets policy

Never commit:

- API keys (Metiora or OKX)
- Facilitator passphrases
- Private keys or seed phrases
- Production database URLs with credentials
- Local key dump files such as `.metiora-api-key.local`

Use Fly secrets or a local `.env` that stays gitignored. Rotate anything that may have leaked.

## Public vs private surface

| Surface | Access |
|--------|--------|
| Website, health, avatar, A2MCP catalog, bootstrap, paid products | Public (products gated by x402) |
| Memory admin, internal service helpers, metrics (default) | Metiora API key |

Marketplace payment is not a substitute for operator authentication on private routes.
