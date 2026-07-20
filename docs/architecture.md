# Metiora Headless A2A ASP Architecture Overview

Metiora is an **Agent Service Provider (ASP)** designed for the **OKX.AI Marketplace** and **Onchain OS** agent ecosystem. It is built strictly as a headless, autonomous AI operating partner without web dashboards or chat user interfaces.

## Clean Architecture Layers

Metiora enforces Clean Architecture principles where dependencies point strictly inward toward the Core Domain:

```
+-------------------------------------------------------------+
|               Integrations & Infrastructure                 |
|   (OKX.AI ASP Protocol, Onchain OS, Prisma DB, Redis)      |
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
|                 Application & Engine Layers                 |
| (Memory Engine, Strategic Intelligence, Conversation Engine)|
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
|                      AI Provider Layer                      |
| (Abstract Interfaces for Gemini, Claude, OpenAI, OpenRouter)|
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
|                         Core Domain                         |
|   (User Memory, Startup Memory, Task, Deliverable Models)   |
+-------------------------------------------------------------+
```

### Core Architectural Guarantees
1. **Decoupled AI Providers**: `IAIProvider` abstraction allows hot-swapping between Gemini, Claude, OpenAI, and OpenRouter without modifying business engines.
2. **Persistent Memory Layer**: `UserMemoryProfile` (founder identity) and `StartupMemoryState` (persistent startup facts) decouple context state from individual task executions.
3. **Strategic Intelligence (CSO)**: `IBusinessIntelligenceEngine` performs intent resolution, gap detection, consistency verification, and action recommendations before asset generation.
4. **OKX.AI A2A Marketplace Integration**: Clean interfaces for task negotiation, escrow execution, and deliverable submission.
