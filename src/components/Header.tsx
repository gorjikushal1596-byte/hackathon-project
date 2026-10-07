import React from 'react';
import logo from '../assets/logo.svg';
import { Play, RotateCcw, Sparkles } from 'lucide-react';
import { AppPhase } from '../hooks/useAccessFix';

interface HeaderProps {
  currentPhase: AppPhase;
  isScanning: boolean;
  isRepairing: boolean;
  isVerifying: boolean;
  onReset: () => void;
  onStartDemo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPhase,
  isScanning,
  isRepairing,
  isVerifying,
  onReset,
  onStartDemo,
}) => {
  const isBusy = isScanning || isRepairing || isVerifying;

  const getPhaseDetails = () => {
    if (isScanning) return { label: 'Scanning HTML...', className: 'status-busy' };
    if (isRepairing) return { label: 'Applying Fixes...', className: 'status-busy' };
    if (isVerifying) return { label: 'Verifying Fixes...', className: 'status-busy' };

    switch (currentPhase) {
      case 'verified':
        return { label: 'Phase 3: Verified (Grade A)', className: 'status-verified' };
      case 'repaired':
        return { label: 'Phase 2: Repaired', className: 'status-repaired' };
      case 'scanned':
        return { label: 'Phase 1: Violations Detected', className: 'status-scanned' };
      case 'input':
      default:
        return { label: 'Ready for Input', className: 'status-ready' };
    }
  };

  const phase = getPhaseDetails();

  return (
    <header className="navbar-wrapper" role="banner">
      <div className="container navbar-container">
        <div className="brand-group">
          <img src={logo} alt="AccessFix Logo" className="brand-icon" />
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-title">AccessFix</span>
              <span className="brand-tag">v0.1.0</span>
            </div>
            <span className="brand-subtitle">WCAG Auto-Remediation Engine</span>
          </div>
        </div>

        <nav className="nav-actions" aria-label="Main Navigation">
          <div className={`status-pill ${phase.className}`}>
            <span className="pulse-dot" aria-hidden="true" />
            <span>{phase.label}</span>
          </div>

          <div className="nav-badges-group">
            <div className="hackathon-chip">
              <Sparkles size={13} className="sparkle-icon" aria-hidden="true" />
              <span>36h Hackathon Sprint</span>
            </div>

            {onStartDemo && (
              <button
                type="button"
                onClick={onStartDemo}
                className="btn btn-primary btn-sm"
                aria-label="Simulate full live demo"
                title="Run step-by-step automated demo simulation"
              >
                <Play size={14} fill="currentColor" aria-hidden="true" />
                <span>Simulate Live Demo</span>
              </button>
            )}

            {currentPhase !== 'input' && (
              <button
                type="button"
                onClick={onReset}
                disabled={isBusy}
                className="btn btn-secondary btn-sm"
                aria-label="Reset audit pipeline"
                title="Reset session to start fresh"
              >
                <RotateCcw size={13} aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
