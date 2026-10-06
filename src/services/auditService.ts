import { AuditReport } from '../types';

/**
 * AccessFix Audit Service
 * Initial service layer foundation for accessibility scans and fixes.
 * Can be connected to axe-core, backend APIs, or Firebase in subsequent phases.
 */

export const mockSampleReport: AuditReport = {
  id: 'audit-demo-01',
  targetUrl: 'https://example.com/checkout',
  score: 78,
  totalIssues: 5,
  resolvedIssues: 3,
  timestamp: new Date().toISOString(),
  issues: [
    {
      id: 'iss-1',
      ruleId: 'color-contrast',
      description: 'Elements must meet minimum color contrast ratio thresholds (WCAG 2.1 AA 4.5:1).',
      severity: 'serious',
      selector: 'button.checkout-btn',
      suggestedFix: 'Increase contrast ratio from 3.2:1 to 4.8:1 by using #1E1B4B on #EEF2FF',
      isResolved: true,
    },
    {
      id: 'iss-2',
      ruleId: 'image-alt',
      description: 'Images must have alternate text for screen readers.',
      severity: 'critical',
      selector: 'img.product-hero',
      suggestedFix: 'Add alt="Wireless noise-cancelling headphones in matte black"',
      isResolved: true,
    },
    {
      id: 'iss-3',
      ruleId: 'label-missing',
      description: 'Form inputs must have explicit accessible labels.',
      severity: 'critical',
      selector: 'input#email-input',
      suggestedFix: 'Attach <label for="email-input">Email Address</label>',
      isResolved: false,
    },
    {
      id: 'iss-4',
      ruleId: 'link-name',
      description: 'Links must have discernible text for screen reader navigation.',
      severity: 'moderate',
      selector: 'a.social-icon',
      suggestedFix: 'Add aria-label="Visit our LinkedIn profile"',
      isResolved: true,
    },
    {
      id: 'iss-5',
      ruleId: 'heading-order',
      description: 'Heading levels should only increase by one level at a time.',
      severity: 'minor',
      selector: 'h4.feature-title',
      suggestedFix: 'Change <h4> to <h3> to follow the <h2> section heading properly',
      isResolved: false,
    },
  ],
};

export const auditService = {
  /**
   * Fetch initial sample audit data
   */
  async getInitialAudit(): Promise<AuditReport> {
    // Simulated async delay for realistic lifecycle handling
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockSampleReport), 200);
    });
  },

  /**
   * Placeholder for future audit trigger (axe-core or backend microservice)
   */
  async runAudit(url: string): Promise<AuditReport> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...mockSampleReport,
          id: `audit-${Date.now()}`,
          targetUrl: url,
          timestamp: new Date().toISOString(),
        });
      }, 500);
    });
  },
};
