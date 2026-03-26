/**
 * Typed Event Schema based on APEX architecture.
 */

export type ApexEventPriority = 1 | 2 | 3 | 4 | 5;

/** Root event schema that all events must extend. */
export interface ApexEvent<T = any> {
  event_id: string; // sha256 unique
  event_type: string;
  source_agent: string; // agent_id_prefix | 'system' | 'orchestrator'
  target_agent: string; // agent_id_prefix | 'broadcast' | 'human_gateway'
  task_id: string; // task_uuid
  dag_node_id?: string; // unique node identifier
  parent_event_id?: string | null;
  trace_id?: string;
  timestamp: string; // ISO8601
  priority: ApexEventPriority;
  requires_ack: boolean;
  timeout_ms?: number | null;
  idempotency_key?: string;
  retry_count: number;
  payload: T;
}

// Event Types from Taxonomy v1.0
export const EventTypes = {
  // 1. Task Lifecycle Events
  TASK_RECEIVED: "TASK_RECEIVED",
  AGENT_SPAWN: "AGENT_SPAWN",
  EXECUTION_SUCCESS: "EXECUTION_SUCCESS", // Maps to TASK_COMPLETED
  EXECUTION_FAILURE: "EXECUTION_FAILURE", // Maps to TASK_FAILED

  // 2. Review & Interaction Events
  REVIEW_APPROVED: "REVIEW_APPROVED",
  MERGE_INITIATED: "MERGE_INITIATED",
  HUMAN_GATE_TRIGGERED: "HUMAN_GATE_TRIGGERED",

  // 3. State & Context Events
  PERCEPTION_UPDATE: "PERCEPTION_UPDATE",
} as const;

export type ApexEventType = typeof EventTypes[keyof typeof EventTypes];
