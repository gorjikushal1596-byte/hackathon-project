import React, { useMemo } from 'react';
import { Code, Trash2, Search, Sparkles, FileCode } from 'lucide-react';
import { SAMPLE_HTML_SNIPPETS, countLines } from '../utils';

interface HtmlInputSectionProps {
  rawHtml: string;
  setRawHtml: (val: string) => void;
  selectedSampleId: string;
  loadSample: (id: string) => void;
  clearHtml: () => void;
  onScan: () => void;
  isScanning: boolean;
}

export const HtmlInputSection: React.FC<HtmlInputSectionProps> = ({
  rawHtml,
  setRawHtml,
  selectedSampleId,
  loadSample,
  clearHtml,
  onScan,
  isScanning,
}) => {
  const lineCount = useMemo(() => Math.max(1, countLines(rawHtml)), [rawHtml]);
  const charCount = rawHtml.length;

  const lineNumbers = useMemo(() => {
    return Array.from({ length: Math.min(lineCount, 250) }, (_, i) => i + 1);
  }, [lineCount]);

  return (
    <section id="code-editor" className="container input-section" aria-labelledby="input-heading">
      <div className="section-header-row">
        <div>
          <span className="section-eyebrow">Step 1 &bull; Source Markup</span>
          <h2 id="input-heading" className="section-title">
            Accessibility Playground & Editor
          </h2>
        </div>

        <div className="sample-presets-group" aria-label="Demo Snippet Presets">
          <span className="preset-label">Load Preset Scenario:</span>
          <div className="preset-buttons">
            {SAMPLE_HTML_SNIPPETS.map((sample) => {
              const isSelected = selectedSampleId === sample.id;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => loadSample(sample.id)}
                  className={`btn-chip ${isSelected ? 'active' : ''}`}
                  aria-pressed={isSelected}
                  title={sample.description}
                >
                  <FileCode size={13} aria-hidden="true" />
                  <span>{sample.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass-card editor-card">
        {/* Editor Toolbar */}
        <div className="editor-toolbar">
          <div className="toolbar-left">
            <span className="editor-badge">
              <Code size={16} className="text-accent" aria-hidden="true" />
              <span>HTML Source Code</span>
            </span>
            <span className="editor-stats">
              {lineCount} lines &bull; {charCount} chars
            </span>
          </div>

          <div className="btn-cluster">
            <button
              type="button"
              onClick={clearHtml}
              disabled={isScanning || !rawHtml}
              className="btn btn-secondary btn-sm"
              aria-label="Clear code editor"
              title="Clear all HTML markup"
            >
              <Trash2 size={13} aria-hidden="true" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Editor Container with Line Numbers */}
        <div className="editor-textarea-container">
          <div className="code-lines-sidebar" aria-hidden="true">
            {lineNumbers.map((num) => (
              <div key={num} className="line-num">
                {num}
              </div>
            ))}
          </div>

          <textarea
            value={rawHtml}
            onChange={(e) => setRawHtml(e.target.value)}
            placeholder="Paste your raw HTML document or snippet here..."
            className="code-textarea"
            aria-label="HTML markup input for accessibility scanning"
            spellCheck="false"
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>

        {/* Editor Footer Action Bar */}
        <div className="editor-actions-bar">
          <div className="action-hint">
            <Sparkles size={14} className="sparkle-icon" aria-hidden="true" />
            <span>WCAG 2.1 AA heuristics evaluate images, form controls, names, and semantics.</span>
          </div>

          <div className="btn-cluster">
            <button
              type="button"
              onClick={onScan}
              disabled={isScanning || !rawHtml.trim()}
              className="btn btn-primary btn-lg"
              aria-label="Run WCAG Accessibility Scan"
            >
              {isScanning ? (
                <>
                  <span className="spinner-inline" aria-hidden="true" />
                  <span>Scanning DOM Nodes...</span>
                </>
              ) : (
                <>
                  <Search size={16} aria-hidden="true" />
                  <span>Run Accessibility Scan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
