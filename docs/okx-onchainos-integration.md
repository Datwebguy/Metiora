# OKX.AI Ecosystem & OnchainOS Integration Specification

This document details Metiora's production-ready integration with the **OKX.AI Marketplace** and **OnchainOS** as an Agent-to-Agent (A2A) Agent Service Provider (ASP).

---

## 1. Integration Architecture & A2A Workflow

```
+--------------------------------------------------------------------------+
|                            OKX.AI Marketplace                            |
|     (Agent Discovery, Negotiation, Escrow & Rating Ecosystem)            |
+--------------------------------------------------------------------------+
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
       +---------------------------+   +---------------------------+
       |   OKX Agent Identity      |   |      Agentic Wallet       |
       +---------------------------+   +---------------------------+
                     │                               │
                     └───────────────┬───────────────┘
                                     ▼
                     +-------------------------------+
                     |     TaskHandler (A2A Flow)    |
                     +-------------------------------+
                                     │
                     +---------------+---------------+
                     │                               │
                     ▼                               ▼
       +---------------------------+   +---------------------------+
       |    User & Startup Memory   |   |   Business Intelligence   |
       +---------------------------+   +---------------------------+
                                     │
                                     ▼
                     +-------------------------------+
                     |      A2aServiceAdapter        |
                     +-------------------------------+
                                     │
         ┌───────────┬───────────┼───────────┬───────────┬───────────┐
         ▼           ▼           ▼           ▼           ▼           ▼
     [Blueprint] [Investor]   [Grant]   [Partnership]  [Token]   [Health]
         │           │           │           │           │           │
         └───────────┴───────────┼───────────┴───────────┴───────────┘
                                 ▼
                     +-------------------------------+
                     |  DeliveryFormatter (Standard) |  --> JSON + Markdown + Metadata
                     +-------------------------------+
                                 │
                                 ▼
                     +-------------------------------+
                     |      Escrow Settlement        |  --> OKX Escrow Settlement & Rating
                     +-------------------------------+
```

---

## 2. Installed OnchainOS Skills Summary

The official OKX OnchainOS skills suite has been installed into `~/.agents/skills/`:
1. `okx-agent-payments-protocol`: Protocol for agent-to-agent micropayments and escrow settlement.
2. `okx-agentic-wallet`: Non-custodial agentic wallet authentication and session management.
3. `okx-ai`: Core OKX AI model routing and prompt orchestration.
4. `okx-dapp-discovery`: Decentralized application registry and capability lookup.
5. `okx-defi`: Yield and liquidity pool telemetry for tokenomics analysis.
6. `okx-dex-market`: DEX market depth and price feed validation.
7. `okx-growth-competition`: Ecosystem growth tracking and developer metrics.
8. `okx-guide`: OKX developer documentation and protocol standards guidance.

---

## 3. Complete A2A Task Execution Lifecycle

When another AI agent requests a Metiora service on the OKX.AI Marketplace:
1. **Receive Task** (`POST /okx/task`): Task payload received and recorded with status `RECEIVED`.
2. **Escrow Lock**: Escrow status verified via `OkxEscrowManager` (`INITIATED` -> `CONFIRMED`).
3. **Load Persistent Context**: `User Memory` and `Startup Memory` loaded.
4. **Business Intelligence Check**: `ReadinessEvaluator` evaluates readiness and component gaps.
5. **Execute Service**: Service executed statelessly via `A2aServiceAdapter`.
6. **Deliver Standardized Output**: Deliverable packaged into dual JSON & Markdown with confidence scores.
7. **Settlement & Rating**: Escrow settled and buyer rating recorded into `OkxRatingRecord`.

---

## 4. Standardized Delivery Format

Every delivered A2A payload returns:
* `contentJson`: Canonical structured JSON.
* `contentMarkdown`: Founder-facing GitHub markdown representation.
* `metadata`: Protocol version (`OKX.AI A2A v1.0`), service type, and provider ID.
* `executionSummary`: Summary of reasoning and memory synchronization.
* `versionInfo`: System service version and incremented startup memory version.
* `memoryUpdatesSummary`: Audit note of persistent startup memory updates.
* `confidenceScore`: Model confidence score (e.g. `0.95`).
* `executionTimestamp`: ISO timestamp.

---

## 5. API Endpoint Matrix

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/okx/connect` | Register/retrieve OKX Agent Identity (`agentId`, `address`). |
| `POST` | `/okx/login` | Authenticate Agentic Wallet & create 24h session token. |
| `POST` | `/okx/task` | Complete A2A task lifecycle (receive, execute, deliver). |
| `POST` | `/okx/negotiate` | A2A pricing & timeline negotiation management. |
| `POST` | `/okx/deliver` | Retrieve packaged deliverable by task ID. |
| `POST` | `/okx/rating` | Record buyer rating (1.0–5.0) and calculate agent reputation. |
| `GET` | `/okx/status` | Expose marketplace service discovery metadata & status. |

---

## 6. Pre-Marketplace Submission Checklist

Before initiating official OKX.AI Marketplace registration:
- [x] Foundation Architecture & Pure Clean Architecture decoupling.
- [x] User Memory & Startup Memory engines with snapshot builders.
- [x] Business Intelligence Engine (Readiness scoring, gap detection, workflow planning).
- [x] Conversation Engine (Interruption recovery, mode switching, single-question sequencing).
- [x] 6 Core ASP Services (Blueprint, Investor, Grant, Partnership, Token, Health).
- [x] OnchainOS Skills Installed (`okx/onchainos-skills`).
- [x] Agentic Wallet & Agent Identity modules.
- [x] A2A Task Lifecycle & Escrow Workflow.
- [x] Standardized Delivery Packaging & Rating System.
- [x] 100% Vitest test pass rate (78/78 tests passing).
- [x] Zero TypeScript compiler errors.
- [ ] **Final Step**: Official ASP Registration on OKX.AI Agent Marketplace (Phase 13).
