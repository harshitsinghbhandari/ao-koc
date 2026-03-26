import { describe, it, expect } from "vitest";
import { resolveSessionRole, resolveAgentSelection } from "../agent-selection.js";
import type { ProjectConfig, DefaultPlugins } from "../types.js";

describe("agent-selection", () => {
  describe("resolveSessionRole", () => {
    it("identifies orchestrator session by ID suffix", () => {
      expect(resolveSessionRole("project-orchestrator")).toBe("orchestrator");
    });

    it("identifies orchestrator session by metadata role", () => {
      expect(resolveSessionRole("random-id", { role: "orchestrator" })).toBe("orchestrator");
    });

    it("defaults to worker if neither id nor role indicates orchestrator", () => {
      expect(resolveSessionRole("app-1")).toBe("worker");
      expect(resolveSessionRole("app-1", { role: "worker" })).toBe("worker");
    });
  });

  describe("resolveAgentSelection", () => {
    const mockProject: ProjectConfig = {
      name: "Test Project",
      repo: "org/repo",
      path: "/tmp/repo",
      defaultBranch: "main",
      sessionPrefix: "tp",
      agent: "project-agent",
      worker: {
        agent: "worker-agent",
        agentConfig: {}
      },
      orchestrator: {
        agent: "orchestrator-agent",
        agentConfig: {}
      },
    } as ProjectConfig;

    const mockDefaults: DefaultPlugins = {
      runtime: "tmux",
      agent: "default-agent",
      workspace: "worktree",
      notifiers: ["desktop"],
      worker: { agent: "default-worker" },
      orchestrator: { agent: "default-orch" }
    } as any;

    it("prefers worker-specific agent for worker role", () => {
      const resolved = resolveAgentSelection({
        role: "worker",
        project: mockProject,
        defaults: mockDefaults,
      });
      expect(resolved.agentName).toBe("worker-agent");
    });

    it("prefers orchestrator-specific agent for orchestrator role", () => {
      const resolved = resolveAgentSelection({
        role: "orchestrator",
        project: mockProject,
        defaults: mockDefaults,
      });
      expect(resolved.agentName).toBe("orchestrator-agent");
    });

    it("falls back to project agent if role-specific agent is missing", () => {
      const projectWithoutRoleAgents: ProjectConfig = {
        ...mockProject,
        worker: { agentConfig: {} },
        orchestrator: { agentConfig: {} },
      } as any;
      const resolved = resolveAgentSelection({
        role: "worker",
        project: projectWithoutRoleAgents,
        defaults: mockDefaults,
      });
      expect(resolved.agentName).toBe("project-agent");
    });

    it("respects spawnAgentOverride", () => {
      const resolved = resolveAgentSelection({
        role: "worker",
        project: mockProject,
        defaults: mockDefaults,
        spawnAgentOverride: "override-agent",
      });
      expect(resolved.agentName).toBe("override-agent");
    });

    it("respects persistedAgent (highest priority)", () => {
      const resolved = resolveAgentSelection({
        role: "worker",
        project: mockProject,
        defaults: mockDefaults,
        persistedAgent: "persisted-agent",
        spawnAgentOverride: "override-agent",
      });
      expect(resolved.agentName).toBe("persisted-agent");
    });

    it("resolves model correctly for orchestrator and worker", () => {
      const projectWithConfig: ProjectConfig = {
        ...mockProject,
        agentConfig: { model: "default-model" },
        orchestrator: { agentConfig: { model: "orch-model" } },
      } as any;

      const workerRes = resolveAgentSelection({
        role: "worker",
        project: projectWithConfig,
        defaults: mockDefaults,
      });
      expect(workerRes.model).toBe("default-model");

      const orchRes = resolveAgentSelection({
        role: "orchestrator",
        project: projectWithConfig,
        defaults: mockDefaults,
      });
      expect(orchRes.model).toBe("orch-model");
    });

    it("merges agentConfig hierarchy", () => {
      const projectWithNestedConfig: ProjectConfig = {
        ...mockProject,
        agentConfig: { commonKey: "common", sharedVal: 1 },
        worker: { agentConfig: { roleKey: "worker-role", sharedVal: 2 } },
      } as any;

      const resolved = resolveAgentSelection({
        role: "worker",
        project: projectWithNestedConfig,
        defaults: mockDefaults,
      });

      expect(resolved.agentConfig["commonKey"]).toBe("common");
      expect(resolved.agentConfig["roleKey"]).toBe("worker-role");
      expect(resolved.agentConfig["sharedVal"]).toBe(2); // Overridden by role config
    });

    it("normalizes permissions correctly", () => {
      const projectWithPermissions: ProjectConfig = {
        ...mockProject,
        agentConfig: { permissions: "suggest" as any },
      } as any;

      const resolved = resolveAgentSelection({
        role: "worker",
        project: projectWithPermissions,
        defaults: mockDefaults,
      });

      expect(resolved.permissions).toBe("suggest");
      expect(resolved.agentConfig.permissions).toBe("suggest");
    });
  });
});
