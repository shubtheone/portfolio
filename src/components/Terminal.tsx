import { useState, useRef, useEffect } from 'react';
import {
    User,
    GraduationCap,
    Hexagon,
    Briefcase,
    Code,
    Award,
    Mail,
    PenTool,
    Search
} from 'lucide-react';

const TABS = [
    { id: 'about', label: 'About', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Hexagon },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'writeups', label: 'Writeups', icon: PenTool },
    { id: 'research', label: 'Research', icon: Search }
];

const COMMAND_OUTPUTS: Record<string, string> = {
    about: `Hello! I'm Shubham Pundir, a passionate cybersecurity enthusiast.\n\nI love playing CTFs, researching security vulnerabilities, and building secure systems.\nType 'skills' or use the tabs below to explore more.`,
    education: `🎓 Bachelor of Technology in Computer Science\n\nFocus on Cybersecurity and Networking.\nGraduated with honors, participated in various security competitions.`,
    skills: `🚀 TECHNICAL SKILLS:\n\n- Penetration Testing\n- Web Application Security\n- Network Analysis (Wireshark)\n- Programming: Python, Bash, C++, JavaScript\n- Tools: Nmap, Burp Suite, Metasploit`,
    experience: `💼 PROFESSIONAL EXPERIENCE:\n\n- Security Researcher @ Bugcrowd/HackerOne (Present)\n- SOC Analyst Intern @ CyberSec Org (2022)\n- Freelance Penetration Tester`,
    projects: `⌨️ PROJECTS:\n\n1. automated-recon: A bash script for automated bug bounty reconnaissance.\n2. secure-chat: End-to-end encrypted terminal chat application.\n3. ctf-writeups: Collection of detailed solutions to various CTF challenges.`,
    certifications: `🏅 CERTIFICATIONS:\n\n- Certified Ethical Hacker (CEH)\n- CompTIA Security+\n- eJPT (eLearnSecurity Junior Penetration Tester)`,
    contact: `📫 CONTACT:\n\nEmail: shubham@example.com\nTwitter: @shubhampundir\nGitHub: github.com/shubhampundir\nLinkedIn: linkedin.com/in/shubhampundir`,
    writeups: `📝 WRITEUPS:\n\nCheck out my latest CTF and bug bounty writeups.\nType 'sudo cat /writeups/latest.txt' to view or visit my blog.`,
    research: `🔬 RESEARCH:\n\nOngoing research in wireless security and IoT vulnerabilities.\nPublished paper on "Analyzing Bluetooth vulnerabilities in modern headsets."`
};

interface TerminalProps {
    activeTab: string | null;
    setActiveTab: (tab: string) => void;
}

export default function Terminal({ activeTab, setActiveTab }: TerminalProps) {
    const [history, setHistory] = useState([
        { text: '$ welcome', type: 'command' },
        { text: '$ echo "SHUBHAM PUNDIR"', type: 'command' },
        { text: 'SHUBHAM PUNDIR\n', type: 'output' },
        { text: '$ whoami', type: 'command' },
        { text: 'shub@cybersec\n', type: 'output' },
        { text: '$ pwd', type: 'command' },
        { text: '/home/shub/portfolio\n', type: 'output' },
        { text: '$ ls', type: 'command' },
        { text: TABS.map(t => t.id).join(' ') + '\n', type: 'output' },
        { text: "Welcome to Shubham's cybersecurity portfolio! Type help to see available commands.", type: 'output' }
    ]);

    const [input, setInput] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of terminal
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, input]);

    // Handle running a command
    const runCommand = (cmd: string) => {
        const trimmed = cmd.trim().toLowerCase();

        // Echo the command
        const newHistory = [...history, { text: `$ ${cmd}`, type: 'command' }];

        // Process command
        if (trimmed === 'clear') {
            setHistory([]);
            return;
        } else if (trimmed === 'help') {
            newHistory.push({
                text: `Available commands:\nhelp - Show this message\nclear - Clear terminal\nls - List available sections\n${TABS.map(t => t.id).join(', ')} - View section details`,
                type: 'output'
            });
        } else if (trimmed === 'ls') {
            newHistory.push({ text: TABS.map(t => t.id).join('  '), type: 'output' });
        } else if (COMMAND_OUTPUTS[trimmed]) {
            newHistory.push({ text: COMMAND_OUTPUTS[trimmed], type: 'output' });
            setActiveTab(trimmed);
        } else if (trimmed === 'whoami') {
            newHistory.push({ text: 'shub@cybersec', type: 'output' });
        } else if (trimmed === 'pwd') {
            newHistory.push({ text: '/home/shub/portfolio', type: 'output' });
        } else if (trimmed !== '') {
            newHistory.push({ text: `bash: ${trimmed}: command not found`, type: 'output' });
        }

        setHistory(newHistory);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            runCommand(input);
            setInput('');
        }
    };

    // Clicking a tab triggers that command
    const handleTabClick = (id: string) => {
        runCommand(id);
        setActiveTab(id);
    };

    return (
        <div className="terminal-wrapper">
            <div className="crt-effect" />

            <div className="terminal-header">
                <span>&gt;_ Shub@cybersec ~ /{activeTab || ''}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '10px' }}>CRT Effect</span>
                </div>
            </div>

            <div className="terminal-body" onClick={() => document.getElementById('terminal-input')?.focus()}>
                {history.map((line, idx) => (
                    <div key={idx} className="output-line" style={{ color: line.type === 'command' ? '#ccc' : '#fff' }}>
                        {line.text}
                    </div>
                ))}

                <div className="prompt-line">
                    <span className="prompt-symbol">$</span>
                    <input
                        id="terminal-input"
                        type="text"
                        className="prompt-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        autoComplete="off"
                        spellCheck="false"
                    />
                </div>
                <div ref={endRef} />
            </div>

            <div className="tabs-container">
                {TABS.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabClick(tab.id)}
                        >
                            <IconComponent size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
