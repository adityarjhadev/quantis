import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import "./dashboard.css";

const SEED = [
  { rank: 1, name: "Hunter Harringson", handle: "@hunt.h", pnl: 11.42, delta: 2 },
  { rank: 2, name: "Arush Sivhakumar", handle: "@trackstar", pnl: 9.81, delta: -1 },
  { rank: 3, name: "Priya Shah", handle: "@priya", pnl: 8.74, delta: 1 },
  { rank: 4, name: "Tomás Lindgren", handle: "@tlind", pnl: 7.55, delta: 0 },
  { rank: 5, name: "Aisha Bello", handle: "@aishab", pnl: 6.92, delta: 3 },
  { rank: 6, name: "Jordan Park", handle: "@jpark", pnl: 6.1, delta: -2, rival: true },
  { rank: 7, name: "You", handle: "@aditya", pnl: 5.74, delta: 4, you: true },
  { rank: 8, name: "Leah Brennan", handle: "@leahb", pnl: 5.21, delta: -1 },
  { rank: 9, name: "Mateo Cruz", handle: "@mcruz", pnl: 4.88, delta: 0 },
  { rank: 10, name: "Hannah Yi", handle: "@hyi", pnl: 4.4, delta: -3 },
  { rank: 11, name: "Ari Tanaka", handle: "@atanaka", pnl: 4.02, delta: 1 },
  { rank: 12, name: "Noah Patel", handle: "@npatel", pnl: 3.88, delta: -1 },
  { rank: 13, name: "Zoe Kim", handle: "@zoek", pnl: 3.45, delta: 2 },
  { rank: 14, name: "Ethan Ross", handle: "@eross", pnl: 3.11, delta: -2 },
  { rank: 15, name: "Sofia Lee", handle: "@sofia", pnl: 2.84, delta: 0 },
];

const FEED_TEMPLATES = [
  "@maya.o climbed to #1",
  "@dreyes lost #1 to @maya.o",
  "@aishab jumped +3 ranks",
  "@you passed @jpark",
  "@hyi dropped -3 ranks",
  "@priya bought NVDA · +1.2%",
  "@tlind held cash through close",
  "@jpark sold AAPL at +2.4%",
  "@leahb opened short on TSLA",
  "@mcruz hit weekly high",
];

const TICKER = [
  { s: "AAPL", p: "+1.24%" }, { s: "NVDA", p: "+3.12%" }, { s: "TSLA", p: "-0.86%" },
  { s: "MSFT", p: "+0.42%" }, { s: "AMZN", p: "+0.91%" }, { s: "META", p: "-1.18%" },
  { s: "GOOGL", p: "+0.55%" }, { s: "BRK.B", p: "+0.21%" }, { s: "JPM", p: "-0.34%" },
  { s: "V", p: "+0.78%" }, { s: "SHOP", p: "+2.41%" }, { s: "BABA", p: "-1.92%" },
  { s: "TSM", p: "+1.65%" }, { s: "ASML", p: "+0.88%" }, { s: "NFLX", p: "+1.04%" },
];

const SKILLS = [
  { k: "Risk", t: "Position sizing under uncertainty", d: "Why a 10% bet feels rational until it goes wrong." },
  { k: "Vol", t: "Volatility, drawdowns, recovery", d: "A -8% week needs +8.7% to break even." },
  { k: "Div", t: "Diversification across 120 markets", d: "Reduce idiosyncratic risk with breadth." },
  { k: "Macro", t: "Reading the tape", d: "Rates, oil, and dollar — the three that move everything." },
  { k: "Edge", t: "Finding repeatable edge", d: "Backtest, paper, scale. In that order." },
];

const TABS = [
  { id: "school", label: "School", icon: "◇" },
  { id: "league", label: "League", icon: "✦" },
  { id: "learn", label: "Learn", icon: "◎" },
  { id: "portfolio", label: "Portfolio", icon: "▣" },
  { id: "discover", label: "Discover", icon: "✸" },
];

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("league");

  useEffect(() => {
    const raw = localStorage.getItem("ranked.user");

    if (!raw) {
      // No auth/onboarding route in app — fallback to demo user instead of redirecting
      setUser({
        name: "Guest",
        handle: "@guest",
        email: ""
      });
      return;
    }

    try {
      setUser(JSON.parse(raw));
    } catch (e) {
      setUser({
        name: "Guest",
        handle: "@guest",
        email: ""
      });
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="dash">
      <div className="dash-bg" aria-hidden />
      <TopBar user={user} onSignOut={() => { localStorage.removeItem("ranked.user"); navigate("/onboarding"); }} />
      <Ticker />

      <main className="dash-main">
        {tab === "league" && <LeagueView user={user} />}
        {tab === "school" && <SchoolView />}
        {tab === "learn" && <LearnView />}
        {tab === "portfolio" && <PortfolioView />}
        {tab === "discover" && <DiscoverView />}
      </main>

      <BottomTabs active={tab} onChange={setTab} />
    </div>
  );
}

function TopBar({ user, onSignOut }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-dot" />
        <span>RANKED</span>
      </div>
      <div className="topbar-stats">
        <span><b>#7</b> global</span>
        <span className="sep">·</span>
        <span className="pos"><b>+5.74%</b> week</span>
      </div>

      <button className="topbar-avatar" onClick={() => setOpen(v => !v)}>
        {user.name.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div className="topbar-menu" onMouseLeave={() => setOpen(false)}>
          <div className="topbar-menu-head">
            <div className="topbar-menu-name">{user.name}</div>
            <div className="topbar-menu-handle">{user.handle}</div>
          </div>
          <button className="topbar-menu-item">Settings</button>
          <button className="topbar-menu-item">Notifications</button>
          <button className="topbar-menu-item danger" onClick={onSignOut}>Sign out</button>
        </div>
      )}
    </header>
  );
}

