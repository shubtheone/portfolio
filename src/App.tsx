import React, { useState, useEffect } from 'react';
import './index.css';
import BackgroundScene from './components/BackgroundScene';

const NAV_ITEMS = [
  'About', 'Education', 'Skills', 'Experience', 'Achievements', 'Projects',
  'Certifications', 'Contact', 'Writeups', 'Research'
];

// Projects with optional URL — renders as "Name ↗" where ↗ is a clickable link
const PROJECTS = [
  { name: 'CTFtime Points Calculator', url: 'https://www.ctfpoints-calculator.me/' },
  { name: 'Learning Curve', url: 'https://learning-curve.tech/about' },
  { name: '0bscuri7y Website', url: 'https://www.0bscuri7y.in/' },
  { name: 'th0rnRecon | Web App Scanner', url: 'https://github.com/shubtheone/th0rnRecon' },
  { name: 'OS Contribution | Cameradar', url: 'https://github.com/shubtheone/cameradar' }
];

// Social links for Contact section
const SOCIAL_LINKS = [
  { label: 'Email', value: 'Me', url: 'mailto:impeccableshub@gmail.com' },
  { label: 'Twitter', value: '@Blackth0rns_', url: 'https://twitter.com/Blackth0rns_' },
  { label: 'GitHub', value: 'shubtheone', url: 'https://github.com/shubtheone' },
  { label: 'LinkedIn', value: 'shub', url: 'https://www.linkedin.com/in/shubhampundir/' }
];

// Writeups links
const WRITEUPS = [
  { name: 'Medium', url: 'https://medium.com/@blackth0rns/' },
  { name: 'Writeups', url: 'https://writeups.shubtheone.xyz/' },
];

const CONTENT_DATA: Record<string, React.ReactNode> = {
  About: "Hello! I am\n Shubham Pundir,\nI love mountains and stars.\nA Researcher and Developer,\nPassionate about offensive security,\n Machine Learning, Artifical Intelligence,\n OSINT, Software development, building robust agent-based and application systems as a hobby.",
  Education: "Bachelors in Computer Applications \nFocused on Information Security and AI\nContinuous self-learner.",
  Skills: "Open-Source Intelligence (OSINT)\nWeb Application Security & Penetration Testing\n Software & Game Development\nMachine Learning & Aritifcial Intelligence\nPrompt Engineering & Agentic AI Frameworks\nLanguages: Python, Go, TypeScript, C/C++",
  Experience: "Co-Founder @ 0bscuri7y\nSecurity Engineer @ Aventior\nCyber Security Intern @ NTRO\n NCIIPC–AICTE CyberSec Bootcamp @ MIT Manipal\n Data Analyst Intern @ AHS Healthcare",
  Achievements: "Appreciated by CERT-In\n 5th rank at Pentathon 2025\nReported Critical Vuln. at SewaBharti Platform\nTeam 0bscuri7y - CTFTime Ranking in India:\n 1st (2026) & 4th(2025)",
  Projects: (
    <span>
      {PROJECTS.map((p, i) => (
        <span key={i}>
          {p.name}
          {p.url && (
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="project-link"
              title={p.url}
            >
              ↗
            </a>
          )}
          {i < PROJECTS.length - 1 && '\n'}
        </span>
      ))}
    </span>
  ),
  Certifications: "Certified AppSec Pentester (CAPen)\nWeb Application Pentesting - THM\nTryHackMe Hackfinity 2025",
  Contact: (
    <span>
      {SOCIAL_LINKS.map((s, i) => (
        <span key={i}>
          {s.label}: {s.value}
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link"
            title={s.url}
          >
            ↗
          </a>
          {i < SOCIAL_LINKS.length - 1 && '\n'}
        </span>
      ))}
    </span>
  ),
  Writeups: (
    <span>
      {WRITEUPS.map((w, i) => (
        <span key={i}>
          {w.name}
          <a
            href={w.url}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link"
            title={w.url}
          >
            ↗
          </a>
          {i < WRITEUPS.length - 1 && '\n'}
        </span>
      ))}
    </span>
  ),
  Research: "Role of Artificial Intelligence in Recruitment Process\n Also Currently Working on some Researches.."
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
        <p>Researcher & Developer</p>
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
        shub
      </div>
    </div>
  );
}

export default App;
