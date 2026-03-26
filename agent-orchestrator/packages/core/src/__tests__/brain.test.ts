import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { initBrain, updateBrain, type ApexBrainState } from "../brain/store.js";
import { getTrustScore, updateTrustScore } from "../brain/trust.js";
import { getProjectBaseDir } from "../paths.js";
import { mkdtempSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("APEX Brain", () => {
  let tmpDir: string;
  let configPath: string;
  let projectPath: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "apex-brain-"));
    configPath = join(tmpDir, "agent-orchestrator.yaml");
    writeFileSync(configPath, "dummy: true");
    projectPath = join(tmpDir, "repo");

    // Override the expandHome path mechanism for getProjectBaseDir during tests
    process.env.HOME = tmpDir;
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
    delete process.env.HOME;
  });

  it("should initialize a new brain", () => {
    const state = initBrain(configPath, projectPath);
    expect(state.version).toBe("1.0");
    expect(state.trustScores).toEqual({});

    const baseDir = getProjectBaseDir(configPath, projectPath);
    const brainPath = join(baseDir, ".apex-brain.json");
    expect(existsSync(brainPath)).toBe(true);
  });

  it("should update an existing brain", () => {
    // Initial call will create it
    initBrain(configPath, projectPath);

    updateBrain(configPath, projectPath, {
      trustScores: { "agent-1": 0.5 }
    });

    const state = initBrain(configPath, projectPath);
    expect(state.trustScores["agent-1"]).toBe(0.5);
  });

  describe("Trust Scores", () => {
    it("should return a default score of 1.0 for new agents", () => {
      const score = getTrustScore(configPath, projectPath, "new-agent");
      expect(score).toBe(1.0);
    });

    it("should update a trust score and clamp between 0.0 and 1.0", () => {
      let score = updateTrustScore(configPath, projectPath, "agent-2", -0.4);
      expect(score).toBe(0.6); // 1.0 - 0.4
      expect(getTrustScore(configPath, projectPath, "agent-2")).toBe(0.6);

      score = updateTrustScore(configPath, projectPath, "agent-2", 10.0);
      expect(score).toBe(1.0); // Clamped to 1.0

      score = updateTrustScore(configPath, projectPath, "agent-2", -5.0);
      expect(score).toBe(0.0); // Clamped to 0.0
    });
  });
});
