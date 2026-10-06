import { useState, useEffect } from 'react';
import { AuditReport } from '../types';
import { auditService } from '../services';

/**
 * Custom hook to manage accessibility audit state
 * Simple, beginner-friendly foundation for the hackathon
 */
export function useAudit() {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const toggleIssueResolution = (issueId: string) => {
    if (!report) return;

    const updatedIssues = report.issues.map((issue) => {
      if (issue.id === issueId) {
        return { ...issue, isResolved: !issue.isResolved };
      }
      return issue;
    });

    const resolvedCount = updatedIssues.filter((i) => i.isResolved).length;
    // Calculate new simulated score
    const newScore = Math.min(100, Math.round(50 + (resolvedCount / updatedIssues.length) * 50));

    setReport({
      ...report,
      issues: updatedIssues,
      resolvedIssues: resolvedCount,
      score: newScore,
    });
  };

  return {
    report,
    isLoading,
    error,
    toggleIssueResolution,
  };
}
