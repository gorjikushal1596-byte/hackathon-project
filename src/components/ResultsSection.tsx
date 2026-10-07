import React, { useMemo } from 'react';
import { ScanResult, SeverityLevel } from '../types';
import { SummaryCards } from './SummaryCards';
import { FindingCard } from './FindingCard';
import { ShieldCheck, Filter, AlertCircle, FileSearch } from 'lucide-react';

interface ResultsSectionProps {
  scanResult: any | null;
  filterSeverity: SeverityLevel | 'all';
  setFilterSeverity: (sev: SeverityLevel | 'all') => void;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  scanResult,
  filterSeverity,
  setFilterSeverity,
}) => {
  if (!scanResult) {
    return (
      <section className="container" aria-label="Scan Results Placeholder">
        <div className="glass-card empty-state-card">
          <div className="empty-state-icon-circle" aria-hidden="true">
            <FileSearch size={28} />
          </div>
          <h3 className="empty-state-title">No Active Scan Results</h3>
          <p className="empty-state-text">
            Provide HTML in the playground above and click <strong>"Run Accessibility Scan"</strong> or launch the <strong>"Simulate Live Demo"</strong> to inspect diagnostics.
          </p>
        </div>
      </section>
    );
  }

  const findings: any[] = scanResult.findings || [];
  const score = scanResult.score ?? scanResult.summary?.score ?? 100;
  const errorCount =
    scanResult.countsBySeverity?.error ??
    findings.filter((f: any) => f.severity === 'error' || f.severity === 'critical').length;
  const warningCount =
    scanResult.countsBySeverity?.warning ??
    findings.filter((f: any) => f.severity === 'warning' || f.severity === 'moderate').length;

  const filteredFindings = useMemo(() => {
    if (filterSeverity === 'all') return findings;
    if (filterSeverity === 'critical' || filterSeverity === 'serious') {
      return findings.filter((f) => f.severity === 'error' || f.severity === 'critical');
    }
    if (filterSeverity === 'warning' || filterSeverity === 'moderate' || filterSeverity === 'minor') {
      return findings.filter((f) => f.severity === 'warning' || f.severity === 'moderate');
    }
    return findings;
  }, [findings, filterSeverity]);

  return (
    <section className="container" aria-labelledby="results-heading">
      <div className="section-header-row">
        <div>
          <span className="section-eyebrow">Step 2 &bull; Diagnostic Findings</span>
          <h2 id="results-heading" className="section-title">
            Accessibility Scan Breakdown
          </h2>
        </div>

        <div className="findings-filter-bar" aria-label="Filter Findings by Severity">
          <span className="filter-label">
            <Filter size={13} aria-hidden="true" />
            <span>Filter:</span>
          </span>

          <div className="filter-pill-group">
            <button
              type="button"
              onClick={() => setFilterSeverity('all')}
              className={`filter-pill ${filterSeverity === 'all' ? 'active' : ''}`}
              aria-pressed={filterSeverity === 'all'}
            >
              <span>All Findings</span>
              <span className="filter-pill-count">{findings.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterSeverity('critical')}
              className={`filter-pill ${filterSeverity === 'critical' ? 'active' : ''}`}
              aria-pressed={filterSeverity === 'critical'}
            >
              <span className="text-danger">Critical Errors</span>
              <span className="filter-pill-count">{errorCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterSeverity('warning')}
              className={`filter-pill ${filterSeverity === 'warning' ? 'active' : ''}`}
              aria-pressed={filterSeverity === 'warning'}
            >
              <span className="text-warning">Warnings</span>
              <span className="filter-pill-count">{warningCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Score & Metrics */}
      <SummaryCards
        score={score}
        totalIssues={findings.length}
        errorCount={errorCount}
        warningCount={warningCount}
      />

      {/* Findings List */}
      <div className="findings-list-wrapper">
        <div className="findings-list-meta">
          Showing <strong>{filteredFindings.length}</strong> of <strong>{findings.length}</strong> detected WCAG violations
        </div>

        {filteredFindings.length === 0 ? (
          <div className="glass-card empty-filter-box">
            <ShieldCheck size={32} className="text-success" aria-hidden="true" />
            <p>No violations match the selected severity filter.</p>
          </div>
        ) : (
          <div className="findings-grid">
            {filteredFindings.map((finding, idx) => (
              <FindingCard key={finding.id || idx} finding={finding} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
