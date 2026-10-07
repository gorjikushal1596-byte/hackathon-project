import {
  Finding,
  FindingSeverity,
  ScanResult,
  SeverityCounts,
} from '../types/accessibility';
import { calculateAccessibilityScore } from './scoringService';

/**
 * Universal element interface used across both browser DOM and lightweight fallback parser.
 */
export interface ScanElement {
  tagName: string;
  attributes: Record<string, string>;
  children: ScanElement[];
  parentElement: ScanElement | null;
  textContent: string;
  outerHTML: string;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  querySelectorAll(selector: string): ScanElement[];
  querySelector(selector: string): ScanElement | null;
  closest(tagName: string): ScanElement | null;
}

/**
 * Creates a normalized ScanElement from native browser DOM Element.
 */
function wrapNativeDomElement(
  nativeEl: Element,
  parent: ScanElement | null = null
): ScanElement {
  const tagName = nativeEl.tagName.toLowerCase();
  const attributes: Record<string, string> = {};

  for (let i = 0; i < nativeEl.attributes.length; i++) {
    const attr = nativeEl.attributes[i];
    attributes[attr.name.toLowerCase()] = attr.value;
  }

  const scanEl: ScanElement = {
    tagName,
    attributes,
    children: [],
    parentElement: parent,
    textContent: nativeEl.textContent || '',
    outerHTML: nativeEl.outerHTML || '',
    getAttribute: (name: string) => {
      const lower = name.toLowerCase();
      return attributes[lower] !== undefined ? attributes[lower] : null;
    },
    hasAttribute: (name: string) => {
      return attributes[name.toLowerCase()] !== undefined;
    },
    querySelectorAll: (sel: string) => {
      try {
        const matches = Array.from(nativeEl.querySelectorAll(sel));
        return matches.map((m) => wrapNativeDomElement(m));
      } catch {
        return [];
      }
    },
    querySelector: (sel: string) => {
      try {
        const match = nativeEl.querySelector(sel);
        return match ? wrapNativeDomElement(match) : null;
      } catch {
        return null;
      }
    },
    closest: (sel: string) => {
      try {
        const match = nativeEl.closest(sel);
        return match ? wrapNativeDomElement(match) : null;
      } catch {
        return null;
      }
    },
  };

  scanEl.children = Array.from(nativeEl.children).map((child) =>
    wrapNativeDomElement(child, scanEl)
  );

  return scanEl;
}

/**
 * Set of HTML void elements that do not require closing tags.
 */
const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

/**
 * Resilient, zero-dependency lightweight DOM tree parser.
 * Used when running in non-browser environments (e.g. Node tests, CLI)
 * or as a safe fallback. Will NEVER crash on malformed HTML.
 */
export function parseHtmlResilient(htmlString: string): ScanElement {
  // Virtual root container
  const root: ScanElement = {
    tagName: 'root',
    attributes: {},
    children: [],
    parentElement: null,
    textContent: '',
    outerHTML: '',
    getAttribute: () => null,
    hasAttribute: () => false,
    querySelectorAll: (sel: string) => queryAllFromElement(root, sel),
    querySelector: (sel: string) => queryFirstFromElement(root, sel),
    closest: () => null,
  };

  if (!htmlString || typeof htmlString !== 'string') {
    return root;
  }

  // Strip comments and doctype header cleanly
  const sanitized = htmlString
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  // Tokenize tags and text content
  const tagRegex = /<\/?([a-zA-Z0-9\-]+)([^>]*)>|([^<]+)/g;
  let match: RegExpExecArray | null;

  const stack: ScanElement[] = [root];

  while ((match = tagRegex.exec(sanitized)) !== null) {
    const [fullMatch, rawTagName, rawAttrs, textChunk] = match;

    if (textChunk) {
      const current = stack[stack.length - 1];
      current.textContent += textChunk;
      continue;
    }

    if (!rawTagName) continue;

    const tagName = rawTagName.toLowerCase();
    const isClosing = fullMatch.startsWith('</');

    if (isClosing) {
      // Find matching tag in stack from top down
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tagName === tagName) {
          stack.splice(i, stack.length - i);
          break;
        }
      }
    } else {
      // Parse attributes
      const attributes: Record<string, string> = {};
      if (rawAttrs) {
        const attrRegex = /([a-zA-Z0-9_\-:@.]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
        let attrMatch: RegExpExecArray | null;
        while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
          const attrName = attrMatch[1].toLowerCase();
          const attrVal =
            attrMatch[2] !== undefined
              ? attrMatch[2]
              : attrMatch[3] !== undefined
              ? attrMatch[3]
              : attrMatch[4] !== undefined
              ? attrMatch[4]
              : '';
          attributes[attrName] = attrVal;
        }
      }

      const isSelfClosing =
        fullMatch.endsWith('/>') || VOID_ELEMENTS.has(tagName);

      const parent = stack[stack.length - 1];
      const newEl: ScanElement = {
        tagName,
        attributes,
        children: [],
        parentElement: parent,
        textContent: '',
        outerHTML: fullMatch,
        getAttribute: (name: string) => {
          const val = attributes[name.toLowerCase()];
          return val !== undefined ? val : null;
        },
        hasAttribute: (name: string) => {
          return attributes[name.toLowerCase()] !== undefined;
        },
        querySelectorAll: (sel: string) => queryAllFromElement(newEl, sel),
        querySelector: (sel: string) => queryFirstFromElement(newEl, sel),
        closest: (sel: string) => closestFromElement(newEl, sel),
      };

      parent.children.push(newEl);

      if (!isSelfClosing) {
        stack.push(newEl);
      }
    }
  }

  // Update outerHTML snippets and aggregated text content
  updateHierarchyProperties(root);

  return root;
}