function Ticker() {
  return (
    <div className="ticker">
      <div className="ticker-track">
        {[...TICKER, ...TICKER].map((t, i) => (
          <span key={i} className={`tk ${t.p.startsWith("+") ? "up" : "down"}`}>
            <b>{t.s}</b> {t.p}
          </span>
        ))}
      </div>
    </div>
  );
}

function LeagueView({ user }) {
  const [board, setBoard] = useState(SEED);
  const [feed, setFeed] = useState(FEED_TEMPLATES.slice(0, 6));
  const [leagues, setLeagues] = useState(() => {
    const raw = localStorage.getItem("ranked.leagues");
    return raw ? JSON.parse(raw) : [];
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setBoard(prev =>
        prev
          .map(r => ({ ...r, pnl: +(r.pnl + (Math.random() - 0.5) * 0.12).toFixed(2) }))
          .sort((a, b) => b.pnl - a.pnl)
          .map((r, i) => ({ ...r, rank: i + 1 }))
      );
    }, 2200);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setFeed(prev => {
        const next = FEED_TEMPLATES[Math.floor(Math.random() * FEED_TEMPLATES.length)];
        return [next, ...prev].slice(0, 8);
      });
    }, 3000);

    return () => clearInterval(id);
  }, []);

  const persistLeagues = (next) => {
    setLeagues(next);
    localStorage.setItem("ranked.leagues", JSON.stringify(next));
  };

  const yourRival = board.find(r => r.rival);
  const youEntry = board.find(r => r.you);

  return (
    <div className="league-grid">
      {/* Hero Stats */}
      <section className="league-hero">
        <div className="hero-main">
          <div className="hero-rank-section">
            <div className="hero-stat">
              <span className="stat-label">League Rank</span>
              <div className="stat-huge">#7</div>
            </div>
            <div className="hero-delta">
              <span className="delta-label">Change</span>
              <div className="delta-badge up">+2</div>
            </div>
          </div>

          <div className="hero-metric">
            <span className="metric-label">Weekly Return</span>
            <div className="metric-value up">+5.74%</div>
            <span className="metric-sub">$5,740 · $105,740 total</span>
          </div>

          <div className="hero-metric">
            <span className="metric-label">Season PnL</span>
            <div className="metric-value up">+28.5%</div>
            <span className="metric-sub">$28,500 gain</span>
          </div>

          <div className="hero-metric">
            <span className="metric-label">Volatility</span>
            <div className="metric-value">18.3%</div>
            <span className="metric-sub">This week</span>
          </div>

          <div className="hero-metric">
            <span className="metric-label">Max Drawdown</span>
            <div className="metric-value">-8.2%</div>
            <span className="metric-sub">Season low</span>
          </div>

          <div className="hero-metric">
            <span className="metric-label">Sharpe Ratio</span>
            <div className="metric-value">1.84</div>
            <span className="metric-sub">Risk-adjusted return</span>
          </div>
        </div>

        {yourRival && (
          <div className="rival-section-league">
            <div className="rival-header">⚔️ Your Rival</div>
            <div className="rival-card-league">
              <div className="rival-card-header">
                <div className="rival-avatar">{yourRival.name.charAt(0)}</div>
                <div className="rival-info">
                  <div className="rival-name">{yourRival.name}</div>
                  <div className="rival-handle">{yourRival.handle}</div>
                </div>
              </div>
              <div className="rival-stats">
                <div className="rival-stat-item">
                  <span className="rival-stat-label">Rank</span>
                  <span className="rival-stat-value">#{yourRival.rank}</span>
                </div>
                <div className="rival-stat-item">
                  <span className="rival-stat-label">PnL</span>
                  <span className="rival-stat-value up">{yourRival.pnl}%</span>
                </div>
                <div className="rival-stat-item">
                  <span className="rival-stat-label">Δ</span>
                  <span className={`rival-stat-value ${yourRival.delta > 0 ? "up" : "down"}`}>{yourRival.delta > 0 ? "+" : ""}{yourRival.delta}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* League Cards Grid */}
      <section className="league-grid-section">
        <div className="section-header">
          <h3>Your Active Leagues</h3>
          <button className="btn-primary-small" onClick={() => setCreateOpen(true)}>+ Create League</button>
        </div>
        <div className="league-mini-cards">
          {board.slice(0, 4).map((r) => (
            <div key={r.handle} className="league-mini-card">
              <div className="mini-header">
                <div className="mini-rank">#{r.rank}</div>
                <div className="mini-pnl up">{r.pnl}%</div>
              </div>
              <div className="mini-name">{r.name}</div>
              <div className="mini-meta">
                <span className="mini-delta up">+{r.delta}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Leaderboard */}
      <section className="league-main-section">
        <div className="card hero-card">
          <div className="card-head">
            <h2>Live leaderboard</h2>
            <span className="pill">Week 14 · closing in 2d 14h</span>
          </div>
          <ol className="lb">
            {board.map(r => (
              <li key={r.handle} className={`lb-row ${r.you ? "you" : ""} ${r.rival ? "rival" : ""}`}>
                <span className="lb-rank">#{r.rank}</span>
                <span className="lb-name">
                  {r.you ? user.name : r.name}
                  <span className="lb-handle">{r.handle}</span>
                </span>
                <span className={`lb-delta ${r.delta > 0 ? "up" : r.delta < 0 ? "down" : ""}`}>{r.delta}</span>
                <span className={`lb-pnl ${r.pnl >= 0 ? "up" : "down"}`}>{r.pnl}%</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {createOpen && <div />}
      {friendsOpen && <div />}
    </div>
  );
}

function BottomTabs({ active, onChange }) {
  const activeIdx = TABS.findIndex(t => t.id === active);

  return (
    <nav className="tabs">
      <div className="tabs-glass">
        <div
          className="tabs-indicator"
          style={{ transform: `translateX(${activeIdx * 100}%)` }}
        />
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`tab ${active === t.id ? "active" : ""}`}
          >
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

const CLASS_LEADERBOARD = [
  { rank: 1, name: "Hunter Harringson", handle: "@hunt.h", pnl: 11.42, delta: 2, you: false, rival: false },
  { rank: 2, name: "Arush Sivhakumar", handle: "@trackstar", pnl: 9.81, delta: -1, you: false, rival: true },
  { rank: 3, name: "Priya Shah", handle: "@priya", pnl: 8.74, delta: 1, you: false, rival: false },
  { rank: 4, name: "Tomás Lindgren", handle: "@tlind", pnl: 7.55, delta: 0, you: false, rival: false },
  { rank: 5, name: "Aisha Bello", handle: "@aishab", pnl: 6.92, delta: 3, you: false, rival: false },
  { rank: 6, name: "Jordan Park", handle: "@jpark", pnl: 6.1, delta: -2, you: false, rival: false },
  { rank: 7, name: "You", handle: "@aditya", pnl: 5.74, delta: 4, you: true, rival: false },
  { rank: 8, name: "Leah Brennan", handle: "@leahb", pnl: 5.21, delta: -1, you: false, rival: false },
  { rank: 9, name: "Mateo Cruz", handle: "@mcruz", pnl: 4.88, delta: 0, you: false, rival: false },
  { rank: 10, name: "Hannah Yi", handle: "@hyi", pnl: 4.4, delta: -3, you: false, rival: false },
  { rank: 11, name: "Ari Tanaka", handle: "@atanaka", pnl: 4.02, delta: 1, you: false, rival: false },
  { rank: 12, name: "Noah Patel", handle: "@npatel", pnl: 3.88, delta: -1, you: false, rival: false },
  { rank: 13, name: "Zoe Kim", handle: "@zoek", pnl: 3.45, delta: 2, you: false, rival: false },
  { rank: 14, name: "Ethan Ross", handle: "@eross", pnl: 3.11, delta: -2, you: false, rival: false },
  { rank: 15, name: "Sofia Lee", handle: "@sofia", pnl: 2.84, delta: 0, you: false, rival: false },
];

const TEACHERS = [
  { name: "Dr. Sarah Chen", role: "Head of Finance", avatar: "S" },
  { name: "Prof. Michael Kumar", role: "Economics Lead", avatar: "M" },
  { name: "Dr. Lisa Rodriguez", role: "Trading Strategy", avatar: "L" },
];

function SchoolView() {
  const daysLeft = 5;
  const hoursLeft = 14;
  const yourRival = CLASS_LEADERBOARD.find(r => r.rival);
  const youEntry = CLASS_LEADERBOARD.find(r => r.you);

  return (
    <div className="school-grid">
      {/* Header Stats Card */}
      <section className="school-hero">
        <div className="hero-content">
          <div className="hero-stat">
            <span className="stat-label">Your Rank</span>
            <div className="stat-large">{youEntry?.rank || 7}</div>
            <div className="rank-delta">
              <span className={youEntry?.delta > 0 ? "up" : youEntry?.delta < 0 ? "down" : ""}>
                {youEntry?.delta > 0 ? "+" : ""}{youEntry?.delta || 0}
              </span>
            </div>
          </div>

          <div className="hero-stat">
            <span className="stat-label">Your PnL</span>
            <div className="stat-large up">{youEntry?.pnl || 5.74}%</div>
            <span className="stat-note">Week 14</span>
          </div>

          <div className="hero-stat">
            <span className="stat-label">Time Left</span>
            <div className="stat-time">{daysLeft}d {hoursLeft}h</div>
            <span className="stat-note">Until reset</span>
          </div>
        </div>

        {yourRival && (
          <div className="rival-section">
            <div className="rival-header">Your Rival</div>
            <div className="rival-card">
              <div className="rival-avatar">{yourRival.name.charAt(0)}</div>
              <div className="rival-info">
                <div className="rival-name">{yourRival.name}</div>
                <div className="rival-handle">{yourRival.handle}</div>
              </div>
              <div className="rival-pnl">{yourRival.pnl}%</div>
            </div>
          </div>
        )}
      </section>

      {/* Teachers */}
      <section className="school-section">
        <div className="section-header">
          <h3>👨‍🏫 Managing This Class</h3>
        </div>
        <div className="teachers-grid">
          {TEACHERS.map((t) => (
            <div key={t.name} className="teacher-card">
              <div className="teacher-avatar">{t.avatar}</div>
              <div className="teacher-info">
                <div className="teacher-name">{t.name}</div>
                <div className="teacher-role">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Class Leaderboard */}
      <section className="school-section">
        <div className="section-header">
          <h3>📊 Class Leaderboard</h3>
          <span className="section-meta">{CLASS_LEADERBOARD.length} students</span>
        </div>
        <div className="class-leaderboard">
          <div className="leaderboard-header">
            <span className="col-rank">Rank</span>
            <span className="col-trader">Student</span>
            <span className="col-delta">Δ</span>
            <span className="col-pnl">PnL</span>
          </div>
          <div className="leaderboard-rows">
            {CLASS_LEADERBOARD.map((row, i) => (
              <div
                key={row.handle}
                className={`leaderboard-row ${row.you ? "you" : ""} ${row.rival ? "rival" : ""}`}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <span className="col-rank">#{row.rank}</span>
                <div className="col-trader">
                  <div className="trader-avatar-mini">{row.name.charAt(0)}</div>
                  <div className="trader-info-mini">
                    <span className="trader-name-mini">{row.name}</span>
                    <span className="trader-handle-mini">{row.handle}</span>
                  </div>
                </div>
                <span className={`col-delta ${row.delta > 0 ? "up" : row.delta < 0 ? "down" : ""}`}>
                  {row.delta > 0 ? "+" : ""}{row.delta}
                </span>
                <span className={`col-pnl ${row.pnl >= 0 ? "up" : "down"}`}>{row.pnl}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function LearnView() {
  const [lessons] = useState(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i + 1,
      category: ["Risk Management", "Technical Analysis", "Macro Economics", "Portfolio Strategy", "Trading Psychology"][i % 5],
      mastery: Math.floor(Math.random() * 100),
    }));
  });

  const weaknesses = [
    { category: "Macro Economics", mastery: 32, priority: 1 },
    { category: "Trading Psychology", mastery: 45, priority: 2 },
    { category: "Portfolio Strategy", mastery: 52, priority: 3 },
  ];

  const categoryMastery = {
    "Risk Management": 78,
    "Technical Analysis": 82,
    "Macro Economics": 32,
    "Portfolio Strategy": 52,
    "Trading Psychology": 45,
  };

  const overallMastery = Math.round(Object.values(categoryMastery).reduce((a, b) => a + b) / 5);

  const suggestedPath = [
    { lesson: "Macro Economics Fundamentals", category: "Macro Economics", reason: "Lowest mastery" },
    { lesson: "Market Psychology Basics", category: "Trading Psychology", reason: "Critical weakness" },
    { lesson: "Advanced Portfolio Construction", category: "Portfolio Strategy", reason: "Build on foundation" },
  ];

  return (
    <div className="learn-grid">
      {/* Hero Section */}
      <section className="learn-hero">
        <div className="learn-hero-main">
          <div className="learn-stat">
            <span className="stat-label">Overall Mastery</span>
            <div className="stat-huge">{overallMastery}%</div>
          </div>

          <div className="learn-metric">
            <span className="metric-label">Lessons Completed</span>
            <div className="metric-value">{lessons.filter(l => l.mastery > 0).length}/{lessons.length}</div>
            <span className="metric-sub">Keep learning</span>
          </div>

          <div className="learn-metric">
            <span className="metric-label">Streak</span>
            <div className="metric-value">7 days</div>
            <span className="metric-sub">Keep it up!</span>
          </div>

          <div className="learn-metric">
            <span className="metric-label">Time Spent</span>
            <div className="metric-value">12.5h</div>
            <span className="metric-sub">This month</span>
          </div>
        </div>

        {/* Mastery by Category */}
        <div className="learn-categories">
          {Object.entries(categoryMastery).map(([cat, mastery]) => (
            <div key={cat} className="category-card">
              <div className="category-header">
                <span className="category-name">{cat}</span>
                <span className={`category-mastery ${mastery >= 70 ? "up" : mastery >= 50 ? "" : "down"}`}>{mastery}%</span>
              </div>
              <div className="category-bar">
                <div className="category-fill" style={{ width: `${mastery}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Weakpoints & Suggestions */}
      <section className="learn-path-section">
        <div className="path-header">
          <h3>Your Weakpoints</h3>
          <span className="path-meta">Focus on these to improve</span>
        </div>

        <div className="weakpoints-grid">
          {weaknesses.map((w) => (
            <div key={w.category} className="weakness-card">
              <div className="weakness-priority">Priority #{w.priority}</div>
              <div className="weakness-name">{w.category}</div>
              <div className="weakness-mastery">{w.mastery}% mastery</div>
              <button className="btn-start-learning">Start Learning</button>
            </div>
          ))}
        </div>
      </section>

      {/* Suggested Path */}
      <section className="learn-path-section">
        <div className="path-header">
          <h3>📚 Suggested Learning Path</h3>
          <span className="path-meta">Personalized for you</span>
        </div>

        <div className="suggested-path">
          {suggestedPath.map((item, idx) => (
            <div key={item.lesson} className="path-item">
              <div className="path-number">{idx + 1}</div>
              <div className="path-content">
                <div className="path-lesson">{item.lesson}</div>
                <div className="path-reason">{item.reason}</div>
              </div>
              <button className="btn-path-start">Start</button>
            </div>
          ))}
        </div>
      </section>

      {/* All Lessons Grid */}
      <section className="learn-lessons-section">
        <div className="section-header">
          <h3>All Lessons</h3>
          <span className="section-meta">{lessons.length} lessons available</span>
        </div>

        <div className="lessons-full-grid">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="lesson-full-card">
              <div className="lesson-header-full">
                <span className="lesson-category-badge">{lesson.category.split(" ")[0]}</span>
                <span className={`lesson-mastery-badge ${lesson.mastery >= 70 ? "up" : lesson.mastery > 0 ? "" : "muted"}`}>
                  {lesson.mastery > 0 ? `${lesson.mastery}%` : "Start"}
                </span>
              </div>
              <div className="lesson-placeholder">Lesson {lesson.id}</div>
              <button className="btn-lesson-card">{lesson.mastery > 0 ? "Continue" : "Start"}</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PortfolioView() {
  const [selectedPortfolio, setSelectedPortfolio] = useState("independent");

  const portfolios = {
    independent: {
      name: "Independent League",
      totalValue: 125430.50,
      buyingPower: 34560.25,
      pnl: 28500.50,
      pnlPercent: 29.3,
      sharpeRatio: 1.84,
      volatility: 18.3,
      winRate: 68,
      maxGain: 8200,
      maxLoss: -3400,
      ytdReturn: 32.5,
      sortino: 2.12,
      roi: 29.3,
      marginUsed: 12000,
      cashOnHand: 22560.25,
      holdings: 12,
      diversification: 85,
      avgTradeDuration: "4.2 days",
      holdings_list: [
        { symbol: "AAPL", shares: 45, price: 182.50, value: 8212.50, pnl: 1240, pnlPercent: 17.8, dayChange: 1.2, volume: 2.3 },
        { symbol: "NVDA", shares: 28, price: 892.30, value: 24984.40, pnl: 5420, pnlPercent: 27.6, dayChange: 2.1, volume: 1.8 },
        { symbol: "TSLA", shares: 15, price: 245.80, value: 3687.00, pnl: -280, pnlPercent: -7.1, dayChange: -0.5, volume: 0.9 },
        { symbol: "MSFT", shares: 32, price: 412.15, value: 13188.80, pnl: 2340, pnlPercent: 21.5, dayChange: 0.8, volume: 1.5 },
        { symbol: "AMZN", shares: 18, price: 185.42, value: 3337.56, pnl: 420, pnlPercent: 14.4, dayChange: 1.1, volume: 2.2 },
        { symbol: "GOOGL", shares: 22, price: 142.30, value: 3130.60, pnl: 680, pnlPercent: 27.8, dayChange: 0.3, volume: 0.7 },
      ]
    },
    school: {
      name: "School League",
      totalValue: 87250.75,
      buyingPower: 18900.30,
      pnl: 12500.75,
      pnlPercent: 16.7,
      sharpeRatio: 1.52,
      volatility: 14.2,
      winRate: 62,
      maxGain: 5600,
      maxLoss: -2100,
      ytdReturn: 18.5,
      sortino: 1.78,
      roi: 16.7,
      marginUsed: 5000,
      cashOnHand: 13900.30,
      holdings: 8,
      diversification: 72,
      avgTradeDuration: "5.1 days",
      holdings_list: [
        { symbol: "QQQ", shares: 25, price: 380.50, value: 9512.50, pnl: 1820, pnlPercent: 23.6, dayChange: 1.8, volume: 3.2 },
        { symbol: "SPY", shares: 35, price: 445.20, value: 15582.00, pnl: 2340, pnlPercent: 17.6, dayChange: 0.9, volume: 2.1 },
        { symbol: "IWM", shares: 42, price: 198.30, value: 8328.60, pnl: 850, pnlPercent: 11.3, dayChange: -0.2, volume: 1.4 },
        { symbol: "EWJ", shares: 55, price: 24.10, value: 1325.50, pnl: 180, pnlPercent: 15.7, dayChange: 0.6, volume: 0.5 },
      ]
    },
    global: {
      name: "Global League",
      totalValue: 156800.20,
      buyingPower: 42300.90,
      pnl: 38200.80,
      pnlPercent: 32.1,
      sharpeRatio: 1.96,
      volatility: 19.8,
      winRate: 71,
      maxGain: 9850,
      maxLoss: -4100,
      ytdReturn: 35.2,
      sortino: 2.34,
      roi: 32.1,
      marginUsed: 18000,
      cashOnHand: 24300.90,
      holdings: 15,
      diversification: 92,
      avgTradeDuration: "3.8 days",
      holdings_list: [
        { symbol: "AAPL", shares: 60, price: 182.50, value: 10950.00, pnl: 1850, pnlPercent: 20.3, dayChange: 1.2, volume: 2.3 },
        { symbol: "NVDA", shares: 35, price: 892.30, value: 31230.50, pnl: 7200, pnlPercent: 29.9, dayChange: 2.1, volume: 1.8 },
        { symbol: "META", shares: 40, price: 501.20, value: 20048.00, pnl: 4620, pnlPercent: 29.8, dayChange: 2.4, volume: 2.8 },
        { symbol: "NFLX", shares: 25, price: 445.80, value: 11145.00, pnl: 2340, pnlPercent: 26.5, dayChange: 1.9, volume: 1.6 },
        { symbol: "ASML", shares: 18, price: 825.40, value: 14857.20, pnl: 3180, pnlPercent: 27.2, dayChange: 1.5, volume: 1.2 },
      ]
    }
  };

  const current = portfolios[selectedPortfolio];

  const getGraphData = (baseValue) => {
    return Array.from({ length: 20 }, (_, i) => {
      const variation = Math.sin(i * 0.5) * 3 + Math.random() * 2;
      return baseValue + variation;
    });
  };

  return (
    <div className="portfolio-grid">
      {/* Hero Section */}
      <section className="portfolio-hero">
        <div className="portfolio-hero-top">
          <div className="portfolio-stat">
            <span className="stat-label">Total Portfolio Value</span>
            <div className="stat-huge">${(current.totalValue / 1000).toFixed(1)}K</div>
          </div>

          <div className="portfolio-metric">
            <span className="metric-label">Buying Power</span>
            <div className="metric-value">${(current.buyingPower / 1000).toFixed(1)}K</div>
            <span className="metric-sub">Available to trade</span>
          </div>

          <div className="portfolio-metric">
            <span className="metric-label">Total PnL</span>
            <div className={`metric-value ${current.pnl >= 0 ? "up" : "down"}`}>${current.pnl.toLocaleString()}</div>
            <span className="metric-sub">{current.pnlPercent > 0 ? "+" : ""}{current.pnlPercent}%</span>
          </div>

          <div className="portfolio-metric">
            <span className="metric-label">Sharpe Ratio</span>
            <div className="metric-value">{current.sharpeRatio}</div>
            <span className="metric-sub">Risk-adjusted</span>
          </div>

          <div className="portfolio-metric">
            <span className="metric-label">Win Rate</span>
            <div className="metric-value">{current.winRate}%</div>
            <span className="metric-sub">Trades won</span>
          </div>

          <div className="portfolio-metric">
            <span className="metric-label">YTD Return</span>
            <div className="metric-value up">{current.ytdReturn}%</div>
            <span className="metric-sub">Year to date</span>
          </div>
        </div>

        {/* Portfolio Selector */}
        <div className="portfolio-selector">
          {Object.entries(portfolios).map(([key, portfolio]) => (
            <button
              key={key}
              onClick={() => setSelectedPortfolio(key)}
              className={`portfolio-btn ${selectedPortfolio === key ? "active" : ""}`}
            >
              {portfolio.name}
            </button>
          ))}
        </div>

        {/* Detailed Stats Grid */}
        <div className="portfolio-stats-grid">
          <div className="portfolio-stat-item">
            <span className="stat-item-label">Volatility</span>
            <span className="stat-item-value">{current.volatility}%</span>
          </div>
          <div className="portfolio-stat-item">
            <span className="stat-item-label">Sortino Ratio</span>
            <span className="stat-item-value">{current.sortino}</span>
          </div>
          <div className="portfolio-stat-item">
            <span className="stat-item-label">ROI</span>
            <span className="stat-item-value">{current.roi}%</span>
          </div>
          <div className="portfolio-stat-item">
            <span className="stat-item-label">Max Gain</span>
            <span className="stat-item-value up">${current.maxGain.toLocaleString()}</span>
          </div>
          <div className="portfolio-stat-item">
            <span className="stat-item-label">Max Loss</span>
            <span className="stat-item-value down">${current.maxLoss.toLocaleString()}</span>
          </div>
          <div className="portfolio-stat-item">
            <span className="stat-item-label">Margin Used</span>
            <span className="stat-item-value">${(current.marginUsed / 1000).toFixed(1)}K</span>
          </div>
          <div className="portfolio-stat-item">
            <span className="stat-item-label">Cash on Hand</span>
            <span className="stat-item-value">${(current.cashOnHand / 1000).toFixed(1)}K</span>
          </div>
          <div className="portfolio-stat-item">
            <span className="stat-item-label">Holdings</span>
            <span className="stat-item-value">{current.holdings}</span>
          </div>
          <div className="portfolio-stat-item">
            <span className="stat-item-label">Diversification</span>
            <span className="stat-item-value">{current.diversification}%</span>
          </div>
          <div className="portfolio-stat-item">
            <span className="stat-item-label">Avg Trade Duration</span>
            <span className="stat-item-value">{current.avgTradeDuration}</span>
          </div>
        </div>
      </section>

      {/* Holdings Section */}
      <section className="portfolio-holdings-section">
        <div className="section-header">
          <h3>Your Holdings ({current.holdings_list.length} stocks)</h3>
          <span className="section-meta">Performance breakdown</span>
        </div>

        <div className="holdings-list">
          {current.holdings_list.map((holding, idx) => (
            <div key={holding.symbol} className="holding-card" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="holding-header">
                <div className="holding-symbol">{holding.symbol}</div>
                <div className="holding-price-info">
                  <span className="holding-price">${holding.price.toFixed(2)}</span>
                  <span className={`holding-day-change ${holding.dayChange > 0 ? "up" : "down"}`}>
                    {holding.dayChange > 0 ? "+" : ""}{holding.dayChange}%
                  </span>
                </div>
              </div>

              {/* Mini Graph */}
              <div className="holding-graph">
                <svg width="100%" height="60" viewBox="0 0 200 60" preserveAspectRatio="xMidYMid meet">
                  <polyline
                    points={getGraphData(holding.price).map((val, i) => `${i * 10},${60 - (val % 30)}`).join(" ")}
                    fill="none"
                    stroke={holding.pnl > 0 ? "#d4b878" : "#c98c7a"}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>

              <div className="holding-details">
                <div className="detail-row">
                  <span className="detail-label">Shares:</span>
                  <span className="detail-value">{holding.shares}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Value:</span>
                  <span className="detail-value">${holding.value.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Volume:</span>
                  <span className="detail-value">{holding.volume}M</span>
                </div>
              </div>

              <div className="holding-pnl">
                <div className={`holding-pnl-amount ${holding.pnl > 0 ? "up" : "down"}`}>
                  ${Math.abs(holding.pnl).toLocaleString()}
                </div>
                <div className={`holding-pnl-percent ${holding.pnlPercent > 0 ? "up" : "down"}`}>
                  {holding.pnlPercent > 0 ? "+" : ""}{holding.pnlPercent}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const SCHOOL_LEADERBOARD = [
  { rank: 1, school: "Stanford Trading Club", symbol: "STC", pnl: 42.18, members: 48, delta: 2 },
  { rank: 2, school: "MIT Investment Club", symbol: "MIC", pnl: 39.45, members: 56, delta: -1 },
  { rank: 3, school: "Harvard Finance Society", symbol: "HFS", pnl: 37.23, members: 52, delta: 1 },
  { rank: 4, school: "Berkeley Traders", symbol: "BT", pnl: 34.89, members: 41, delta: 0 },
  { rank: 5, school: "Yale Wealth Club", symbol: "YWC", pnl: 32.56, members: 38, delta: 3 },
];

const TOURNAMENT_LEADERBOARD = [
  { rank: 1, name: "Maya Ortega", handle: "@maya.o", pnl: 24.18, tournament: "Spring Classic", delta: 2 },
  { rank: 2, name: "Dreya Reyes", handle: "@dreyes", pnl: 21.45, tournament: "Spring Classic", delta: -1 },
  { rank: 3, name: "Chen Wei", handle: "@chenw", pnl: 19.73, tournament: "Spring Classic", delta: 1 },
  { rank: 4, name: "Sophia Liu", handle: "@sophialiu", pnl: 18.92, tournament: "Spring Classic", delta: 0 },
  { rank: 5, name: "Marcus Johnson", handle: "@mjohnson", pnl: 17.41, tournament: "Spring Classic", delta: 3 },
];

const OPEN_LEAGUES = [
  { name: "Tech Giants Battle", size: 24, spots: 8, level: "Intermediate", prize: "$500", members: 16 },
  { name: "Dividend Warriors", size: 32, spots: 5, level: "Beginner", prize: "$250", members: 27 },
  { name: "Crypto Chariot", size: 16, spots: 12, level: "Advanced", prize: "$1000", members: 4 },
  { name: "Blue Chip Elite", size: 12, spots: 3, level: "Advanced", prize: "$2000", members: 9 },
  { name: "Weekly Grind", size: 64, spots: 18, level: "Beginner", prize: "$100", members: 46 },
];

const LESSONS = [
  { title: "Risk Management 101", category: "Fundamentals", duration: "12 min", difficulty: "Beginner", views: 3200 },
  { title: "Reading Market Momentum", category: "Technical", duration: "18 min", difficulty: "Intermediate", views: 2841 },
  { title: "Portfolio Rebalancing", category: "Strategy", duration: "15 min", difficulty: "Intermediate", views: 2156 },
  { title: "Volatility Trading", category: "Advanced", duration: "22 min", difficulty: "Advanced", views: 1423 },
  { title: "Sector Rotation Patterns", category: "Macro", duration: "20 min", difficulty: "Advanced", views: 987 },
];

function DiscoverView() {
  return (
    <div className="discover-grid">
      <section className="discover-section">
        <div className="section-header">
          <h2>🎓 School Leaderboard</h2>
          <span className="section-meta">Top trading clubs globally</span>
        </div>
        <div className="leaderboard-table">
          <div className="leaderboard-header">
            <span className="col-rank">Rank</span>
            <span className="col-school">School</span>
            <span className="col-members">Members</span>
            <span className="col-delta">Delta</span>
            <span className="col-pnl">PnL</span>
          </div>
          {SCHOOL_LEADERBOARD.map((item) => (
            <div key={item.rank} className="leaderboard-row">
              <span className="col-rank">#{item.rank}</span>
              <div className="col-school">
                <div className="school-badge">{item.symbol}</div>
                <div className="school-info">
                  <span className="school-name">{item.school}</span>
                </div>
              </div>
              <span className="col-members">{item.members}</span>
              <span className={`col-delta ${item.delta > 0 ? "up" : item.delta < 0 ? "down" : ""}`}>
                {item.delta > 0 ? "+" : ""}{item.delta}
              </span>
              <span className="col-pnl up">{item.pnl}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="discover-section">
        <div className="section-header">
          <h2>🏆 Tournament Leaders</h2>
          <span className="section-meta">Spring Classic top performers</span>
        </div>
        <div className="leaderboard-table">
          <div className="leaderboard-header">
            <span className="col-rank">Rank</span>
            <span className="col-name">Trader</span>
            <span className="col-tournament">Tournament</span>
            <span className="col-delta">Delta</span>
            <span className="col-pnl">PnL</span>
          </div>
          {TOURNAMENT_LEADERBOARD.map((item) => (
            <div key={item.rank} className="leaderboard-row">
              <span className="col-rank">#{item.rank}</span>
              <div className="col-name">
                <div className="trader-avatar-small">{item.name.charAt(0)}</div>
                <div className="trader-info">
                  <span className="trader-name">{item.name}</span>
                  <span className="trader-handle">{item.handle}</span>
                </div>
              </div>
              <span className="col-tournament">{item.tournament}</span>
              <span className={`col-delta ${item.delta > 0 ? "up" : item.delta < 0 ? "down" : ""}`}>
                {item.delta > 0 ? "+" : ""}{item.delta}
              </span>
              <span className="col-pnl up">{item.pnl}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="discover-section">
        <div className="section-header">
          <h2>🏆 Open Leagues</h2>
          <span className="section-meta">Join and start competing</span>
        </div>
        <div className="leagues-list">
          {OPEN_LEAGUES.map((l, i) => (
            <div key={l.name} className="league-card" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="league-header">
                <div className="league-info">
                  <h3 className="league-name">{l.name}</h3>
                  <p className="league-level">{l.level}</p>
                </div>
                <div className="league-badge">{l.prize}</div>
              </div>
              
              <div className="league-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(l.members / l.size) * 100}%` }} />
                </div>
                <span className="progress-text">{l.members}/{l.size} members</span>
              </div>

              <div className="league-footer">
                <div className="league-meta">
                  <span className="meta-item">📍 {l.spots} spots left</span>
                  <span className="meta-item">⏱ Weekly</span>
                </div>
                <button className="btn-join">Join</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="discover-section">
        <div className="section-header">
          <h2>📚 Lessons & Insights</h2>
          <span className="section-meta">Learn from the best</span>
        </div>
        <div className="lessons-grid">
          {LESSONS.map((l, i) => (
            <div key={l.title} className="lesson-card" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="lesson-header">
                <div className="lesson-category">{l.category}</div>
                <div className={`lesson-difficulty ${l.difficulty.toLowerCase()}`}>{l.difficulty}</div>
              </div>
              
              <h3 className="lesson-title">{l.title}</h3>
              
              <div className="lesson-meta">
                <span className="meta">⏱ {l.duration}</span>
                <span className="meta">👁 {l.views.toLocaleString()} views</span>
              </div>

              <button className="btn-lesson">Watch Lesson</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;