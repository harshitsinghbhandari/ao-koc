# Phase 1: Foundation – Typed Event Bus & State Substrate (L2, L4)

## Goal
Establish the core nervous system of APEX within `agent-orchestrator`. We will introduce a strict Typed Event Bus (replacing/augmenting simple webhooks) and the "APEX Brain" (Local Context/State Sovereignity). This phase does not change the user experience but prepares the ground for multi-agent parallelism and advanced context features.

## Actionable Steps
1. **Event Bus Implementation (`packages/core/src/events/`)**
   - Create an Event Sourced architecture as per ADR-002.
   - Define exact schemas for `TASK_RECEIVED`, `AGENT_SPAWN`, `EXECUTION_SUCCESS`, `EXECUTION_FAILURE`, `REVIEW_APPROVED`, `MERGE_INITIATED`, `HUMAN_GATE_TRIGGERED` based on `IDEA/apex/interfaces/event_bus_schema.md`.
   - Update `LifecycleManager` to act as an event consumer rather than a polling loop, or hybridize it to publish state transitions.

2. **APEX Brain (L2) Initialization (`packages/core/src/brain/`)**
   - Introduce local SQLite or file-backed storage for persistence. Since `agent-orchestrator` heavily uses `~/.agent-orchestrator/` flat files, we can create an `.apex-brain.db` per project instance or standard JSON storage for:
     - Component Dependency maps.
     - ADR (Architecture Decision Records) generation history.
     - Agent "Trust Scores".
   - Ensure `ao start` automatically provisions the Brain storage alongside `sessions/` and `worktrees/`.

3. **Trust Score Tracker**
   - Implement the `0.0` to `1.0` Trust Score tracking system per agent instance.
   - Agents (from `packages/plugins/`) start with a score based on their configuration (`agent-orchestrator.yaml` can define default trust levels).

4. **Testing & Verification**
   - Write Vitest tests verifying event publishing/subscribing.
   - Verify that `ao start` properly initializes the `.apex-brain` directory/db without requiring user configuration.
