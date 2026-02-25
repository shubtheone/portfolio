import React, { useState, useEffect, useRef } from 'react';
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

const DETAIL_DATA: Record<string, React.ReactNode> = {
  About: (
    <>

      <p>
        I am Shubham Pundir, a researcher and developer focused on offensive security, OSINT,
        and building practical systems with AI.
      </p>
      <p>
        I enjoy solving hard problems, writing clean tooling for real-world security workflows,
        and balancing technical depth with creative execution.
      </p>
      <p>
        Outside work, mountains and night skies keep me grounded—they are a major source of
        the calm and curiosity that drive my long-term research mindset.
      </p>
    </>
  ),
  Education: (
    <>
      <h3>Education</h3>
      <p>
        <strong>Bachelor of Computer Applications</strong> — Information Security and AI track.
      </p>
      <p>
        Academic focus included secure software design, networking fundamentals, and applied
        machine learning concepts.
      </p>
      <p>
        Self-learning continues through CTF practice, vulnerability research, open-source
        contributions, and technical writing.
      </p>
    </>
  ),
  Skills: (
    <>
      <h3>Skills</h3>
      <p><strong>Security:</strong> Web app testing, recon automation, vulnerability analysis, OSINT.</p>
      <p><strong>Engineering:</strong> Python, Go, TypeScript, C/C++, automation pipelines, scripting.</p>
      <p><strong>AI/ML:</strong> Prompt engineering, agentic workflows, model-assisted tooling.</p>
      <p><strong>Tools:</strong> Burp, Nmap, custom scanners, Git/GitHub, Linux-first workflows.</p>
    </>
  ),
  Experience: (
    <>
      <h3>Experience</h3>
      <p><strong>Co-Founder, 0bscuri7y</strong> — built team workflows, challenge pipelines, and public-facing security initiatives.</p>
      <p><strong>Security Engineer, Aventior</strong> — participated in assessments and security validation engagements.</p>
      <p><strong>Cyber Security Intern, NTRO</strong> — exposure to structured security operations and defensive analysis.</p>
      <p><strong>NCIIPC–AICTE CyberSec Bootcamp, MIT Manipal</strong> — hands-on labs and practical security drills.</p>
      <p><strong>Data Analyst Intern, AHS Healthcare</strong> — analytical reporting and data-backed decision support.</p>
    </>
  ),
  Achievements: (
    <>
      <h3>Achievements</h3>
      <p><strong>Recognized by CERT-In</strong> for impactful security reporting and responsible disclosure.</p>
      <p><strong>Pentathon 2025:</strong> secured 5th rank through multi-domain practical challenge solving.</p>
      <p><strong>SewaBharti platform:</strong> reported critical vulnerability with clear remediation context.</p>
      <p><strong>CTFTime India ranking:</strong> Team 0bscuri7y placed 4th (2025) and 1st (2026).</p>
    </>
  ),
  Projects: (
    <>
      <h3>Projects</h3>
      {PROJECTS.map((p, i) => (
        <p key={i}>
          <strong>{p.name}</strong> — designed and shipped with practical utility and measurable outcomes.
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link"
            title={p.url}
          >
            ↗
          </a>
        </p>
      ))}
    </>
  ),
  Certifications: (
    <>
      <h3>Certifications</h3>
      <p><strong>Certified AppSec Pentester (CAPen)</strong> — application security testing workflow and exploitation methodology.</p>
      <p><strong>Web Application Pentesting (THM)</strong> — practical offensive testing and reporting.</p>
      <p><strong>TryHackMe Hackfinity 2025</strong> — applied security tasks across multiple challenge domains.</p>
    </>
  ),
  Contact: (
    <>
      <h3>Contact</h3>
      <p>I am open to security research, engineering collaboration, and product-focused problem solving.</p>
      {SOCIAL_LINKS.map((s, i) => (
        <p key={i}>
          <strong>{s.label}:</strong> {s.value}
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link"
            title={s.url}
          >
            ↗
          </a>
        </p>
      ))}
    </>
  ),
  Writeups: (
    <>
      <h3>Writeups</h3>
      <p>
        I write concise, practical security content focused on reproducible methodology,
        clear impact, and actionable remediation.
      </p>
      <p>
        Topics include CTF techniques, web application testing, recon workflows,
        and public vulnerability case studies.
      </p>
      {WRITEUPS.map((w, i) => (
        <p key={i}>
          <strong>{w.name}</strong>
          <a
            href={w.url}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link"
            title={w.url}
          >
            ↗
          </a>
        </p>
      ))}
    </>
  ),
  Research: (
    <>
      <h3>Research</h3>
      <p><strong>Title:</strong> Role of Artificial Intelligence in Recruitment Process</p>
      <p>
        <strong>Summary:</strong> explores how AI can improve candidate screening, matching,
        and process efficiency while preserving fairness and transparency.
      </p>
      <p><strong>Status:</strong> active work in progress alongside additional security-focused research threads.</p>
    </>
  )
};

