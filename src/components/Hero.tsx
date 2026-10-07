import React from 'react';
import { ShieldCheck, Zap, ArrowRight, CheckCircle2, Play, Sparkles } from 'lucide-react';

interface HeroProps {
  onStartDemo?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartDemo }) => {
  return (
    <section className="hero-section" aria-labelledby="hero-heading">
      <div className="container hero-content">
        <div className="hero-badge-row">
          <span className="badge badge-primary-glow">
            <Zap size={12} aria-hidden="true" />
            Deterministic Accessibility Engine
          </span>
          <span className="badge badge-success">
            <ShieldCheck size={12} aria-hidden="true" />
            WCAG 2.1 AA Compliant
          </span>
        </div>

        <h1 id="hero-heading" className="hero-title">
          Web Accessibility. <br />
          <span className="gradient-text">Detect &bull; Auto-Repair &bull; Verify.</span>
        </h1>

        <p className="hero-subtitle">
          Transform inaccessible web markup into fully WCAG 2.1 AA compliant HTML with zero regressions.
          Deterministic auto-remediation tested and verified in real time.
        </p>

        {onStartDemo && (
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onStartDemo}
              className="btn btn-primary btn-lg"
              aria-label="Launch interactive live demo simulation"
            >
              <Play size={18} fill="currentColor" aria-hidden="true" />
              <span>Simulate Live Demo (Interactive Walkthrough)</span>
            </button>
            <a
              href="#code-editor"
              className="btn btn-secondary btn-lg"
            >
              <span>Explore Interactive Editor</span>
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        )}

        {/* Stepper Pipeline Architecture for Hackathon Judges */}
        <div className="pipeline-tracker" aria-label="Pipeline Architecture Steps">
          <div className="pipeline-step">
            <span className="pipeline-icon-circle">1</span>
            <div className="pipeline-meta">
              <span className="pipeline-title">HTML Input</span>
              <span className="pipeline-sub">Paste / Select</span>
            </div>
          </div>

          <span className="pipeline-arrow" aria-hidden="true">
            <ArrowRight size={14} />
          </span>

          <div className="pipeline-step">
            <span className="pipeline-icon-circle">2</span>
            <div className="pipeline-meta">
              <span className="pipeline-title">Scanner Engine</span>
              <span className="pipeline-sub">WCAG 2.1 AA</span>
            </div>
          </div>

          <span className="pipeline-arrow" aria-hidden="true">
            <ArrowRight size={14} />
          </span>

          <div className="pipeline-step">
            <span className="pipeline-icon-circle">3</span>
            <div className="pipeline-meta">
              <span className="pipeline-title">Auto-Repair</span>
              <span className="pipeline-sub">Safe Deterministic</span>
            </div>
          </div>

          <span className="pipeline-arrow" aria-hidden="true">
            <ArrowRight size={14} />
          </span>

          <div className="pipeline-step">
            <span className="pipeline-icon-circle">4</span>
            <div className="pipeline-meta">
              <span className="pipeline-title">Verification</span>
              <span className="pipeline-sub">0 Regressions</span>
            </div>
          </div>

          <span className="pipeline-arrow" aria-hidden="true">
            <ArrowRight size={14} />
          </span>

          <div className="pipeline-step">
            <span className="pipeline-icon-circle">
              <CheckCircle2 size={16} className="text-success" />
            </span>
            <div className="pipeline-meta">
              <span className="pipeline-title">Audit Record</span>
              <span className="pipeline-sub">Firestore Sync</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
