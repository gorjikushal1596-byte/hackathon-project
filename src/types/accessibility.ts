/**
 * AccessFix - Accessibility Scanner & Verification Types
 * Strong TypeScript types for HTML scanning, findings, scoring, and verification.
 */

export type FindingSeverity = 'error' | 'warning';

/**
 * An individual accessibility violation or warning detected by the scanner.
 */
export interface Finding {
  /** Unique identifier for the finding instance (e.g. "finding-img-alt-1") */
  id: string;
  /** Rule identifier (e.g. "img-alt", "form-label", "button-name", "html-lang", "heading-order") */
  rule: string;
  /** Severity level of the finding */
  severity: FindingSeverity;
  /** Human-readable explanation of why this is an issue */
  message: string;
  /** Tag name or element descriptor (e.g. "<img>", "<input#email>") */
  element?: string;
  /** Best-effort CSS selector targeting the problematic node */
  selector?: string;
  /** Outer HTML snippet of the problematic element */
  htmlSnippet?: string;
  /** Actionable recommendation for remediating this issue */
  suggestion?: string;
}

/**
 * Breakdown of finding counts by severity.
 */
export interface SeverityCounts {
  error: number;
  warning: number;
}

/**
 * Comprehensive result produced by scanning an HTML string.
 */
export interface ScanResult {
  /** Array of structured accessibility findings */
  findings: Finding[];
  /** Total count of all findings (errors + warnings) */
  totalIssues: number;
  /** Aggregate counts categorized by severity */
  countsBySeverity: SeverityCounts;
  /** Finding counts grouped by rule ID */
  countsByRule: Record<string, number>;
  /** Calculated accessibility health score (0 - 100) */
  score: number;
  /** ISO timestamp of when the scan occurred */
  scannedAt: string;
}

/**
 * Result returned by comparing an original scan against a repaired HTML scan.
 */
export interface VerificationResult {
  /** Issue count before the repair was performed */
  beforeIssueCount: number;
  /** Issue count after the repair was performed */
  afterIssueCount: number;
  /** Issues from original scan that were successfully remediated */
  fixedIssues: Finding[];
  /** Issues from original scan that still remain unresolved */
  remainingIssues: Finding[];
  /** New accessibility issues introduced by the repair (regressions) */
  newIssues: Finding[];
  /** Whether the verification succeeded (issues reduced and zero regressions) */
  verified: boolean;
  /** Accessibility score prior to repair */
  scoreBefore: number;
  /** Accessibility score after repair */
  scoreAfter: number;
  /** Difference in score (+ indicates improvement) */
  scoreDelta: number;
}

/**
 * Configuration options for scoring calculation.
 */
export interface ScoringWeights {
  errorDeduction: number;
  warningDeduction: number;
  minScore: number;
  maxScore: number;
}
