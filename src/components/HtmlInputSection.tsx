import React, { useState, useMemo, useRef } from 'react';
import {
  Code,
  Trash2,
  Search,
  Sparkles,
  FileCode,
  Globe,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { SAMPLE_HTML_SNIPPETS, countLines } from '../utils';
import { fetchHtmlFromUrl, PRESET_LIVE_URLS } from '../services';

interface HtmlInputSectionProps {
  rawHtml: string;
  setRawHtml: (val: string) => void;
  selectedSampleId: string;
  loadSample: (id: string) => void;
  clearHtml: () => void;
  onScan: () => void;
  isScanning: boolean;
}

type InputMode = 'editor' | 'url' | 'file';

export const HtmlInputSection: React.FC<HtmlInputSectionProps> = ({
  rawHtml,
  setRawHtml,
  selectedSampleId,
  loadSample,
  clearHtml,
  onScan,
  isScanning,
}) => {
  const [inputMode, setInputMode] = useState<InputMode>('editor');
  const [urlInput, setUrlInput] = useState<string>('https://www.google.com');
  const [isFetchingUrl, setIsFetchingUrl] = useState<boolean>(false);
  const [urlFetchError, setUrlFetchError] = useState<string | null>(null);
  const [loadedSourceMeta, setLoadedSourceMeta] = useState<string | null>(null);

  // File upload drag-and-drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const lineCount = useMemo(() => Math.max(1, countLines(rawHtml)), [rawHtml]);
  const charCount = rawHtml.length;

  const lineNumbers = useMemo(() => {
    return Array.from({ length: Math.min(lineCount, 250) }, (_, i) => i + 1);
  }, [lineCount]);

  // Handle URL scraping
  const handleFetchUrl = async (targetUrl: string = urlInput) => {
    if (!targetUrl.trim()) return;

    try {
      setIsFetchingUrl(true);
      setUrlFetchError(null);
      const result = await fetchHtmlFromUrl(targetUrl);

      if (result.status === 'success' && result.html) {
        setRawHtml(result.html);
        setLoadedSourceMeta(`Scraped from ${result.url} (${((result.byteSize || 0) / 1024).toFixed(1)} KB)`);
        setUploadedFileName(null);
      } else {
        setUrlFetchError(result.error || 'Failed to fetch webpage.');
      }
    } catch (err) {
      setUrlFetchError(err instanceof Error ? err.message : 'Failed to fetch URL.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // Handle HTML File Upload
  const handleFileProcess = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setRawHtml(content);
        setUploadedFileName(file.name);
        setLoadedSourceMeta(`Loaded from ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        setUrlFetchError(null);
      }
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <section id="code-editor" className="container input-section" aria-labelledby="input-heading">
      <div className="section-header-row">
        <div>
          <span className="section-eyebrow">Step 1 &bull; Source Markup & Ingestion</span>
          <h2 id="input-heading" className="section-title">
            Accessibility Playground & Input Hub
          </h2>
        </div>

        {/* Input Mode Tabs */}
        <div className="input-mode-tabs" role="tablist" aria-label="Input Formats">
          <button
            type="button"
            onClick={() => setInputMode('editor')}
            className={`input-mode-tab ${inputMode === 'editor' ? 'active' : ''}`}
            role="tab"
            aria-selected={inputMode === 'editor'}
          >
            <Code size={14} aria-hidden="true" />
            <span>Code Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={`input-mode-tab ${inputMode === 'url' ? 'active' : ''}`}
            role="tab"
            aria-selected={inputMode === 'url'}
          >
            <Globe size={14} aria-hidden="true" />
            <span>Live URL Scraper</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode('file')}
            className={`input-mode-tab ${inputMode === 'file' ? 'active' : ''}`}
            role="tab"
            aria-selected={inputMode === 'file'}
          >
            <UploadCloud size={14} aria-hidden="true" />
            <span>Upload .HTML File</span>
          </button>
        </div>
      </div>

      <div className="glass-card editor-card">
        {/* URL Input Bar (Visible in URL Mode) */}
        {inputMode === 'url' && (
          <div className="url-scraper-bar">
            <div className="url-input-group">
              <Globe size={18} className="text-accent" aria-hidden="true" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFetchUrl();
                }}
                placeholder="Enter any live website URL (e.g. https://google.com, wikipedia.org, reddit.com)"
                className="url-text-field"
                aria-label="Website URL to crawl and scrape HTML from"
              />
              <button
                type="button"
                onClick={() => handleFetchUrl()}
                disabled={isFetchingUrl || !urlInput.trim()}
                className="btn btn-primary btn-md"
              >
                {isFetchingUrl ? (
                  <>
                    <span className="spinner-inline" aria-hidden="true" />
                    <span>Crawling & Scraping...</span>
                  </>
                ) : (
                  <>
                    <span>Fetch & Ingest HTML</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </>
                )}
              </button>
            </div>

            {/* Quick Live URL Presets */}
            <div className="quick-url-presets">
              <span className="preset-label">Quick Live Targets:</span>
              <div className="preset-buttons">
                {PRESET_LIVE_URLS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => {
                      setUrlInput(preset.url);
                      handleFetchUrl(preset.url);
                    }}
                    className="btn-chip"
                    title={`Fetch from ${preset.url}`}
                  >
                    <ExternalLink size={12} aria-hidden="true" />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {urlFetchError && (
              <div className="url-error-msg" role="alert">
                <AlertCircle size={14} className="text-danger" />
                <span>{urlFetchError}</span>
              </div>
            )}
          </div>
        )}

        {/* HTML File Upload Dropzone (Visible in File Mode) */}
        {inputMode === 'file' && (
          <div className="file-upload-zone">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".html,.htm,.xhtml,.txt"
              style={{ display: 'none' }}
              aria-label="HTML file upload selector"
            />
            <div
              className={`file-dropzone ${isDragging ? 'file-dropzone-active' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
              }}
              aria-label="Drag and drop or click to upload HTML file"
            >
              <div className="dropzone-icon-circle">
                <UploadCloud size={28} className="text-accent" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                {uploadedFileName ? uploadedFileName : 'Drag & Drop HTML File Here'}
              </h3>
              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.85rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button type="button" className="btn btn-primary btn-sm">
                  <FileCode size={13} />
                  <span>Browse Local Files</span>
                </button>
                <a
                  href="/demo-sample.html"
                  download="novacorp-demo-sample.html"
                  onClick={(e) => e.stopPropagation()}
                  className="btn btn-secondary btn-sm"
                  title="Download ready-to-test sample HTML file to your Downloads folder"
                >
                  <UploadCloud size={13} style={{ transform: 'rotate(180deg)' }} />
                  <span>Download Demo Sample File (.html)</span>
                </a>
              </div>
            </div>
          </div>
        )}

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
            {loadedSourceMeta && (
              <span className="source-meta-tag">
                <CheckCircle2 size={12} className="text-success" />
                <span>{loadedSourceMeta}</span>
              </span>
            )}
          </div>

          {inputMode === 'editor' && (
            <div className="sample-presets-group" aria-label="Demo Snippet Presets">
              <span className="preset-label">Presets:</span>
              <div className="preset-buttons">
                {SAMPLE_HTML_SNIPPETS.map((sample) => {
                  const isSelected = selectedSampleId === sample.id;
                  return (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => {
                        loadSample(sample.id);
                        setLoadedSourceMeta(`Preset: ${sample.title}`);
                        setUploadedFileName(null);
                      }}
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
          )}

          <div className="btn-cluster">
            <button
              type="button"
              onClick={() => {
                clearHtml();
                setLoadedSourceMeta(null);
                setUploadedFileName(null);
              }}
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
            onChange={(e) => {
              setRawHtml(e.target.value);
              setLoadedSourceMeta('Custom User Input');
            }}
            placeholder="Paste your raw HTML document, live scrape output, or uploaded file contents here..."
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
            <span>
              Ingested HTML will be evaluated across 7 WCAG 2.1 AA rule sets with deterministic auto-repair.
            </span>
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
