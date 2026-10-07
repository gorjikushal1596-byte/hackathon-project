import React, { useState } from 'react';
import { useAccessFix } from '../hooks/useAccessFix';
import {
  Hero,
  HtmlInputSection,
  ResultsSection,
  RepairSection,
  BeforeAfterComparison,
  VerificationSection,
  LiveDemoSimulatorModal,
} from '../components';
import { AlertCircle } from 'lucide-react';

interface LandingPageProps {
  accessFixState?: ReturnType<typeof useAccessFix>;
  isDemoOpen?: boolean;
  onCloseDemo?: () => void;
  onOpenDemo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  accessFixState,
  isDemoOpen: externalDemoOpen,
  onCloseDemo: externalCloseDemo,
  onOpenDemo: externalOpenDemo,
}) => {
  const [internalDemoOpen, setInternalDemoOpen] = useState<boolean>(false);
  const internalState = useAccessFix();
  const state = accessFixState || internalState;

  const isDemoOpen = externalDemoOpen !== undefined ? externalDemoOpen : internalDemoOpen;
  const handleOpenDemo = externalOpenDemo || (() => setInternalDemoOpen(true));
  const handleCloseDemo = externalCloseDemo || (() => setInternalDemoOpen(false));

  const {
    rawHtml,
    setRawHtml,
    selectedSampleId,
    loadSample,
    clearHtml,
    scanResult,
    isScanning,
    runScan,
    repairResult,
    isRepairing,
    runRepair,
    verificationResult,
    isVerifying,
    runVerification,
    saveToHistory,
    historySaved,
    isSavingHistory,
    filterSeverity,
    setFilterSeverity,
    error,
    currentPhase,
    resetAll,
  } = state;

  return (
    <div className="landing-page-container">
      {/* 1. Hero Section */}
      <Hero onStartDemo={handleOpenDemo} />

      {/* Global Error Banner */}
      {error && (
        <div className="container" role="alert">
          <div className="glass-card error-banner">
            <AlertCircle size={18} className="text-danger" aria-hidden="true" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 2. HTML Input Section */}
      <HtmlInputSection
        rawHtml={rawHtml}
        setRawHtml={setRawHtml}
        selectedSampleId={selectedSampleId}
        loadSample={loadSample}
        clearHtml={clearHtml}
        onScan={runScan}
        isScanning={isScanning}
      />

      {/* 3. Findings & Diagnostics Section */}
      <ResultsSection
        scanResult={scanResult}
        filterSeverity={filterSeverity}
        setFilterSeverity={setFilterSeverity}
      />

      {/* 4. Safe Deterministic Repair Section */}
      {scanResult && (
        <RepairSection
          scanResult={scanResult}
          repairResult={repairResult}
          onRepair={runRepair}
          isRepairing={isRepairing}
        />
      )}

      {/* 5. Before & After Benchmark Section */}
      {scanResult && repairResult && (
        <BeforeAfterComparison
          scanResult={scanResult}
          repairResult={repairResult}
          verificationResult={verificationResult}
        />
      )}

      {/* 6. Post-Repair Verification Section */}
      {scanResult && repairResult && (
        <VerificationSection
          scanResult={scanResult}
          repairResult={repairResult}
          verificationResult={verificationResult}
          onVerify={runVerification}
          isVerifying={isVerifying}
          onSaveHistory={saveToHistory}
          historySaved={historySaved}
          isSavingHistory={isSavingHistory}
        />
      )}

      {/* 7. Interactive Live Demo Simulation Modal */}
      <LiveDemoSimulatorModal
        isOpen={isDemoOpen}
        onClose={handleCloseDemo}
        loadSample={loadSample}
        runScan={runScan}
        runRepair={runRepair}
        runVerification={runVerification}
        saveToHistory={saveToHistory}
        resetAll={resetAll}
        scanResult={scanResult}
        repairResult={repairResult}
        verificationResult={verificationResult}
        currentPhase={currentPhase}
      />
    </div>
  );
};
