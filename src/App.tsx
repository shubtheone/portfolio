import { useState, useEffect } from 'react';
import BackgroundScene from './components/BackgroundScene';
import './index.css';

const TABS = [
  { id: 'about', label: 'About' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'contact', label: 'Contact' },
  { id: 'writeups', label: 'Writeups' },
  { id: 'research', label: 'Research' }
];

const CONTENT: Record<string, string> = {
  about: `Security researcher with a passion for\npushing the boundaries of what's possible.\n\nI believe cyberspace can be more\ndynamic, expressive, and secure.\nExploring vulnerabilities with curiosity\nand sharing knowledge freely.`,
  education: `B.Tech — Computer Science & Cybersecurity\n\nFocus: Cryptography & Network Security\nDistinction in Security Engineering`,
  skills: `Penetration Testing\nWeb / API Security\nNetwork Analysis & Forensics\nPython / Bash / JavaScript / C++\nBurp Suite / Nmap / Metasploit\nThree.js / React / Node.js`,
  experience: `Security Researcher\nBugcrowd & HackerOne — Ongoing\n\nSOC Analyst Intern\nCyberSec Org — 2022\n\nFreelance Penetration Tester`,
  projects: `automated-recon\nBash-based bug bounty recon pipeline\n\nsecure-chat\nE2E encrypted terminal messenger\n\nctf-writeups\nPublic CTF solutions & research\n\nvulnerability-lab\nPersonal vulnerable-app testbed`,
  certifications: `OSCP — Offensive Security\nCEH — EC-Council\nCompTIA Security+\neJPT — eLearnSecurity\n\nContinuously learning.`,
  contact: `shubham@example.com\n\ngithub.com/shubhampundir\ntwitter.com/shubhampundir\nlinkedin.com/in/shubhampundir`,
  writeups: `0-day in IoT Power Devices — 2025\nDefCon 2025 CTF Writeup\nHackTheBox: Absolute Machine\nBugBounty: RCE in *.target.com`,
  research: `"Bluetooth Vulnerabilities in Consumer Headsets"\n— Published 2025\n\nOngoing: Wireless Protocol Fuzzing\nFocus: IoT & Embedded Device Security`
};

type Theme = 'dark' | 'light' | 'color';

function App() {
  const [activeTab, setActiveTab] = useState('about');
  const [theme, setTheme] = useState<Theme>('color');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // text color based on theme
  const textClass = theme === 'color' ? 'text-on-color' : '';

  return (
    <div className={`main-layout ${textClass}`}>
      <div className="noise-overlay" />
      <BackgroundScene theme={theme} />

      {/* Sidebar theme switcher */}
      <div className="sidebar-left">
        <div className="vertical-text">
          <span
            className={`theme-toggle ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
          >
            Light
          </span>
          <span
            className={`theme-toggle ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
          >
            Dark
          </span>
          <span
            className={`theme-toggle ${theme === 'color' ? 'active' : ''}`}
            onClick={() => setTheme('color')}
          >
            Night
          </span>
        </div>
      </div>

      <header className="header-section">
        <h1 className="header-name">SHUBHAM PUNDIR</h1>
        <p className="header-title">Security Researcher &amp; Developer</p>
      </header>

      <nav className="nav-menu">
        {TABS.map((tab) => (
          <div
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </nav>

      <main className="content-display">
        <div key={activeTab} className="content-text">
          {CONTENT[activeTab]}
        </div>
      </main>

      <footer className="footer">
        ©Blackth0rns
      </footer>
    </div>
  );
}

export default App;
