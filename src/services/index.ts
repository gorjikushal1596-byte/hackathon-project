export * from './auditService';
export { firestoreService } from './firestoreService';
export { accessibilityScanner } from './accessibilityScanner';
export { calculateAccessibilityScore } from './scoringService';
export { verificationService as baseVerificationService } from './verificationService';

import { accessibilityScanner } from './accessibilityScanner';
import { repairHtml, RepairResult } from '../utils/repairEngine';
import { verificationService as baseVerificationService } from './verificationService';
import { ScanResult as CoreScanResult, Finding } from '../types/accessibility';

export const scannerService = {
  scan: async (html: string): Promise<any> => {
    const rawResult = accessibilityScanner.scanHtml(html);
    const scannedAt = rawResult.scannedAt || new Date().toISOString();
    return {
      ...rawResult,
      id: `scan-${Date.now()}`,
      rawHtml: html,
      timestamp: scannedAt,
      summary: {
        totalIssues: rawResult.totalIssues,
        score: rawResult.score,
        criticalCount: rawResult.countsBySeverity.error,
        seriousCount: 0,
        moderateCount: 0,
        minorCount: 0,
        warningsCount: rawResult.countsBySeverity.warning,
        passedCount: rawResult.totalIssues === 0 ? 1 : 0,
      },
    };
  },
};

export const repairService = {
  repair: async (scanResult: any): Promise<RepairResult> => {
    const html =
      scanResult.originalHtml ??
      scanResult.rawHtml ??
      scanResult.html ??
      '';

    const findings: Finding[] = scanResult.findings ?? [];
    const scanId: string = scanResult.id || `scan-${Date.now()}`;
    return repairHtml(html, findings, scanId);
  },
};

export const verificationService = {
  verify: async (
    scanResult: any,
    repairResult: any
  ): Promise<any> => {
    const repairedHtml =
      repairResult.repairedHtml ??
      repairResult.html ??
      '';

    const verification = baseVerificationService.verifyRepair(
      scanResult,
      repairedHtml
    );

    return {
      ...verification,
      id: `verify-${Date.now()}`,
      repairId: repairResult.id || `repair-${Date.now()}`,
      originalScore: verification.scoreBefore,
      repairedScore: verification.scoreAfter,
      originalIssueCount: verification.beforeIssueCount,
      remainingIssueCount: verification.afterIssueCount,
      resolvedCount: verification.fixedIssues.length,
      isVerified: verification.verified,
      status: verification.verified ? 'verified' : 'partially-verified',
      resolvedFindings: verification.fixedIssues,
      remainingFindings: verification.remainingIssues,
      timestamp: new Date().toISOString(),
    };
  },
};
