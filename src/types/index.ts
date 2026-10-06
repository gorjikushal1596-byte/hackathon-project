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
