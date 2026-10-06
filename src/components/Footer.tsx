import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer-wrapper">
      <div className="container footer-content">
        <div className="footer-left">
          <p className="footer-brand"><strong>AccessFix</strong> &bull; 36-Hour Hackathon Project</p>
          <p className="footer-sub">
            Empowering teams to detect and fix web accessibility barriers with intelligent automation.
          </p>
        </div>

        <div className="footer-right">
          <span className="badge badge-minor">Phase 1: Foundation Ready</span>
        </div>
      </div>
    </footer>
  );
};
