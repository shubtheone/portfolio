import React, { useState, useEffect } from 'react';
import './index.css';
import BackgroundScene from './components/BackgroundScene';

const NAV_ITEMS = [
  'About', 'Education', 'Skills', 'Experience', 'Projects',
  'Certifications', 'Contact', 'Writeups', 'Research'
];

const CONTENT_DATA: Record<string, string> = {
  About: "I am Shubham Pundir (Blackth0rns),\na cybersecurity researcher and developer.\nPassionate about offensive security,\nvulnerability research, and building\nrobust defensive systems.",
  Education: "B.Tech in Computer Science\nFocus on Information Security\nContinuous self-learner in\nadvanced exploitation techniques.",
  Skills: "Reverse Engineering\nWeb Application Security\nPenetration Testing\nMalware Analysis\nLanguages: Python, Go, TypeScript, C/C++",
  Experience: "Security Researcher @ Various Bug Bounties\nDiscovered critical vulnerabilities\nin top-tier organizations.\nDeveloped custom tooling for automated\nsecurity assessments.",
  Projects: "1. Agentic Scam Detection Honeypot\n2. CTF Solvers & Calculators\n3. Rusty Proxy Challenge\n4. Evasion Tooling",
  Certifications: "OSCP (Offensive Security Certified Professional)\nOSWE (Offensive Security Web Expert)\nHTB Pro Labs",
  Contact: "Email: shubham@0bscuri7y.in\nTwitter: @Blackth0rns\nGitHub: github.com/shubtheone",
  Writeups: "Regularly publishing writeups on\ncomplex CTF challenges and\nreal-world vulnerability disclosures\nat 0bscuri7y.in.",
  Research: "Focusing on AI-driven Exploitation,\nBrowser Security (V8 Internals),\nand Cloud Infrastructure Vulnerabilities."
};

function App() {
  const [theme, setTheme] = useState<'Light' | 'Dark' | 'Night'>('Night');
  const [activeTab, setActiveTab] = useState('About');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // Intro screen duration
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-container">
      {/* Loader */}
      <div className={`loader-container ${!loading ? 'hidden' : ''}`}>
        <div className="loader-text">
          <span style={{ fontWeight: 100 }}>Shubham Pundir</span>
          <span className="bold-part">Portfolio</span>
        </div>
      </div>

      <BackgroundScene theme={theme} />

      {/* Noise Overlay Disabled */}
      <div className="noise-overlay"></div>

      {/* Left Sidebar */}
      <div className="sidebar">
        {['Light', 'Dark', 'Night'].map(t => (
          <button
            key={t}
            className={`theme-button ${theme === t ? 'active' : ''}`}
            onClick={() => setTheme(t as any)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="header">
        <h1>SHUBHAM PUNDIR</h1>
        <p>Security Researcher & Developer</p>
      </div>

      {/* Navigation */}
      <div
        className="navigation"
        onWheel={(e) => {
          const now = Date.now();
          // Adding a 150ms cooldown so it doesn't skip too many items at once
          if (now - (window as any).lastNavScroll > 150 || !(window as any).lastNavScroll) {
            (window as any).lastNavScroll = now;
            const currentIndex = NAV_ITEMS.indexOf(activeTab);
            if (e.deltaY > 0 && currentIndex < NAV_ITEMS.length - 1) {
              setActiveTab(NAV_ITEMS[currentIndex + 1]);
            } else if (e.deltaY < 0 && currentIndex > 0) {
              setActiveTab(NAV_ITEMS[currentIndex - 1]);
            }
          }
        }}
        onMouseEnter={() => {
          // Prevent default page scroll when hovering menu to solely change tabs
          document.body.style.overflow = 'hidden';
        }}
        onMouseLeave={() => {
          document.body.style.overflow = 'hidden'; // Keep global hidden
        }}
      >
        {NAV_ITEMS.map(item => (
          <button
            key={item}
            className={`nav-item ${activeTab === item ? 'active' : ''}`}
            onClick={() => setActiveTab(item)}
          >
            <span className="dot">●</span>
            <span className="nav-text">{item}</span>
          </button>
        ))}
      </div>

      {/* Content Panel */}
      <div className="content-panel">
        <p key={activeTab}>{CONTENT_DATA[activeTab]}</p>
      </div>

      {/* Footer */}
      <div className="footer">
        ©Blackth0rns
      </div>
    </div>
  );
}

export default App;
