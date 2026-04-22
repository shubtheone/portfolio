import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import BackgroundScene from './components/BackgroundScene';

type Language = 'en' | 'ja';

const STORAGE_KEYS = {
  theme: 'portfolio:theme',
  language: 'portfolio:language',
} as const;

const SECTION_KEYS = [
  'About', 'Education', 'Skills', 'Experience', 'Achievements', 'Projects',
  'Certifications', 'Contact', 'Writeups', 'Research'
] as const;

const NAV_LABELS: Record<Language, Record<string, string>> = {
  en: {
    About: 'About',
    Education: 'Education',
    Skills: 'Skills',
    Experience: 'Experience',
    Achievements: 'Achievements',
    Projects: 'Projects',
    Certifications: 'Certifications',
    Contact: 'Contact',
    Writeups: 'Writeups',
    Research: 'Research',
  },
  ja: {
    About: '自己紹介',
    Education: '学歴',
    Skills: 'スキル',
    Experience: '経験',
    Achievements: '実績',
    Projects: 'プロジェクト',
    Certifications: '資格',
    Contact: '連絡先',
    Writeups: '記事',
    Research: '研究',
  },
};

const THEME_LABELS: Record<Language, Record<'Light' | 'Dark' | 'Night', string>> = {
  en: { Light: 'Light', Dark: 'Dark', Night: 'Night' },
  ja: { Light: 'ライト', Dark: 'ダーク', Night: 'ナイト' },
};

const UI_LABELS: Record<Language, { subtitle: string; back: string; langToggle: string; loaderSuffix: string }> = {
  en: {
    subtitle: 'Researcher & Developer',
    back: '← Back',
    langToggle: '日本語',
    loaderSuffix: 'Portfolio',
  },
  ja: {
    subtitle: '研究者・開発者',
    back: '← 戻る',
    langToggle: 'English',
    loaderSuffix: 'ポートフォリオ',
  },
};

const LEFT_SHIFT_TOPICS = new Set(['Contact', 'Writeups', 'Research']);

// Projects with optional URL — renders as "Name ↗" where ↗ is a clickable link
const PROJECTS = [
  { name: 'CTFtime Points Calculator', url: 'https://www.ctfpoints-calculator.me/' },
  { name: 'Learning Curve', url: 'https://learning-curve.tech/about' },
  { name: '0bscuri7y Website', url: 'https://www.0bscuri7y.in/' },
  { name: 'th0rnRecon | Web App Scanner', url: 'https://github.com/shubtheone/th0rnRecon' },
  { name: 'OS Contribution | Cameradar', url: 'https://github.com/shubtheone/cameradar' }
];

