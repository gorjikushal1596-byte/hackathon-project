import React from 'react';
import { useAudit } from '../hooks';
import { FeatureCard, AuditCard } from '../components';
import { formatScore } from '../utils';

export const LandingPage: React.FC = () => {
  const { report, isLoading, toggleIssueResolution } = useAudit();

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
              icon="💡"
              title="Smart Remediation"
              description="Provides beginner-friendly code snippets and suggested fixes rather than cryptic error codes."
              badge="Smart Fix"
            />
            <FeatureCard
              icon="📊"
              title="Score & Analytics"
              description="Tracks your compliance health score in real-time as issues are addressed and resolved."
              badge="Real-time"
            />
          </div>
        </div>
      </section>

      {/* Interactive Demo Simulator Section */}
      <section id="demo" className="demo-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Live Simulator Preview</span>
            <h2 className="section-title">Sample Audit Playground</h2>
            <p className="section-description">
              Interact with sample accessibility violations below to see how AccessFix
              recalculates your score as issues are remediated.
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

              {/* Issues List */}
              <div className="issues-list">
                <h3 className="issues-list-heading">
                  Detected Violations ({report.issues.length})
                </h3>
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
                <h4>Phase 1: Project Scaffolding & Design System</h4>
                <p>Vite + React + TypeScript setup, clean architecture, responsive dark theme foundation.</p>
              </div>
            </div>

            <div className="roadmap-step step-upcoming">
              <div className="step-marker">2</div>
              <div className="step-content">
                <h4>Phase 2: Backend & Firebase Integration</h4>
                <p>Authentication, audit history persistence, and project workspaces (to be configured next).</p>
              </div>
            </div>

            <div className="roadmap-step step-upcoming">
              <div className="step-marker">3</div>
              <div className="step-content">
                <h4>Phase 3: Core Scanner Engine</h4>
                <p>Live URL scraping, axe-core runner, and automated CSS/HTML fix generators.</p>
              </div>
            </div>

            <div className="roadmap-step step-upcoming">
              <div className="step-marker">4</div>
              <div className="step-content">
                <h4>Phase 4: Polish & Pitch Presentation</h4>
                <p>Exporting reports, accessibility badges, presentation slides, and demo video.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
