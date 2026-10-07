import React from 'react';
import { Wrench, ShieldCheck, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

interface RepairSectionProps {
  scanResult: any;
  repairResult: any | null;
  onRepair: () => void;
  isRepairing: boolean;
}

export const RepairSection: React.FC<RepairSectionProps> = ({
  scanResult,
  repairResult,
  onRepair,
  isRepairing,
}) => {
  const totalFindings = scanResult.findings?.length || scanResult.totalIssues || 0;
  const isRepaired = !!repairResult;
  const repairedCount = repairResult?.repairedCount ?? (isRepaired ? totalFindings : 0);

  return (
    <section id="auto-repair-engine" className="container repair-section" aria-labelledby="repair-heading">
      <div className="section-header-row">
        <div>
          <span className="section-eyebrow">Step 3 &bull; Deterministic Engine</span>
          <h2 id="repair-heading" className="section-title">
            Safe Auto-Remediation
          </h2>
        </div>
      </div>

      <div className="glass-card repair-action-card">
        <div className="repair-header-row">
          <div className="repair-brand-badge">
            <div className="repair-icon-halo">
              <Wrench size={22} aria-hidden="true" />
            </div>
            <div>
              <h3 className="repair-title">AccessFix Deterministic Repair Engine</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                Rule-based AST transformations with zero semantic side-effects.
              </p>
            </div>
          </div>

          <div className="engine-status-pill">
            <span className={isRepaired ? 'pulse-dot-cyan' : 'pulse-dot-indigo'} aria-hidden="true" />
            <span>{isRepaired ? 'Repairs Applied' : 'Engine Ready'}</span>
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="guarantee-banner">
          <ShieldCheck size={20} className="text-accent shield-icon" aria-hidden="true" />
          <p className="guarantee-text">
            <strong>Deterministic Safety Guarantee:</strong> Only high-confidence WCAG remediations are automatically applied (such as missing <code>alt</code> attributes, document <code>lang</code> tags, accessible <code>aria-labels</code>, and button names). Visual layout and existing styles are 100% preserved.
          </p>
        </div>

        <div className="repair-controls-row">
          <div className="repair-scope-info">
            <span className="scope-stat-number">{isRepaired ? repairedCount : totalFindings}</span>
            <div className="scope-stat-meta">
              <span className="scope-stat-title">
                {isRepaired ? 'Remediations Applied' : 'Issues Queued for Auto-Repair'}
              </span>
              <span className="scope-stat-sub">
                {isRepaired
                  ? 'Ready for post-repair verification re-scan'
                  : 'Zero manual coding required'}
              </span>
            </div>
          </div>

          <div className="repair-btn-container">
            <button
              type="button"
              onClick={onRepair}
              disabled={isRepairing || totalFindings === 0}
              className="btn btn-primary btn-lg"
              aria-label="Execute Safe Deterministic Repairs"
            >
              {isRepairing ? (
                <>
                  <span className="spinner-inline" aria-hidden="true" />
                  <span>Synthesizing Safe Repairs...</span>
                </>
              ) : isRepaired ? (
                <>
                  <CheckCircle2 size={18} className="text-success" aria-hidden="true" />
                  <span>Re-apply Auto-Repairs</span>
                </>
              ) : (
                <>
                  <Zap size={18} aria-hidden="true" />
                  <span>Apply Safe Deterministic Repairs</span>
                </>
              )}
            </button>
          </div>
        </div>

        {isRepaired && (
          <div className="repair-complete-alert" role="status">
            <CheckCircle2 size={20} className="text-success" aria-hidden="true" />
            <div className="repair-alert-content">
              <strong>Deterministic Repairs Successfully Generated!</strong>
              <p>
                The DOM has been rewritten with accessible attributes. Proceed below to inspect the before/after benchmark diff and execute verification.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
