# User Memory Engine Specification & Developer Guide

The **User Memory Engine** is Metiora's persistent knowledge infrastructure dedicated exclusively to founder identity, preferences, professional experience, communication style, and track record.

---

## 1. User Memory Architecture

User Memory belongs to the founder, **never the startup**. Because one founder may own or advise multiple startups, User Memory operates independently from `StartupMemoryState`.

```
+-------------------------------------------------------------------+
|                    Downstream AI Services                         |
| (BI, Conversation Engine, Blueprint, Investor Ready, Grants, etc.) |
+-------------------------------------------------------------------+
                                  ▲
                                  │ Standardized Memory Snapshot
+-------------------------------------------------------------------+
|                        User Memory Engine                         |
|   - Conflict Detector  - Snapshot Builder  - Versioning Engine    |
+-------------------------------------------------------------------+
                                  ▲
                                  │ Pure Domain Aggregate
+-------------------------------------------------------------------+
|                Prisma User Memory Repository                       |
| (Normalized Postgres Tables: Identity, Pro, Personal, History)    |
+-------------------------------------------------------------------+
```

---

## 2. Normalized Database Schema

User Memory is modeled using normalized relational models to maintain high domain integrity:

* **`FounderProfile`**: Aggregate root containing email, current version number, and timestamps.
* **`FounderIdentity`**: Full Name, Preferred Name, Title, Bio, Country, Timezone, Confidence Level.
* **`FounderProfessional`**: Skills, Industries, Experience Years, Areas of Expertise, Certifications.
* **`FounderPersonal`**: Founder Story, Personal Mission, Leadership Style, Long-term Vision.
* **`FounderCommunication`**: Writing Style, Tone, Preferred Language, Document Style.
* **`FounderPublicPresence`**: Website, Twitter/X, LinkedIn, GitHub, Portfolio URLs.
* **`FounderHistoryEntry`**: Track record of previous startups, accelerators, awards, investments, and speaking events.
* **`FounderPreferences`**: Brand Style, Investor Preferences, Grant Preferences.
* **`FounderMemoryVersion`**: Immutable historical JSON snapshots for every approved profile version.
* **`FounderPendingUpdate`**: Proposed changes awaiting explicit founder approval when conflicts or inferred updates occur.

---

## 3. Approval & Conflict Lifecycles

1. **Direct Update (No Conflict)**:
   - When incoming fields do not conflict with approved data, the update is applied immediately and increments the aggregate `version`.
2. **Conflict Detection & Proposal**:
   - When an incoming value differs from existing approved data (e.g., changing full name or mission statement), `ConflictDetector` generates a `ConflictDescriptor` detailing:
     - `fieldPath`
     - `currentValue`
     - `suggestedValue`
     - `explanation`
     - `confidenceDiff`
   - A `FounderPendingUpdateProposal` is saved with status `PENDING`. No data is overwritten automatically.
3. **Approval (`POST /founder/:id/approve`)**:
   - Merges proposed data into the current profile aggregate, increments `version`, creates a new `FounderMemoryVersion` record, and marks the proposal as `APPROVED`.
4. **Rejection (`POST /founder/:id/reject`)**:
   - Marks the proposal as `REJECTED` without mutating the founder profile.

---

## 4. Confidence Model

Every field tracks metadata:
* **HIGH**: Explicitly confirmed by the founder.
* **MEDIUM**: Founder edited an AI suggestion.
* **LOW**: AI inferred from external materials.
* **UNKNOWN**: Unconfirmed.

---

## 5. Standardized User Memory Snapshot Format

`UserMemorySnapshot` is injected into downstream workflow services:

```json
{
  "founderId": "uuid",
  "version": 2,
  "generatedAt": "2026-07-18T03:15:00.000Z",
  "founderSummary": {
    "fullName": "Alex Founder",
    "title": "CEO",
    "location": "United States (UTC-7)"
  },
  "professionalProfile": {
    "skills": ["AI Systems", "Backend Architecture"],
    "industries": ["Artificial Intelligence"],
    "expertise": ["Market Strategy"]
  },
  "strategicVision": {
    "personalMission": "Empower founders through persistent AI memory."
  },
  "communicationPreferences": {
    "preferredLanguage": "en",
    "tone": "executive"
  },
  "trackRecord": [
    { "type": "PREVIOUS_STARTUP", "organization": "Metiora Labs", "role": "Founder" }
  ]
}
```

---

## 6. API Endpoint Matrix

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/founder` | Create a new founder profile (v1). |
| `GET` | `/founder/:id` | Retrieve founder profile aggregate. |
| `PATCH` | `/founder/:id` | Update profile (applies update or creates pending proposal). |
| `GET` | `/founder/:id/history` | Retrieve full immutable version history. |
| `POST` | `/founder/:id/approve` | Approve pending update proposal. |
| `POST` | `/founder/:id/reject` | Reject pending update proposal. |
| `GET` | `/founder/:id/snapshot` | Generate standardized memory snapshot. |

---

## 7. Developer Extension Guide

To add a new founder field:
1. Add the field to `prisma/schema.prisma` under the appropriate normalized model.
2. Run `pnpm exec prisma generate`.
3. Update `FounderProfileAggregate` in `src/core/domain/user-memory.ts`.
4. Update `mapToAggregate` in `src/storage/database/repositories/prisma-user-memory-repository.ts`.
5. Update `SnapshotBuilder` if the field should be included in AI snapshots.
