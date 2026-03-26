import { existsSync, writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getProjectBaseDir } from "../paths.js";

/**
 * APEX Brain structure
 */
export interface ApexBrainState {
  version: "1.0";
  componentDependencies: Record<string, string[]>;
  adrHistory: Record<string, any>;
  trustScores: Record<string, number>;
}

/**
 * The default initial state of the APEX Brain.
 */
const DEFAULT_STATE: ApexBrainState = {
  version: "1.0",
  componentDependencies: {},
  adrHistory: {},
  trustScores: {},
};

/**
 * Initialize or read the Brain for a specific project.
 * @param configPath - The config path.
 * @param projectPath - The project path.
 * @returns The initialized or read state.
 */
export function initBrain(configPath: string, projectPath: string): ApexBrainState {
  const baseDir = getProjectBaseDir(configPath, projectPath);
  const brainPath = join(baseDir, ".apex-brain.json");

  // Ensure baseDir exists
  if (!existsSync(baseDir)) {
    mkdirSync(baseDir, { recursive: true });
  }

  if (!existsSync(brainPath)) {
    // Create new store
    writeFileSync(brainPath, JSON.stringify(DEFAULT_STATE, null, 2), "utf-8");
    return { ...DEFAULT_STATE };
  }

  // Read existing store
  try {
    const data = JSON.parse(readFileSync(brainPath, "utf-8"));
    return { ...DEFAULT_STATE, ...data };
  } catch (err) {
    console.warn(`[Brain] Failed to parse existing brain at ${brainPath}, using default state.`);
    return { ...DEFAULT_STATE };
  }
}

/**
 * Update the APEX brain with new state.
 * @param configPath - The config path.
 * @param projectPath - The project path.
 * @param partialState - The partial state to update.
 */
export function updateBrain(configPath: string, projectPath: string, partialState: Partial<ApexBrainState>): void {
  const currentState = initBrain(configPath, projectPath);
  const newState: ApexBrainState = {
    ...currentState,
    ...partialState,
  };

  const baseDir = getProjectBaseDir(configPath, projectPath);
  const brainPath = join(baseDir, ".apex-brain.json");
  writeFileSync(brainPath, JSON.stringify(newState, null, 2), "utf-8");
}
