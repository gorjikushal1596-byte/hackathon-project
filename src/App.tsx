import React from 'react';
import './App.css';
import { Navbar, Footer } from './components';
import { LandingPage } from './pages';

export const App: React.FC = () => {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        <LandingPage />
      </main>
      <Footer />
    </div>
  );
};

export default App;
