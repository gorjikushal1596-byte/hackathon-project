# AccessFix 🚀

> **Intelligent Web Accessibility Auditing & Deterministic Auto-Remediation**  
> Built for the 36-Hour Hackathon Sprint.

AccessFix transforms inaccessible web markup into fully WCAG 2.1 AA compliant HTML with zero regressions. Featuring an end-to-end automated pipeline: **Input &rarr; Detect &rarr; Diagnose &rarr; Auto-Repair &rarr; Verify (0 Regressions) &rarr; Persist & Export**.

---

## 🌟 Core Features

- **⚡ Client-Side WCAG 2.1 AA Scanner**: 7 deterministic rule sets (`img-alt`, `form-label`, `button-name`, `html-lang`, `heading-order`, `link-name`, `empty-heading`) with 0ms latency.
- **🛠️ Safe Deterministic Auto-Repair**: Automated AST transformations synthesizing valid `lang`, `alt`, `aria-label`, and button attributes with **zero style/layout drift**.
- **📊 Interactive Before & After Diffs**: Side-by-side syntax comparison, live score delta tracking (`+60 pts`), and one-click clean code copying.
- **🛡️ Autonomous Closed-Loop Verification**: Re-scans repaired DOM to confirm 100% resolution with **0 introduced regressions**.
- **💾 Session Persistence & Export**: Cloud Firestore sync with automatic local storage fallback and full JSON audit report export.
- **🎬 Built-In Live Demo Simulator**: Autonomous and step-by-step presentation walkthrough for judges and audience.

---

## 📁 Project Structure

```text
├── public/                 # Static assets & favicon
├── src/
│   ├── assets/             # Branding assets, logo SVGs
│   ├── components/         # Modular UI Components
│   │   ├── Header.tsx              # Top navigation with live phase status
│   │   ├── Hero.tsx                # Stepper pipeline header & demo triggers
│   │   ├── HtmlInputSection.tsx    # Code editor with line numbers & presets
│   │   ├── SummaryCards.tsx        # Accessibility health score & grade cards
│   │   ├── FindingCard.tsx         # Detailed violation cards with selectors
│   │   ├── ResultsSection.tsx      # Severity filters & findings list
│   │   ├── RepairSection.tsx       # Auto-repair actions & safety guarantee
│   │   ├── BeforeAfterComparison.tsx # Side-by-side diff & score jump ribbon
│   │   ├── VerificationSection.tsx # Post-repair re-scan & Firestore save
│   │   ├── LiveDemoSimulatorModal.tsx # Interactive presentation simulator
│   │   ├── Footer.tsx              # Standards badges & architecture credits
│   │   └── index.ts                # Component exports
│   ├── hooks/
│   │   ├── useAccessFix.ts         # Central pipeline state management hook
│   │   └── index.ts
│   ├── pages/
│   │   ├── LandingPage.tsx         # Main dashboard integrating all 5 stages
│   │   └── index.ts
│   ├── services/
│   │   ├── accessibilityScanner.ts # 7-rule WCAG DOM scanner engine
│   │   ├── scoringService.ts       # Deterministic penalty & score formulas
│   │   ├── verificationService.ts  # Post-repair comparison & regression checker
│   │   ├── firestoreService.ts     # Firebase Firestore & local persistence
│   │   └── index.ts
│   ├── types/
│   │   ├── accessibility.ts        # Scanner & verification type contracts
│   │   └── index.ts                # Global unified type definitions
│   ├── utils/
│   │   ├── repairEngine.ts         # AST remediation transformations
│   │   ├── helpers.ts              # Sample presets, badges & score formatters
│   │   └── index.ts
│   ├── App.css             # Component layout and responsive styles
│   ├── App.tsx             # Root App component
│   ├── firebase.ts         # Firebase initialization
│   ├── index.css           # Design tokens, themes & typography
│   └── main.tsx            # Vite React entry point
├── index.html              # HTML shell & font definitions
├── package.json            # Scripts & dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

---

## 🛠️ Team Setup & Local Execution Guide

Follow these steps to run AccessFix in your local IDE:

### 1. Clone the Repository
```bash
git clone https://github.com/gorjikushal1596-byte/hackathon-project.git
cd hackathon-project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** (or the port shown in your terminal) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 👥 Team Module Architecture

- **Lead / Integration**: Responsive Frontend UI, Stepper Pipeline, Design System, Live Demo Simulator.
- **Bhavya**: Accessibility Scanner Engine (`accessibilityScanner.ts`), Scoring Service (`scoringService.ts`), Verification Engine (`verificationService.ts`).
- **Sravani**: Safe Deterministic Repair Engine (`repairEngine.ts`), Cloud Firestore Integration (`firestoreService.ts`).

---

## 📜 Standards & Compliance
- **WCAG 2.1 Level AA Criteria**
- **Section 508 Standards**
- **W3C ARIA 1.2 Authoring Practices**
