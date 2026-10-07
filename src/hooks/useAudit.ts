import { useState, useEffect, useCallback } from 'react';
import { AuditReport } from '../types';
import { auditService } from '../services';
import { repairHtml, RepairResult, Finding } from '../utils';

export const DEFAULT_SAMPLE_HTML = `<!DOCTYPE html>
<html lang="">
  <head>
    <title>Checkout - AccessFix Demo</title>
  </head>
  <body>
    <header>
      <h1>Express Checkout</h1>
    </header>
    <main>
      <!-- Critical: Missing image alt attribute -->
      <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500" class="product-hero" />

      <!-- Critical: Image missing src context (conservatively skipped) -->
      <img class="unverified-ad" />

      <!-- Serious: Interactive button missing accessible name/label -->
      <button class="checkout-btn"></button>

      <!-- Accessible Button -->
      <button class="nav-btn" aria-label="Return to store">Back</button>
    </main>
  </body>
</html>`;

/**
 * Custom hook to manage accessibility audit state, HTML repair engine execution,
 * and Cloud Firestore history persistence.
 */
export function useAudit() {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Repair Engine & Firestore states
  const [htmlSnippet, setHtmlSnippet] = useState<string>(DEFAULT_SAMPLE_HTML);
  const [repairResult, setRepairResult] = useState<RepairResult | null>(null);
  const [isRepairing, setIsRepairing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessDocId, setSaveSuccessDocId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await auditService.getInitialAudit();
        if (isMounted) {
          setReport(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load audit');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleIssueResolution = useCallback((issueId: string) => {
    setReport((prevReport) => {
      if (!prevReport) return null;

      const updatedIssues = prevReport.issues.map((issue) => {
        if (issue.id === issueId) {
          return { ...issue, isResolved: !issue.isResolved };
        }
        return issue;
      });

      const resolvedCount = updatedIssues.filter((i) => i.isResolved).length;
      // Calculate new simulated score
      const newScore = Math.min(100, Math.round(50 + (resolvedCount / updatedIssues.length) * 50));

      return {
        ...prevReport,
        issues: updatedIssues,
        resolvedIssues: resolvedCount,
        score: newScore,
      };
    });
  }, []);

  /**
   * Run the Repair Engine on current or provided HTML
   */
  const runRepair = useCallback((customHtml?: string): RepairResult => {
    setIsRepairing(true);
    const sourceHtml = customHtml !== undefined ? customHtml : htmlSnippet;

    // Convert current report issues to findings for repair engine
    const findings: Finding[] = (report?.issues || []).map((issue) => ({
      id: issue.id,
      rule: issue.ruleId,
      description: issue.description,
      elementHtml: issue.selector,
      type: issue.severity,
    }));

    const result = repairHtml(sourceHtml, findings);
    setRepairResult(result);

    // Auto-resolve issues in report that were fixed by repair engine
    if (result.changes.length > 0) {
      setReport((prevReport) => {
        if (!prevReport) return null;

        const fixedRules = new Set(result.changes.map((c) => c.rule));
        // Match rules between repair engine and sample issues (e.g. image-alt, button-name, etc.)
        const updatedIssues = prevReport.issues.map((issue) => {
          if (fixedRules.has(issue.ruleId) || (issue.ruleId === 'link-name' && fixedRules.has('button-name'))) {
            return { ...issue, isResolved: true };
          }
          return issue;
        });

        const resolvedCount = updatedIssues.filter((i) => i.isResolved).length;
        const newScore = Math.min(100, Math.round(50 + (resolvedCount / updatedIssues.length) * 50));

        return {
          ...prevReport,
          issues: updatedIssues,
          resolvedIssues: resolvedCount,
          score: newScore,
        };
      });
    }

    setIsRepairing(false);
    return result;
  }, [htmlSnippet, report?.issues]);

  /**
   * Persist repair result and original HTML to Cloud Firestore via saveAuditRecord
   */
  const saveAudit = useCallback(async (targetResult?: RepairResult, customHtml?: string): Promise<string | null> => {
    const resultToSave = targetResult || repairResult;
    const sourceHtml = customHtml !== undefined ? customHtml : htmlSnippet;

    if (!resultToSave) {
      setSaveError('Please run the Repair Engine first before saving the audit record.');
      return null;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const docId = await auditService.saveAuditRecord(
        resultToSave,
        sourceHtml,
        report?.targetUrl || 'Direct HTML Snippet'
      );
      setSaveSuccessDocId(docId);
      setLastSavedTimestamp(new Date().toLocaleTimeString());
      return docId;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown Firestore error occurred';
      console.warn('Firestore save notice:', errorMsg);
      setSaveError(errorMsg);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [repairResult, htmlSnippet, report?.targetUrl]);

  /**
   * Combined one-click execution: Run Repair and save immediately to Firestore
   */
  const runRepairAndSave = useCallback(async (): Promise<{ repairResult: RepairResult; docId: string | null }> => {
    const result = runRepair();
    const docId = await saveAudit(result);
    return { repairResult: result, docId };
  }, [runRepair, saveAudit]);

  const resetSnippet = useCallback(() => {
    setHtmlSnippet(DEFAULT_SAMPLE_HTML);
    setRepairResult(null);
    setSaveSuccessDocId(null);
    setSaveError(null);
  }, []);

  return {
    report,
    isLoading,
    error,
    toggleIssueResolution,
    // Repair Engine & Firestore states & triggers
    htmlSnippet,
    setHtmlSnippet,
    repairResult,
    isRepairing,
    isSaving,
    saveSuccessDocId,
    saveError,
    lastSavedTimestamp,
    runRepair,
    saveAudit,
    runRepairAndSave,
    resetSnippet,
  };
}
