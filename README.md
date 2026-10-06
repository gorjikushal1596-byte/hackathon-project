# hackathon-project
36-hour hackathon project

---

# AccessFix 🚀

> **Intelligent Web Accessibility Auditing & Auto-Remediation**  
> Built for the 36-Hour Hackathon Sprint.

AccessFix helps developers detect WCAG 2.1 AA accessibility issues in real time and provides actionable, beginner-friendly remediation suggestions.

---

## 📁 Project Structure

```text
├── public/                 # Static assets & favicon
├── src/
│   ├── assets/             # Branding assets, icons, SVGs
│   ├── components/         # Reusable UI components (Navbar, Footer, Cards)
│   ├── hooks/              # Custom React hooks (useAudit state manager)
│   ├── pages/              # Application pages (LandingPage)
│   ├── services/           # Service layer & API stubs (auditService)
│   ├── types/              # TypeScript interfaces & types
│   ├── utils/              # Helper utilities & score calculators
│   ├── App.css             # Component layout and styles
│   ├── App.tsx             # Root App component
│   ├── index.css           # Global design system & theme tokens
│   └── main.tsx            # Vite React DOM entry point
├── index.html              # HTML shell & font definitions
├── package.json            # Scripts & dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Production Build
```bash
npm run build
```

---

## 🗺️ Hackathon Roadmap

- [x] **Phase 1: Foundation (Current)** - Vite + React + TypeScript setup, dark-mode design system, landing page, and mock audit playground.
- [ ] **Phase 2: Authentication & Database** - Firebase setup for user accounts and audit saving.
- [ ] **Phase 3: Real Scanner Engine** - Integrate accessibility testing engine (axe-core / custom heuristics).
- [ ] **Phase 4: Pitch & Final Polish** - Report export, presentation assets, and live demo.
