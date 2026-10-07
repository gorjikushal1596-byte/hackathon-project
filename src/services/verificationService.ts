import {
  Finding,
  ScanResult,
  VerificationResult,
} from '../types/accessibility';
import { scanHtml } from './accessibilityScanner';

/**
 * Generates a stable fingerprint string for an accessibility finding.
 * Uses rule ID and element selector / target information.
 */
function createFindingFingerprint(finding: Finding): string {
  const target = finding.selector || finding.element || '';
  return `${finding.rule}::${target}`;
}

/**
 * Compares an initial scan result with a repaired HTML string and its re-scan findings.
 *
 * Rather than relying solely on raw counts, this function matches individual findings
 * by rule and element signature to classify:
 * - fixedIssues: issues that were present before but successfully remediated
 * - remainingIssues: issues that still persist in the repaired HTML
 * - newIssues: regressions or brand-new accessibility issues introduced by the repair
 *
 * @param originalScanResult The ScanResult from the original HTML
 * @param repairedHtml The repaired HTML string produced by the repair engine
 * @returns VerificationResult detailing fixes, remaining violations, regressions, and status
 */
export function verifyRepair(
  originalScanResult: ScanResult,
  repairedHtml: string
): VerificationResult {
  // Re-scan the repaired HTML
  const newScanResult = scanHtml(repairedHtml);

  const fixedIssues: Finding[] = [];
  const remainingIssues: Finding[] = [];
  const newIssues: Finding[] = [];

  // Track matched findings in newScanResult by index to detect new regressions
  const matchedNewIndices = new Set<number>();

  for (const origFinding of originalScanResult.findings) {
    const origFingerprint = createFindingFingerprint(origFinding);

    // Look for a matching finding in new scan by exact fingerprint
    let foundIndex = newScanResult.findings.findIndex(
      (f, idx) => !matchedNewIndices.has(idx) && createFindingFingerprint(f) === origFingerprint
    );

    // Secondary fallback: match by rule alone if rule counts allow
    if (foundIndex === -1) {
      foundIndex = newScanResult.findings.findIndex(
        (f, idx) => !matchedNewIndices.has(idx) && f.rule === origFinding.rule
      );
    }

    if (foundIndex !== -1) {
      // Issue still persists in new scan
      matchedNewIndices.add(foundIndex);
      remainingIssues.push(origFinding);
    } else {
      // Issue was successfully resolved
      fixedIssues.push(origFinding);
    }
  }

  // Any unmatched findings in newScanResult are newly introduced issues
  newScanResult.findings.forEach((newFinding, idx) => {
    if (!matchedNewIndices.has(idx)) {
      newIssues.push(newFinding);
    }
  });

  const beforeIssueCount = originalScanResult.totalIssues;
  const afterIssueCount = newScanResult.totalIssues;

  // Verification is successful if:
  // 1. Issues were resolved (or original had zero issues)
  // 2. No new regressions were introduced
  // 3. Issue count decreased (or remains 0)
  const isBetter =
    beforeIssueCount === 0
      ? afterIssueCount === 0
      : fixedIssues.length > 0 && afterIssueCount < beforeIssueCount;

  const verified = isBetter && newIssues.length === 0;

  const scoreBefore = originalScanResult.score;
  const scoreAfter = newScanResult.score;
  const scoreDelta = scoreAfter - scoreBefore;

  return {
    beforeIssueCount,
    afterIssueCount,
    fixedIssues,
    remainingIssues,
    newIssues,
    verified,
    scoreBefore,
    scoreAfter,
    scoreDelta,
  };
}

export const verificationService = {
  verifyRepair,
};