function updateHierarchyProperties(el: ScanElement): void {
  for (const child of el.children) {
    updateHierarchyProperties(child);
  }
  if (el.tagName !== 'root' && el.children.length > 0) {
    el.textContent = collectText(el);
  }
}

function collectText(el: ScanElement): string {
  let text = el.textContent || '';
  for (const child of el.children) {
    text += ' ' + collectText(child);
  }
  return text.trim();
}

/**
 * Searches element and descendants for matching selector.
 */
function queryAllFromElement(root: ScanElement, selector: string): ScanElement[] {
  const selectors = selector.split(',').map((s) => s.trim().toLowerCase());
  const results: ScanElement[] = [];

  function traverse(node: ScanElement) {
    for (const child of node.children) {
      if (matchesSelector(child, selectors)) {
        results.push(child);
      }
      traverse(child);
    }
  }

  traverse(root);
  return results;
}

function queryFirstFromElement(root: ScanElement, selector: string): ScanElement | null {
  const matches = queryAllFromElement(root, selector);
  return matches.length > 0 ? matches[0] : null;
}

function closestFromElement(el: ScanElement, selector: string): ScanElement | null {
  const target = selector.trim().toLowerCase();
  let curr: ScanElement | null = el.parentElement;

  while (curr && curr.tagName !== 'root') {
    if (curr.tagName === target) {
      return curr;
    }
    curr = curr.parentElement;
  }

  return null;
}

function matchesSelector(el: ScanElement, selectors: string[]): boolean {
  for (const sel of selectors) {
    if (sel.startsWith('#')) {
      const id = sel.substring(1);
      if (el.getAttribute('id') === id) return true;
    } else if (sel.startsWith('.')) {
      const cls = sel.substring(1);
      const classAttr = el.getAttribute('class') || '';
      if (classAttr.split(/\s+/).includes(cls)) return true;
    } else if (el.tagName === sel) {
      return true;
    }
  }
  return false;
}

/**
 * Parses an HTML string into a queryable document root.
 * Prioritizes window.DOMParser when available, falling back to parseHtmlResilient.
 */
export function parseDocument(html: string): {
  root: ScanElement;
  hasHtmlTag: boolean;
  rawHtml: string;
} {
  const hasHtmlTag = /<html[\s>]/i.test(html) || /<!doctype html/i.test(html);

  // If running in browser environment with DOMParser available
  if (
    typeof window !== 'undefined' &&
    typeof window.DOMParser !== 'undefined'
  ) {
    try {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const root = wrapNativeDomElement(doc.documentElement);
      return { root, hasHtmlTag, rawHtml: html };
    } catch {
      // Fall through to resilient parser
    }
  }

  const root = parseHtmlResilient(html);
  return { root, hasHtmlTag, rawHtml: html };
}

/**
 * Builds a CSS selector or best-effort identifier for a finding.
 */
function buildElementSelector(el: ScanElement, fallbackIndex: number): string {
  if (el.hasAttribute('id')) {
    return `${el.tagName}#${el.getAttribute('id')}`;
  }
  if (el.hasAttribute('name')) {
    return `${el.tagName}[name="${el.getAttribute('name')}"]`;
  }
  if (el.hasAttribute('src')) {
    const src = el.getAttribute('src') || '';
    const cleanSrc = src.length > 25 ? src.slice(0, 22) + '...' : src;
    return `${el.tagName}[src="${cleanSrc}"]`;
  }
  if (el.hasAttribute('class')) {
    const firstClass = el.getAttribute('class')?.trim().split(/\s+/)[0];
    if (firstClass) return `${el.tagName}.${firstClass}`;
  }
  return `${el.tagName}:nth-of-type(${fallbackIndex})`;
}

