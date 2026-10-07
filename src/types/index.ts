/**
 * AccessFix - Type Definitions
 * Beginner-friendly types for accessibility auditing & remediation
 */

export type SeverityLevel = 'critical' | 'serious' | 'moderate' | 'minor';

export interface AccessibilityIssue {
  id: string;
  ruleId: string;
  description: string;
  severity: SeverityLevel;
  selector: string;
  suggestedFix?: string;
  isResolved: boolean;
}

export interface AuditReport {
  id: string;
  targetUrl: string;
  score: number;
  totalIssues: number;
  resolvedIssues: number;
  timestamp: string;
  issues: AccessibilityIssue[];
}

export interface FeatureHighlight {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge?: string;
}

// Re-export scanner & verification types
export * from './accessibility';

/**
 * Adapter helper: converts a scanner Finding into the legacy UI AccessibilityIssue format.
 */
export function findingToAccessibilityIssue(finding: import('./accessibility').Finding): AccessibilityIssue {
  return {
    id: finding.id,
    ruleId: finding.rule,
    description: finding.message,
    severity: finding.severity === 'error' ? 'critical' : 'moderate',
    selector: finding.selector || finding.element || 'unknown',
    suggestedFix: finding.suggestion,
    isResolved: false,
  };
}

/**
 * Adapter helper: converts a ScanResult into the UI AuditReport format for seamless integration.
 */
export function scanResultToAuditReport(
  scanResult: import('./accessibility').ScanResult,
  targetUrl: string = 'Local HTML Document'
): AuditReport {
  return {
    id: `scan-${Date.now()}`,
    targetUrl,
    score: scanResult.score,
    totalIssues: scanResult.totalIssues,
    resolvedIssues: 0,
    timestamp: scanResult.scannedAt,
    issues: scanResult.findings.map(findingToAccessibilityIssue),
  };
}
