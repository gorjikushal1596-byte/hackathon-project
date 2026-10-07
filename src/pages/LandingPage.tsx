import React from 'react';
import { useAudit } from '../hooks';
import { FeatureCard, AuditCard, RepairStudio } from '../components';
import { formatScore } from '../utils';

export const LandingPage: React.FC = () => {
  const {
    report,
    isLoading,
    toggleIssueResolution,
    htmlSnippet,
    setHtmlSnippet,
    repairResult,
    isRepairing,
    isSaving,
    saveSuccessDocId,
    saveError,
    lastSavedTimestamp,
    runRepair,
    saveAudit,
    runRepairAndSave,
    resetSnippet,
  } = useAudit();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-content">
          <div className="hero-badge-row">
            <span className="badge badge-moderate">⚡ 36-Hour Hackathon Project</span>
            <span className="badge badge-minor">Web Accessibility (a11y)</span>
          </div>

          <h1 className="hero-title">
            Meet <span className="gradient-text">AccessFix</span>
          </h1>

          <p className="hero-subtitle">
            Making the web inclusive by design. Detect, understand, and remediate
            accessibility issues in seconds with intelligent automated fixes.
          </p>

          <div className="hero-cta-group">
            <a href="#demo" className="btn btn-primary">
              Explore Demo Simulator &darr;
            </a>
            <a href="#repair-studio" className="btn btn-accent">
              ⚡ Open Repair Studio
            </a>
            <a
              href="#roadmap"
              className="btn btn-secondary"
            >
              Hackathon Roadmap
            </a>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Core Capabilities</span>
            <h2 className="section-title">Built for Speed and Impact</h2>
            <p className="section-description">
              Designed from the ground up to empower developers to fix WCAG barriers before release.
            </p>
          </div>

          <div className="features-grid">
            <FeatureCard
              icon="🔍"
              title="Instant WCAG Scans"
              description="Evaluates web applications against WCAG 2.1 AA criteria to identify color contrast, ARIA tags, and keyboard traps."
              badge="Automated"
            />
            <FeatureCard
              icon="🛠️"
              title="Deterministic Repair Engine"
              description="Applies safe automatic fixes for missing document language, missing image alt tags, and unnamed buttons."
              badge="Safe Engine"
            />
            <FeatureCard
              icon="🔥"
              title="Cloud Audit Persistence"
              description="Syncs audit records and remediation history into Firebase Cloud Firestore for audit compliance trails."
              badge="Firestore"
            />
          </div>
        </div>
      </section>

      {/* Interactive Demo Simulator & Repair Section */}
      <section id="demo" className="demo-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Interactive Remediation Lab</span>
            <h2 className="section-title">Sample Audit Playground &amp; Repair Studio</h2>
            <p className="section-description">
              Interact with the live repair engine, inspect safe automated fixes, and persist audit
              records to Cloud Firestore in real time.
            </p>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading audit environment...</p>
            </div>
          ) : report ? (
            <div className="simulator-wrapper">
              {/* Score Dashboard Header */}
              <div className="glass-card score-banner">
                <div className="score-info">
                  <span className="score-label">Current Audit Score</span>
                  <div className="score-value-row">
                    <span className="score-number">{report.score}</span>
                    <span className="score-max">/ 100</span>
                    <span
                      className="score-grade"
                      style={{ color: formatScore(report.score).color }}
                    >
                      (Grade {formatScore(report.score).grade})
                    </span>
                  </div>
                  <p className="target-url">
                    Target: <code>{report.targetUrl}</code>
                  </p>
                </div>

                <div className="stats-pills">
                  <div className="stat-pill">
                    <span className="stat-number">{report.totalIssues}</span>
                    <span className="stat-name">Total Issues</span>
                  </div>
                  <div className="stat-pill stat-resolved">
                    <span className="stat-number">{report.resolvedIssues}</span>
                    <span className="stat-name">Fixed</span>
                  </div>
                  <div className="stat-pill stat-pending">
                    <span className="stat-number">{report.totalIssues - report.resolvedIssues}</span>
                    <span className="stat-name">Pending</span>
                  </div>
                </div>
              </div>

              {/* Repair Studio & Cloud Persistence Component */}
              <RepairStudio
                htmlSnippet={htmlSnippet}
                onHtmlChange={setHtmlSnippet}
                repairResult={repairResult}
                isRepairing={isRepairing}
                isSaving={isSaving}
                saveSuccessDocId={saveSuccessDocId}
                saveError={saveError}
                lastSavedTimestamp={lastSavedTimestamp}
                onRunRepair={() => runRepair()}
                onSaveAudit={() => saveAudit()}
                onRunRepairAndSave={runRepairAndSave}
                onResetSnippet={resetSnippet}
              />

              {/* Issues List */}
              <div className="issues-list">
                <div className="issues-list-header">
                  <h3 className="issues-list-heading">
                    Detected Violations ({report.issues.length})
                  </h3>
                  <span className="badge badge-minor">
                    {report.resolvedIssues}/{report.issues.length} Remediated
                  </span>
                </div>
                <div className="issues-grid">
                  {report.issues.map((issue) => (
                    <AuditCard
                      key={issue.id}
                      issue={issue}
                      onToggleResolve={toggleIssueResolution}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="error-state">
              <p>Unable to load sample audit report.</p>
            </div>
          )}
        </div>
      </section>

      {/* Hackathon Roadmap */}
      <section id="roadmap" className="roadmap-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Sprint Milestones</span>
            <h2 className="section-title">Hackathon Development Plan</h2>
          </div>

          <div className="roadmap-steps">
            <div className="roadmap-step step-done">
              <div className="step-marker">✓</div>
              <div className="step-content">
                <h4>Phase 1: Project Scaffolding &amp; Design System</h4>
                <p>Vite + React + TypeScript setup, clean architecture, responsive dark theme foundation.</p>
              </div>
            </div>

            <div className="roadmap-step step-done">
              <div className="step-marker">✓</div>
              <div className="step-content">
                <h4>Phase 2: Core Repair Engine &amp; Firestore History</h4>
                <p>Safe automatic HTML remediation rules, DOMParser engine, and Cloud Firestore audit history persistence.</p>
              </div>
            </div>

            <div className="roadmap-step step-upcoming">
              <div className="step-marker">3</div>
              <div className="step-content">
                <h4>Phase 3: Live Scanner Engine Integration</h4>
                <p>Live URL scraping, axe-core automated runner integration, and full AST pipeline.</p>
              </div>
            </div>

            <div className="roadmap-step step-upcoming">
              <div className="step-marker">4</div>
              <div className="step-content">
                <h4>Phase 4: Polish &amp; Pitch Presentation</h4>
                <p>Exporting reports, accessibility badges, presentation slides, and demo video.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