/**
 * Truncates outer HTML snippet to keep findings clean and readable.
 */
function getSnippet(el: ScanElement, maxLength: number = 100): string {
  const raw = el.outerHTML || `<${el.tagName}>`;
  if (raw.length <= maxLength) return raw;
  return raw.slice(0, maxLength - 3) + '...';
}

// ============================================================================
// ACCESSIBILITY RULES
// ============================================================================

/**
 * Rule 1: Images without alt attributes (img-alt)
 * - Flags <img> tags completely missing the alt attribute.
 * - Respects explicitly empty alt="" (valid decorative image per WCAG).
 * - Respects aria-hidden="true" or role="presentation" / "none".
 */
function checkImgAlt(doc: ScanElement): Finding[] {
  const findings: Finding[] = [];
  const images = doc.querySelectorAll('img');

  images.forEach((img, idx) => {
    // Check if element is explicitly hidden or decorative via ARIA
    if (img.getAttribute('aria-hidden') === 'true') return;
    const role = img.getAttribute('role')?.toLowerCase();
    if (role === 'presentation' || role === 'none') return;

    // Distinguish missing alt from explicitly empty alt=""
    if (!img.hasAttribute('alt')) {
      findings.push({
        id: `finding-img-alt-${idx + 1}`,
        rule: 'img-alt',
        severity: 'error',
        message: 'Image element is missing an alt attribute.',
        element: '<img>',
        selector: buildElementSelector(img, idx + 1),
        htmlSnippet: getSnippet(img),
        suggestion:
          'Add an alt attribute describing the image content (e.g., alt="Product preview"), or provide alt="" if the image is purely decorative.',
      });
    }
  });

  return findings;
}

/**
 * Rule 2: Form controls without accessible labels (form-label)
 * - Detects <input>, <select>, <textarea> lacking accessible names.
 * - Excludes hidden, submit, reset, and button input types.
 * - Validates aria-label, aria-labelledby, wrapping <label>, <label for="id">, and title.
 */
function checkFormLabels(doc: ScanElement): Finding[] {
  const findings: Finding[] = [];
  const controls = doc.querySelectorAll('input, select, textarea');
  const allLabels = doc.querySelectorAll('label');

  controls.forEach((ctrl, idx) => {
    // Exclude hidden or self-labeled input types
    const type = (ctrl.getAttribute('type') || 'text').toLowerCase();
    if (['hidden', 'submit', 'reset', 'button'].includes(type)) return;
    if (ctrl.getAttribute('aria-hidden') === 'true') return;

    // 1. Direct aria-label
    if (ctrl.getAttribute('aria-label')?.trim()) return;

    // 2. Direct aria-labelledby
    if (ctrl.getAttribute('aria-labelledby')?.trim()) return;

    // 3. title attribute
    if (ctrl.getAttribute('title')?.trim()) return;

    // 4. Wrapping <label> ancestor
    const parentLabel = ctrl.closest('label');
    if (parentLabel && parentLabel.textContent.trim().length > 0) return;

    // 5. Explicit <label for="id"> elsewhere in the DOM
    const id = ctrl.getAttribute('id');
    if (id) {
      const matchingLabel = allLabels.find(
        (lbl) => lbl.getAttribute('for') === id && lbl.textContent.trim().length > 0
      );
      if (matchingLabel) return;
    }

    // Violation found
    findings.push({
      id: `finding-form-label-${idx + 1}`,
      rule: 'form-label',
      severity: 'error',
      message: `Form control (<${ctrl.tagName}>) does not have an accessible label.`,
      element: `<${ctrl.tagName}>`,
      selector: buildElementSelector(ctrl, idx + 1),
      htmlSnippet: getSnippet(ctrl),
      suggestion:
        'Associate an explicit label using <label for="element-id">Label text</label>, wrap the control in a <label>, or add an aria-label attribute.',
    });
  });

  return findings;
}

/**
 * Rule 3: Buttons without accessible names (button-name)
 * - Detects <button> and <input type="button|submit|reset"> with no discernible accessible name.
 * - Validates inner text, aria-label, aria-labelledby, title, value, or child img[alt]/svg[title].
 */
