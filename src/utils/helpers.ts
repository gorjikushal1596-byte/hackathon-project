import { SeverityLevel } from '../types';

/**
 * Utility helper functions for AccessFix
 */

export function getSeverityBadgeClass(severity: SeverityLevel): string {
  switch (severity) {
    case 'critical':
      return 'badge-critical';
    case 'serious':
      return 'badge-serious';
    case 'moderate':
      return 'badge-moderate';
    case 'minor':
    default:
      return 'badge-minor';
  }
}

export function formatScore(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: 'A', color: 'var(--color-success)' };
  if (score >= 80) return { grade: 'B', color: 'var(--color-info)' };
  if (score >= 70) return { grade: 'C', color: 'var(--color-warning)' };
  return { grade: 'Needs Work', color: 'var(--color-danger)' };
}

export function truncateString(str: string, maxLength: number = 50): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}
