# agentmetiora.xyz → Fly DNS (Namecheap)

## DNS records to add in Namecheap

**Domain List → agentmetiora.xyz → Manage → Advanced DNS**

Delete any default parking/URL redirect records that conflict.

### Required (apex domain)

| Type | Host | Value | TTL |
|------|------|--------|-----|
| **A Record** | `@` | `66.241.125.216` | Automatic |
| **AAAA Record** | `@` | `2a09:8280:1::150:1a07:0` | Automatic |

### Recommended (API subdomain)

| Type | Host | Value | TTL |
|------|------|--------|-----|
| **A Record** | `api` | `66.241.125.216` | Automatic |
| **AAAA Record** | `api` | `2a09:8280:1::150:1a07:0` | Automatic |

Optional www:

| Type | Host | Value |
|------|------|--------|
| **CNAME** | `www` | `agentmetiora.xyz` |

## After DNS saves

Wait 5–30 minutes, then:

```powershell
flyctl certs check agentmetiora.xyz -a metiora-api
flyctl certs check api.agentmetiora.xyz -a metiora-api
curl.exe -sI "https://agentmetiora.xyz/health"
curl.exe -sI "https://agentmetiora.xyz/avatar.png"
```

## Public URLs for OKX listing (once HTTPS works)

| Item | URL |
|------|-----|
| Avatar | https://agentmetiora.xyz/avatar.png |
| Health | https://agentmetiora.xyz/health |
| Services catalog | https://agentmetiora.xyz/v1/a2mcp/services |
| Blueprint | https://agentmetiora.xyz/v1/a2mcp/startup-blueprint |
| Investor | https://agentmetiora.xyz/v1/a2mcp/investor-ready |
| Grant | https://agentmetiora.xyz/v1/a2mcp/grant-builder |
| Partnership | https://agentmetiora.xyz/v1/a2mcp/partnership-studio |
| Token | https://agentmetiora.xyz/v1/a2mcp/token-launch-kit |
| Health svc | https://agentmetiora.xyz/v1/a2mcp/startup-health |

Fly fallback still works: `https://metiora-api.fly.dev/...`
