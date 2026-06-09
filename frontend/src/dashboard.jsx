import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUser, logout } from "./auth";
import "./dashboard.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8001";

function sanitizeHandle(name) {
  return `@${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 10) || "new"}`;
}



const STOCK_COMPANY_NAMES = {
  AAPL: "Apple Inc.",
  NVDA: "NVIDIA Corporation",
  TSLA: "Tesla, Inc.",
  MSFT: "Microsoft Corporation",
  AMZN: "Amazon.com, Inc.",
  META: "Meta Platforms, Inc.",
  GOOGL: "Alphabet Inc.",
  BRKB: "Berkshire Hathaway Inc.",
  "BRK.B": "Berkshire Hathaway Inc.",
  JPM: "JPMorgan Chase & Co.",
  V: "Visa Inc.",
  SHOP: "Shopify Inc.",
  BABA: "Alibaba Group Holding Ltd.",
  TSM: "Taiwan Semiconductor Manufacturing Company Limited",
  ASML: "ASML Holding N.V.",
  NFLX: "Netflix, Inc.",
  ORCL: "Oracle Corporation",
  XOM: "Exxon Mobil Corporation",
  CVX: "Chevron Corporation",
  IBM: "International Business Machines Corporation",
  DIS: "The Walt Disney Company",
  BIIB: "Biogen Inc.",
  LULU: "Lululemon Athletica Inc.",
};

function getCompanyName(ticker) {
  return STOCK_COMPANY_NAMES[ticker] || "Public Company";
}

function buildDashboardUser(email) {
  const localName = email?.split("@")[0] || "new trader";
  const name = localName
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") || "New Trader";

  return {
    name,
    handle: sanitizeHandle(name),
    email,
  };
}

function getDefaultDashboardState(user) {
  const baseBoard = SEED.map((row) => ({ ...row, rival: row.rival || false, you: false }));
  const youRow = {
    rank: baseBoard.length + 1,
    name: user.name,
    handle: user.handle,
    pnl: 0,
    delta: 0,
    you: true,
    rival: false,
  };

  const board = [...baseBoard, youRow].sort((a, b) => b.pnl - a.pnl || a.rank - b.rank);
  board.forEach((row, index) => {
    row.rank = index + 1;
  });

  const classBoard = CLASS_LEADERBOARD.map((row) => ({ ...row, you: false, rival: row.rival || false }));
  classBoard.push({
    rank: classBoard.length + 1,
    name: user.name,
    handle: user.handle,
    pnl: 0,
    delta: 0,
    you: true,
    rival: false,
  });

  const learnLessons = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    category: [
      "Risk Management",
      "Technical Analysis",
      "Macro Economics",
      "Portfolio Strategy",
      "Trading Psychology",
    ][i % 5],
    mastery: 0,
  }));

  return {
    profile: {
      totalPortfolioValue: 100000,
      buyingPower: 100000,
      weeklyReturn: 0,
      seasonPnl: 0,
      volatility: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      rank: board.find((row) => row.you)?.rank ?? board.length,
      delta: 0,
      followers: 0,
      following: 0,
      profileViews: 0,
      level: "Beginner",
      bio: "New trader building experience.",
    },
    league: {
      board,
      hero: {
        rank: board.find((row) => row.you)?.rank ?? board.length,
        weeklyReturn: 0,
        seasonPnl: 0,
        volatility: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        delta: 0,
      },
      feed: FEED_TEMPLATES.slice(0, 6),
      leagues: [],
      openLeagues: [
        { id: "OL-1", name: "Tech Giants Battle", size: 24, spots: 8, level: "Independent", prize: "$500", members: 16 },
        { id: "OL-2", name: "Campus Showdown", size: 30, spots: 10, level: "School", prize: "$750", members: 20 },
        { id: "OL-3", name: "Global Masters", size: 40, spots: 12, level: "Global", prize: "$1200", members: 10 },
      ],
    },
    school: {
      classBoard,
      inLeague: false,
      stats: {
        rank: classBoard.find((row) => row.you)?.rank ?? classBoard.length,
        pnl: 0,
        delta: 0,
        timeLeftDays: 5,
        timeLeftHours: 14,
      },
    },
    learn: {
      lessons: learnLessons,
      categoryMastery: {
        "Risk Management": 0,
        "Technical Analysis": 0,
        "Macro Economics": 0,
        "Portfolio Strategy": 0,
        "Trading Psychology": 0,
      },
      weaknesses: [
        { category: "Macro Economics", mastery: 0, priority: 1 },
        { category: "Trading Psychology", mastery: 0, priority: 2 },
        { category: "Portfolio Strategy", mastery: 0, priority: 3 },
      ],
      overallMastery: 0,
      suggestedPath: [
        { lesson: "Macro Economics Fundamentals", category: "Macro Economics", reason: "Lowest mastery" },
        { lesson: "Market Psychology Basics", category: "Trading Psychology", reason: "Critical weakness" },
        { lesson: "Advanced Portfolio Construction", category: "Portfolio Strategy", reason: "Build on foundation" },
      ],
    },
    portfolio: {
      independent: {
        name: "Independent League",
        totalValue: 100000,
        buyingPower: 100000,
        pnl: 0,
        pnlPercent: 0,
        sharpeRatio: 0,
        volatility: 0,
        winRate: 0,
        beta: 1.0,
        alpha: 0,
        ytdReturn: 0,
        sortino: 0,
        roi: 0,
        marginUsed: 0,
        cashOnHand: 100000,
        holdings: 0,
        informationRatio: 0,
        calmarRatio: 0,
        holdings_list: [],
      },
      school: {
        name: "School League",
        totalValue: 100000,
        buyingPower: 100000,
        pnl: 0,
        pnlPercent: 0,
        sharpeRatio: 0,
        volatility: 0,
        winRate: 0,
        beta: 1.0,
        alpha: 0,
        ytdReturn: 0,
        sortino: 0,
        roi: 0,
        marginUsed: 0,
        cashOnHand: 100000,
        holdings: 0,
        informationRatio: 0,
        calmarRatio: 0,
        holdings_list: [],
      },
      global: {
        name: "Global League",
        totalValue: 100000,
        buyingPower: 100000,
        pnl: 0,
        pnlPercent: 0,
        sharpeRatio: 0,
        volatility: 0,
        winRate: 0,
        beta: 1.0,
        alpha: 0,
        ytdReturn: 0,
        sortino: 0,
        roi: 0,
        marginUsed: 0,
        cashOnHand: 100000,
        holdings: 0,
        informationRatio: 0,
        calmarRatio: 0,
        holdings_list: [],
      },
    },
  };
}

