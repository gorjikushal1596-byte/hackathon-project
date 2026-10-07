import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { formatScore } from '../utils';

interface SummaryCardsProps {
  score: number;
  totalIssues: number;
  errorCount: number;
  warningCount: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  score,
  totalIssues,
  errorCount,
  warningCount,
}) => {
  const scoreInfo = formatScore(score);

  return (
    <div className="summary-cards-grid" aria-label="Accessibility Metrics Summary">
      {/* 1. Score Card */}
      <div className="glass-card metric-card score-metric-card">
        <div className="metric-header">
          <span className="metric-title">Accessibility Health</span>
          <Activity size={18} style={{ color: scoreInfo.color }} aria-hidden="true" />
        </div>
        <div>
          <div className="score-big-row">
            <span className="metric-big-number" style={{ color: scoreInfo.color }}>
              {score}
            </span>
            <span className="score-denom">/100</span>
          </div>
          <span
            className="score-grade-badge"
            style={{
              borderColor: scoreInfo.color,
              color: scoreInfo.color,
              backgroundColor: `${scoreInfo.color}18`,
            }}
          >
            Grade {scoreInfo.grade} &bull; {scoreInfo.label}
          </span>
        </div>
      </div>

      {/* 2. Total Issues */}
      <div className="glass-card metric-card">
        <div className="metric-header">
          <span className="metric-title">Total Violations</span>
          <ShieldAlert size={18} className="text-danger" aria-hidden="true" />
        </div>
        <div>
          <span className="metric-big-number text-danger">{totalIssues}</span>
          <p className="metric-sub-text">
            {totalIssues === 0 ? 'Zero accessibility barriers' : 'WCAG 2.1 AA non-compliant items'}
          </p>
        </div>
      </div>

      {/* 3. Critical & Errors */}
      <div className="glass-card metric-card">
        <div className="metric-header">
          <span className="metric-title">Critical Errors</span>
          <ShieldAlert size={18} style={{ color: '#f87171' }} aria-hidden="true" />
        </div>
        <div>
          <span className="metric-big-number text-danger">{errorCount}</span>
          <div className="metric-sub-breakdown">
            <span className="sub-tag tag-critical">Missing Alt</span>
            <span className="sub-tag tag-critical">Missing Labels</span>
            <span className="sub-tag tag-critical">Empty Buttons</span>
          </div>
        </div>
      </div>

      {/* 4. Warnings */}
      <div className="glass-card metric-card">
        <div className="metric-header">
          <span className="metric-title">Warnings & Hierarchy</span>
          <AlertTriangle size={18} className="text-warning" aria-hidden="true" />
        </div>
        <div>
          <span className="metric-big-number text-warning">{warningCount}</span>
          <p className="metric-sub-text">Heading levels & link accessible names</p>
        </div>
      </div>
    </div>
  );
};
