import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Eye,
  Sparkles,
  Play,
  Square,
  ShieldCheck,
  RefreshCw,
  Zap,
  Sliders,
} from 'lucide-react';

interface DisabilitySimulatorProps {
  originalHtml: string;
  repairedHtml: string;
}

export type VisionFilter = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia' | 'low-vision';

export const DisabilitySimulator: React.FC<DisabilitySimulatorProps> = ({
  originalHtml,
  repairedHtml,
}) => {
  const [activeTab, setActiveTab] = useState<'screen-reader' | 'vision-lens'>('screen-reader');
  const [readingMode, setReadingMode] = useState<'before' | 'after'>('after');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentSpeechText, setCurrentSpeechText] = useState<string>('');
  const [speechLog, setSpeechLog] = useState<string[]>([]);
  const [activeVisionFilter, setActiveVisionFilter] = useState<VisionFilter>('normal');

  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  // Parses HTML into simulated screen reader announcements
  const extractScreenReaderAnnouncements = (html: string, isRepaired: boolean): string[] => {
    if (!html) return ['No markup provided.'];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const announcements: string[] = [];

    // Document language check
    const lang = doc.documentElement.getAttribute('lang');
    if (lang) {
      announcements.push(`Document language specified as ${lang}.`);
    } else {
      announcements.push('Warning: No document language specified. Screen reader using default voice.');
    }

    // Traverse interactive & key semantic elements
    const elements = Array.from(doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6, img, a, button, input, select, textarea, p'));

    elements.forEach((el) => {
      const tag = el.tagName.toLowerCase();

      if (/^h[1-6]$/.test(tag)) {
        const text = el.textContent?.trim();
        if (text) {
          announcements.push(`Heading level ${tag[1]}: ${text}`);
        } else {
          announcements.push(`Empty heading level ${tag[1]}.`);
        }
      } else if (tag === 'img') {
        const alt = el.getAttribute('alt');
        const src = el.getAttribute('src') || '';
        const fileName = src.split('/').pop() || 'graphic';
        if (alt === '') {
          announcements.push('Decorative image, skipped.');
        } else if (alt) {
          announcements.push(`Image: ${alt}`);
        } else {
          announcements.push(`Unlabelled graphic, file: ${fileName}`);
        }
      } else if (tag === 'button') {
        const ariaLabel = el.getAttribute('aria-label');
        const text = el.textContent?.trim();
        if (ariaLabel) {
          announcements.push(`Button: ${ariaLabel}`);
        } else if (text) {
          announcements.push(`Button: ${text}`);
        } else {
          announcements.push('Unlabelled button, interactive.');
        }
      } else if (tag === 'input') {
        const type = el.getAttribute('type') || 'text';
        const ariaLabel = el.getAttribute('aria-label');
        const placeholder = el.getAttribute('placeholder');
        const id = el.getAttribute('id');
        const labelEl = id ? doc.querySelector(`label[for="${id}"]`) : null;
        const labelText = labelEl?.textContent?.trim();

        if (ariaLabel) {
          announcements.push(`Edit text, ${type}: ${ariaLabel}`);
        } else if (labelText) {
          announcements.push(`Edit text, ${type}: ${labelText}`);
        } else if (placeholder) {
          announcements.push(`Edit text with placeholder: ${placeholder}`);
        } else {
          announcements.push(`Unlabelled edit text field, type ${type}.`);
        }
      } else if (tag === 'a') {
        const text = el.textContent?.trim();
        const ariaLabel = el.getAttribute('aria-label');
        if (ariaLabel) {
          announcements.push(`Link: ${ariaLabel}`);
        } else if (text) {
          announcements.push(`Link: ${text}`);
        } else {
          announcements.push('Unlabelled link.');
        }
      }
    });

    if (announcements.length === 0) {
      announcements.push('Page content: ' + (doc.body.textContent?.slice(0, 100) || ''));
    }

    return announcements;
  };

  const handleStartSpeaking = () => {
    if (!synthRef.current) {
      alert('Speech synthesis is not supported in this browser environment.');
      return;
    }

    synthRef.current.cancel();

    const targetHtml = readingMode === 'after' ? (repairedHtml || originalHtml) : originalHtml;
    const announcements = extractScreenReaderAnnouncements(targetHtml, readingMode === 'after');
    setSpeechLog(announcements);
    setIsSpeaking(true);

    const fullText = announcements.join('. ');
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onboundary = (event) => {
      // Show currently spoken phrase roughly
      const words = fullText.slice(event.charIndex, event.charIndex + 40);
      setCurrentSpeechText(words);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeechText('');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentSpeechText('');
    };

    synthRef.current.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    setCurrentSpeechText('');
  };

  const getVisionFilterStyle = (filter: VisionFilter): React.CSSProperties => {
    switch (filter) {
      case 'protanopia':
        // Red-blind simulation matrix
        return { filter: 'url(#protanopia-filter) grayscale(30%) sepia(20%)' };
      case 'deuteranopia':
        // Green-blind simulation
        return { filter: 'sepia(40%) hue-rotate(180deg) saturate(140%)' };
      case 'tritanopia':
        // Blue-blind simulation
        return { filter: 'sepia(50%) hue-rotate(70deg) saturate(120%)' };
      case 'achromatopsia':
        // Total color blindness
        return { filter: 'grayscale(100%) contrast(110%)' };
      case 'low-vision':
        // Cataracts / Low Vision
        return { filter: 'blur(3.5px) contrast(85%)' };
      case 'normal':
      default:
        return { filter: 'none' };
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.75rem', marginTop: '1.75rem', borderColor: 'rgba(99, 102, 241, 0.4)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                Interactive Disability Perspective Simulator
              </h3>
              <span className="badge badge-primary-glow">Judge Demo Feature</span>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>
              Test accessibility through the lived experience of blind & visually impaired users
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="input-mode-tabs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('screen-reader');
              handleStopSpeaking();
            }}
            className={`input-mode-tab ${activeTab === 'screen-reader' ? 'active' : ''}`}
          >
            <Volume2 size={14} />
            <span>Audio Screen Reader Voice</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('vision-lens');
              handleStopSpeaking();
            }}
            className={`input-mode-tab ${activeTab === 'vision-lens' ? 'active' : ''}`}
          >
            <Eye size={14} />
            <span>Visual Impairment Lens</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SCREEN READER VOICE SIMULATOR */}
      {activeTab === 'screen-reader' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'rgba(0, 0, 0, 0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Select Perspective:
              </span>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setReadingMode('before');
                    handleStopSpeaking();
                  }}
                  className={`btn-chip ${readingMode === 'before' ? 'active' : ''}`}
                  style={{ borderColor: readingMode === 'before' ? '#ef4444' : undefined }}
                >
                  <VolumeX size={12} className="text-danger" />
                  <span>Before Repair (Broken Audio)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReadingMode('after');
                    handleStopSpeaking();
                  }}
                  className={`btn-chip ${readingMode === 'after' ? 'active' : ''}`}
                  style={{ borderColor: readingMode === 'after' ? '#10b981' : undefined }}
                >
                  <ShieldCheck size={12} className="text-success" />
                  <span>After Repair (Clear WCAG Voice)</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {isSpeaking ? (
                <button
                  type="button"
                  onClick={handleStopSpeaking}
                  className="btn btn-secondary btn-md"
                  style={{ borderColor: '#ef4444', color: '#fca5a5' }}
                >
                  <Square size={14} fill="currentColor" />
                  <span>Stop Speech</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartSpeaking}
                  className="btn btn-primary btn-md"
                >
                  <Play size={14} fill="currentColor" />
                  <span>🔊 Speak Screen Reader Audio Live</span>
                </button>
              )}
            </div>
          </div>

          {/* Spoken Speech Display Box */}
          <div style={{ background: 'var(--bg-code)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Volume2 size={13} className="text-accent" />
                <span>Simulated Screen Reader Speech Stream</span>
              </span>
              <span className={`badge ${readingMode === 'after' ? 'badge-success' : 'badge-critical'}`}>
                {readingMode === 'after' ? 'Accessible Speech Stream' : 'Broken Inaccessible Stream'}
              </span>
            </div>

            <div style={{ minHeight: '120px', maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}>
              {speechLog.length === 0 ? (
                <p style={{ color: 'var(--text-dim)', fontStyle: 'italic', margin: 'auto' }}>
                  Click <strong>"🔊 Speak Screen Reader Audio Live"</strong> to hear what blind and low-vision users experience.
                </p>
              ) : (
                speechLog.map((line, idx) => {
                  const isBroken = line.includes('Unlabelled') || line.includes('Warning') || line.includes('Empty');
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '0.35rem 0.6rem',
                        borderRadius: '4px',
                        background: isBroken ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                        borderLeft: `3px solid ${isBroken ? '#ef4444' : '#10b981'}`,
                        color: isBroken ? '#fca5a5' : '#a7f3d0',
                      }}
                    >
                      <span>🗣️ {line}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL IMPAIRMENT & COLOR BLINDNESS LENS */}
      {activeTab === 'vision-lens' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', background: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Vision Lens Filter:
            </span>
            <button
              type="button"
              onClick={() => setActiveVisionFilter('normal')}
              className={`btn-chip ${activeVisionFilter === 'normal' ? 'active' : ''}`}
            >
              Normal 20/20 Vision
            </button>
            <button
              type="button"
              onClick={() => setActiveVisionFilter('protanopia')}
              className={`btn-chip ${activeVisionFilter === 'protanopia' ? 'active' : ''}`}
            >
              Protanopia (Red-Blind)
            </button>
            <button
              type="button"
              onClick={() => setActiveVisionFilter('deuteranopia')}
              className={`btn-chip ${activeVisionFilter === 'deuteranopia' ? 'active' : ''}`}
            >
              Deuteranopia (Green-Blind)
            </button>
            <button
              type="button"
              onClick={() => setActiveVisionFilter('tritanopia')}
              className={`btn-chip ${activeVisionFilter === 'tritanopia' ? 'active' : ''}`}
            >
              Tritanopia (Blue-Blind)
            </button>
            <button
              type="button"
              onClick={() => setActiveVisionFilter('achromatopsia')}
              className={`btn-chip ${activeVisionFilter === 'achromatopsia' ? 'active' : ''}`}
            >
              Achromatopsia (Monochrome)
            </button>
            <button
              type="button"
              onClick={() => setActiveVisionFilter('low-vision')}
              className={`btn-chip ${activeVisionFilter === 'low-vision' ? 'active' : ''}`}
            >
              Cataracts / Low Vision Blur
            </button>
          </div>

          {/* Live Rendered Iframe / Viewport */}
          <div style={{ background: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '2px solid rgba(99, 102, 241, 0.4)', transition: 'filter 0.3s ease', ...getVisionFilterStyle(activeVisionFilter) }}>
            <div style={{ background: '#1e293b', color: '#94a3b8', padding: '0.4rem 0.75rem', fontSize: '0.74rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Live Simulation Viewport (Filtered: {activeVisionFilter.toUpperCase()})</span>
              <span>Rendered DOM Sandbox</span>
            </div>
            <iframe
              srcDoc={repairedHtml || originalHtml || '<p style="padding:2rem;color:#000;">No markup loaded yet.</p>'}
              title="Visual Impairment Simulation Sandbox"
              sandbox="allow-same-origin"
              style={{ width: '100%', height: '240px', border: 'none', background: '#ffffff' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