async function fetchDashboardState(email, user) {
  if (!email) return getDefaultDashboardState(user);
  try {
    const response = await fetch(`${API_BASE}/api/dashboard/state?email=${encodeURIComponent(email)}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    // fallback to local state if backend unavailable
  }
  return getDefaultDashboardState(user);
}

async function persistDashboardState(email, state) {
  if (!email || !state) return;
  try {
    await fetch(`${API_BASE}/api/dashboard/state`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, state }),
    });
  } catch (error) {
    // Backend update is best-effort
  }
}

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
  const [dashboardState, setDashboardState] = useState(null);

  const dashboardKey = useMemo(
    () => user?.email ? `quantis.dashboard.${user.email}` : null,
    [user]
  );

  useEffect(() => {
    const current = getCurrentUser();
    if (!current?.email) {
      navigate("/onboarding");
      return;
    }

    const profile = buildDashboardUser(current.email);
    setUser(profile);

    if (!dashboardKey) return;

    const savedState = localStorage.getItem(dashboardKey);
    if (savedState) {
      try {
        setDashboardState(JSON.parse(savedState));
        return;
      } catch (error) {
        // continue to fresh load
      }
    }

    (async () => {
      const state = await fetchDashboardState(current.email, profile);
      setDashboardState(state);
      localStorage.setItem(dashboardKey, JSON.stringify(state));
    })();
  }, [navigate, dashboardKey]);

  const handleUpdateDashboardState = (updater) => {
    setDashboardState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (dashboardKey) {
        localStorage.setItem(dashboardKey, JSON.stringify(next));
      }
      if (user?.email) {
        persistDashboardState(user.email, next);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!user || !dashboardState || !dashboardKey) return;
    localStorage.setItem(dashboardKey, JSON.stringify(dashboardState));
    persistDashboardState(user.email, dashboardState);
  }, [dashboardState, dashboardKey, user]);

  if (!user || !dashboardState) return null;

  return (
    <div className="dash">
      <div className="dash-bg" aria-hidden />
      <TopBar user={user} onSignOut={() => { logout(); navigate("/"); }} />
      <Ticker />

      <main className="dash-main">
        {tab === "league" && <LeagueView user={user} data={dashboardState} onStateChange={handleUpdateDashboardState} />}
        {tab === "school" && <SchoolView data={dashboardState} />}
        {tab === "learn" && <LearnView data={dashboardState} />}
        {tab === "portfolio" && <PortfolioView data={dashboardState} user={user} onStateChange={handleUpdateDashboardState} />}
        {tab === "discover" && <DiscoverView data={dashboardState} onStateChange={handleUpdateDashboardState} />}
      </main>

      <BottomTabs active={tab} onChange={setTab} />
    </div>
  );
}

function TopBar({ user, onSignOut }) {
  const [open, setOpen] = useState(false);
  const avatarLetter = useMemo(() => {
    if (user?.email) {
      const match = user.email.trim().match(/[a-zA-Z]/);
      if (match) return match[0].toUpperCase();
    }
    return user?.name?.charAt(0).toUpperCase() || "Q";
  }, [user]);

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-dot" />
        <span>QUANTIS</span>
      </div>

      <button className="topbar-avatar" onClick={() => setOpen(v => !v)}>
        {avatarLetter}
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
  const [tickerData, setTickerData] = useState(TICKER);

  useEffect(() => {
    let isMounted = true;

    async function fetchTicker() {
      try {
        const res = await fetch(`${API_BASE}/api/stocks/ticker`);
        if (!res.ok) throw new Error("Failed to fetch ticker");
        const data = await res.json();

        if (isMounted && Array.isArray(data)) {
          setTickerData(data);
        }
      } catch (err) {
        // fallback silently to default TICKER to prevent crash
        console.warn("Ticker fetch failed, using fallback data");
      }
    }

    fetchTicker();
    const interval = setInterval(fetchTicker, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="ticker">
      <div className="ticker-track">
        {[...tickerData, ...tickerData].map((t, i) => (
          <span key={i} className={`tk ${t.p && t.p.startsWith("+") ? "up" : "down"}`}>
            <b>{t.s || "N/A"}</b> {t.p || "0.00%"}
          </span>
        ))}
      </div>
    </div>
  );
}

function LeagueView({ user, data, onStateChange }) {
  const defaultBoard = data?.league?.board ?? SEED.map((row) => ({ ...row, rival: row.rival || false, you: false }));
  const [board, setBoard] = useState(defaultBoard);
  const [feed, setFeed] = useState(data?.league?.feed ?? FEED_TEMPLATES.slice(0, 6));
  const [userLeagues, setUserLeagues] = useState(data?.league?.leagues ?? []);
  const [openLeagues, setOpenLeagues] = useState(data?.league?.openLeagues ?? []);
  const [createOpen, setCreateOpen] = useState(false);
  const [leagueForm, setLeagueForm] = useState({
    name: "New League",
    type: "independent",
    startingCash: 100000,
    maxMembers: 20,
    durationDays: 7,
  });

  useEffect(() => {
    if (data?.league) {
      setBoard(data.league.board);
      setFeed(data.league.feed ?? FEED_TEMPLATES.slice(0, 6));
      setUserLeagues(data.league.leagues ?? []);
      setOpenLeagues(data.league.openLeagues ?? []);
    }
  }, [data]);

  useEffect(() => {
    const id = setInterval(() => {
      setFeed((prev) => {
        const next = FEED_TEMPLATES[Math.floor(Math.random() * FEED_TEMPLATES.length)];
        return [next, ...prev].slice(0, 8);
      });
    }, 3000);

    return () => clearInterval(id);
  }, []);

  const hero = data?.league?.hero ?? {
    rank: board.find((row) => row.you)?.rank ?? board.length,
    weeklyReturn: 0,
    seasonPnl: 0,
    volatility: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    delta: 0,
  };

  const yourRival = board.find((r) => r.rival);

  const saveLocalLeagueState = (nextState) => {
    setUserLeagues(nextState.league.leagues ?? []);
    setOpenLeagues(nextState.league.openLeagues ?? []);
    setBoard(nextState.league.board ?? board);
    setFeed(nextState.league.feed ?? feed);
    if (onStateChange) onStateChange(nextState);
  };

  const createLeague = async () => {
    const nextLeague = {
      name: leagueForm.name,
      type: leagueForm.type,
      startingCash: Number(leagueForm.startingCash) || 100000,
      maxMembers: Math.min(100, Math.max(2, Number(leagueForm.maxMembers) || 20)),
      durationDays: Number(leagueForm.durationDays) || 7,
    };

    try {
      const response = await fetch(`${API_BASE}/api/leagues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, league: nextLeague }),
      });
      if (!response.ok) throw new Error("Failed to create league");
      const nextState = await response.json();
      saveLocalLeagueState(nextState);
      setCreateOpen(false);
      setLeagueForm({ name: "New League", type: "independent", startingCash: 100000, maxMembers: 20, durationDays: 7 });
      return;
    } catch (err) {
      const fallbackState = {
        ...data,
        league: {
          ...data?.league,
          leagues: [
            {
              id: `L-${Date.now()}`,
              name: nextLeague.name,
              type: nextLeague.type,
              startingCash: nextLeague.startingCash,
              maxMembers: nextLeague.maxMembers,
              durationDays: nextLeague.durationDays,
              createdAt: new Date().toISOString(),
              owner: user.email,
              members: [user.email],
              invitees: [],
              status: "active",
            },
            ...(data?.league?.leagues || []),
          ],
        },
      };
      saveLocalLeagueState(fallbackState);
      setCreateOpen(false);
    }
  };

  const inviteToLeague = async (leagueId) => {
    const invitee = window.prompt("Enter email to invite:");
    if (!invitee) return;

    try {
      const response = await fetch(`${API_BASE}/api/leagues/${leagueId}/invite`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, invitee }),
      });
      if (!response.ok) throw new Error("Invite failed");
      const nextState = await response.json();
      saveLocalLeagueState(nextState);
      return;
    } catch (err) {
      window.alert("Unable to send invite, but your league is still saved locally.");
    }
  };

  return (
    <div className="league-grid">
      {/* Hero Stats */}
      <section className="league-hero">
        <div className="hero-main">
          <div className="hero-rank-section">
            <div className="hero-stat">
              <span className="stat-label">League Rank</span>
              <div className="delta-badge">#{hero.rank}</div>
            </div>
            <div className="hero-delta">
              <span className="delta-label">Change</span>
              <div className={`delta-badge ${hero.delta >= 0 ? "up" : "down"}`}>
                {hero.delta >= 0 ? "+" : ""}{hero.delta}
              </div>
            </div>
          </div>

          <div className="hero-metric">
            <span className="metric-label">Weekly Return</span>
            <div className={`metric-value ${hero.weeklyReturn >= 0 ? "up" : "down"}`}>{hero.weeklyReturn.toFixed(2)}%</div>
          </div>

          <div className="hero-metric">
            <span className="metric-label">Season PnL</span>
            <div className={`metric-value ${hero.seasonPnl >= 0 ? "up" : "down"}`}>{hero.seasonPnl.toFixed(1)}%</div>
          </div>

          <div className="hero-metric">
            <span className="metric-label">Volatility</span>
            <div className="metric-value">{hero.volatility.toFixed(1)}%</div>
            <span className="metric-sub">This week</span>
          </div>

          <div className="hero-metric">
            <span className="metric-label">Max Drawdown</span>
            <div className="metric-value">{hero.maxDrawdown.toFixed(1)}%</div>
            <span className="metric-sub">Season low</span>
          </div>

          <div className="hero-metric">
            <span className="metric-label">Sharpe Ratio</span>
            <div className="metric-value">{hero.sharpeRatio.toFixed(2)}</div>
            <span className="metric-sub">Risk-adjusted return</span>
          </div>
        </div>

        <div className="rival-section-league">
          <div className="rival-header">⚔️ Your Rival</div>
          <div className="rival-card-league">
            <div className="rival-card-header">
              <div className="rival-avatar">{yourRival ? yourRival.name.charAt(0) : "N/A"}</div>
              <div className="rival-info">
                <div className="rival-name">{yourRival?.name ?? "N/A"}</div>
                <div className="rival-handle">{yourRival?.handle ?? "N/A"}</div>
              </div>
            </div>
            <div className="rival-stats">
              <div className="rival-stat-item">
                <span className="rival-stat-label">Rank</span>
                <span className="rival-stat-value">{yourRival ? `#${yourRival.rank}` : "N/A"}</span>
              </div>
              <div className="rival-stat-item">
                <span className="rival-stat-label">PnL</span>
                <span className={`rival-stat-value ${yourRival ? (yourRival.pnl >= 0 ? "up" : "down") : ""}`}>{yourRival ? `${yourRival.pnl}%` : "N/A"}</span>
              </div>
              <div className="rival-stat-item">
                <span className="rival-stat-label">Δ</span>
                <span className={`rival-stat-value ${yourRival ? (yourRival.delta >= 0 ? "up" : "down") : ""}`}>{yourRival ? `${yourRival.delta >= 0 ? "+" : ""}${yourRival.delta}` : "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="league-grid-section">
        <div className="section-header">
          <h3>Your Active Leagues</h3>
          <button className="btn-primary-small" onClick={() => setCreateOpen(true)}>+ Create League</button>
        </div>

        {userLeagues.length === 0 ? (
          <div className="empty-card">
            <div className="empty-card-title">No leagues created yet</div>
            <div className="empty-card-copy">Create an independent or school league and invite your first members.</div>
            <button className="btn-primary-small" onClick={() => setCreateOpen(true)}>Create a league</button>
          </div>
        ) : (
          <div className="league-mini-cards">
            {userLeagues.map((league) => (
              <div key={league.id} className="league-mini-card">
                <div className="mini-header">
                  <div className="mini-rank">{league.type === "school" ? "School" : "Ind"}</div>
                  <div className="mini-pnl">{league.members.length}/{league.maxMembers}</div>
                </div>
                <div className="mini-name">{league.name}</div>
                <div className="mini-meta">
                  <span className="mini-delta">{league.durationDays}d</span>
                  <button className="btn-link" onClick={() => inviteToLeague(league.id)}>Invite</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {createOpen && (
        <div className="modal-overlay" onClick={() => setCreateOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create League</h3>
              <button className="modal-close" onClick={() => setCreateOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <label>
                League name
                <input
                  value={leagueForm.name}
                  onChange={(e) => setLeagueForm({ ...leagueForm, name: e.target.value })}
                />
              </label>
              <label>
                League type
                <select
                  value={leagueForm.type}
                  onChange={(e) => setLeagueForm({ ...leagueForm, type: e.target.value })}
                >
                  <option value="independent">Independent</option>
                  <option value="school">School</option>
                </select>
              </label>
              <label>
                Starting cash
                <input
                  type="number"
                  value={leagueForm.startingCash}
                  onChange={(e) => setLeagueForm({ ...leagueForm, startingCash: Number(e.target.value) })}
                />
              </label>
              <label>
                Max members
                <input
                  type="number"
                  value={leagueForm.maxMembers}
                  onChange={(e) => setLeagueForm({ ...leagueForm, maxMembers: Number(e.target.value) })}
                  min={2}
                  max={100}
                />
              </label>
              <label>
                Duration (days)
                <input
                  type="number"
                  value={leagueForm.durationDays}
                  onChange={(e) => setLeagueForm({ ...leagueForm, durationDays: Number(e.target.value) })}
                  min={1}
                  max={30}
                />
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setCreateOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={createLeague}>Save league</button>
            </div>
          </div>
        </div>
      )}

      <section className="league-grid-section">
        <div className="section-header">
          <h3>Open leagues</h3>
          <span className="section-meta">Browse leagues available to join</span>
        </div>
        {openLeagues.length === 0 ? (
          <div className="empty-card">
            <div className="empty-card-title">No open leagues at this time</div>
            <div className="empty-card-copy">Create a league to start recruiting members and competing.</div>
            <button className="btn-primary-small" onClick={() => setCreateOpen(true)}>Create a league</button>
          </div>
        ) : (
          <div className="league-list">
            {openLeagues.map((league) => (
              <div key={league.id} className="league-card">
                <div className="league-card-head">
                  <div>
                    <div className="league-name">{league.name}</div>
                    <div className="league-level">{league.level}</div>
                  </div>
                  <div className="league-badge">{league.prize}</div>
                </div>
                <div className="league-card-body">
                  <span>{league.members}/{league.size} members</span>
                  <span>{league.spots} spots left</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Main Leaderboard */}
      <section className="league-main-section">
        {board.length === 0 ? (
          <div className="empty-card">
            <div className="empty-card-title">Not in a leaderboard yet</div>
            <div className="empty-card-copy">Join or create a league to start competing on the leaderboard.</div>
            <button className="btn-primary" onClick={() => setCreateOpen(true)}>Create a league</button>
          </div>
        ) : (
          <div className="card hero-card">
            <div className="card-head">
              <h2>Live leaderboard</h2>
              <span className="pill">Week 14 · closing in 2d 14h</span>
            </div>
            <ol className="lb">
              {board.map((r) => (
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
        )}
      </section>
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
          style={{ transform: `translateX(${activeIdx * 98}%)` }}
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

function SchoolView({ data }) {
  const classBoard = data?.school?.classBoard ?? CLASS_LEADERBOARD;
  const inLeague = data?.school?.inLeague ?? false;
  const stats = data?.school?.stats ?? {
    rank: classBoard.find((r) => r.you)?.rank ?? classBoard.length,
    pnl: 0,
    delta: 0,
    timeLeftDays: 5,
    timeLeftHours: 14,
  };
  const yourRival = inLeague ? classBoard.find((r) => r.rival) : null;

  return (
    <div className="school-grid">
      {/* Header Stats Card */}
      <section className="school-hero">
        <div className="hero-content">
          <div className="hero-stat">
            <span className="stat-label">Your Rank</span>
            <div className="stat-large">{inLeague ? stats.rank : 0}</div>
            <div className="rank-delta">
              <span className={stats.delta > 0 ? "up" : stats.delta < 0 ? "down" : ""}>
                {inLeague ? (stats.delta > 0 ? "+" : "") + stats.delta : "0"}
              </span>
            </div>
          </div>

          <div className="hero-stat">
            <span className="stat-label">Your PnL</span>
            <div className={`stat-large ${stats.pnl >= 0 ? "up" : "down"}`}>{inLeague ? `${stats.pnl}%` : "0%"}</div>
            <span className="stat-note">Week 14</span>
          </div>

          <div className="hero-stat">
            <span className="stat-label">Time Left</span>
            <div className="stat-time">{inLeague ? `${stats.timeLeftDays}d ${stats.timeLeftHours}h` : "0d 0h"}</div>
            <span className="stat-note">Until reset</span>
          </div>
        </div>

        <div className="rival-section">
          <div className="rival-header">Your Rival</div>
          <div className="rival-card">
            <div className="rival-avatar">{inLeague && yourRival ? yourRival.name.charAt(0) : "N/A"}</div>
            <div className="rival-info">
              <div className="rival-name">{inLeague && yourRival ? yourRival.name : "N/A"}</div>
              <div className="rival-handle">{inLeague && yourRival ? yourRival.handle : "N/A"}</div>
            </div>
            <div className="rival-pnl">{inLeague && yourRival ? `${yourRival.pnl}%` : "N/A"}</div>
          </div>
        </div>
      </section>

      {!inLeague ? (
        <section className="school-section school-empty-state">
          <div className="empty-card">
            <div className="empty-card-title">Not in a school league yet</div>
            <div className="empty-card-copy">
              Join a school league to unlock class rankings, rivals, and teacher insights.
            </div>
            <button className="btn-primary" onClick={() => window.alert("Join a league flow coming soon")}>Join a league</button>
          </div>
        </section>
      ) : (
        <>
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
              <span className="section-meta">{classBoard.length} students</span>
            </div>
            <div className="class-leaderboard">
              <div className="leaderboard-header">
                <span className="col-rank">Rank</span>
                <span className="col-trader">Student</span>
                <span className="col-delta">Δ</span>
                <span className="col-pnl">PnL</span>
              </div>
              <div className="leaderboard-rows">
                {classBoard.map((row, i) => (
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
        </>
      )}
    </div>
  );  
}

function LearnView({ data }) {
  const lessons = data?.learn?.lessons ?? Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    category: ["Risk Management", "Technical Analysis", "Macro Economics", "Portfolio Strategy", "Trading Psychology"][i % 5],
    mastery: 0,
  }));

  const weaknesses = data?.learn?.weaknesses ?? [
    { category: "Macro Economics", mastery: 0, priority: 1 },
    { category: "Trading Psychology", mastery: 0, priority: 2 },
    { category: "Portfolio Strategy", mastery: 0, priority: 3 },
  ];

  const categoryMastery = data?.learn?.categoryMastery ?? {
    "Risk Management": 0,
    "Technical Analysis": 0,
    "Macro Economics": 0,
    "Portfolio Strategy": 0,
    "Trading Psychology": 0,
  };

  const overallMastery = data?.learn?.overallMastery ?? Math.round(Object.values(categoryMastery).reduce((a, b) => a + b) / 5);

  const suggestedPath = data?.learn?.suggestedPath ?? [
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

      {/* lessons removed per request */}
    </div>
  );
}

const PORTFOLIO_POLL_MS = 2000;
const CHART_WINDOW_12H = 144;

function catmullRom2bezier(points) {
  if (!points || points.length === 0) return "";
  if (points.length === 1) return `M ${points[0][0]},${points[0][1]}`;
  const cr = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const x1 = p1[0] + (p2[0] - p0[0]) / 6;
    const y1 = p1[1] + (p2[1] - p0[1]) / 6;
    const x2 = p2[0] - (p3[0] - p1[0]) / 6;
    const y2 = p2[1] - (p3[1] - p1[1]) / 6;
    if (i === 0) cr.push(`M ${p1[0]},${p1[1]} C ${x1},${y1} ${x2},${y2} ${p2[0]},${p2[1]}`);
    else cr.push(`C ${x1},${y1} ${x2},${y2} ${p2[0]},${p2[1]}`);
  }
  return cr.join(" ");
}

function getSmoothPath(points) {
  if (!points || points.length === 0) return "";
  return catmullRom2bezier(points);
}

function historyToPath(history) {
  if (!history?.length) return "";
  const min = Math.min(...history);
  const max = Math.max(...history, min + 1);
  const range = Math.max(max - min, 0.0001);
  const points = history.map((value, index) => {
    const x = (index / Math.max(history.length - 1, 1)) * 220;
    const y = 76 - ((value - min) / range) * 68;
    return [x, y];
  });
  return getSmoothPath(points);
}

function RollingDigit({ digit }) {
  if (!/\d/.test(digit)) {
    return <span className="rolling-char static">{digit}</span>;
  }

  const target = parseInt(digit, 10);

  return (
    <span className="rolling-digit">
      <span
        className="rolling-digit-track"
        style={{ transform: `translateY(-${target * 10}%)` }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="rolling-digit-num">{n}</span>
        ))}
      </span>
    </span>
  );
}

function RollingNumber({ value, format, className = "" }) {
  const formatted = format(value);
  const prevRef = useRef(formatted);
  const [ticking, setTicking] = useState(false);

  useEffect(() => {
    if (formatted === prevRef.current) return;
    prevRef.current = formatted;
    setTicking(true);
    const timer = setTimeout(() => setTicking(false), 400);
    return () => clearTimeout(timer);
  }, [formatted]);

  return (
    <span className={`rolling-number ${ticking ? "tick" : ""} ${className}`.trim()}>
      {formatted.split("").map((char, i) => (
        <RollingDigit key={i} digit={char} />
      ))}
    </span>
  );
}

function ScrollingChart({ history, stroke = "#d4b878", small = false }) {
  const scrollKey = history?.length ? `${history.length}-${history[history.length - 1]}` : "empty";
  const path = useMemo(() => historyToPath(history), [history]);

  if (!history?.length) return null;

  return (
    <div className="scrolling-chart-viewport">
      <svg viewBox="0 0 220 80" preserveAspectRatio="none" className={`smooth-chart ${small ? "small" : ""}`}>
        <defs>
          <linearGradient id={`gradient-${scrollKey}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <g key={scrollKey} className="scrolling-chart-layer">
          <path
            d={path}
            fill={`url(#gradient-${scrollKey})`}
            stroke="none"
            className={`chart-fill ${small ? "small" : ""}`}
          />
          <path
            d={path}
            fill="none"
            stroke={stroke}
            strokeWidth={small ? 2.2 : 2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`chart-path ${small ? "small" : ""}`}
          />
        </g>
      </svg>
    </div>
  );
}

function useLiveChartSeries(quotesByKey, keys) {
  const [seriesMap, setSeriesMap] = useState({});

  const quoteSignature = useMemo(
    () => keys.map((key) => {
      const quote = quotesByKey[key];
      const price = quote?.history?.length
        ? quote.history[quote.history.length - 1]
        : quote?.price;
      const histLen = quote?.history?.length ?? 0;
      return `${key}:${price ?? "na"}:${histLen}`;
    }).join("|"),
    [keys, quotesByKey]
  );

  useEffect(() => {
    if (!keys.length) {
      setSeriesMap({});
      return;
    }

    setSeriesMap((prev) => {
      const next = { ...prev };
      let changed = false;

      keys.forEach((key) => {
        const quote = quotesByKey[key];
        if (!quote) return;

        const price = quote.history?.length
          ? quote.history[quote.history.length - 1]
          : quote.price;
        if (price == null || Number.isNaN(price)) return;

        const base = next[key] ?? [];
const last = base[base.length - 1];

if (last === price) return;

next[key] = [...base, price].slice(-144);
changed = true;
      });

      return changed ? next : prev;
    });
  }, [quoteSignature, keys, quotesByKey]);

  return seriesMap;
}

const fmtK = (v) => `$${(Number(v) / 1000).toFixed(1)}K`;
const fmtUsd = (v) => `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const fmtUsd2 = (v) => `$${Number(v).toFixed(2)}`;
const fmtPct = (v, d = 1) => `${Number(v) > 0 ? "+" : ""}${Number(v).toFixed(d)}%`;
const fmtNum = (v, d = 1) => Number(v).toFixed(d);
const fmtInt = (v) => Number(v).toLocaleString();
const fmtCompact = (v) => {
  const num = Number(v);
  if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
};

function PortfolioView({ data, user, onStateChange }) {
  const [selectedPortfolio, setSelectedPortfolio] = useState("independent");
  const [tradeTicker, setTradeTicker] = useState("AAPL");
  const [tradeQuantity, setTradeQuantity] = useState(1);
  const [stockData, setStockData] = useState(null);
  const [holdingQuotes, setHoldingQuotes] = useState({});
  const [livePortfolio, setLivePortfolio] = useState(null);
  const [tradeStatus, setTradeStatus] = useState("");
  const [isTrading, setIsTrading] = useState(false);

  const defaultPortfolioTemplate = {
    totalValue: 100000,
    buyingPower: 100000,
    pnl: 0,
    pnlPercent: 0,
    sharpeRatio: 0,
    volatility: 0,
    winRate: 0,
    beta: 1.0,
    alpha: 0,
    ytdReturn: 0,
    sortino: 0,
    roi: 0,
    marginUsed: 0,
    cashOnHand: 100000,
    holdings: 0,
    informationRatio: 0,
    calmarRatio: 0,
    holdings_list: [],
  };

  const portfolios = {
    independent: data?.portfolio?.independent ?? {
      ...defaultPortfolioTemplate,
      name: "Independent League",
    },
    school: data?.portfolio?.school ?? {
      ...defaultPortfolioTemplate,
      name: "School League",
    },
    global: data?.portfolio?.global ?? {
      ...defaultPortfolioTemplate,
      name: "Global League",
    },
  };

  const current = livePortfolio ?? portfolios[selectedPortfolio];

  useEffect(() => {
    setLivePortfolio(null);
  }, [selectedPortfolio]);

  const holdingSymbols = useMemo(
    () => current.holdings_list.map((holding) => holding.symbol || holding.ticker).filter(Boolean),
    [current.holdings_list]
  );

  const holdingSymbolsKey = holdingSymbols.join(",");

  useEffect(() => {
    const email = user?.email;
    if (!email) return;

    let cancelled = false;

    const refreshLiveData = async () => {
      const ticker = tradeTicker.trim().toUpperCase();

      const portfolioPromise = fetch(
        `${API_BASE}/api/portfolio/${selectedPortfolio}?email=${encodeURIComponent(email)}`
      )
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);

      const stockPromise = ticker
        ? fetch(`${API_BASE}/api/stock/${encodeURIComponent(ticker)}`)
            .then(async (r) => {
              if (!r.ok) {
                let errorMsg = `Unable to fetch quote for ${ticker}`;
                try {
                  const json = await r.json();
                  errorMsg = json.detail || json.error || json.message || errorMsg;
                } catch (_) {}
                return { error: errorMsg, ticker };
              }
              return r.json();
            })
            .catch((error) => ({ error: error.message || "Unable to fetch quote", ticker }))
        : Promise.resolve(null);

      const holdingPromises = holdingSymbols.map((symbol) =>
        fetch(`${API_BASE}/api/stock/${encodeURIComponent(symbol)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((payload) => (payload ? { symbol, payload } : null))
          .catch(() => null)
      );

      const [portfolioData, stockPayload, ...holdingResults] = await Promise.all([
        portfolioPromise,
        stockPromise,
        ...holdingPromises,
      ]);

      if (cancelled) return;

      if (portfolioData) setLivePortfolio(portfolioData);
      if (stockPayload) setStockData(stockPayload);

      const nextQuotes = {};
      holdingResults.forEach((result) => {
        if (result?.symbol && result.payload) {
          nextQuotes[result.symbol] = result.payload;
        }
      });
      if (holdingSymbols.length) {
        setHoldingQuotes((prev) => ({ ...prev, ...nextQuotes }));
      } else {
        setHoldingQuotes({});
      }
    };

    refreshLiveData();
    const poll = setInterval(refreshLiveData, PORTFOLIO_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [selectedPortfolio, tradeTicker, user?.email, holdingSymbolsKey]);

  const tradeChartKey = stockData?.ticker || tradeTicker.trim().toUpperCase() || "trade";
  const tradeQuoteMap = useMemo(
    () => (stockData ? { [tradeChartKey]: stockData } : {}),
    [tradeChartKey, stockData]
  );
  const tradeChartKeys = useMemo(
    () => (stockData?.history?.length || stockData?.price != null ? [tradeChartKey] : []),
    [stockData, tradeChartKey]
  );
  const tradeChartSeries = useLiveChartSeries(tradeQuoteMap, tradeChartKeys);
  const holdingChartSeries = useLiveChartSeries(holdingQuotes, holdingSymbols);

  const performTrade = async (side) => {
    const ticker = tradeTicker.trim().toUpperCase();
    const qty = Number(tradeQuantity);
    const email = user?.email || data?.profile?.email;
    if (!email) {
      setTradeStatus("Unable to trade without a logged-in user.");
      return;
    }
    if (!ticker || qty <= 0) {
      setTradeStatus("Enter a valid ticker and quantity.");
      return;
    }

    setIsTrading(true);
    setTradeStatus(`Executing ${side} order for ${ticker}...`);

    try {
      const endpoint = `${API_BASE}/api/portfolio/${selectedPortfolio}/trade`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ticker, side, quantity: qty }),
      });

      if (!response.ok) {
        let errorMsg = "Trade failed.";
        try {
          const json = await response.json();
          errorMsg = json.detail || json.error || json.message || errorMsg;
        } catch (e) {
          try {
            const txt = await response.text();
            errorMsg = txt || errorMsg;
          } catch (_) {}
        }
        throw new Error(errorMsg);
      }

      const nextState = await response.json();
      if (nextState?.portfolio) {
        onStateChange?.({
          ...data,
          portfolio: nextState.portfolio
        });
        const updated = nextState.portfolio[selectedPortfolio];
        if (updated) setLivePortfolio(updated);
      }
      setTradeStatus(`✅ Order successful: ${side} ${qty} ${ticker}`);
      setTradeTicker("");
      setTradeQuantity(1);

      const quoteResponse = await fetch(`${API_BASE}/api/stock/${encodeURIComponent(ticker)}`);
      if (quoteResponse.ok) {
        setStockData(await quoteResponse.json());
      }
    } catch (error) {
      setTradeStatus(`❌ ${error.message || "Trade failed."}`);
    } finally {
      setIsTrading(false);
    }
  };

  const formatStatValue = (key, value) => {
    if (typeof value !== "number") return () => String(value ?? "—");
    const k = key.toLowerCase();
    if (k.includes("percent") || k.includes("pnlpercent") || k.includes("ytd") || k.includes("roi") || k.includes("volatility") || k.includes("winrate") || k.includes("diversification")) {
      return (v) => `${Number(v).toFixed(k.includes("volatility") ? 1 : 0)}%`;
    }
    if (k.includes("total") || k.includes("value") || k.includes("cash") || k.includes("buyingpower") || k.includes("margin") || k.includes("max") || k === "pnl") {
      return (v) => `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return (v) => Number(v).toLocaleString();
  };

  return (
    <div className="portfolio-grid">
      {/* Hero Section */}
      <section className="portfolio-hero">

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

        {/* Detailed Stats Grid: scalar metrics only (exclude trades, holdings_list, etc.) */}
        <div className="portfolio-stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",width:"100%"}}>
          {Object.entries(current)
            .filter(([k, value]) => {
              if (["holdings_list", "name", "trades", "portfolio_id"].includes(k)) return false;
              if (value !== null && typeof value === "object") return false;
              return true;
            })
            .map(([key, value]) => {
              const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
              return (
                <div key={key} className="portfolio-stat-item">
                  <span className="stat-item-label">{label}</span>
                  <span className={`stat-item-value ${typeof value === "number" && value > 0 ? "up" : ""}`}>
                    {typeof value === "number" ? (
                      <RollingNumber value={value} format={formatStatValue(key, value)} />
                    ) : (
                      value ?? "—"
                    )}
                  </span>
                </div>
              );
            })}
        </div>

        <div className="global-trade-panel">
          <div className="global-trade-header">
            <div>
              <div className="trade-title">{current.name} Market Explorer</div>
              <div className="trade-sub">Buy and sell tickers directly from your {current.name.toLowerCase()}.</div>
            </div>
              <div className="global-trade-controls">
                <input
                  value={tradeTicker}
                  onChange={(e) => setTradeTicker(e.target.value.toUpperCase())}
                  className="stock-input"
                  placeholder="Ticker"
                />
                <input
                  type="number"
                  min={1}
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(Number(e.target.value))}
                  className="stock-input"
                  placeholder="Qty"
                />
                <button className="btn-primary-small" onClick={() => performTrade("buy")} disabled={isTrading}>Buy</button>
                <button className="btn-secondary" onClick={() => performTrade("sell")} disabled={isTrading}>Sell</button>
              </div>
            </div>

            <div className="global-trade-content">
              <div className="stock-quote-card">
                <div className="stock-quote-top">
                  <div>
                    <div className="stock-symbol">{stockData?.ticker ?? (tradeTicker.toUpperCase() || "TICK")}</div>
                    <div className="stock-company-name">{getCompanyName(stockData?.ticker ?? tradeTicker.toUpperCase())}</div>
                  </div>
                  <div className="stock-price">
                    {stockData?.history?.length || stockData?.price != null ? (
                      <RollingNumber
                        value={stockData.history?.length ? stockData.history[stockData.history.length - 1] : stockData.price}
                        format={fmtUsd2}
                      />
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
                <div className="stock-subtext">
                  {stockData?.metrics
                    ? `1d ${stockData.metrics.priceChange1d >= 0 ? "+" : ""}${stockData.metrics.priceChange1d}% · RSI ${stockData.metrics.rsi}`
                    : stockData?.error || "Loading quote metrics..."}
                </div>
        
                  
                <div className="stock-quote-graph">
                  {stockData?.history?.length ? (
                    <ScrollingChart history={tradeChartSeries[tradeChartKey] || []} stroke="#d4b878" />
                  ) : (
                    <div className="stock-quote-empty">{stockData?.error || "Waiting for live quote..."}</div>
                  )}
                </div>
              </div>

              <div className="stock-metrics-grid">
                {stockData?.metrics ? (
                  Object.entries(stockData.metrics)
                    .filter(([key]) => key !== "marketCap")
                    .map(([key, value]) => (
                      <div key={key} className="stock-metric-row">
                        <span className="stock-metric-label">{key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}</span>
                        <span className="stock-metric-value">
                          {typeof value === "number" ? (
                            <RollingNumber value={value} format={fmtInt} />
                          ) : value}
                        </span>
                      </div>
                    ))
                ) : (
                  <div className="stock-metric-empty">Select a ticker to view metrics.</div>
                )}
              </div>
            </div>
            <div className="trade-status">{tradeStatus}</div>
          </div>
      </section>

      {/* Holdings Section */}
      <section className="portfolio-holdings-section">
        <div className="section-header">
          <h3>Your Holdings ({current.holdings_list.length} stocks)</h3>
          <span className="section-meta">Performance breakdown</span>
        </div>

        <div className="holdings-list">
          {current.holdings_list.length === 0 ? (
            <div className="empty-holdings-card">
              <div className="empty-holdings-title">Portfolio is empty</div>
              <div className="empty-holdings-copy">
                You have ${current.buyingPower.toLocaleString()} in buying power. Place your first trade to build your portfolio.
              </div>
            </div>
          ) : current.holdings_list.map((holding, idx) => {
            const symbol = holding.symbol || holding.ticker;
            const shares = holding.shares ?? holding.qty ?? 0;
            const quote = holdingQuotes[symbol] || null;
            const displayPrice = quote?.history?.length ? quote.history[quote.history.length - 1] : (quote?.price ?? holding.price ?? 0);
            const dayChange = quote?.metrics?.priceChange1d ?? holding.dayChange ?? 0;
            const rsi = quote?.metrics?.rsi ?? null;
            const avgVolume = quote?.metrics?.avgVolume ?? holding.volume;
            const holdingValue = holding.value ?? shares * displayPrice;
const chartHistory =
  holdingChartSeries[symbol] ||
  holding.history ||
  (displayPrice ? [displayPrice] : []);            const strokeColor = (holding.pnl ?? 0) >= 0 ? "#d4b878" : "#c98c7a";

            return (
              <div key={symbol || idx} className="holding-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="holding-quote-top">
                  <div>
                    <div className="holding-symbol">{symbol}</div>
                    <div className="holding-company-name">{getCompanyName(symbol)}</div>
                  </div>
                  <div className="holding-price">
                    <RollingNumber value={displayPrice} format={fmtUsd2} />
                  </div>
                </div>
                <div className="holding-subtext">
                  <RollingNumber value={dayChange} format={(v) => fmtPct(v, 2)} />
                  {rsi !== null ? (
                    <> · RSI <RollingNumber value={rsi} format={(v) => fmtNum(v, 0)} /></>
                  ) : null}
                </div>
                <div className="holding-quote-graph">
<ScrollingChart
history={holdingChartSeries[symbol] || []}  stroke="#d4b878"
/>                </div>
                <div className="holding-metrics-grid">
                  <div className="stock-metric-row">
                    <span className="stock-metric-label">Shares</span>
                    <span className="stock-metric-value">
                      <RollingNumber value={shares} format={fmtInt} />
                    </span>
                  </div>
                  <div className="stock-metric-row">
                    <span className="stock-metric-label">Value</span>
                    <span className="stock-metric-value">
                      <RollingNumber value={holdingValue} format={fmtUsd} />
                    </span>
                  </div>
                  <div className="stock-metric-row">
                    <span className="stock-metric-label">P/L %</span>
                    <span className="stock-metric-value">
                      <RollingNumber value={holding.pnlPercent ?? 0} format={(v) => fmtPct(v, 2)} />
                    </span>
                  </div>
                  <div className="stock-metric-row">
                    <span className="stock-metric-label">Avg volume</span>
                    <span className="stock-metric-value">
                      <RollingNumber value={avgVolume ?? 0} format={fmtInt} />
                    </span>
                  </div>
                  <div className="stock-metric-row">
                    <span className="stock-metric-label">Cost basis</span>
                    <span className="stock-metric-value">
                      {holding.avgCost != null ? (
                        <RollingNumber value={holding.avgCost} format={fmtUsd2} />
                      ) : "—"}
                    </span>
                  </div>
                  <div className="stock-metric-row">
                    <span className="stock-metric-label">Day change</span>
                    <span className="stock-metric-value">
                      <RollingNumber value={dayChange} format={(v) => fmtPct(v, 2)} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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

function DiscoverView({ data }) {
  const schoolLeaderboard = Array.isArray(data?.discover?.schoolLeaderboard) ? data.discover.schoolLeaderboard : [];
  const tournamentLeaderboard = Array.isArray(data?.discover?.tournamentLeaderboard) ? data.discover.tournamentLeaderboard : [];
  const openLeagues = Array.isArray(data?.league?.openLeagues) ? data.league.openLeagues : [];
  const lessons = Array.isArray(data?.learn?.lessons) ? data.learn.lessons : [];
  const profile = data?.profile ?? {};

  return (
    <div className="discover-grid">
      <section className="discover-section profile-discover-card">
        <div className="section-header">
          <h2>Welcome back, trader</h2>
          <span className="section-meta">Real account stats and discovery</span>
        </div>
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <span className="stat-label">Portfolio value</span>
            <span className="stat-value">${profile.totalPortfolioValue?.toLocaleString() ?? 0}</span>
          </div>
          <div className="profile-stat-card">
            <span className="stat-label">Buying power</span>
            <span className="stat-value">${profile.buyingPower?.toLocaleString() ?? 0}</span>
          </div>
          <div className="profile-stat-card">
            <span className="stat-label">Followers</span>
            <span className="stat-value">{profile.followers ?? 0}</span>
          </div>
          <div className="profile-stat-card">
            <span className="stat-label">Profile views</span>
            <span className="stat-value">{profile.profileViews ?? 0}</span>
          </div>
          <div className="profile-stat-card">
            <span className="stat-label">Level</span>
            <span className="stat-value">{profile.level ?? "Beginner"}</span>
          </div>
          <div className="profile-stat-card">
            <span className="stat-label">Following</span>
            <span className="stat-value">{profile.following ?? 0}</span>
          </div>
        </div>
      </section>

      {schoolLeaderboard.length > 0 && (
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
            {schoolLeaderboard.map((item) => (
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
      )}

      {tournamentLeaderboard.length > 0 && (
        <section className="discover-section">
          <div className="section-header">
            <h2>🏆 Tournament Leaders</h2>
            <span className="section-meta">Top performers</span>
          </div>
          <div className="leaderboard-table">
            <div className="leaderboard-header">
              <span className="col-rank">Rank</span>
              <span className="col-name">Trader</span>
              <span className="col-tournament">Tournament</span>
              <span className="col-delta">Delta</span>
              <span className="col-pnl">PnL</span>
            </div>
            {tournamentLeaderboard.map((item) => (
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
      )}
      {openLeagues.length > 0 && (
        <section className="discover-section">
          <div className="section-header">
            <h2>🏆 Open Leagues</h2>
            <span className="section-meta">Join and start competing</span>
          </div>
          <div className="leagues-list">
            {openLeagues.map((l, i) => (
              <div key={l.id || l.name} className="league-card" style={{ animationDelay: `${i * 0.05}s` }}>
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
      )}

      {lessons.length > 0 && (
        <section className="discover-section">
          <div className="section-header">
            <h2>📚 Lessons & Insights</h2>
            <span className="section-meta">Learn from the best</span>
          </div>
          <div className="lessons-grid">
            {lessons.map((l, i) => {
              const difficultyLabel = l?.difficulty || "Unknown";
              const difficultyClass = difficultyLabel.toLowerCase().replace(/\s+/g, "-");
              const title = l?.title || `Lesson ${i + 1}`;
              const duration = l?.duration || "—";
              const views = typeof l?.views === "number" ? l.views.toLocaleString() : "N/A";

              return (
                <div key={l?.id ?? title ?? i} className="lesson-card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="lesson-header">
                    <div className="lesson-category">{l?.category || "General"}</div>
                    <div className={`lesson-difficulty ${difficultyClass}`}>{difficultyLabel}</div>
                  </div>

                  <h3 className="lesson-title">{title}</h3>

                  <div className="lesson-meta">
                    <span className="meta">⏱ {duration}</span>
                    <span className="meta">👁 {views} views</span>
                  </div>

                  <button className="btn-lesson">Watch Lesson</button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default Dashboard;