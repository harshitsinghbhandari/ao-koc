import { describe, it, expect } from "vitest";
import { EventBus } from "../events/bus.js";
import { EventTypes, type ApexEvent } from "../events/types.js";

describe("EventBus", () => {
  it("should publish and subscribe to an event", () => {
    const bus = new EventBus();
    let receivedEvent: ApexEvent<any> | null = null;

    bus.subscribe(EventTypes.TASK_RECEIVED, (event) => {
      receivedEvent = event;
    });

    const eventId = bus.publish({
      event_type: EventTypes.TASK_RECEIVED,
      source_agent: "system",
      target_agent: "orchestrator",
      task_id: "task-123",
      payload: { foo: "bar" },
    });

    expect(eventId).toBeDefined();
    expect(receivedEvent).not.toBeNull();
    expect(receivedEvent?.event_id).toBe(eventId);
    expect(receivedEvent?.task_id).toBe("task-123");
    expect(receivedEvent?.payload.foo).toBe("bar");
  });
});