const PROJECT_DETAILS = [
  {
    name: 'CTFtime Points Calculator',
    url: 'https://www.ctfpoints-calculator.me/',
    description:
      'There was no online calculator to estimate CTFtime points accurately, so I built and hosted one with React. It is now used by teams and individual players to track event impact and plan participation.',
    descriptionJa:
      'CTFtimeポイントを正確に計算できるサービスがなかったため、Reactで開発して無料公開しました。現在は多くのチームや個人が大会選定と成績管理に利用しています。',
  },
  {
    name: 'Learning Curve',
    url: 'https://learning-curve.tech/about',
    description:
      'A learning-focused platform created to simplify skill progression with structured resources and a cleaner user journey for learners exploring technical domains.It is more like a time table generator for remembering what to learn and when to learn.',
    descriptionJa:
      '学習計画を整理し、技術分野のスキル習得を進めやすくするためのプラットフォームです。何をいつ学ぶかを可視化するタイムテーブル型の設計です。',
  },
  {
    name: '0bscuri7y Website',
    url: 'https://www.0bscuri7y.in/',
    description:
      'Official web presence for 0bscuri7y to showcase team work, security activity, and public-facing initiatives around CTF and research.',
    descriptionJa:
      '0bscuri7yチームの公式サイトです。CTF活動、セキュリティ研究、公開向けの取り組みを整理して発信しています。',
  },
  {
    name: 'th0rnRecon | Web App Scanner',
    url: 'https://github.com/shubtheone/th0rnRecon',
    description:
      'Recon and web scanning project focused on automating repetitive discovery tasks to speed up web reconnaissance and vulnerability identification in security assessments.',
    descriptionJa:
      'Web偵察とスキャン作業を自動化し、評価時の情報収集と脆弱性発見を高速化するためのプロジェクトです。',
  },
  {
    name: 'OS Contribution | Cameradar',
    url: 'https://github.com/shubtheone/cameradar',
    description:
      'Open-source contribution effort in Cameradar repository a popular tool with almost 5k stars on github.',
    descriptionJa:
      'GitHubで高い評価を受けているCameradarへのオープンソース貢献です。改善提案と実装を通じて実運用に寄与しました。',
  },
  {
    name: 'CTFd Agent Solver',
    description:
      'An AI-Agent Wrapper which uses SOTA models and prompt engineering to solve challenges hosted on CTFd platforms. This is a team project. We have implemented rotor accounts system and added skills for better efficiency at solving challenges.',
    descriptionJa:
      'CTFd上の課題を解くためのAIエージェントラッパーです。最先端モデルとプロンプト設計を活用し、チームでローテーションアカウント機構と専用スキルを実装しました。',
  },
    {
    name: 'NetraAstra',
    description:
      'GO and python based RTSP camera scanner and recon tool.',
    descriptionJa:
      'GoとPythonで構築したRTSPカメラスキャナー兼リコンツールです。探索と情報収集を効率化します。',
  },
  {
    name: 'Yomu',
    description:
      'A Japanese Reader App for reading light novels offline at your device. It supports 10 thousand dictionary words. Got a B in reading at JLPT N4 so decided to make this app for myself and others who like to read while travelling. (It is currently in development)',
    descriptionJa:
      '端末でオフライン読書ができる日本語リーダーアプリです。1万語規模の辞書に対応し、移動中の読書体験を想定して開発中です。',
  },

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

const CONTENT_DATA_EN: Record<string, React.ReactNode> = {
  About: "Hello! I am\n Shubham Pundir,\nI love mountains and stars.\nA Researcher and Developer,\nPassionate about offensive security,\n Machine Learning, Artifical Intelligence,\n OSINT, Software development, building robust agent-based and application systems as a hobby.",
  Education: "Bachelors in Computer Applications \nFocused on Information Security and AI\nContinuous self-learner.",
  Skills: "Open-Source Intelligence (OSINT)\nWeb Application Security & Penetration Testing\n Software & Game Development\nMachine Learning & Aritifcial Intelligence\nPrompt Engineering & Agentic AI Frameworks\nLanguages: Python, Go, TypeScript, C/C++",
  Experience: "Co-Founder @ 0bscuri7y\nSecurity Engineer @ Aventior\nCyber Security Intern @ NTRO\n Data Analyst Intern @ AHS Healthcare",
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
  Certifications: "NCIIPC–AICTE CyberSec Bootcamp, MIT Manipal\nCertified AppSec Pentester (CAPen)\nWeb Application Pentesting - THM\nTryHackMe Hackfinity 2025",
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

const DETAIL_DATA_EN: Record<string, React.ReactNode> = {
  About: (
    <>

      <p>
        I am Shubham Pundir, a researcher and developer focused on offensive security, OSINT,
        and building practical systems with AI.
      </p>
      <p>
        I enjoy developing softwares and stuff. The thing about developing is you're the creator yourself. There have been many times when I felt the need of a software which didn't exist at that time I made one. Examples include CTFtime calculator, Yomu (Japanese Reader App) you can see more about it in my projects.
      </p>
      <p>
        Outside work, mountains and night skies keep me grounded—they are a major source of
        the calm and curiosity that drive my long-term research mindset.
      </p>
    </>
  ),
  Education: (
    <>
      <p>
        <strong>Institute of Innovation in Technology & Management (IINTM), Janakpuri</strong>
      </p>
      <p>
        <strong>Bachelor of Computer Applications 2023 - 2026 (BCA)</strong>
      </p>
      <p>
        <strong>Cumulative GPA:</strong> 8.8 (Till 5th Sem)
      </p>
      <p>
        Academic focus included secure software design, networking fundamentals, applied machine learning concepts and mostly yapping.
      </p>
      <p>
        Self-learning continues through CTF practice, working with team, doing researches, scrolling through github repositories, and reading writeups.
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
      <p><strong>Languages:</strong> English, Hindi, Japanese</p>
    </>
  ),
  Experience: (
    <>
      <h3>Experience</h3>
      <p><strong>Technical Intern at NTRO (National Technical Research Organization)</strong></p>
      <p>Sept 2025 – Feb 2026</p>
      <p>• Worked with Indian government in order to develop and optimize secure backend applications using Python and GO to enhance data processing efficiency.</p>

      <p><strong>Co-Founder at 0bscuri7y CTF Team</strong></p>
      <p>April 2025 – Present</p>
      <p>• Co-founded a cybersecurity research and CTF team specializing in vulnerability analysis and applied security challenges. Ranking 4th all over India in CTFTime (2025)</p>

      <p><strong>Data Analyst Intern at AHS Healthcare Ltd.</strong></p>
      <p>Apr 2024 – Dec 2024</p>
      <p>• Automated data visualization and analysis tasks using Python and Excel for health-related datasets.</p>
      <p>• Developed data scraping scripts to aggregate information, facilitating data-driven decision-making</p>
    </>
  ),
  Achievements: (
    <>
      <p><strong>Recognized by CERT-In</strong> for impactful security reporting and responsible disclosure.</p>
      <p><strong>Pentathon 2025:</strong> secured 5th rank through multi-domain practical challenge solving.</p>
      <p><strong>SewaBharti platform:</strong> Reported a critical vulnerability in the SewaBharti platform, gaining unauthorized admin access.</p>
      <p><strong>CTFTime India ranking:</strong> Team 0bscuri7y placed 4th (2025).</p>
    </>
  ),
  Projects: (
    <>

      {PROJECT_DETAILS.map((p, i) => (
        <p key={i}>
          <strong>{p.name}</strong> — {p.description}
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
        </p>
      ))}
    </>
  ),
  Certifications: (
    <>
      <h3>Certifications</h3>
      <p><strong>NCIIPC–AICTE CyberSec Bootcamp, MIT Manipal</strong> — hands-on labs and practical security drills.</p>
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
      <h3>Role of Artificial Intelligence in Recruitment Process</h3>
      <p>
        <strong>Summary:</strong> explores how agentic AI and knowledge graphs can enhance candidate screening, skill assessment, and bias mitigation in hiring workflows.
      </p>
      <p><strong>Status:</strong> active work in progress.</p>
      <div className="research-separator" />
      <h3>Ongoing Researches</h3>
      <p>
        <strong>
Currently working on some researches which I will disclose once they are ready to be disclosed.
        </strong>
      </p>
    </>
  )
};

const DETAIL_SIDEBAR_INFO_EN: Record<string, React.ReactNode> = {
  About: (
    <>
      <p>
I’m someone who loves learning new things. I’ve often been told by my peers that I’m a fast learner.
</p>

<p>
I live by the quote, “No wind is favorable if the sailor does not know which port he sails to.”
</p>

<p>

I like to play all sports but football, badminton and chess are my favourites.
      </p>
    </>
  ),
  Education: 'Academic foundation, coursework focus, and continuous self-learning path in security, AI and technological fields.',
  Skills: 'Capability map across security, engineering, and AI with practical tool depth and delivery strength.',
  Experience: 'Role-based contributions, CTF Participation, Community Involvement and Working experience across different teams.',
  Achievements: 'Recognition, rankings, and disclosed findings with context and real-world security value.',
  Projects: 'Built products and tools with clear scope, stack choices, and useful outcomes.',
  Certifications: 'Verified training milestones, issuers, and applied security competencies.',
  Contact: 'Direct collaboration channels for research, engineering work, and opportunities.',
  Writeups: 'Public writing focus, methodology style, and topics covered across security domains.',
  Research: 'Ongoing research direction, abstract-level summary, and current status.'
};

const CONTENT_DATA_JA: Record<string, React.ReactNode> = {
  About: 'こんにちは、シュバム・プンディルです。\n山と星が好きです。\n研究と開発を行っています。\n攻撃的セキュリティ、AI、OSINT、\nそして実用的なソフトウェア開発に情熱があります。',
  Education: 'BCA（学士課程）在学中\n情報セキュリティとAIを中心に学習\n継続的に自己学習しています。',
  Skills: 'OSINT\nWebアプリケーション診断\nソフトウェア開発\nAI/ML\nPrompt Engineering\n言語: Python, Go, TypeScript, C/C++',
  Experience: '0bscuri7y共同創設者\nNTRO 技術インターン\nAHS Healthcare データ分析インターン',
  Achievements: 'CERT-In から評価\nPentathon 2025 5位\nSewaBhartiで重大脆弱性報告\nCTFTime India 2026 現在1位',
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
  Certifications: 'NCIIPC–AICTE サイバーセキュリティブートキャンプ\nCAPen\nWeb Application Pentesting (THM)\nTryHackMe Hackfinity 2025',
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
  Research: '採用プロセスにおけるAIの役割\n現在も研究を進行中です。'
};

const DETAIL_DATA_JA: Record<string, React.ReactNode> = {
  About: (
    <>
      <p>私は攻撃的セキュリティ、OSINT、AIを活用した実用システム開発に取り組む研究者・開発者です。</p>
      <p>必要なツールが存在しないなら自分で作る、という姿勢でプロダクトを作っています。</p>
      <p>山と夜空は、長期的な研究と開発を続けるための大切なモチベーションです。</p>
    </>
  ),
  Education: (
    <>
      <p><strong>Institute of Innovation in Technology & Management (IINTM), Janakpuri</strong></p>
      <p><strong>Bachelor of Computer Applications 2023 - 2026 (BCA)</strong></p>
      <p><strong>Cumulative GPA:</strong> 8.8 (5学期時点)</p>
      <p>情報セキュリティ、ネットワーク、機械学習を中心に学習しています。</p>
      <p>CTF、チーム活動、論文・Writeup読解を通して継続的に自己学習しています。</p>
    </>
  ),
  Skills: (
    <>
      <h3>スキル</h3>
      <p><strong>セキュリティ:</strong> Web診断、Recon自動化、脆弱性分析、OSINT</p>
      <p><strong>開発:</strong> Python, Go, TypeScript, C/C++, 自動化パイプライン</p>
      <p><strong>AI/ML:</strong> Prompt Engineering、Agentic Workflow、モデル活用</p>
      <p><strong>ツール:</strong> Burp, Nmap, Git/GitHub, Linux</p>
      <p><strong>言語:</strong> 英語、ヒンディー語、日本語</p>
    </>
  ),
  Experience: (
    <>
      <h3>経験</h3>
      <p><strong>NTRO 技術インターン</strong></p>
      <p>2025年9月 – 2026年2月</p>
      <p>• インド政府関連業務として、PythonとGoを用いた安全なバックエンド開発・最適化を実施し、データ処理効率を向上。</p>
      <p><strong>0bscuri7y CTFチーム 共同創設者</strong></p>
      <p>2025年4月 – 現在</p>
      <p>• 脆弱性分析と実践的セキュリティ課題に特化したCTFチームを共同創設。CTFTime India 2025で全国4位を獲得。</p>
      <p><strong>AHS Healthcare データ分析インターン</strong></p>
      <p>2024年4月 – 2024年12月</p>
      <p>• PythonとExcelを用いて医療系データの可視化・分析業務を自動化。</p>
      <p>• データ収集スクリプトを開発し、意思決定に必要な情報集約を効率化。</p>
    </>
  ),
  Achievements: (
    <>
      <p><strong>CERT-In評価</strong> — 責任ある開示と実務的な報告を高く評価。</p>
      <p><strong>Pentathon 2025:</strong> 5位</p>
      <p><strong>SewaBharti:</strong> 重大脆弱性を報告し管理権限取得の問題を指摘。</p>
      <p><strong>CTFTime India:</strong> 2025年4位、2026年現在1位。</p>
    </>
  ),
  Projects: (
    <>
      {PROJECT_DETAILS.map((p, i) => (
        <p key={i}>
          <strong>{p.name}</strong> — {p.descriptionJa ?? p.description}
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
        </p>
      ))}
    </>
  ),
  Certifications: (
    <>
      <h3>資格</h3>
      <p><strong>NCIIPC–AICTE CyberSec Bootcamp, MIT Manipal</strong></p>
      <p><strong>CAPen</strong></p>
      <p><strong>Web Application Pentesting (THM)</strong></p>
      <p><strong>TryHackMe Hackfinity 2025</strong></p>
    </>
  ),
  Contact: (
    <>
      <h3>連絡先</h3>
      <p>研究・開発・セキュリティ関連の協業はいつでも歓迎です。</p>
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
      <h3>記事</h3>
      <p>再現性と実用性を重視したセキュリティ記事を書いています。</p>
      <p>CTF手法、Web診断、Reconワークフロー、実例分析などを扱います。</p>
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
      <h3>採用プロセスにおけるAIの役割</h3>
      <p><strong>概要:</strong> Agentic AIとナレッジグラフで候補者評価・スキル判定・バイアス軽減を改善する研究。</p>
      <p><strong>進捗:</strong> 現在進行中。</p>
      <div className="research-separator" />
      <h3>進行中の研究</h3>
      <p><strong>公開可能な段階になり次第、順次公開予定です。</strong></p>
    </>
  )
};

const DETAIL_SIDEBAR_INFO_JA: Record<string, React.ReactNode> = {
  About: (
    <>
      <p>新しいことを学ぶのが好きで、吸収が早いと言われることが多いです。</p>
      <p>「目的地を知らない船乗りに追い風はない」という言葉を大切にしています。</p>
      <p>スポーツが好きで、特にサッカー、バドミントン、チェスが好きです。</p>
    </>
  ),
  Education: '学習基盤、主要科目、そして継続的な自己学習の方向性。',
  Skills: 'セキュリティ、開発、AIの実践的なスキル構成。',
  Experience: 'チーム活動、実務経験、CTF参加を通じた実践的な成果。',
  Achievements: '評価・順位・報告実績とその実務的インパクト。',
  Projects: '目的と成果が明確なプロジェクト群。',
  Certifications: '取得資格と対応スキル領域。',
  Contact: '研究・開発コラボレーション向けの連絡先。',
  Writeups: '記事の主題、手法、文体の概要。',
  Research: '現在進行中の研究の要約とステータス。'
};


function App() {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEYS.language);
      return saved === 'ja' || saved === 'en' ? saved : 'en';
    } catch {
      return 'en';
    }
  });
  const [languageTransitioning, setLanguageTransitioning] = useState(false);
  const [theme, setTheme] = useState<'Light' | 'Dark' | 'Night'>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEYS.theme);
      return saved === 'Light' || saved === 'Dark' || saved === 'Night' ? saved : 'Night';
    } catch {
      return 'Night';
    }
  });
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
  const languageTimer = useRef<number | null>(null);

  const clearTimers = () => {
    if (panelShowTimer.current) window.clearTimeout(panelShowTimer.current);
    if (cameraDoneTimer.current) window.clearTimeout(cameraDoneTimer.current);
    if (backFadeTimer.current) window.clearTimeout(backFadeTimer.current);
    if (languageTimer.current) window.clearTimeout(languageTimer.current);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.theme, theme);
    } catch {
      // noop
    }
  }, [theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.language, language);
    } catch {
      // noop
    }
  }, [language]);

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

  const handleLanguageToggle = () => {
    if (languageTransitioning) return;
    setLanguageTransitioning(true);
    languageTimer.current = window.setTimeout(() => {
      setLanguage((previous) => (previous === 'en' ? 'ja' : 'en'));
      setLanguageTransitioning(false);
    }, 180);
  };

  const CONTENT_DATA = language === 'ja' ? CONTENT_DATA_JA : CONTENT_DATA_EN;
  const DETAIL_DATA = language === 'ja' ? DETAIL_DATA_JA : DETAIL_DATA_EN;
  const DETAIL_SIDEBAR_INFO = language === 'ja' ? DETAIL_SIDEBAR_INFO_JA : DETAIL_SIDEBAR_INFO_EN;

  const headerTitle = detailOpen
    ? (language === 'ja' ? NAV_LABELS.ja[detailSection ?? activeTab] : (detailSection ?? activeTab).toLowerCase())
    : 'SHUBHAM PUNDIR';
  const detailDirection = LEFT_SHIFT_TOPICS.has(detailSection ?? activeTab) ? 'left' : 'right';

  return (
    <div className="app-container">
      {/* Loader */}
      <div className={`loader-container ${!loading ? 'hidden' : ''}`}>
        <div className="loader-text">
          <span style={{ fontWeight: 100 }}>Shubham Pundir</span>
          <span className="bold-part">{UI_LABELS[language].loaderSuffix}</span>
        </div>
      </div>

      <BackgroundScene
        theme={theme}
        detailOpen={detailOpen}
        isMobile={isMobile}
        detailDirection={detailDirection}
      />

      {/* Noise Overlay Disabled */}
      <div className="noise-overlay"></div>

      {/* Left Sidebar */}
      <button
        className="language-toggle"
        onClick={handleLanguageToggle}
        aria-label={language === 'en' ? 'Switch language to Japanese' : 'Switch language to English'}
      >
        {UI_LABELS[language].langToggle}
      </button>

      <div className={`ui-layer ${languageTransitioning ? 'lang-fade' : ''}`}>
        <div className={`sidebar ${language === 'ja' ? 'ja' : ''}`}>
          {(['Light', 'Dark', 'Night'] as const).map((themeItem) => (
            <button
              key={themeItem}
              className={`theme-button ${theme === themeItem ? 'active' : ''}`}
              onClick={() => setTheme(themeItem)}
              aria-label={`Set theme to ${themeItem}`}
            >
              {THEME_LABELS[language][themeItem]}
            </button>
          ))}
        </div>

        <div className="header">
          <h1 key={headerTitle} className="header-title-fade">{headerTitle}</h1>
          <p className={`header-subtitle ${detailOpen ? 'hidden' : ''}`}>{UI_LABELS[language].subtitle}</p>
        </div>

        {!detailOpen ? (
          <div
            className="navigation"
            onWheel={(e) => {
              const now = Date.now();
              if (now - (window as any).lastNavScroll > 150 || !(window as any).lastNavScroll) {
                (window as any).lastNavScroll = now;
                const currentIndex = SECTION_KEYS.indexOf(activeTab as (typeof SECTION_KEYS)[number]);
                if (e.deltaY > 0 && currentIndex < SECTION_KEYS.length - 1) {
                  setActiveTab(SECTION_KEYS[currentIndex + 1]);
                } else if (e.deltaY < 0 && currentIndex > 0) {
                  setActiveTab(SECTION_KEYS[currentIndex - 1]);
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
            {SECTION_KEYS.map((item) => (
              <button
                key={item}
                className={`nav-item ${activeTab === item ? 'active' : ''}`}
                onClick={() => setActiveTab(item)}
                aria-label={`Open ${NAV_LABELS.en[item]} section`}
              >
                <span className="dot">●</span>
                <span className="nav-text">{NAV_LABELS[language][item]}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="detail-side-info">
            {DETAIL_SIDEBAR_INFO[detailSection ?? activeTab]}
          </div>
        )}

        <div className={`content-panel ${detailOpen ? 'hidden' : ''}`}>
          <p
            key={`${activeTab}-${language}`}
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
            {UI_LABELS[language].back}
          </button>
        )}

        <div className="footer">
          shub
        </div>
      </div>
    </div>
  );
}

export default App;