function checkButtonNames(doc: ScanElement): Finding[] {
  const findings: Finding[] = [];
  const buttons = doc.querySelectorAll('button');
  const buttonInputs = doc.querySelectorAll('input').filter((input) => {
    const type = (input.getAttribute('type') || '').toLowerCase();
    return ['button', 'submit', 'reset'].includes(type);
  });

  const allButtons = [...buttons, ...buttonInputs];

  allButtons.forEach((btn, idx) => {
    if (btn.getAttribute('aria-hidden') === 'true') return;

    // 1. aria-label or aria-labelledby
    if (btn.getAttribute('aria-label')?.trim()) return;
    if (btn.getAttribute('aria-labelledby')?.trim()) return;

    // 2. title attribute
    if (btn.getAttribute('title')?.trim()) return;

    // 3. For input elements, check value attribute
    if (btn.tagName === 'input') {
      const val = btn.getAttribute('value')?.trim();
      if (val && val.length > 0) return;
      // Submit/reset have default browser labels if value omitted, but explicit value is better practice
      const type = (btn.getAttribute('type') || '').toLowerCase();
      if (['submit', 'reset'].includes(type) && !btn.hasAttribute('value')) return;
    }

    // 4. Discernible text content
    if (btn.textContent.trim().length > 0) return;

    // 5. Child image with valid alt text
    const childImages = btn.querySelectorAll('img');
    const hasImageAlt = childImages.some(
      (img) => (img.getAttribute('alt')?.trim().length || 0) > 0
    );
    if (hasImageAlt) return;

    // 6. Child svg with title or aria-label
    const childSvgs = btn.querySelectorAll('svg');
    const hasSvgName = childSvgs.some(
      (svg) =>
        (svg.getAttribute('aria-label')?.trim().length || 0) > 0 ||
        svg.querySelectorAll('title').some((t) => t.textContent.trim().length > 0)
    );
    if (hasSvgName) return;

    // Violation found
    findings.push({
      id: `finding-button-name-${idx + 1}`,
      rule: 'button-name',
      severity: 'error',
      message: 'Button element does not have an accessible name.',
      element: `<${btn.tagName}>`,
      selector: buildElementSelector(btn, idx + 1),
      htmlSnippet: getSnippet(btn),
      suggestion:
        'Provide descriptive text inside the button or specify an aria-label attribute (e.g., aria-label="Submit form").',
    });
  });

  return findings;
}

/**
 * Rule 4: Missing document language (html-lang)
 * - Detects when the <html> element has no lang attribute or has an empty lang attribute.
 * - Only evaluated when an <html> tag or <!DOCTYPE> document wrapper is present.
 */
function checkHtmlLang(doc: ScanElement, hasHtmlTag: boolean, rawHtml: string): Finding[] {
  const findings: Finding[] = [];

  if (!hasHtmlTag) return findings;

  const htmlEl =
    doc.tagName === 'html'
      ? doc
      : doc.querySelector('html');

  const langAttr = htmlEl ? htmlEl.getAttribute('lang') : null;
  const isMissingLang =
    !htmlEl ||
    !htmlEl.hasAttribute('lang') ||
    !langAttr ||
    langAttr.trim().length === 0;

  if (isMissingLang) {
    findings.push({
      id: 'finding-html-lang-1',
      rule: 'html-lang',
      severity: 'error',
      message: 'Document <html> element is missing a valid lang attribute.',
      element: '<html>',
      selector: 'html',
      htmlSnippet: htmlEl ? getSnippet(htmlEl, 60) : '<html ...>',
      suggestion:
        'Add a valid BCP 47 language code to the <html> root tag (e.g., <html lang="en">).',
    });
  }

  return findings;
}

/**
 * Rule 5: Heading hierarchy skipped (heading-order)
 * - Flags skipped heading levels in sequential flow (e.g. <h1> directly to <h3> without <h2>).
 * - Decreasing levels (e.g. <h3> back to <h2>) are allowed when closing sub-sections.
 */
function checkHeadingOrder(doc: ScanElement): Finding[] {
  const findings: Finding[] = [];
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

  let prevLevel: number | null = null;

  headings.forEach((h, idx) => {
    const currLevel = parseInt(h.tagName.substring(1), 10);

    if (prevLevel !== null && currLevel > prevLevel + 1) {
      findings.push({
        id: `finding-heading-order-${idx + 1}`,
        rule: 'heading-order',
        severity: 'warning',
        message: `Heading level skipped: jumped from <h${prevLevel}> directly to <h${currLevel}> without an intermediate <h${
          prevLevel + 1
        }>.`,
        element: `<${h.tagName}>`,
        selector: buildElementSelector(h, idx + 1),
        htmlSnippet: getSnippet(h),
        suggestion: `Adjust heading hierarchy sequentially (e.g., use <h${
          prevLevel + 1
        }>) to ensure logical document outline structure.`,
      });
    }

    prevLevel = currLevel;
  });

  return findings;
}

