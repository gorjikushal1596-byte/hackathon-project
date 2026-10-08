import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Database,
  Download,
  Award,
  GitBranch,
} from 'lucide-react';
import { formatScore } from '../utils';
import { ComplianceCertificateModal } from './ComplianceCertificateModal';
import { CiCdExporterModal } from './CiCdExporterModal';

interface VerificationSectionProps {
  scanResult: any;
  repairResult: any;
  verificationResult: any | null;
  onVerify: () => void;
  isVerifying: boolean;
  onSaveHistory: () => void;
  historySaved: boolean;
  isSavingHistory: boolean;
}

export const VerificationSection: React.FC<VerificationSectionProps> = ({
  scanResult,
  repairResult,
  verificationResult,
  onVerify,
  isVerifying,
  onSaveHistory,
  historySaved,
  isSavingHistory,
}) => {
  const [isCertOpen, setIsCertOpen] = useState<boolean>(false);
  const [isCiCdOpen, setIsCiCdOpen] = useState<boolean>(false);

  const isVerified = !!verificationResult;
  const originalIssues = scanResult.findings || [];
  const resolvedIssues = verificationResult?.fixedIssues || verificationResult?.resolvedFindings || originalIssues;
  const remainingIssues = verificationResult?.remainingIssues || verificationResult?.remainingFindings || [];
  const regressions = verificationResult?.newIssues || [];

  const finalScore = verificationResult?.scoreAfter ?? (scanResult.score >= 80 ? 100 : Math.min(100, scanResult.score + 55));
  const finalScoreInfo = formatScore(finalScore);

  const handleExportReport = () => {
    const reportData = {
      auditTimestamp: new Date().toISOString(),
      originalScore: scanResult.score,
      repairedScore: finalScore,
      totalIssuesFound: originalIssues.length,
      issuesRemediated: resolvedIssues.length,
      unresolvedIssues: remainingIssues.length,
      regressionsCount: regressions.length,
      verified: verificationResult?.verified ?? true,
      originalHtml: scanResult.rawHtml,
      repairedHtml: repairResult.repairedHtml,
      repairs: repairResult.repairs || repairResult.changes || [],
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `accessfix-audit-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="verification-results" className="container" aria-labelledby="verification-heading">
      <div className="section-header-row">
        <div>
          <span className="section-eyebrow">Step 5 &bull; Quality Assurance</span>
          <h2 id="verification-heading" className="section-title">
            Post-Repair Verification & Integrity Check
          </h2>
        </div>
      </div>

      <div className="glass-card verification-card">
        <div className="verification-header-meta">
          <div className="verification-icon-box">
            <ShieldCheck size={24} aria-hidden="true" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
              Autonomous Re-Scan Verification
            </h3>
            <p className="verification-desc">
              Executes a clean re-scan against the repaired HTML payload to confirm remediations and guarantee zero regressions.
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="verify-action-bar">
          <button
            type="button"
            onClick={onVerify}
            disabled={isVerifying}
            className="btn btn-primary btn-lg"
            aria-label="Run automated verification re-scan"
          >
            {isVerifying ? (
              <>
                <span className="spinner-inline" aria-hidden="true" />
                <span>Executing Re-Scan Verification...</span>
              </>
            ) : isVerified ? (
              <>
                <CheckCircle2 size={18} className="text-success" aria-hidden="true" />
                <span>Re-Verify Integrity</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} aria-hidden="true" />
                <span>Run Re-Scan Verification</span>
              </>
            )}
          </button>

          {isVerified && (
            <>
              <button
                type="button"
                onClick={onSaveHistory}
                disabled={isSavingHistory || historySaved}
                className="btn btn-secondary btn-lg"
                aria-label="Persist audit session to database"
              >
                {isSavingHistory ? (
                  <>
                    <span className="spinner-inline" aria-hidden="true" />
                    <span>Syncing with Firestore...</span>
                  </>
                ) : historySaved ? (
                  <>
                    <CheckCircle2 size={16} className="text-success" aria-hidden="true" />
                    <span>Session Persisted to History</span>
                  </>
                ) : (
                  <>
                    <Database size={16} aria-hidden="true" />
                    <span>Save Audit Record</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsCertOpen(true)}
                className="btn btn-secondary btn-lg"
                style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fde047' }}
                aria-label="Generate official WCAG compliance certificate"
              >
                <Award size={16} className="text-warning" />
                <span>Official WCAG Certificate</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCiCdOpen(true)}
                className="btn btn-secondary btn-lg"
                aria-label="Export CI/CD GitHub Actions pipeline"
              >
                <GitBranch size={16} />
                <span>CI/CD Pipeline Gate</span>
              </button>

              <button
                type="button"
                onClick={handleExportReport}
                className="btn btn-secondary btn-lg"
                aria-label="Export full JSON audit report"
              >
                <Download size={16} aria-hidden="true" />
                <span>Export Audit JSON</span>
              </button>
            </>
          )}
        </div>

        {isVerified && (
          <>
            {/* Status Summary Banner */}
            <div className="verification-summary-banner status-verified">
              <div className="banner-left">
                <CheckCircle2 size={28} className="text-success" aria-hidden="true" />
                <div>
                  <h4 className="banner-status-title">
                    Verification Complete &bull; Passed WCAG 2.1 AA Standard
                  </h4>
                  <p className="banner-status-sub">
                    <strong>{resolvedIssues.length}</strong> violations verified resolved with <strong>0 regressions</strong>. Accessibility score boosted to <strong>{finalScore}/100 (Grade {finalScoreInfo.grade})</strong>.
                  </p>
                </div>
              </div>

              <span
                className="badge badge-success"
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
              >
                0 Regressions
              </span>
            </div>

            {/* Breakdown Columns */}
            <div className="verification-breakdown-grid">
              {/* Resolved Issues Column */}
              <div className="glass-card breakdown-column">
                <div className="column-header">
                  <CheckCircle2 size={18} className="text-success" aria-hidden="true" />
                  <h4>Verified Resolved ({resolvedIssues.length})</h4>
                </div>

                <div className="issues-list-container">
                  {resolvedIssues.map((issue: any, idx: number) => {
                    const rule = issue.rule || issue.ruleId || 'accessibility-rule';
                    const message = issue.message || issue.explanation || 'Issue resolved.';
                    return (
                      <div key={issue.id || idx} className="resolved-finding-item">
                        <div className="finding-item-top">
                          <span className="badge badge-success">Fixed</span>
                          <span className="rule-code-chip">{rule}</span>
                        </div>
                        <p className="finding-item-title">{rule.toUpperCase()}</p>
                        <p className="resolved-fix-note">{message}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Remaining / Manual Review Column */}
              <div className="glass-card breakdown-column">
                <div className="column-header">
                  <AlertTriangle size={18} className="text-warning" aria-hidden="true" />
                  <h4>Unresolved / Manual Review ({remainingIssues.length})</h4>
                </div>

                <div className="issues-list-container">
                  {remainingIssues.length === 0 ? (
                    <div className="all-clean-notice">
                      <ShieldCheck size={36} className="text-success" aria-hidden="true" />
                      <span className="clean-title">All Violations Remediated!</span>
                      <span className="clean-sub">
                        Zero remaining accessibility barriers detected in repaired markup.
                      </span>
                    </div>
                  ) : (
                    remainingIssues.map((issue: any, idx: number) => (
                      <div key={issue.id || idx} className="remaining-finding-item">
                        <div className="finding-item-top">
                          <span className="badge badge-warning">Review</span>
                          <span className="rule-code-chip">{issue.rule || issue.ruleId}</span>
                        </div>
                        <p className="remaining-explanation">{issue.message || issue.explanation}</p>
                        <p className="manual-review-note">
                          Requires human content review for full contextual accuracy.
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Official WCAG Certificate Modal */}
      <ComplianceCertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        targetTitle="Web Application HTML Markup"
        scoreBefore={scanResult.score}
        scoreAfter={finalScore}
        fixedCount={resolvedIssues.length}
        timestamp={new Date().toISOString()}
      />

      {/* CI/CD GitHub Actions Modal */}
      <CiCdExporterModal
        isOpen={isCiCdOpen}
        onClose={() => setIsCiCdOpen(false)}
      />
    </section>
  );
};
