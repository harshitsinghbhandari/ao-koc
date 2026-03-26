import { EventEmitter } from "node:events";
import { randomUUID, createHash } from "node:crypto";
import type { ApexEvent, ApexEventPriority, ApexEventType } from "./types.js";

/**
 * The APEX Typed Event Bus.
 */
export class EventBus {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100);
  }

  /**
   * Publishes an event to the bus.
   * Auto-generates `event_id`, `timestamp`, and `retry_count` if not provided.
   */
  public publish<T>(event: Omit<ApexEvent<T>, "event_id" | "timestamp" | "retry_count"> & Partial<Pick<ApexEvent<T>, "event_id" | "timestamp" | "retry_count">>): string {
    const timestamp = event.timestamp ?? new Date().toISOString();

    // Generate an event ID if one isn't provided.
    // Spec: event_id: "evt_sha256_unique"
    let event_id = event.event_id;
    if (!event_id) {
        const rawString = `${event.event_type}-${event.task_id}-${timestamp}-${randomUUID()}`;
        event_id = `evt_${createHash("sha256").update(rawString).digest("hex")}`;
    }

    const fullEvent: ApexEvent<T> = {
      ...event,
      event_id,
      timestamp,
      retry_count: event.retry_count ?? 0,
      priority: event.priority ?? 3,
      requires_ack: event.requires_ack ?? false,
    };

    this.emitter.emit(fullEvent.event_type, fullEvent);
    // Also emit a catch-all event for global listeners
    this.emitter.emit("*", fullEvent);

    return fullEvent.event_id;
  }

  /**
   * Subscribes to a specific event type.
   */
  public subscribe<T>(eventType: ApexEventType | "*", handler: (event: ApexEvent<T>) => void): void {
    this.emitter.on(eventType, handler);
  }

  /**
   * Unsubscribes from a specific event type.
   */
  public unsubscribe<T>(eventType: ApexEventType | "*", handler: (event: ApexEvent<T>) => void): void {
    this.emitter.off(eventType, handler);
  }
}
