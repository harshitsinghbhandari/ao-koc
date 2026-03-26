# Phase 4: Multi-Agent Orchestration & Parallel Execution (L4, L5)

## Goal
Enable concurrent execution of DAG nodes using isolated git worktrees, managing merge conflicts and synchronization.

## Actionable Steps
1. **Parallel Workspace Management (`packages/core/src/workspaces/`)**
   - Modify the `worktree` plugin. When a DAG specifies parallel tasks (e.g., Node A and Node B), spawn separate git worktrees (`branch-node-a`, `branch-node-b`) branched from the parent node's branch.

2. **Agent Role Spawning**
   - Update `SessionManager.spawn` to accept an `agentRole` (Generator, Tester, Security) based on the DAG node definition.
   - Inject the specific subtask instructions and context boundaries (from L2) into the agent's prompt.

3. **Event-Driven Execution Flow**
   - As an agent finishes, it publishes `EXECUTION_SUCCESS`.
   - The Orchestrator listens, marks the DAG node complete, and triggers `MERGE_INITIATED`.
   - Implement basic recursive git merges for parallel branches upon completion. If conflicts arise, pause and trigger `HUMAN_GATE_TRIGGERED` or escalate to Architect.

4. **Testing & Verification**
   - Integration test: Define a 3-node DAG (A -> B, A -> C). Verify B and C spawn concurrently in separate worktrees and merge successfully.
