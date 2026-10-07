import React, { useState } from 'react';
import './App.css';
import { Header, Footer } from './components';
import { LandingPage } from './pages';
import { useAccessFix } from './hooks';

export const App: React.FC = () => {
  const accessFix = useAccessFix();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  return (
    <div className="app-wrapper">
      <Header
        currentPhase={accessFix.currentPhase}
        isScanning={accessFix.isScanning}
        isRepairing={accessFix.isRepairing}
        isVerifying={accessFix.isVerifying}
        onReset={accessFix.resetAll}
        onStartDemo={() => setIsDemoModalOpen(true)}
      />
      <main className="main-content" id="main-content">
        <LandingPage
          accessFixState={accessFix}
          isDemoOpen={isDemoModalOpen}
          onOpenDemo={() => setIsDemoModalOpen(true)}
          onCloseDemo={() => setIsDemoModalOpen(false)}
        />
      </main>
      <Footer />
    </div>
  );
};

export default App;
