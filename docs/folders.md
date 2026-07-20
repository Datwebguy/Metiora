# Metiora Folder Structure & Module Responsibilities

```
/metiora
├── /src
│   ├── /ai
│   │   └── /providers               # AI Provider Abstraction (Gemini, Claude, OpenAI, OpenRouter)
│   ├── /business-intelligence
│   │   └── /interfaces              # Strategic Intelligence (CSO) Reasoning Engine Contracts
│   ├── /config                      # Zod-validated Environment Configuration
│   ├── /conversation
│   │   └── /interfaces              # Goal-Driven Conversation Engine Lifecycle Contracts
│   ├── /core
│   │   ├── /domain                  # Pure Domain Entities (User Memory, Startup Memory, Task, Asset)
│   │   └── /ports                   # Repository Interfaces
│   ├── /integrations
│   │   ├── /okx                     # OKX.AI Marketplace A2A ASP Protocol Contracts
│   │   └── /onchainos               # Onchain OS / OpenClaw / Hermes Agent Contracts
│   ├── /memory
│   │   └── /interfaces              # User & Startup Memory Engine Contracts
│   ├── /services
│   │   └── /interfaces              # Service Contracts (Blueprint, Investor Ready, Grant, etc.)
│   ├── /shared
│   │   ├── /errors                  # Domain, Application, & Infrastructure Error Hierarchy
│   │   ├── /logging                 # Centralized Structured Logger & Tracer
│   │   └── /types                   # Common TypeScript Types
│   ├── /storage
│   │   ├── /database                # Prisma ORM & PostgreSQL Client Service
│   │   └── /redis                   # Optional Redis Cache Interface Abstraction
│   └── index.ts                     # Headless Foundation Entrypoint
├── /prisma
│   └── schema.prisma                # PostgreSQL Schema Setup
├── /docs                            # System Architecture & Workflow Documentation
├── package.json                     # Node.js TypeScript Package Manifest
├── tsconfig.json                    # Strict Compiler Options & Path Aliases
├── .eslintrc.json                   # ESLint Quality Rules
├── .prettierrc                      # Code Formatting Rules
├── .env.example                     # Environment Variable Template
└── README.md                        # Project Overview
```
