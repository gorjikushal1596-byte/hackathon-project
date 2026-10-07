import React, { useState } from 'react';
import { RepairResult } from '../utils';

interface RepairStudioProps {
  htmlSnippet: string;
  onHtmlChange: (html: string) => void;
  repairResult: RepairResult | null;
  isRepairing: boolean;
  isSaving: boolean;
  saveSuccessDocId: string | null;
  saveError: string | null;
  lastSavedTimestamp: string | null;
  onRunRepair: () => void;
  onSaveAudit: () => void;
  onRunRepairAndSave: () => void;
  onResetSnippet: () => void;
}

export const RepairStudio: React.FC<RepairStudioProps> = ({
  htmlSnippet,
  onHtmlChange,
  repairResult,
  isRepairing,
  isSaving,
  saveSuccessDocId,
  saveError,
  lastSavedTimestamp,
  onRunRepair,
  onSaveAudit,
  onRunRepairAndSave,
  onResetSnippet,
}) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'rules' | 'firestore'>('comparison');
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyRepaired = async () => {
    if (!repairResult?.repairedHtml) return;
    try {
      await navigator.clipboard.writeText(repairResult.repairedHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-card repair-studio-card" id="repair-studio">
      <div className="repair-studio-header">
        <div>
          <div className="studio-badge-row">
            <span className="badge badge-accent">⚡ Engine &amp; Firestore Integration</span>
            <span className="badge badge-success">Safe Deterministic Remediator</span>
          </div>
          <h3 className="repair-studio-title">Accessibility Repair Studio</h3>
          <p className="repair-studio-desc">
            Provide HTML input, trigger the deterministic <strong>repairEngine</strong> to remediate WCAG
            defects safely, and sync audit records to <strong>Cloud Firestore</strong>.
          </p>
        </div>

        <div className="repair-actions-group">
          <button
            type="button"
            id="btn-run-repair"
            onClick={onRunRepair}
            disabled={isRepairing}
            className="btn btn-primary"
            aria-label="Run Accessibility Repair Engine"
          >
            {isRepairing ? '⏳ Repairing...' : '⚡ Run Repair'}
          </button>

          <button
            type="button"
            id="btn-save-audit"
            onClick={onSaveAudit}
            disabled={isSaving || !repairResult}
            className={`btn ${!repairResult ? 'btn-disabled' : 'btn-secondary'}`}
            title={!repairResult ? 'Run repair first to create an audit record' : 'Save record to Cloud Firestore'}
            aria-label="Save Audit Record to Firestore"
          >
            {isSaving ? '⏳ Saving...' : '💾 Save Audit'}
          </button>

          <button
            type="button"
            id="btn-repair-and-save"
            onClick={onRunRepairAndSave}
            disabled={isRepairing || isSaving}
            className="btn btn-accent"
            aria-label="Run Repair and Save to Firestore"
          >
            {isRepairing || isSaving ? '⏳ Processing...' : '🚀 Repair &amp; Save'}
          </button>

          <button
            type="button"
            id="btn-reset-html"
            onClick={onResetSnippet}
            className="btn btn-ghost"
            title="Reset to default sample HTML"
            aria-label="Reset HTML to default sample"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Firestore Save Notifications */}
      {saveSuccessDocId && (
        <div className="status-notification success-banner" role="status" aria-live="polite">
          <div className="notification-icon">✓</div>
          <div className="notification-content">
            <div className="notification-title">Audit Record Saved to Firestore!</div>
            <div className="notification-details">
              Collection: <code>audit_history</code> &bull; Doc ID: <strong className="doc-id-pill">{saveSuccessDocId}</strong>
              {lastSavedTimestamp && <span> &bull; Synced at: {lastSavedTimestamp}</span>}
            </div>
          </div>
        </div>
      )}

      {saveError && (
        <div className="status-notification warning-banner" role="alert" aria-live="assertive">
          <div className="notification-icon">⚠</div>
          <div className="notification-content">
            <div className="notification-title">Firestore Sync Note</div>
            <div className="notification-details">
              {saveError}
              <div className="notification-hint">
                💡 Note: The Repair Engine completed successfully. To persist records to live Firebase, configure your credentials in <code>.env</code>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Repair Engine Metric Pills */}
      {repairResult && (
        <div className="repair-metrics-banner">
          <div className="metric-pill metric-fixes">
            <span className="metric-count">✓ {repairResult.changes.length}</span>
            <span className="metric-label">Safe Fixes Applied</span>
          </div>
          <div className="metric-pill metric-skipped">
            <span className="metric-count">⚠ {repairResult.skipped.length}</span>
            <span className="metric-label">Conservative Skips</span>
          </div>
          <div className="metric-pill metric-status">
            <span className="metric-count">{saveSuccessDocId ? 'Cloud Synced' : 'Ready to Save'}</span>
            <span className="metric-label">Persistence Status</span>
          </div>
        </div>
      )}

      {/* Studio View Navigation Tabs */}
      <div className="studio-tabs-row">
        <button
          type="button"
          className={`studio-tab-btn ${activeTab === 'comparison' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          HTML Code Comparison
        </button>
        <button
          type="button"
          className={`studio-tab-btn ${activeTab === 'rules' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          Engine Remediation Log ({repairResult ? repairResult.changes.length + repairResult.skipped.length : 0})
        </button>
        <button
          type="button"
          className={`studio-tab-btn ${activeTab === 'firestore' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('firestore')}
        >
          Firestore Payload Inspector
        </button>
      </div>

      {/* Tab 1: HTML Code Comparison */}
      {activeTab === 'comparison' && (
        <div className="studio-code-grid">
          {/* Source HTML Input */}
          <div className="code-column">
            <div className="code-column-header">
              <span className="code-col-title">Original HTML Input</span>
              <span className="badge badge-minor">Editable</span>
            </div>
            <textarea
              className="code-textarea"
              value={htmlSnippet}
              onChange={(e) => onHtmlChange(e.target.value)}
              placeholder="Paste raw HTML here to scan and repair..."
              rows={14}
              spellCheck={false}
              aria-label="Original HTML Input code"
            />
          </div>

          {/* Repaired HTML Output */}
          <div className="code-column">
            <div className="code-column-header">
              <span className="code-col-title">
                Repaired HTML Output
                {repairResult && <span className="badge badge-success ml-2">Remediated</span>}
              </span>
              {repairResult && (
                <button
                  type="button"
                  onClick={handleCopyRepaired}
                  className="btn btn-sm btn-ghost"
                  aria-label="Copy Repaired HTML to clipboard"
                >
                  {copied ? '✓ Copied!' : '📋 Copy HTML'}
                </button>
              )}
            </div>
            {repairResult ? (
              <pre className="code-pre-box" tabIndex={0}>
                <code>{repairResult.repairedHtml}</code>
              </pre>
            ) : (
              <div className="code-placeholder-box">
                <span className="placeholder-icon">⚡</span>
                <p>Click <strong>"Run Repair"</strong> to generate accessible, sanitized HTML.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Engine Remediation Log */}
      {activeTab === 'rules' && (
        <div className="rules-log-container">
          {!repairResult ? (
            <div className="empty-log-state">
              <p>No repair run yet. Click "Run Repair" to inspect applied changes and conservative skips.</p>
            </div>
          ) : (
            <div className="remediation-entries">
              <div className="entries-section">
                <h4 className="entries-heading text-success">
                  Applied Remediations ({repairResult.changes.length})
                </h4>
                {repairResult.changes.length === 0 ? (
                  <p className="entries-empty">No automated changes needed for this snippet.</p>
                ) : (
                  <ul className="remediation-list">
                    {repairResult.changes.map((change, index) => (
                      <li key={index} className="remediation-item change-success">
                        <div className="change-meta">
                          <span className="badge badge-success">✓ Fixed</span>
                          <code className="change-rule">{change.rule}</code>
                        </div>
                        <p className="change-desc">{change.description}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="entries-section">
                <h4 className="entries-heading text-warning">
                  Conservative Skips ({repairResult.skipped.length})
                </h4>
                {repairResult.skipped.length === 0 ? (
                  <p className="entries-empty">No rules were skipped.</p>
                ) : (
                  <ul className="remediation-list">
                    {repairResult.skipped.map((skip, index) => (
                      <li key={index} className="remediation-item change-skipped">
                        <div className="change-meta">
                          <span className="badge badge-warning">⚠ Safe Guard</span>
                          <code className="change-rule">{skip.rule}</code>
                        </div>
                        <p className="change-desc">{skip.reason}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Firestore Payload Inspector */}
      {activeTab === 'firestore' && (
        <div className="firestore-inspector-box">
          <div className="inspector-meta-row">
            <div>
              <span className="inspector-label">Target Collection:</span>
              <code>audit_history</code>
            </div>
            <div>
              <span className="inspector-label">Sync Status:</span>
              <span className={`badge ${saveSuccessDocId ? 'badge-success' : 'badge-minor'}`}>
                {saveSuccessDocId ? 'Persisted in Cloud' : 'Pending Save'}
              </span>
            </div>
            {saveSuccessDocId && (
              <div>
                <span className="inspector-label">Document ID:</span>
                <code>{saveSuccessDocId}</code>
              </div>
            )}
          </div>

          <pre className="code-pre-box" tabIndex={0}>
            <code>
              {JSON.stringify(
                {
                  collection: 'audit_history',
                  docId: saveSuccessDocId || '(Auto-generated on save)',
                  url: 'Direct HTML Snippet',
                  changesCount: repairResult?.changes.length || 0,
                  skippedCount: repairResult?.skipped.length || 0,
                  changes: repairResult?.changes || [],
                  skipped: repairResult?.skipped || [],
                  repairedHtmlLength: repairResult?.repairedHtml ? `${repairResult.repairedHtml.length} characters` : '0 characters',
                  savedAt: lastSavedTimestamp || '(Not saved yet)',
                },
                null,
                2
              )}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
};
