import { ScoringWeights, SeverityCounts } from '../types/accessibility';

/**
 * Default weights used to calculate deterministic accessibility scores.
 * - Errors: deduct 15 points
 * - Warnings: deduct 5 points
 * - Score range: 0 to 100
 */
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  errorDeduction: 15,
  warningDeduction: 5,
  minScore: 0,
  maxScore: 100,
};

/**
 * Calculates a deterministic accessibility score from 0 to 100.
 *
 * Starts at maxScore (100) and deducts points based on error and warning counts.
 * The scoring logic is isolated so team members can adjust deduction weights
 * or formulas without modifying scanner rule logic.
 *
 * @param counts Severity counts containing error and warning numbers
 * @param weights Optional custom scoring weights
 * @returns An integer score between minScore and maxScore
 */
export function calculateAccessibilityScore(
  counts: SeverityCounts,
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): number {
  const penalty =
    counts.error * weights.errorDeduction +
    counts.warning * weights.warningDeduction;

  const rawScore = weights.maxScore - penalty;

  // Clamp strictly within [minScore, maxScore]
  return Math.max(weights.minScore, Math.min(weights.maxScore, rawScore));
}
