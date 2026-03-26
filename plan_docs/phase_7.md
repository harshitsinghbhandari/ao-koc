# Phase 7: Advanced Observability & Mode C (L8, L1)

## Goal
Add comprehensive telemetry for tracking APEX system health and introduce implicit intent inference.

## Actionable Steps
1. **Distributed Tracing (L8)**
   - Add OpenTelemetry or custom lightweight tracing spanning the Orchestrator, Event Bus, Brain, and Agent executions.
   - Visualize execution flow, LLM token usage, and Time-to-Resolution in the Web Dashboard.

2. **Mode C: Intent Inference (L1)**
   - (Optional/Advanced) Monitor terminal history and branch checkouts outside the `agent-orchestrator` scope to pre-warm the Brain context or suggest Fast Mode tasks.

3. **Testing & Verification**
   - Verify trace IDs persist across parent orchestrator and child agent sessions.
