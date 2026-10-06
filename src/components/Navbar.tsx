import React from 'react';
import logo from '../assets/logo.svg';

export const Navbar: React.FC = () => {
  return (
    <header className="navbar-wrapper">
      <div className="container navbar-container">
        <div className="brand-group">
          <img src={logo} alt="AccessFix Logo" className="brand-icon" />
          <div className="brand-text">
            <span className="brand-title">AccessFix</span>
            <span className="brand-tag">v0.1.0-alpha</span>
          </div>
        </div>

        <nav className="nav-actions">
          <div className="hackathon-chip">
            <span className="pulse-dot"></span>
            <span>36h Hackathon Sprint</span>
          </div>

          <a
            href="#demo"
            className="btn btn-secondary btn-sm"
            aria-label="Jump to interactive demo"
          >
            Live Simulator
          </a>
        </nav>
      </div>
    </header>
  );
};
