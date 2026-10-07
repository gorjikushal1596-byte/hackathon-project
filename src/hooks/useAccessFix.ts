import { useState, useCallback } from 'react';
import {
  ScanResult,
  RepairResult,
  VerificationResult,
  SeverityLevel,
} from '../types';
import {
  scannerService,
  repairService,
  verificationService,
  firestoreService,
} from '../services';
import { SAMPLE_HTML_SNIPPETS } from '../utils';

export type AppPhase = 'input' | 'scanned' | 'repaired' | 'verified';

export function useAccessFix() {
  const [rawHtml, setRawHtml] = useState<string>(SAMPLE_HTML_SNIPPETS[0].html);
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_HTML_SNIPPETS[0].id);

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const [repairResult, setRepairResult] = useState<RepairResult | null>(null);
  const [isRepairing, setIsRepairing] = useState<boolean>(false);

  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const [historySaved, setHistorySaved] = useState<boolean>(false);
  const [isSavingHistory, setIsSavingHistory] = useState<boolean>(false);

  // Determine current active flow phase
  const currentPhase: AppPhase = verificationResult
    ? 'verified'
    : repairResult
    ? 'repaired'
    : scanResult
    ? 'scanned'
    : 'input';

  // Load a preset sample
  const loadSample = useCallback((sampleId: string) => {
    const found = SAMPLE_HTML_SNIPPETS.find((s) => s.id === sampleId);
    if (found) {
      setRawHtml(found.html);
      setSelectedSampleId(found.id);
      setScanResult(null);
      setRepairResult(null);
      setVerificationResult(null);
      setHistorySaved(false);
      setError(null);
    }
  }, []);

  // Clear HTML input
  const clearHtml = useCallback(() => {
    setRawHtml('');
    setSelectedSampleId('');
    setScanResult(null);
    setRepairResult(null);
    setVerificationResult(null);
    setHistorySaved(false);
    setError(null);
  }, []);

  // Step 1: Scan HTML for violations
  const runScan = useCallback(async () => {
    if (!rawHtml.trim()) {
      setError('Please provide HTML markup to scan.');
      return;
    }

    try {
      setIsScanning(true);
      setError(null);
      // Reset downstream steps
      setRepairResult(null);
      setVerificationResult(null);
      setHistorySaved(false);

      const result = await scannerService.scan(rawHtml);
      setScanResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during scanning.');
    } finally {
      setIsScanning(false);
    }
  }, [rawHtml]);

  // Step 2: Apply safe deterministic repairs
  const runRepair = useCallback(async () => {
    if (!scanResult) {
      setError('Please run an accessibility scan before applying repairs.');
      return;
    }

    try {
      setIsRepairing(true);
      setError(null);
      setVerificationResult(null);
      setHistorySaved(false);

      const result = await repairService.repair(scanResult);
      setRepairResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during repair.');
    } finally {
      setIsRepairing(false);
    }
  }, [scanResult]);

  // Step 3: Verify the repairs with re-scan
  const runVerification = useCallback(async () => {
    if (!scanResult || !repairResult) {
      setError('Cannot verify without both an original scan and repaired HTML.');
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);

      const result = await verificationService.verify(scanResult, repairResult);
      setVerificationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  }, [scanResult, repairResult]);

  // Step 4: Save session record to Firestore (boundary for Sravani)
  const saveToHistory = useCallback(async () => {
    if (!scanResult) return;

    try {
      setIsSavingHistory(true);
      const sample = SAMPLE_HTML_SNIPPETS.find((s) => s.id === selectedSampleId);
      await firestoreService.saveAuditSession({
        timestamp: new Date().toISOString(),
        htmlSnippetTitle: sample?.title || 'Custom HTML Snippet',
        originalScore: scanResult.summary.score,
        finalScore: verificationResult ? verificationResult.repairedScore : scanResult.summary.score,
        originalIssueCount: scanResult.summary.totalIssues,
        repairedIssueCount: repairResult ? repairResult.repairedCount : 0,
        remainingIssueCount: verificationResult
          ? verificationResult.remainingIssueCount
          : scanResult.summary.totalIssues,
        status: verificationResult ? 'completed' : 'in-progress',
      });
      setHistorySaved(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save audit session.';
      console.warn('History saving note:', err);
      setError(`Save failed: ${message} (Session is preserved locally.)`);
    } finally {
      setIsSavingHistory(false);
    }
  }, [scanResult, repairResult, verificationResult, selectedSampleId]);

  // Reset entire workflow back to input
  const resetAll = useCallback(() => {
    setScanResult(null);
    setRepairResult(null);
    setVerificationResult(null);
    setHistorySaved(false);
    setError(null);
  }, []);

  return {
    rawHtml,
    setRawHtml,
    selectedSampleId,
    loadSample,
    clearHtml,
    // Scan state
    scanResult,
    isScanning,
    runScan,
    // Repair state
    repairResult,
    isRepairing,
    runRepair,
    // Verification state
    verificationResult,
    isVerifying,
    runVerification,
    // Persistence state
    saveToHistory,
    historySaved,
    isSavingHistory,
    // Filtering & Meta
    filterSeverity,
    setFilterSeverity,
    currentPhase,
    error,
    resetAll,
  };
}
