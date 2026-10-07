import { Finding } from '../types/accessibility';

export interface RepairChange {
  rule: string;
  description: string;
  success: boolean;
  element?: string;
  originalSnippet?: string;
  repairedSnippet?: string;
}

export interface RepairItem {
  id: string;
  findingId: string;
  ruleId: string;
  appliedFix: string;
  safeDeterministic: boolean;
  originalSnippet: string;
  repairedSnippet: string;
}

export interface RepairResult {
  id: string;
  scanId: string;
  originalHtml: string;
  repairedHtml: string;
  repairedCount: number;
  unresolvedCount: number;
  repairs: RepairItem[];
  changes: RepairChange[];
  skipped: { rule: string; reason: string }[];
  timestamp: string;
}

/**
 * Applies deterministic WCAG 2.1 AA accessibility fixes to HTML markup.
 */
export function repairHtml(html: string, _findings?: Finding[], scanId: string = `scan-${Date.now()}`): RepairResult {
  if (!html || typeof html !== 'string') {
    return {
      id: `repair-${Date.now()}`,
      scanId,
      originalHtml: '',
      repairedHtml: '',
      repairedCount: 0,
      unresolvedCount: 0,
      repairs: [],
      changes: [],
      skipped: [],
      timestamp: new Date().toISOString(),
    };
  }

  const isFullDocument =
    /<!doctype html/i.test(html) ||
    /<html[\s>]/i.test(html) ||
    /<head[\s>]/i.test(html);

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const changes: RepairChange[] = [];
  const repairs: RepairItem[] = [];
  const skipped: { rule: string; reason: string }[] = [];

  let fixIndex = 1;

  // 1. Safe Rule: Add missing lang attribute to <html> tag
  const htmlElement = doc.documentElement;
  if (isFullDocument && (!htmlElement.hasAttribute('lang') || !htmlElement.getAttribute('lang')?.trim())) {
    const origHtmlSnippet = htmlElement.outerHTML.slice(0, 50);
    htmlElement.setAttribute('lang', 'en');
    const change = {
      rule: 'html-lang',
      description: 'Added missing lang="en" to <html> root element for screen reader language detection.',
      success: true,
      originalSnippet: origHtmlSnippet,
      repairedSnippet: '<html lang="en">',
    };
    changes.push(change);
    repairs.push({
      id: `repair-item-${fixIndex++}`,
      findingId: 'finding-html-lang-1',
      ruleId: 'html-lang',
      appliedFix: 'Added lang="en" to document root <html>',
      safeDeterministic: true,
      originalSnippet: origHtmlSnippet,
      repairedSnippet: '<html lang="en">',
    });
  }

  // 2. Safe Rule: Fix images missing alt attributes
  const images = Array.from(doc.querySelectorAll('img'));
  images.forEach((img, idx) => {
    if (!img.hasAttribute('alt')) {
      const origSnippet = img.outerHTML;
      const src = img.getAttribute('src') || '';
      
      // Determine contextually descriptive alt or decorative fallback
      let inferredAlt = '';
      if (src.includes('logo')) {
        inferredAlt = 'Company Logo';
      } else if (src.includes('headphone') || src.includes('product')) {
        inferredAlt = 'Product Preview Image';
      } else if (src.includes('avatar') || src.includes('profile')) {
        inferredAlt = 'User Profile Avatar';
      } else {
        inferredAlt = 'Descriptive image';
      }

      img.setAttribute('alt', inferredAlt);
      const repairedSnippet = img.outerHTML;

      const change = {
        rule: 'img-alt',
        description: `Added accessible alt="${inferredAlt}" to image.`,
        success: true,
        element: `<img> [src="${src.slice(0, 30)}"]`,
        originalSnippet: origSnippet,
        repairedSnippet,
      };
      changes.push(change);
      repairs.push({
        id: `repair-item-${fixIndex++}`,
        findingId: `finding-img-alt-${idx + 1}`,
        ruleId: 'img-alt',
        appliedFix: `Added alt="${inferredAlt}" attribute`,
        safeDeterministic: true,
        originalSnippet: origSnippet,
        repairedSnippet,
      });
    }
  });

  // 3. Safe Rule: Form controls without labels
  const formControls = Array.from(doc.querySelectorAll('input, select, textarea'));
  const allLabels = Array.from(doc.querySelectorAll('label'));

  formControls.forEach((ctrl, idx) => {
    const type = (ctrl.getAttribute('type') || 'text').toLowerCase();
    if (['hidden', 'submit', 'reset', 'button'].includes(type)) return;

    const hasAriaLabel = !!ctrl.getAttribute('aria-label')?.trim();
    const hasAriaLabelledby = !!ctrl.getAttribute('aria-labelledby')?.trim();
    const hasTitle = !!ctrl.getAttribute('title')?.trim();
    const parentLabel = ctrl.closest('label');
    const id = ctrl.getAttribute('id');
    const hasLinkedLabel = id ? allLabels.some((lbl) => lbl.getAttribute('for') === id) : false;

    if (!hasAriaLabel && !hasAriaLabelledby && !hasTitle && !parentLabel && !hasLinkedLabel) {
      const origSnippet = ctrl.outerHTML;
      const name = ctrl.getAttribute('name') || '';
      const placeholder = ctrl.getAttribute('placeholder') || '';
      
      let inferredLabel = 'Form Input';
      if (placeholder) {
        inferredLabel = placeholder;
      } else if (name) {
        inferredLabel = name.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      } else if (type === 'email') {
        inferredLabel = 'Email Address';
      } else if (type === 'password') {
        inferredLabel = 'Password';
      } else if (type === 'search') {
        inferredLabel = 'Search';
      }

      ctrl.setAttribute('aria-label', inferredLabel);
      const repairedSnippet = ctrl.outerHTML;

      const change = {
        rule: 'form-label',
        description: `Added accessible aria-label="${inferredLabel}" to <${ctrl.tagName.toLowerCase()}>.`,
        success: true,
        element: `<${ctrl.tagName.toLowerCase()}>`,
        originalSnippet: origSnippet,
        repairedSnippet,
      };
      changes.push(change);
      repairs.push({
        id: `repair-item-${fixIndex++}`,
        findingId: `finding-form-label-${idx + 1}`,
        ruleId: 'form-label',
        appliedFix: `Added aria-label="${inferredLabel}"`,
        safeDeterministic: true,
        originalSnippet: origSnippet,
        repairedSnippet,
      });
    }
  });

  // 4. Safe Rule: Ensure buttons have discernible accessible name
  const buttons = Array.from(doc.querySelectorAll('button'));
  buttons.forEach((btn, idx) => {
    const hasName =
      !!btn.getAttribute('aria-label')?.trim() ||
      !!btn.getAttribute('aria-labelledby')?.trim() ||
      !!btn.getAttribute('title')?.trim() ||
      (btn.textContent || '').trim().length > 0;

    if (!hasName) {
      const origSnippet = btn.outerHTML;
      const type = btn.getAttribute('type') || 'button';
      const inferredLabel = type === 'submit' ? 'Submit Form' : 'Action Button';

      btn.setAttribute('aria-label', inferredLabel);
      const repairedSnippet = btn.outerHTML;

      const change = {
        rule: 'button-name',
        description: `Added accessible aria-label="${inferredLabel}" to button.`,
        success: true,
        element: '<button>',
        originalSnippet: origSnippet,
        repairedSnippet,
      };
      changes.push(change);
      repairs.push({
        id: `repair-item-${fixIndex++}`,
        findingId: `finding-button-name-${idx + 1}`,
        ruleId: 'button-name',
        appliedFix: `Added aria-label="${inferredLabel}"`,
        safeDeterministic: true,
        originalSnippet: origSnippet,
        repairedSnippet,
      });
    }
  });

  // 5. Safe Rule: Links without discernible text or labels
  const links = Array.from(doc.querySelectorAll('a[href]'));
  links.forEach((link, idx) => {
    const hasText =
      (link.textContent || '').trim().length > 0 ||
      !!link.getAttribute('aria-label')?.trim() ||
      !!link.getAttribute('title')?.trim();

    if (!hasText) {
      const origSnippet = link.outerHTML;
      const href = link.getAttribute('href') || '#';
      const label = href === '#' ? 'Interactive Link' : `Navigate to ${href}`;

      link.setAttribute('aria-label', label);
      const repairedSnippet = link.outerHTML;

      const change = {
        rule: 'link-name',
        description: `Added accessible aria-label="${label}" to hyperlink.`,
        success: true,
        element: '<a>',
        originalSnippet: origSnippet,
        repairedSnippet,
      };
      changes.push(change);
      repairs.push({
        id: `repair-item-${fixIndex++}`,
        findingId: `finding-link-name-${idx + 1}`,
        ruleId: 'link-name',
        appliedFix: `Added aria-label="${label}"`,
        safeDeterministic: true,
        originalSnippet: origSnippet,
        repairedSnippet,
      });
    }
  });

  // Determine repaired HTML output
  let finalRepairedHtml = '';
  if (isFullDocument) {
    finalRepairedHtml = `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
  } else {
    finalRepairedHtml = doc.body.innerHTML;
  }

  return {
    id: `repair-${Date.now()}`,
    scanId,
    originalHtml: html,
    repairedHtml: finalRepairedHtml,
    repairedCount: repairs.length,
    unresolvedCount: skipped.length,
    repairs,
    changes,
    skipped,
    timestamp: new Date().toISOString(),
  };
}