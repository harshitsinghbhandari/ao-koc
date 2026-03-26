# Phase 3: Planning Intelligence (L3) & DAG Generation

## Goal
Upgrade the single-threaded orchestrator to decompose complex tasks into a Directed Acyclic Graph (DAG) for parallel execution.

## Actionable Steps
1. **Architect Agent Integration**
   - Introduce the `Architect Agent` role. When a new issue/task arrives via `ao spawn`, it first routes to the Architect.
   - The Architect queries the Brain (L2) and Perception Engine (L1).
   - The Architect outputs a DAG containing nodes with `node_id`, `depends_on`, `parallelizable`, `risk_score`, and `agent_type`.

2. **Complexity Routing**
   - Implement Intent Classifier logic: Small tasks bypass the DAG and go straight to Fast Mode (current `agent-orchestrator` behavior).
   - Large/XL tasks generate a formal Plan Document.

3. **DAG Storage and State**
   - Store the active DAG in the APEX Brain.
   - Update `SessionManager` to understand parent/child sessions based on DAG nodes.

4. **Testing & Verification**
   - Unit test the DAG structure validation (preventing cyclical dependencies).
   - Mock an LLM response from the Architect and ensure `SessionManager` queues the root nodes correctly.
