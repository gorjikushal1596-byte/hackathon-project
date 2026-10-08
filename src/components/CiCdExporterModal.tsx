import React, { useState } from 'react';
import { GitBranch, Copy, Check, X, Terminal, ShieldCheck, Download } from 'lucide-react';

interface CiCdExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CiCdExporterModal: React.FC<CiCdExporterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const githubActionWorkflow = `name: AccessFix Automated WCAG 2.1 AA Quality Gate

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  accessibility-audit:
    name: Run AccessFix Accessibility Verification
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm ci

      - name: Execute AccessFix WCAG Scanner & Verification Engine
        run: npx accessfix audit --strict --min-score 90 --zero-regressions
        env:
          ACCESSFIX_FAIL_ON_REGRESSION: "true"
          ACCESSFIX_AUTO_REMEDIATE: "true"

      - name: Upload Accessibility Audit Artifact
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: accessfix-compliance-report
          path: accessfix-audit-*.json
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(githubActionWorkflow);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([githubActionWorkflow], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'accessfix-quality-gate.yml';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cicd-heading"
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '94vh',
          overflowY: 'auto',
          padding: '2rem',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <GitBranch size={20} />
            </div>
            <div>
              <h3 id="cicd-heading" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                GitHub Actions & CI/CD Pipeline Gate
              </h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                Automate zero-regression accessibility checks on every Pull Request
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            <X size={16} />
          </button>
        </div>

        {/* Workflow Code Block */}
        <div style={{ background: 'var(--bg-code)', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-dim)' }}>
            <span>.github/workflows/accessfix-audit.yml</span>
            <span>YAML Workflow Definition</span>
          </div>
          <pre style={{ padding: '1rem', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: '#f1f5f9', maxHeight: '340px', overflowY: 'auto', lineHeight: 1.5 }}>
            <code>{githubActionWorkflow}</code>
          </pre>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6ee7b7', fontSize: '0.82rem' }}>
            <ShieldCheck size={16} />
            <span>Blocks pull requests failing WCAG 2.1 AA threshold</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleCopy}
              className="btn btn-secondary btn-md"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-success" />
                  <span>Copied Workflow!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy YAML</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="btn btn-primary btn-md"
            >
              <Download size={14} />
              <span>Download .yml File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
