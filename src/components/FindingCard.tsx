import React from 'react';
import { Finding, FindingSeverity } from '../types/accessibility';
import { AlertCircle, AlertTriangle, CheckCircle2, Terminal, Wrench } from 'lucide-react';

interface FindingCardProps {
  finding: Finding | any;
}

export const FindingCard: React.FC<FindingCardProps> = ({ finding }) => {
  const isError = finding.severity === 'error' || finding.severity === 'critical' || finding.severity === 'serious';
  const rule = finding.rule || finding.ruleId || 'wcag-rule';
  const message = finding.message || finding.explanation || 'Accessibility barrier detected.';
  const snippet = finding.htmlSnippet || finding.affectedCode || '';
  const selector = finding.selector || finding.element || '<element>';
  const suggestion = finding.suggestion || finding.suggestedFix || '';

  const getCategory = (ruleId: string): string => {
    if (ruleId.includes('img') || ruleId.includes('alt')) return 'Images & Media';
    if (ruleId.includes('label') || ruleId.includes('form')) return 'Form Controls';
    if (ruleId.includes('button')) return 'Interactive Elements';
    if (ruleId.includes('lang') || ruleId.includes('html')) return 'Document Root';
    if (ruleId.includes('heading') || ruleId.includes('order')) return 'Heading Hierarchy';
    if (ruleId.includes('link')) return 'Navigation Links';
    return 'Semantics';
  };

  return (
    <div className={`glass-card finding-item-card ${isError ? '' : 'finding-serious'}`}>
      <div className="finding-header">
        <div className="finding-badges">
          <span className={`badge ${isError ? 'badge-critical' : 'badge-warning'}`}>
            {isError ? (
              <AlertCircle size={12} aria-hidden="true" />
            ) : (
              <AlertTriangle size={12} aria-hidden="true" />
            )}
            <span>{isError ? 'Error (Critical)' : 'Warning'}</span>
          </span>

          <span className="category-chip">{getCategory(rule)}</span>
          <span className="rule-code-chip">{rule}</span>
        </div>

        {selector && (
          <div className="code-selector">
            <code>{selector}</code>
          </div>
        )}
      </div>

      <div>
        <h3 className="finding-title">{rule.toUpperCase()} Violation</h3>
        <p className="finding-explanation">{message}</p>
      </div>

      {snippet && (
        <div className="affected-code-wrapper">
          <div className="code-box-header">
            <span className="code-box-label">
              <Terminal size={12} aria-hidden="true" />
              <span>Affected Element</span>
            </span>
          </div>
          <pre className="code-snippet-box">
            <code>{snippet}</code>
          </pre>
        </div>
      )}

      {suggestion && (
        <div className="fix-preview-box">
          <div className="fix-preview-header">
            <Wrench size={12} aria-hidden="true" />
            <span>Remediation Strategy</span>
            <span className="auto-safe-pill">Safe Deterministic</span>
          </div>
          <p className="fix-preview-text">{suggestion}</p>
        </div>
      )}
    </div>
  );
};
