import { initBrain, updateBrain } from "./store.js";

/**
 * Get the trust score for a specific agent instance.
 * Defaults to 1.0 if the agent has no existing score.
 */
export function getTrustScore(configPath: string, projectPath: string, agentId: string): number {
  const state = initBrain(configPath, projectPath);
  return state.trustScores[agentId] ?? 1.0;
}

/**
 * Update the trust score for a specific agent instance.
 * The score is bounded between 0.0 and 1.0.
 */
export function updateTrustScore(configPath: string, projectPath: string, agentId: string, delta: number): number {
  const state = initBrain(configPath, projectPath);
  const currentScore = state.trustScores[agentId] ?? 1.0;

  // Calculate new score, clamping between 0.0 and 1.0
  let newScore = currentScore + delta;
  if (newScore > 1.0) newScore = 1.0;
  if (newScore < 0.0) newScore = 0.0;

  updateBrain(configPath, projectPath, {
    trustScores: {
      ...state.trustScores,
      [agentId]: newScore,
    }
  });

  return newScore;
}
