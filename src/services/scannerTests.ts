import { scanHtml } from './accessibilityScanner';
import { verifyRepair } from './verificationService';

export interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

/**
 * Asserts a condition, throwing an error if false.
 */
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Test 1: Fully accessible HTML produces zero findings and score 100.
 */
export function testFullyAccessibleHtml(): TestResult {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head><title>Accessible Page</title></head>
      <body>
        <h1>Main Heading</h1>
        <h2>Section Overview</h2>
        <p>Introduction text.</p>
        <img src="diagram.png" alt="Architecture diagram showing client-server interaction" />
        <form>
          <label for="username">Username:</label>
          <input id="username" type="text" />
          <button type="submit">Submit Application</button>
        </form>
        <a href="/help">Read user documentation</a>
      </body>
    </html>
  `;

  const result = scanHtml(html);
  assert(result.totalIssues === 0, `Expected 0 issues, got ${result.totalIssues}`);
  assert(result.score === 100, `Expected score 100, got ${result.score}`);
  assert(result.findings.length === 0, 'Expected empty findings array');

  return { name: 'Fully accessible HTML passes cleanly', passed: true };
}

/**
 * Test 2: Image without alt is detected; decorative alt="" and aria-hidden pass.
 */
export function testImageWithoutAlt(): TestResult {
  // Violation case
  const htmlMissing = '<img src="banner.jpg">';
  const resMissing = scanHtml(htmlMissing);
  assert(resMissing.totalIssues === 1, `Expected 1 issue, got ${resMissing.totalIssues}`);
  assert(resMissing.findings[0].rule === 'img-alt', 'Expected rule img-alt');
  assert(resMissing.findings[0].severity === 'error', 'Expected error severity');

  // Compliant decorative image (alt="")
  const htmlDecorative = '<img src="decoration.svg" alt="">';
  const resDecorative = scanHtml(htmlDecorative);
  assert(
    resDecorative.countsByRule['img-alt'] === undefined,
    'alt="" should be considered valid decorative image'
  );

  // Compliant aria-hidden image
  const htmlHidden = '<img src="spacer.gif" aria-hidden="true">';
  const resHidden = scanHtml(htmlHidden);
  assert(
    resHidden.countsByRule['img-alt'] === undefined,
    'aria-hidden image should not be flagged'
  );

  return { name: 'Image alt detection and decorative alt="" handling', passed: true };
}

/**
 * Test 3: Form controls without accessible labels are detected.
 */
export function testFormInputWithoutLabel(): TestResult {
  // Violation case: input with only placeholder or no label
  const htmlUnlabeled = '<input type="text" id="first-name" placeholder="First Name">';
  const resUnlabeled = scanHtml(htmlUnlabeled);
  assert(resUnlabeled.totalIssues === 1, 'Expected 1 issue for unlabeled input');
  assert(resUnlabeled.findings[0].rule === 'form-label', 'Expected rule form-label');

  // Compliant: explicit label for
  const htmlLabelFor = '<label for="first-name">First Name</label><input type="text" id="first-name">';
  assert(scanHtml(htmlLabelFor).totalIssues === 0, 'label[for] should resolve input');

  // Compliant: wrapping label
  const htmlWrapped = '<label>Email Address <input type="email"></label>';
  assert(scanHtml(htmlWrapped).totalIssues === 0, 'Wrapping label should resolve input');

  // Compliant: aria-label
  const htmlAria = '<input type="search" aria-label="Site Search">';
  assert(scanHtml(htmlAria).totalIssues === 0, 'aria-label should resolve input');

  // Ignored input types (hidden, submit)
  const htmlHiddenInput = '<input type="hidden" name="token" value="abc">';
  assert(scanHtml(htmlHiddenInput).totalIssues === 0, 'Hidden input should be ignored');

  return { name: 'Form control accessible label detection', passed: true };
}

/**
 * Test 4: Buttons without accessible names are detected.
 */
export function testButtonWithoutAccessibleName(): TestResult {
  // Violation case: empty button
  const htmlEmpty = '<button class="icon-btn"></button>';
  const resEmpty = scanHtml(htmlEmpty);
  assert(resEmpty.totalIssues === 1, 'Expected 1 issue for empty button');
  assert(resEmpty.findings[0].rule === 'button-name', 'Expected rule button-name');

  // Compliant: button with text
  const htmlText = '<button class="icon-btn">Save Changes</button>';
  assert(scanHtml(htmlText).totalIssues === 0, 'Button with text should pass');

  // Compliant: button with aria-label
  const htmlAria = '<button class="icon-btn" aria-label="Close dialog"></button>';
  assert(scanHtml(htmlAria).totalIssues === 0, 'Button with aria-label should pass');

  // Compliant: button with child img with alt
  const htmlImgChild = '<button><img src="search.svg" alt="Execute Search"></button>';
  assert(scanHtml(htmlImgChild).totalIssues === 0, 'Button with alt child image should pass');

  return { name: 'Button accessible name detection', passed: true };
}

/**
 * Test 5: Missing html lang is detected on document wrappers.
 */
export function testMissingHtmlLang(): TestResult {
  // Missing lang
  const htmlNoLang = '<html><head><title>Test</title></head><body><p>Content</p></body></html>';
  const resNoLang = scanHtml(htmlNoLang);
  assert(resNoLang.countsByRule['html-lang'] === 1, 'Expected html-lang error');

  // Empty lang attribute
  const htmlEmptyLang = '<html lang=""><head><title>Test</title></head><body><p>Content</p></body></html>';
  const resEmptyLang = scanHtml(htmlEmptyLang);
  assert(resEmptyLang.countsByRule['html-lang'] === 1, 'Expected html-lang error for empty lang');

  // Valid lang
  const htmlValidLang = '<html lang="en-US"><head><title>Test</title></head><body><p>Content</p></body></html>';
  const resValidLang = scanHtml(htmlValidLang);
  assert(resValidLang.countsByRule['html-lang'] === undefined, 'Valid lang="en-US" should pass');

  return { name: 'Document html lang attribute detection', passed: true };
}

/**
 * Test 6: Heading hierarchy jumps (e.g. h1 directly to h3) are flagged.
 */
export function testHeadingOrderIssues(): TestResult {
  // Jump from h1 to h3
  const htmlJump = `
    <h1>Site Title</h1>
    <h3>Subsection without H2</h3>
  `;
  const resJump = scanHtml(htmlJump);
  assert(resJump.countsByRule['heading-order'] === 1, 'Expected heading-order warning');
  assert(resJump.findings[0].severity === 'warning', 'Expected heading-order to be warning');

  // Sequential headings h1 -> h2 -> h3
  const htmlSequential = `
    <h1>Site Title</h1>
    <h2>Section</h2>
    <h3>Subsection</h3>
  `;
  assert(scanHtml(htmlSequential).totalIssues === 0, 'Sequential headings should pass');

  // Headings stepping down (h3 back to h2) are valid in HTML
  const htmlStepDown = `
    <h1>Site Title</h1>
    <h2>Section 1</h2>
    <h3>Subsection 1.1</h3>
    <h2>Section 2</h2>
  `;
  assert(scanHtml(htmlStepDown).totalIssues === 0, 'Stepping back down to h2 should pass');

  return { name: 'Heading hierarchy skipped level detection', passed: true };
}

/**
 * Test 7: Multiple combined accessibility issues.
 */
export function testMultipleIssuesCombined(): TestResult {
  const htmlMulti = `
    <html>
      <body>
        <h1>Title</h1>
        <h3>Skipped Heading</h3>
        <img src="banner.jpg">
        <input type="text" id="email">
        <button></button>
        <a href="/target"></a>
      </body>
    </html>
  `;

  const res = scanHtml(htmlMulti);
  // Expected issues:
  // 1. html-lang (error)
  // 2. heading-order (warning)
  // 3. img-alt (error)
  // 4. form-label (error)
  // 5. button-name (error)
  // 6. link-name (warning)
  assert(res.totalIssues === 6, `Expected 6 issues, got ${res.totalIssues}`);
  assert(res.countsBySeverity.error === 4, `Expected 4 errors, got ${res.countsBySeverity.error}`);
  assert(res.countsBySeverity.warning === 2, `Expected 2 warnings, got ${res.countsBySeverity.warning}`);
  // 100 - (4 * 15) - (2 * 5) = 100 - 60 - 10 = 30
  assert(res.score === 30, `Expected score 30, got ${res.score}`);

  return { name: 'Multiple combined accessibility issues & score deduction', passed: true };
}

/**
 * Test 8: Resilient handling of malformed or unusual HTML without crashing.
 */
export function testMalformedHtmlSafety(): TestResult {
  // Empty / whitespace
  assert(scanHtml('').totalIssues === 0, 'Empty string should return 0 issues safely');
  assert(scanHtml('   \n\t  ').totalIssues === 0, 'Whitespace string should return 0 issues safely');

  // Broken / unclosed tags
  const malformed = '<div <<<>>> <img src="test.jpg" <button <<';
  const resMalformed = scanHtml(malformed);
  assert(typeof resMalformed.score === 'number', 'Malformed HTML should produce valid score');
  assert(Array.isArray(resMalformed.findings), 'Malformed HTML should produce findings array');

  // Stray characters and unquoted attributes
  const unusual = '<input type=text id=custom-input aria-label=Search>';
  const resUnusual = scanHtml(unusual);
  assert(resUnusual.totalIssues === 0, 'Unquoted aria-label should still be recognized');

  return { name: 'Resilient malformed and unusual HTML handling', passed: true };
}

/**
 * Test 9: Verification / re-scan engine workflow.
 */
export function testVerificationWorkflow(): TestResult {
  const originalHtml = `
    <div class="card">
      <img src="avatar.jpg">
      <input type="text" id="nickname">
      <button></button>
    </div>
  `;

  const originalScan = scanHtml(originalHtml);
  assert(originalScan.totalIssues === 3, 'Original should have 3 issues');

  // Repair engine successfully fixes all 3 issues
  const repairedHtml = `
    <div class="card">
      <img src="avatar.jpg" alt="User avatar">
      <label for="nickname">Nickname</label>
      <input type="text" id="nickname">
      <button>Submit Profile</button>
    </div>
  `;

  const verification = verifyRepair(originalScan, repairedHtml);
  assert(verification.beforeIssueCount === 3, 'Before count should be 3');
  assert(verification.afterIssueCount === 0, 'After count should be 0');
  assert(verification.fixedIssues.length === 3, 'All 3 issues should be marked fixed');
  assert(verification.remainingIssues.length === 0, '0 issues should remain');
  assert(verification.newIssues.length === 0, '0 new regressions should exist');
  assert(verification.verified === true, 'Verification status should be true');
  assert(verification.scoreDelta > 0, 'Score delta should be positive');

  // Regression test: fix introduces a new issue
  const flawedRepairedHtml = `
    <div class="card">
      <img src="avatar.jpg" alt="User avatar">
      <label for="nickname">Nickname</label>
      <input type="text" id="nickname">
      <button>Submit Profile</button>
      <a href="/bad-link"></a>
    </div>
  `;

  const flawedVerification = verifyRepair(originalScan, flawedRepairedHtml);
  assert(flawedVerification.newIssues.length === 1, 'Should detect new regression');
  assert(flawedVerification.verified === false, 'Verified should be false when regression exists');

  return { name: 'Verification and re-scan engine lifecycle', passed: true };
}

/**
 * Runs the full test suite and outputs diagnostic details.
 */
export function runAllScannerTests(): {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
} {
  const tests = [
    testFullyAccessibleHtml,
    testImageWithoutAlt,
    testFormInputWithoutLabel,
    testButtonWithoutAccessibleName,
    testMissingHtmlLang,
    testHeadingOrderIssues,
    testMultipleIssuesCombined,
    testMalformedHtmlSafety,
    testVerificationWorkflow,
  ];

  const results: TestResult[] = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const testFn of tests) {
    try {
      const res = testFn();
      results.push(res);
      passedCount++;
    } catch (err) {
      results.push({
        name: testFn.name,
        passed: false,
        message: err instanceof Error ? err.message : String(err),
      });
      failedCount++;
    }
  }

  return {
    total: tests.length,
    passed: passedCount,
    failed: failedCount,
    results,
  };
}

// Auto-run if executed directly via Node / tsx
if (
  typeof process !== 'undefined' &&
  process.argv &&
  process.argv[1] &&
  process.argv[1].includes('scannerTests')
) {
  console.log('=== Running AccessFix Scanner & Verification Test Suite ===\n');
  const summary = runAllScannerTests();
  summary.results.forEach((r, idx) => {
    const symbol = r.passed ? '✓' : '✗';
    console.log(`${symbol} [Test ${idx + 1}] ${r.name}`);
    if (!r.passed && r.message) {
      console.log(`    Error: ${r.message}`);
    }
  });
  console.log(`\nResults: ${summary.passed}/${summary.total} passed (${summary.failed} failed).`);
  if (summary.failed > 0) {
    process.exit(1);
  }
}