const DETAIL_SIDEBAR_INFO: Record<string, React.ReactNode> = {
  About: (
    <>
      <p>
        I am Shubham Pundir, a researcher and developer focused on offensive security, OSINT,
        and building practical systems with AI.
      </p>
      <p>
        I enjoy solving hard problems, writing clean tooling for real-world security workflows,
        and balancing technical depth with creative execution.
      </p>
      <p>
        Outside work, mountains and night skies keep me grounded—they are a major source of
        the calm and curiosity that drive my long-term research mindset.
      </p>
    </>
  ),
  Education: 'Academic foundation, coursework focus, and continuous self-learning path in security and AI.',
  Skills: 'Capability map across security, engineering, and AI with practical tool depth and delivery strength.',
  Experience: 'Role-based contributions, operational exposure, and measurable impact across different teams.',
  Achievements: 'Recognition, rankings, and disclosed findings with context and real-world security value.',
  Projects: 'Built products and tools with clear scope, stack choices, and useful outcomes.',
  Certifications: 'Verified training milestones, issuers, and applied security competencies.',
  Contact: 'Direct collaboration channels for research, engineering work, and opportunities.',
  Writeups: 'Public writing focus, methodology style, and topics covered across security domains.',
  Research: 'Ongoing research direction, abstract-level summary, and current status.'
};


function App() {
  const [theme, setTheme] = useState<'Light' | 'Dark' | 'Night'>('Night');
  const [activeTab, setActiveTab] = useState('About');
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSection, setDetailSection] = useState<string | null>(null);
  const [detailPanelVisible, setDetailPanelVisible] = useState(false);
  const [cameraTransitioning, setCameraTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const panelShowTimer = useRef<number | null>(null);
  const cameraDoneTimer = useRef<number | null>(null);
  const backFadeTimer = useRef<number | null>(null);

  const clearTimers = () => {
    if (panelShowTimer.current) window.clearTimeout(panelShowTimer.current);
    if (cameraDoneTimer.current) window.clearTimeout(cameraDoneTimer.current);
    if (backFadeTimer.current) window.clearTimeout(backFadeTimer.current);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // Intro screen duration
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const handleOpenDetail = () => {
    clearTimers();
    setDetailSection(activeTab);
    setDetailOpen(true);

    if (isMobile) {
      setDetailPanelVisible(true);
      setCameraTransitioning(false);
      return;
    }

    setDetailPanelVisible(false);
    setCameraTransitioning(true);
    panelShowTimer.current = window.setTimeout(() => {
      setDetailPanelVisible(true);
    }, 700);
    cameraDoneTimer.current = window.setTimeout(() => {
      setCameraTransitioning(false);
    }, 1000);
  };

  const handleCloseDetail = () => {
    if (cameraTransitioning) return;

    clearTimers();
    setDetailPanelVisible(false);

    if (isMobile) {
      setDetailOpen(false);
      setDetailSection(null);
      return;
    }

    setCameraTransitioning(true);
    backFadeTimer.current = window.setTimeout(() => {
      setDetailOpen(false);
    }, 300);
    cameraDoneTimer.current = window.setTimeout(() => {
      setDetailSection(null);
      setCameraTransitioning(false);
    }, 1300);
  };

  const headerTitle = detailOpen ? (detailSection ?? activeTab).toLowerCase() : 'SHUBHAM PUNDIR';

  return (
    <div className="app-container">
      {/* Loader */}
      <div className={`loader-container ${!loading ? 'hidden' : ''}`}>
        <div className="loader-text">
          <span style={{ fontWeight: 100 }}>Shubham Pundir</span>
          <span className="bold-part">Portfolio</span>
        </div>
      </div>

      <BackgroundScene theme={theme} detailOpen={detailOpen} isMobile={isMobile} />

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
        <h1 key={headerTitle} className="header-title-fade">{headerTitle}</h1>
        <p className={`header-subtitle ${detailOpen ? 'hidden' : ''}`}>Researcher & Developer</p>
      </div>

      {/* Navigation */}
      {!detailOpen ? (
        <div
          className="navigation"
          onWheel={(e) => {
            const now = Date.now();
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
            document.body.style.overflow = 'hidden';
          }}
          onMouseLeave={() => {
            document.body.style.overflow = 'hidden';
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
      ) : (
        <div className="detail-side-info">
          {DETAIL_SIDEBAR_INFO[detailSection ?? activeTab]}
        </div>
      )}

      {/* Content Panel */}
      <div className={`content-panel ${detailOpen ? 'hidden' : ''}`}>
        <p
          key={activeTab}
          className={`content-summary ${detailOpen ? 'disabled' : ''}`}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('a')) return;
            if (!detailOpen) handleOpenDetail();
          }}
        >
          {CONTENT_DATA[activeTab]}
        </p>
      </div>

      {(detailOpen || detailSection) && detailSection && (
        <div className={`detail-panel ${detailPanelVisible ? 'visible' : ''} ${isMobile ? 'mobile' : ''}`}>
          {DETAIL_DATA[detailSection]}
        </div>
      )}

      {detailOpen && (
        <button
          className={`back-button ${cameraTransitioning ? 'disabled' : ''}`}
          onClick={handleCloseDetail}
          disabled={cameraTransitioning}
        >
          ← Back
        </button>
      )}

      {/* Footer */}
      <div className="footer">
        shub
      </div>
    </div>
  );
}

export default App;
