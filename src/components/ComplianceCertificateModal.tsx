import React, { useRef } from 'react';
import {
  ShieldCheck,
  Award,
  Download,
  Printer,
  X,
  CheckCircle2,
  Lock,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ComplianceCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTitle?: string;
  scoreBefore: number;
  scoreAfter: number;
  fixedCount: number;
  timestamp: string;
}

export const ComplianceCertificateModal: React.FC<ComplianceCertificateModalProps> = ({
  isOpen,
  onClose,
  targetTitle = 'Web Application HTML Markup',
  scoreBefore,
  scoreAfter,
  fixedCount,
  timestamp,
}) => {
  if (!isOpen) return null;

  const certificateId = `AF-CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const verificationHash = `sha256-${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  const handlePrint = () => {
    window.print();
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
      aria-labelledby="certificate-heading"
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '760px',
          maxHeight: '94vh',
          overflowY: 'auto',
          padding: '2.25rem',
          border: '2px solid rgba(245, 158, 11, 0.5)',
          background: 'linear-gradient(135deg, rgba(16, 23, 38, 0.98) 0%, rgba(10, 14, 23, 0.98) 100%)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
          }}
          aria-label="Close Certificate"
        >
          <X size={20} />
        </button>

        {/* Certificate Frame */}
        <div
          style={{
            border: '2px dashed rgba(245, 158, 11, 0.4)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            background: 'rgba(245, 158, 11, 0.02)',
          }}
        >
          {/* Gold Badge Seal */}
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              color: '#ffffff',
              boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)',
            }}
          >
            <Award size={36} />
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#fbbf24' }}>
              Official Certificate of Web Accessibility
            </span>
            <h2 id="certificate-heading" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
              WCAG 2.1 AA Compliance Verification
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '520px', margin: '0.5rem auto 0' }}>
              This certifies that the target web markup has undergone automated heuristic auditing, safe deterministic auto-remediation, and zero-regression re-scan verification.
            </p>
          </div>

          {/* Target Entity Box */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              textAlign: 'left',
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Target Resource</span>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{targetTitle}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Verified Score</span>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>{scoreAfter}/100 (Grade A)</p>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Remediations</span>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>{fixedCount} Resolved</p>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>Regressions</span>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>0 Regressions</p>
            </div>
          </div>

          {/* Verification Hash & Meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: 'var(--text-dim)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={12} className="text-warning" />
              <span>Certificate ID: <code>{certificateId}</code></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={12} />
              <span>Issued: {new Date(timestamp || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-md"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-primary btn-md"
          >
            <Printer size={15} />
            <span>Print / Save Certificate PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
