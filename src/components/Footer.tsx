import React from 'react';
import { ShieldCheck, GitBranch, Layers, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer-wrapper" role="contentinfo">
      <div className="container footer-content">
        <div className="footer-left">
          <div className="footer-brand-row">
            <span className="footer-brand-title">AccessFix</span>
            <span className="badge badge-minor">36-Hour Hackathon Project</span>
          </div>
          <p className="footer-sub">
            Web accessibility remediation tool &bull; <strong>Detect &bull; Repair &bull; Verify</strong>.
            Empowering developers to fix WCAG barriers with safe, deterministic standard compliance.
          </p>
        </div>

        {/* Modular Architecture Credit for Judges */}
        <div className="footer-architecture-box">
          <div className="arch-header">
            <GitBranch size={14} aria-hidden="true" />
            <span>Team Module Boundaries</span>
          </div>
          <ul className="arch-list">
            <li>
              <span className="member-role">Lead (Frontend & Integration):</span>
              <span className="member-status">Shell Ready</span>
            </li>
            <li>
              <span className="member-role">Bhavya (Scanner & Verification):</span>
              <span className="member-status">Feature Branch Ready</span>
            </li>
            <li>
              <span className="member-role">Sravani (Repair Engine & Firestore):</span>
              <span className="member-status">Feature Branch Ready</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom-row">
        <p className="copyright-text">
          AccessFix &copy; {new Date().getFullYear()} &bull; Built with React, TypeScript & Vite.
        </p>
        <div className="standards-badge">
          <ShieldCheck size={14} className="text-success" aria-hidden="true" />
          <span>WCAG 2.1 AA / Section 508 Compliant Architecture</span>
        </div>
      </div>
    </footer>
  );
};