/**
 * Rule 6: Links without accessible names (link-name)
 * - Detects <a> tags with href that have no discernible text or accessible name.
 */
function checkLinkNames(doc: ScanElement): Finding[] {
  const findings: Finding[] = [];
  const links = doc.querySelectorAll('a').filter((a) => a.hasAttribute('href'));

  links.forEach((link, idx) => {
    if (link.getAttribute('aria-hidden') === 'true') return;

    // 1. aria-label or aria-labelledby
    if (link.getAttribute('aria-label')?.trim()) return;
    if (link.getAttribute('aria-labelledby')?.trim()) return;

    // 2. title attribute
    if (link.getAttribute('title')?.trim()) return;

    // 3. Non-empty text content
    if (link.textContent.trim().length > 0) return;

    // 4. Child img with non-empty alt
    const childImages = link.querySelectorAll('img');
    const hasImageAlt = childImages.some(
      (img) => (img.getAttribute('alt')?.trim().length || 0) > 0
    );
    if (hasImageAlt) return;

    findings.push({
      id: `finding-link-name-${idx + 1}`,
      rule: 'link-name',
      severity: 'warning',
      message: 'Hyperlink element has no discernible text or accessible name.',
      element: '<a>',
      selector: buildElementSelector(link, idx + 1),
      htmlSnippet: getSnippet(link),
      suggestion:
        'Add descriptive text inside the link or provide an aria-label attribute explaining the link destination.',
    });
  });

  return findings;
}

/**
 * Rule 7: Empty Headings (empty-heading)
 * - Flags <h1> to <h6> elements that contain neither text nor accessible label.
 */
function checkEmptyHeadings(doc: ScanElement): Finding[] {
  const findings: Finding[] = [];
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headings.forEach((h, idx) => {
    if (h.getAttribute('aria-hidden') === 'true') return;
    if (h.getAttribute('aria-label')?.trim()) return;
    if (h.textContent.trim().length > 0) return;

    const childImages = h.querySelectorAll('img');
    const hasImageAlt = childImages.some(
      (img) => (img.getAttribute('alt')?.trim().length || 0) > 0
    );
    if (hasImageAlt) return;

    findings.push({
      id: `finding-empty-heading-${idx + 1}`,
      rule: 'empty-heading',
      severity: 'warning',
      message: `Heading element (<${h.tagName}>) is empty and conveys no content.`,
      element: `<${h.tagName}>`,
      selector: buildElementSelector(h, idx + 1),
      htmlSnippet: getSnippet(h),
      suggestion: 'Provide heading text or remove the empty heading element.',
    });
  });

  return findings;
}

// ============================================================================
// MAIN SCANNER API
// ============================================================================

/**
 * Scans an HTML string for deterministic accessibility issues.
 *
 * @param html HTML source code to analyze
 * @returns ScanResult containing findings, severity breakdown, and accessibility score
 */
export function scanHtml(html: string): ScanResult {
  const scannedAt = new Date().toISOString();

  // Guard against non-string or empty input safely
  if (!html || typeof html !== 'string' || html.trim().length === 0) {
    return {
      findings: [],
      totalIssues: 0,
      countsBySeverity: { error: 0, warning: 0 },
      countsByRule: {},
      score: 100,
      scannedAt,
    };
  }

  const { root, hasHtmlTag, rawHtml } = parseDocument(html);

  // Execute all deterministic rules
  const allFindings: Finding[] = [
    ...checkImgAlt(root),
    ...checkFormLabels(root),
    ...checkButtonNames(root),
    ...checkHtmlLang(root, hasHtmlTag, rawHtml),
    ...checkHeadingOrder(root),
    ...checkLinkNames(root),
    ...checkEmptyHeadings(root),
  ];

  // Aggregate severity counts
  const countsBySeverity: SeverityCounts = {
    error: allFindings.filter((f) => f.severity === 'error').length,
    warning: allFindings.filter((f) => f.severity === 'warning').length,
  };

  // Group counts by rule
  const countsByRule: Record<string, number> = {};
  for (const f of allFindings) {
    countsByRule[f.rule] = (countsByRule[f.rule] || 0) + 1;
  }

  // Calculate deterministic score
  const score = calculateAccessibilityScore(countsBySeverity);

  return {
    findings: allFindings,
    totalIssues: allFindings.length,
    countsBySeverity,
    countsByRule,
    score,
    scannedAt,
  };
}

export const accessibilityScanner = {
  scanHtml,
};
