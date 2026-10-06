import React from 'react';
import { AccessibilityIssue } from '../types';
import { getSeverityBadgeClass } from '../utils';

interface AuditCardProps {
  issue: AccessibilityIssue;
  onToggleResolve: (id: string) => void;
}

export const AuditCard: React.FC<AuditCardProps> = ({
  issue,
  onToggleResolve,
}) => {
  return (
    <div className={`glass-card audit-issue-card ${issue.isResolved ? 'is-resolved' : ''}`}>
      <div className="issue-meta">
        <span className={`badge ${getSeverityBadgeClass(issue.severity)}`}>
          {issue.severity}
        </span>
        <code className="issue-rule">{issue.ruleId}</code>
        {issue.isResolved && (
          <span className="badge badge-success">Remediated</span>
        )}
      </div>

      <p className="issue-desc">{issue.description}</p>

      <div className="issue-selector-box">
        <span className="selector-label">Target:</span>
        <code className="selector-code">{issue.selector}</code>
      </div>

      {issue.suggestedFix && (
        <div className="fix-suggestion">
          <span className="suggestion-label">Suggested Remediator:</span>
          <p className="suggestion-text">{issue.suggestedFix}</p>
        </div>
      )}

      <div className="card-actions">
        <button
          type="button"
          onClick={() => onToggleResolve(issue.id)}
          className={`btn btn-sm ${issue.isResolved ? 'btn-secondary' : 'btn-primary'}`}
          aria-label={issue.isResolved ? `Mark ${issue.ruleId} as unresolved` : `Simulate fix for ${issue.ruleId}`}
        >
          {issue.isResolved ? '↩ Reopen Issue' : '⚡ Simulate Quick Fix'}
        </button>
      </div>
    </div>
  );
};
