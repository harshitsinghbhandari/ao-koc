import { describe, it, expect, vi, beforeEach } from "vitest";
import { decompose, getLeaves, getSiblings, formatPlanTree, propagateStatus, formatLineage } from "../decomposer.js";
import Anthropic from "@anthropic-ai/sdk";

// Mock Anthropic SDK
const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}));

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class {
      messages = {
        create: mockCreate,
      }
    }
  };
});

describe("decomposer", () => {
  describe("formatLineage", () => {
    it("formats a single task correctly", () => {
      const formatted = formatLineage([], "Root task");
      expect(formatted).toBe("0. Root task  <-- (this task)");
    });

    it("formats nested lineage with indentation", () => {
      const formatted = formatLineage(["Root task", "Level 1"], "Level 2");
      expect(formatted).toBe("0. Root task\n  1. Level 1\n    2. Level 2  <-- (this task)");
    });
  });

  describe("decompose", () => {

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("creates an atomic plan directly if classified as atomic", async () => {
      // Mock classifier to return "atomic"
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "atomic" }],
      });

      const plan = await decompose("Fix a small bug");

      expect(plan.rootTask).toBe("Fix a small bug");
      expect(plan.tree.kind).toBe("atomic");
      expect(plan.tree.children).toHaveLength(0);
    });

    it("recurses into subtasks for composite tasks", async () => {
      // 1. Classify root as composite
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "composite" }],
      });
      // 2. Decompose root into 2 subtasks
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: '["Subtask A", "Subtask B"]' }],
      });
      // 3. Classify Subtask A as atomic
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "atomic" }],
      });
      // 4. Classify Subtask B as atomic
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "atomic" }],
      });

      const plan = await decompose("Build a huge feature");

      expect(plan.tree.kind).toBe("composite");
      expect(plan.tree.children).toHaveLength(2);
      expect(plan.tree.children[0].description).toBe("Subtask A");
      expect(plan.tree.children[0].kind).toBe("atomic");
      expect(plan.tree.children[1].description).toBe("Subtask B");
      expect(plan.tree.children[1].kind).toBe("atomic");
    });
  });

  describe("tree operations", () => {
    const mockTree: any = {
      id: "1",
      description: "Root",
      kind: "composite",
      status: "ready",
      children: [
        {
          id: "1.1",
          description: "A",
          kind: "atomic",
          status: "done",
          children: [],
        },
        {
          id: "1.2",
          description: "B",
          kind: "composite",
          status: "ready",
          children: [
            { id: "1.2.1", description: "B1", kind: "atomic", status: "pending", children: [] },
            { id: "1.2.2", description: "B2", kind: "atomic", status: "pending", children: [] },
          ],
        },
      ],
    };

    it("getLeaves should return only atomic leaf nodes", () => {
      const leaves = getLeaves(mockTree);
      expect(leaves).toHaveLength(3);
      expect(leaves.map(l => l.id)).toEqual(["1.1", "1.2.1", "1.2.2"]);
    });

    it("getSiblings should return sibling descriptions", () => {
      const siblings = getSiblings(mockTree, "1.2.1");
      expect(siblings).toEqual(["B2"]);
    });

    it("formatPlanTree should produce an indented tree string", () => {
      const formatted = formatPlanTree(mockTree);
      expect(formatted).toContain("1. [COMPOSITE] Root");
      expect(formatted).toContain("  1.1. [ATOMIC] A");
      expect(formatted).toContain("  1.2. [COMPOSITE] B");
      expect(formatted).toContain("    1.2.1. [ATOMIC] B1");
    });

    it("propagateStatus should bubble up done status", () => {
      const treeToComplete = JSON.parse(JSON.stringify(mockTree));
      // Mark all leaves as done
      treeToComplete.children[0].status = "done";
      treeToComplete.children[1].children[0].status = "done";
      treeToComplete.children[1].children[1].status = "done";

      propagateStatus(treeToComplete);

      expect(treeToComplete.children[1].status).toBe("done");
      expect(treeToComplete.status).toBe("done");
    });

    it("propagateStatus should bubble up failed status", () => {
      const treeToFail = JSON.parse(JSON.stringify(mockTree));
      treeToFail.children[1].children[0].status = "failed";

      propagateStatus(treeToFail);

      expect(treeToFail.children[1].status).toBe("failed");
      expect(treeToFail.status).toBe("failed");
    });
  });
});
