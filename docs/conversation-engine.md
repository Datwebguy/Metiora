# Conversation Engine Specification & Developer Guide

The **Conversation Engine** is Metiora's natural language communication layer. It transforms founder conversations into structured execution requests for the **Business Intelligence Engine**, maintaining multi-turn context, handling interruptions, and enforcing single-question sequencing strategy.

---

## 1. Conversation Architecture

```
                  +--------------------------+
                  |     Founder Message      |
                  +--------------------------+
                               │
                               ▼
                  +--------------------------+
                  |    Load User Memory      |
                  +--------------------------+
                               │
                               ▼
                  +--------------------------+
                  |   Load Startup Memory    |
                  +--------------------------+
                               │
                               ▼
                  +--------------------------+
                  |   Business Intelligence  |  --> Returns ExecutionPlan
                  +--------------------------+
                               │
                               ▼
                  +--------------------------+
                  |    QuestionSequencer     |  --> Asks 1 question at a time
                  +--------------------------+
                               │
            +------------------+------------------+
            │                                     │
     [Missing Facts]                      [Ready for Workflow]
            │                                     │
            ▼                                     ▼
+-----------------------+              +-----------------------+
| Single Question Turn  |              | Trigger Target        |
| (InformationCollect)  |              | Service Execution     |
+-----------------------+              +-----------------------+
```

---

## 2. Conversation State Model

* **Session Aggregate**: `ConversationSessionAggregate`
  * `id`: Unique Session UUID.
  * `founderProfileId`: Associated Founder ID.
  * `startupProfileId`: Associated Startup ID.
  * `status`: `ACTIVE` | `PAUSED` | `COMPLETED`.
  * `currentMode`: `STRATEGIC_DISCUSSION` | `INFORMATION_COLLECTION` | `REVIEW` | `CLARIFICATION` | `MEMORY_CONFIRMATION` | `RECOMMENDATION` | `STATUS_UPDATE` | `WORKFLOW_COMPLETION`.
  * `currentObjective`: Target `StrategicObjective` returned by Business Intelligence.
  * `currentWorkflow`: Target execution service (`startup_blueprint`, `investor_ready`, `grant_builder`, etc.).
  * `resumePoint`: Interruption state snapshot (`pausedMode`, `pausedObjective`, `pausedWorkflow`, `pendingQuestions`).
  * `messages`: Full conversation turn history.

---

## 3. Question Strategy (One Question at a Time)

To avoid overwhelming founders:
1. Business Intelligence yields missing prerequisite fields (`missingDependencies`).
2. `QuestionSequencer` checks `UserMemorySnapshot` and `StartupMemorySnapshot`.
3. If facts exist with `HIGH` confidence, they are never asked.
4. If a fact is missing, the engine asks **only 1 concise, focused question** explaining why it is needed.

---

## 4. Interruption & Resume Architecture

* **Interruption Detection**: Commands like *"We'll continue tomorrow"*, *"pause"*, or *"stop for now"* set session status to `PAUSED` and create a `ResumePoint`.
* **Resumption**: Commands like *"resume"* or *"continue"* restore state and re-evaluate pending questions seamlessly.

---

## 5. Coordination with Business Intelligence

1. Conversation Engine loads memory snapshots.
2. Sends goal & snapshot context to `AnalyzeObjective`.
3. Receives `ExecutionPlan` containing:
   - Objective & Stage
   - Readiness Score & Risks
   - Missing Dependencies
   - Recommended Next Service
4. If dependencies are missing, enters `INFORMATION_COLLECTION` mode.
5. Once all dependencies are satisfied, marks `isReadyForWorkflow: true` for downstream execution.

---

## 6. API Endpoint Matrix

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/conversation/start` | Start a new conversation session and analyze initial goal. |
| `POST` | `/conversation/message` | Submit founder turn message and receive single question or ready status. |
| `POST` | `/conversation/pause` | Manually pause a conversation session and save resume point. |
| `POST` | `/conversation/resume` | Resume a paused conversation session. |
| `POST` | `/conversation/end` | Mark conversation session as completed. |
| `GET` | `/conversation/:id` | Retrieve conversation context, session state, and message transcript. |
