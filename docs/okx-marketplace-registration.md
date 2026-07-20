# OKX.AI Marketplace Registration & Publication Specification

This document details Metiora's official publication and service registration as an **Agent Service Provider (ASP)** on the **OKX.AI Marketplace**.

---

## 1. ASP Registration Architecture

```
+-----------------------------------------------------------------------+
|                         OKX.AI Marketplace                            |
|             (Agent Discovery & Public Service Registry)               |
+-----------------------------------------------------------------------+
                                    │
                                    ▼
       +---------------------------------------------------------+
       |             ProfilePublisher (ASP Profile)              |
       |  Name: metiora-ai-operating-partner                    |
       |  Category: Professional Asset Creation & BI            |
       |  Version: 1.0.0                                         |
       +---------------------------------------------------------+
                                    │
                                    ▼
       +---------------------------------------------------------+
       |             CatalogPublisher (Service Catalog)          |
       +---------------------------------------------------------+
                                    │
       ┌───────────────┬────────────┼────────────┬───────────────┐
       ▼               ▼            ▼            ▼               ▼
 [Blueprint]       [Investor]    [Grant]   [Partnership]  [Token Launch]  [Health]
 ($50/Fixed)       ($75/Fixed) ($60/Fixed)  ($60/Fixed)    ($100/Fixed)  ($40/Fixed)
       │               │            │            │               │           │
       └───────────────┴────────────┼────────────┴───────────────┴───────────┘
                                    ▼
       +---------------------------------------------------------+
       |             ServiceValidator & PricingEngine            |
       |   Validates Schemas & Execution Modes:                  |
       |   • AUTO_MATCH                                          |
       |   • DIRECT_ASSIGNMENT                                   |
       |   • PUBLIC_LISTING                                      |
       +---------------------------------------------------------+
```

---

## 2. Agent Service Provider (ASP) Profile

Metiora's registered ASP profile:
* **Agent Name**: `metiora-ai-operating-partner`
* **Display Name**: `Metiora — AI Operating Partner for Founders`
* **Description**: Production-grade Agent Service Provider (ASP) delivering persistent Company Memory, Business Intelligence, Startup Blueprints, Investor Pitch Packages, Grant Proposals, Strategic Partnership Kits, Tokenomics Design, and Continuous Health Assessment.
* **Category**: `Professional Asset Creation & Business Intelligence`
* **Supported Languages**: `['en', 'zh', 'es']`
* **Contact Email**: `asp@metiora.ai`
* **Website**: `https://metiora.ai`
* **Documentation**: `https://docs.metiora.ai`
* **Version**: `1.0.0`

---

## 3. Registered Service Catalog

| Service | Est. Time | Base Price | Pricing Mode | Execution Modes |
| :--- | :--- | :--- | :--- | :--- |
| **Startup Blueprint** | 5 mins | $50 USD | FIXED | `AUTO_MATCH`, `DIRECT_ASSIGNMENT`, `PUBLIC_LISTING` |
| **Investor Ready Package** | 5 mins | $75 USD | FIXED | `AUTO_MATCH`, `DIRECT_ASSIGNMENT`, `PUBLIC_LISTING` |
| **Grant Builder Package** | 5 mins | $60 USD | FIXED | `AUTO_MATCH`, `DIRECT_ASSIGNMENT`, `PUBLIC_LISTING` |
| **Partnership Studio** | 5 mins | $60 USD | FIXED | `AUTO_MATCH`, `DIRECT_ASSIGNMENT`, `PUBLIC_LISTING` |
| **Token Launch Kit** | 5 mins | $100 USD | FIXED | `AUTO_MATCH`, `DIRECT_ASSIGNMENT`, `PUBLIC_LISTING` |
| **Startup Health Review** | 3 mins | $40 USD | FIXED | `AUTO_MATCH`, `DIRECT_ASSIGNMENT`, `PUBLIC_LISTING` |

---

## 4. Discovery Metadata & Keywords Matrix

- **Startup Blueprint**: `startup`, `blueprint`, `business plan`, `strategy`, `mvp`
- **Investor Ready Package**: `investor`, `fundraising`, `pitch deck`, `investor memo`, `vc`
- **Grant Builder Package**: `grant`, `funding`, `innovation`, `budget`, `web3 grant`
- **Partnership Studio**: `partnership`, `alliance`, `integration`, `enterprise`, `outreach`
- **Token Launch Kit**: `token`, `tokenomics`, `crypto`, `web3`, `governance`
- **Startup Health**: `health`, `assessment`, `audit`, `analytics`, `growth`

---

## 5. API Endpoint Matrix

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/okx/marketplace/profile` | Publish/register Metiora ASP Profile. |
| `GET` | `/okx/marketplace/profile` | Retrieve published ASP Profile metadata. |
| `POST` | `/okx/marketplace/register-service` | Register all 6 services into OKX Catalog. |
| `GET` | `/okx/marketplace/catalog` | Discovery query catalog by keyword, max price, execution mode. |
| `POST` | `/okx/marketplace/validate-task` | Validate task compatibility and schema readiness. |

---

## 6. Verification Summary

- **Total Test Suites**: 12 passing
- **Total Unit & Integration Tests**: 84 passing
- **TypeScript Compilation**: Clean (0 errors)
