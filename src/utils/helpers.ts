import { SeverityLevel, FindingStatus } from '../types';

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
    case 'warning':
      return 'badge-warning';
    case 'minor':
    default:
      return 'badge-minor';
  }
}

export function getStatusBadgeClass(status: FindingStatus): string {
  switch (status) {
    case 'repaired':
      return 'badge-success';
    case 'detected':
      return 'badge-critical';
    case 'manual-review-required':
      return 'badge-warning';
    case 'passed':
      return 'badge-success';
    default:
      return 'badge-minor';
  }
}

export function formatScore(score: number): { grade: string; color: string; label: string } {
  if (score >= 90) return { grade: 'A', color: 'var(--color-success)', label: 'Excellent' };
  if (score >= 80) return { grade: 'B', color: 'var(--color-info)', label: 'Good' };
  if (score >= 70) return { grade: 'C', color: 'var(--color-warning)', label: 'Acceptable' };
  if (score >= 50) return { grade: 'D', color: '#f97316', label: 'Needs Improvement' };
  return { grade: 'F', color: 'var(--color-danger)', label: 'Critical Barriers' };
}

export function truncateString(str: string, maxLength: number = 60): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

export function countLines(text: string): number {
  if (!text) return 0;
  return text.split('\n').length;
}

/**
 * Curated HTML sample snippets for instant demo testing
 */
export interface SampleSnippet {
  id: string;
  title: string;
  description: string;
  html: string;
}

export const SAMPLE_HTML_SNIPPETS: SampleSnippet[] = [
  {
    id: 'ecommerce-barriers',
    title: 'Checkout & Product Card',
    description: 'Missing alt attributes, unlabelled checkout inputs, missing lang, and icon-only button.',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Flash Sale Product</title>
</head>
<body>
  <header>
    <img src="/images/company-logo.svg">
    <nav>
      <a href="#">click here</a>
      <a href="/catalog">Products</a>
    </nav>
  </header>

  <main>
    <section class="product-card">
      <img src="https://images.unsplash.com/photo-wireless-headphone.jpg">
      <h2>Noise Cancelling Studio Headphones</h2>
      <p class="price">$199.99</p>

      <form class="checkout-form">
        <input type="email" placeholder="Enter your email to purchase">
        <button type="submit"></button>
      </form>
    </section>
  </main>
</body>
</html>`,
  },
  {
    id: 'signup-form',
    title: 'Newsletter & Signup Form',
    description: 'Form inputs lacking accessible name labels, empty anchors, and redundant image alt tags.',
    html: `<div class="signup-container">
  <img src="avatar.png" alt="photo">
  <h2>Subscribe to Developer Weekly</h2>
  <p>Stay updated with our newest releases.</p>

  <form id="subscribe-form">
    <input type="text" name="first_name" placeholder="First Name">
    <input type="email" name="user_email" placeholder="Work Email">
    <button class="icon-btn"></button>
  </form>

  <p>Read our terms <a href="#">here</a>.</p>
</div>`,
  },
  {
    id: 'clean-accessible',
    title: 'Clean Accessible Baseline',
    description: 'Pre-remediated HTML with proper lang, accessible labels, alt text, and valid buttons.',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessible Profile Page</title>
</head>
<body>
  <header>
    <h1>User Account Settings</h1>
  </header>
  <main>
    <img src="/avatars/alex.jpg" alt="Profile avatar of Alex Rivera" width="80" height="80">
    <form>
      <label for="username">Username</label>
      <input id="username" type="text" value="alex_rivera">

      <button type="submit" aria-label="Save changes to your profile">Save Changes</button>
    </form>
  </main>
</body>
</html>`,
  },
];
