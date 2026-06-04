import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Onboarding.css";

const SEED = [
  { rank: 1,  name: "Hunter Harringson", handle: "@hunt.h",   pnl: 11.42, delta: 2 },
  { rank: 2,  name: "Arush Sivhakumar",  handle: "@trackstar", pnl: 9.81, delta: -1 },
  { rank: 3,  name: "Priya Shah",        handle: "@priya",    pnl: 8.74, delta: 1 },
  { rank: 4,  name: "Tomás Lindgren",    handle: "@tlind",    pnl: 7.55, delta: 0 },
  { rank: 5,  name: "Aisha Bello",       handle: "@aishab",   pnl: 6.92, delta: 3 },
  { rank: 6,  name: "Jordan Park",       handle: "@jpark",    pnl: 6.10, delta: -2, rival: true },
  { rank: 7,  name: "You",               handle: "@you",      pnl: 5.74, delta: 4, you: true },
  { rank: 8,  name: "Leah Brennan",      handle: "@leahb",    pnl: 5.21, delta: -1 },
  { rank: 9,  name: "Mateo Cruz",        handle: "@mcruz",    pnl: 4.88, delta: 0 },
  { rank: 10, name: "Hannah Yi",         handle: "@hyi",      pnl: 4.40, delta: -3 },
  { rank: 11, name: "Ari Tanaka",        handle: "@atanaka",  pnl: 4.02, delta: 1 },
  { rank: 12, name: "Noah Patel",        handle: "@npatel",   pnl: 3.88, delta: -1 },
  { rank: 13, name: "Zoe Kim",           handle: "@zoek",     pnl: 3.45, delta: 2 },
  { rank: 14, name: "Ethan Ross",        handle: "@eross",    pnl: 3.11, delta: -2 },
  { rank: 15, name: "Sofia Lee",         handle: "@sofia",    pnl: 2.84, delta: 0 },
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
  "@adi sold MSFT at -0.8%",
  "@arush sold AMZN at +0.9%",
  "@hunt.h bought GOOGL at open",
  "@sofia bought BRK.B at +0.2%",
  "@eross hit weekly low",
  "@zoe.k bought JPM at -0.3%",

];

const TICKER = [
  { s: "AAPL",  p: "+1.24%" },
  { s: "NVDA",  p: "+3.12%" },
  { s: "TSLA",  p: "-0.86%" },
  { s: "MSFT",  p: "+0.42%" },
  { s: "AMZN",  p: "+0.91%" },
  { s: "META",  p: "-1.18%" },
  { s: "GOOGL", p: "+0.55%" },
  { s: "BRK.B", p: "+0.21%" },
  { s: "JPM",   p: "-0.34%" },
  { s: "V",     p: "+0.78%" },
  { s: "SHOP",  p: "+2.41%" },
  { s: "BABA",  p: "-1.92%" },
  { s: "TSM",   p: "+1.65%" },
  { s: "ASML",  p: "+0.88%" },
  { s: "NFLX",  p: "+1.04%" },
  { s: "ORCL",  p: "+0.60%" },
  { s: "XOM",   p: "+0.30%" },
  { s: "CVX",   p: "+0.18%" },
  { s: "IBM",   p: "-0.05%" },
  { s: "DIS",   p: "+1.14%" },
  { s: "BIIB",  p: "-0.72%" },
  { s: "LULU",  p: "+2.05%" },
];

const SKILLS = [
  { k: "Risk", t: "Position sizing under uncertainty", d: "Learn why a 10% bet feels rational until it goes wrong. The leaderboard rewards survival, not heroics." },
  { k: "Vol",  t: "Volatility, drawdowns, recovery", d: "Watch how a -8% week needs +8.7% to break even. The engine teaches it; the ranking enforces it." },
  { k: "Div",  t: "Diversification across 120 markets", d: "Concentrated bets win weeks. Diversified portfolios win seasons. Both show up on the board." },
  { k: "Mkt",  t: "How real markets actually move", d: "Stochastic drift, mean reversion, fat tails. You feel them in your rank before you read about them." },
  { k: "ψ",    t: "Behavioural bias under pressure", d: "Loss aversion, FOMO, anchoring. Every Friday you see exactly which one cost you a rank." },
  { k: "$",    t: "Compounding & long-horizon thinking", d: "Weekly cycles. Season totals. The kids who win seasons aren't the ones who win every week." },
];

const CONCEPTS = [
  { f: "P/E", b: "Price-to-Earnings", d: "What multiple is the market paying for $1 of company earnings — and is that hot or overpriced?" },
  { f: "β",   b: "Beta",              d: "How violently a stock moves vs. the index. β=1.5 means it amplifies the market by 50%." },
  { f: "σ",   b: "Standard deviation", d: "Your portfolio's volatility — the price you pay for return. Higher σ, wider swings." },
  { f: "α",   b: "Alpha",             d: "Excess return above the benchmark. Pure skill, statistically — or pure luck, statistically." },
  { f: "DD",  b: "Drawdown",          d: "Peak-to-trough loss. The metric that hurts the most and teaches the most." },
  { f: "SR",  b: "Sharpe ratio",      d: "Return per unit of risk. The number quants stare at when they grade themselves." },
];


function buildEnginePath(w, h, seed = 0) {
  const pts = [];
  let v = 100;

  let momentum = 0;
  let volatility = 0.6;

  for (let i = 0; i < 220; i++) {
    const t = i + seed;

    // Multi-scale smooth noise (fractal-like)
    const lowFreq =
      Math.sin(t * 0.05) * 1.2 +
      Math.cos(t * 0.03) * 0.8;

    const midFreq =
      Math.sin(t * 0.15) * 0.5 +
      Math.cos(t * 0.12) * 0.4;

    const highFreq =
      Math.sin(t * 0.4) * 0.15;

    const noise = lowFreq + midFreq + highFreq;

    // Volatility clustering (slow changes)
    volatility += (Math.sin(t * 0.02) * 0.02);
    volatility = Math.max(0.3, Math.min(1.2, volatility));

    // Momentum (trend continuation)
    momentum = momentum * 0.85 + noise * 0.15;

    // Final movement
    v += momentum * volatility + 0.03;

    pts.push(v);
  }

  // --- SMOOTHING PASS (critical) ---
  const smoothPts = pts.map((_, i, arr) => {
    const prev = arr[i - 1] ?? arr[i];
    const curr = arr[i];
    const next = arr[i + 1] ?? arr[i];
    return (prev + curr * 2 + next) / 4;
  });

  const min = Math.min(...smoothPts);
  const max = Math.max(...smoothPts);
  const range = max - min || 1;

  return smoothPts
    .map((p, i) => {
      const x = (i / (smoothPts.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [feed, setFeed] = useState([]);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    let id = 0;
    const stamp = () => {
      const d = new Date();
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    };
    setFeed(FEED_TEMPLATES.slice(0, 9).map((line) => ({ line, time: stamp(), id: id++ })));
    const t = setInterval(() => {
      setFeed((prev) => [
        { line: FEED_TEMPLATES[Math.floor(Math.random() * FEED_TEMPLATES.length)], time: stamp(), id: id++ },
        ...prev,
      ].slice(0, 9));
    }, 2400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
  let frame;
  let start;

  const loop = (t) => {
    if (!start) start = t;
    const elapsed = t - start;

    // slow continuous motion
    setSeed(elapsed * 0.00025); 

    frame = requestAnimationFrame(loop);
  };

  frame = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(frame);
}, []);
  useEffect(() => {
    const onMove = (e) => {
      document.documentElement.style.setProperty("--qz-cx", `${e.clientX}px`);
      document.documentElement.style.setProperty("--qz-cy", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const W = 460, H = 300;
  const path = buildEnginePath(W, H, seed);
  const goSignup = () => navigate("/signup");
  const goSignin = () => navigate("/signup");
  const goApp = () => navigate("/signup");

  return (
    <div className="qz">
      <div className="qz-cursor-glow" aria-hidden />
      <div className="qz-aurora" aria-hidden>
        <span className="qz-aurora-blob a" />
        <span className="qz-aurora-blob b" />
        <span className="qz-aurora-blob c" />
      </div>

      <nav className="qz-nav">
        <div className="qz-wrap qz-nav-inner">
          <div className="qz-logo">
            
            <img
  src="/logo.jpeg"
  alt="Quantis"
  style={{
    height: "40px",
    width: "auto",
    maxWidth: "100%",
    display: "block"
  }}
/>
            
            <span className="qz-logo-text">Quantis</span>
            
            <span className="qz-tag">Financial Literacy · Gamified</span>
          </div>
          <div className="qz-nav-actions">
            <a className="qz-link" href="#learn">What you learn</a>
            <a className="qz-link" href="#how">How it works</a>
            <a className="qz-link" onClick={goSignin}>
             Sign in

          </a>

           <button className="qz-btn" onClick={goSignup}>

         <span>Join a league</span>
              
              <span className="qz-btn-arrow">→</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="qz-ticker" aria-hidden>
        <div className="qz-ticker-track">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span className="qz-ticker-item" key={i}>
              <span className="qz-ticker-s">{t.s}</span>
              <span className={`qz-ticker-p ${t.p.startsWith("-") ? "qz-down" : "qz-up"}`}>{t.p}</span>
            </span>
          ))}
        </div>
      </div>

      <section className="qz-hero">
        <div className="qz-hero-grid" />
        <div className="qz-wrap qz-hero-inner">
          <div>
            <div className="qz-pill">
              <span className="qz-dot" />
              School leagues · Individual leagues · Open now
            </div>
            <h1 className="qz-h1">
              <span className="qz-word">Markets,</span>{" "}
              <span className="qz-word d1">taught</span>{" "}
              <span className="qz-word d2">by</span>{" "}
              <span className="qz-word d3 accent">competition.</span>
            </h1>
            <p className="qz-lede">
              Quantis turns financial literacy into a status game. Same starting cash, 15,000 real tickers across 120 international markets, and a stochastic price engine that runs around the clock. You learn risk, diversification, volatility, and behaviour — not because a teacher said so, but because the leaderboard is watching.
            </p>
            <div className="qz-cta-row">
              <button className="qz-btn qz-btn-lg" onClick={goSignup}>
                <span>Join a league</span>
                <span className="qz-btn-arrow">→</span>
              </button>
              <button className="qz-btn-ghost" onClick={goSignin}>See the battle screen</button>
            </div>
            <CountStats />
          </div>

          <TiltCard>
            <HeroCard />
          </TiltCard>
        </div>
      </section>

      <section className="qz-section" id="learn">
        <div className="qz-wrap">
          <Reveal as="div">
            <div className="qz-section-label">00 — Why it works</div>
            <h2 className="qz-h2">Financial literacy doesn't stick from a textbook. It sticks from getting ranked.</h2>
            <p className="qz-lede-2">
              Traditional finance education teaches concepts in isolation — diversification on Monday, volatility on Wednesday, behavioural bias never. Quantis flips it: you compete first, and the concepts arrive exactly when your portfolio needs them. Loss aversion shows up the first time you refuse to sell a loser. Drawdown shows up when your rival passes you. The lesson lands because the stakes — your rank — feel real.
            </p>
          </Reveal>

          <div className="qz-skills">
            {SKILLS.map((s, i) => (
              <Reveal as="div" key={s.t} delay={i * 70}>
                <SkillCard skill={s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="qz-section">
        <div className="qz-wrap">
          <Reveal>
            <div className="qz-section-label">The vocabulary</div>
            <h2 className="qz-h2">Concepts you'll absorb without studying.</h2>
            <p className="qz-lede-2">
              Hover any card. These are the metrics the leaderboard pushes you to internalise — not because we lecture you, but because they predict who climbs and who falls.
            </p>
          </Reveal>

          <div className="qz-concepts">
            {CONCEPTS.map((c, i) => (
              <Reveal as="div" key={c.f} delay={i * 60}>
                <ConceptCard c={c} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="qz-section">
        <div className="qz-wrap qz-market">
          <Reveal as="div">
            <div className="qz-section-label">The universe</div>
            <h2 className="qz-h2">15,000 stocks. 120 markets. One engine that never stops moving.</h2>
            <p>
              Build a portfolio from real tickers across NYSE, NASDAQ, LSE, TSE, HKEX, Euronext, ASX and 113 more international exchanges. Behind it all runs a quantitative stochastic price simulation — calibrated to real volatility — that drives constant action between market hours.
            </p>
            <div className="qz-tiles">
              <AnimatedTile k={15000} suffix="+" v="tickers" />
              <AnimatedTile k={120} suffix="" v="exchanges" />
              <AnimatedTile k={24} suffix="/7" v="price ticks" />
            </div>
          </Reveal>

          <Reveal as="div" delay={120}>
            <div className="qz-engine">
              <div className="qz-engine-head">
                <span className="qz-meta">Stochastic price engine · sample path</span>
                <span className="qz-live"><span className="qz-dot" /> SIM</span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`}>
                <defs>
                  <linearGradient id="qzgrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#d6c6a6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#d6c6a6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((y) => (
                  <line key={y} x1="0" x2={W} y1={H * y} y2={H * y} stroke="#2a2620" strokeWidth="1" strokeDasharray="2 4" />
                ))}
                <polygon points={`0,${H} ${path} ${W},${H}`} fill="url(#qzgrad)" className="qz-engine-fill" />
                <polyline points={path} fill="none" stroke="#d6c6a6" strokeWidth="1.75" className="qz-engine-line" />
              </svg>
              <div className="qz-kpis">
                <div className="qz-kpi"><div className="k">μ drift</div><div className="v">+0.04%</div></div>
                <div className="qz-kpi"><div className="k">σ vol</div><div className="v">1.8%</div></div>
                <div className="qz-kpi"><div className="k">dt</div><div className="v">1m</div></div>
                <div className="qz-kpi"><div className="k">paths</div><div className="v">15K</div></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="qz-section">
        <div className="qz-wrap qz-board">
          <Reveal as="div">
            <div className="qz-section-label">01 — The screen</div>
            <h2 className="qz-h2">One screen. Rank, rival, and how far to the next position.</h2>
            <p className="qz-lede-2">No tabs. No dashboards. Every login answers one question — am I moving up?</p>

            <div className="qz-board-card">
              <div className="qz-board-head">
                <span className="qz-meta">Top 15 · Week 03</span>
                <span className="qz-meta">closes Fri 16:00</span>
              </div>
              <div className="qz-board-list">
                {SEED.map((r, i) => <BoardRow key={r.rank} row={r} idx={i} />)}
              </div>
            </div>
          </Reveal>

          <Reveal as="div" delay={140}>
            <div className="qz-section-label">Live rank feed</div>
            <h2 className="qz-h2">Movement, in real time.</h2>
            <p className="qz-lede-2">Every rank change in your league streams here. The feed is the FOMO engine.</p>

            <div className="qz-feed">
              <div className="qz-feed-head">
                <span className="qz-dot" />
                League feed · live
              </div>
              <ul>
                {feed.map((item) => (
                  <li key={item.id}>
                    <span className="t">{item.time}</span>
                    <span>{item.line}</span>
                  </li>
                ))}
                {feed.length === 0 && <li><span>connecting…</span></li>}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="qz-section">
        <div className="qz-wrap">
          <Reveal>
            <div className="qz-section-label">02 — The mechanic</div>
            <h2 className="qz-h2">One fixed rival. Every week. Personal.</h2>
            <p className="qz-lede-2">
              Every player gets paired with one other player of similar rank. Beat them and you climb. Lose to them and they take your spot. The leaderboard is the league; the rival is the rivalry.
            </p>
          </Reveal>

          <div className="qz-rival-grid">
            <Reveal as="div"><RivalCard you name="You" handle="@you" rank={7} pnl={5.74} delta={4} /></Reveal>
            <Reveal as="div" delay={120}><RivalCard name="Jordan Park" handle="@jpark" rank={6} pnl={6.10} delta={-2} /></Reveal>
          </div>

          <Reveal as="div" delay={200}>
            <div className="qz-h2h">
              <div>
                <div className="qz-meta">Head-to-head</div>
                <div className="big">
                  <span className="qz-down">−0.36%</span> <span className="meta">vs</span> <span>@jpark</span>
                </div>
              </div>
              <div className="meta">Closes Fri 16:00 · Winner takes the rank</div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="qz-section" id="how">
        <div className="qz-wrap">
          <Reveal>
            <div className="qz-section-label">03 — The loop</div>
            <h2 className="qz-h2">A weekly cycle, built to be checked daily.</h2>
          </Reveal>

          <div className="qz-steps">
            {[
              { n: "01", t: "Same start", d: "Every player in your league gets $100,000 in virtual cash and access to all 15,000 tickers." },
              { n: "02", t: "Constant moves", d: "A stochastic price engine ticks between real market hours. Trade when it makes sense — or hold." },
              { n: "03", t: "Rank shifts", d: "The leaderboard recalculates continuously. Your rival, the top 10, and your distance to next." },
              { n: "04", t: "Week locks", d: "Friday 16:00 the week closes. Winners are announced. Rankings reset. New battle Monday." },
            ].map((s, i) => (
              <Reveal as="div" key={s.n} delay={i * 90}><StepItem step={s} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="qz-section">
        <div className="qz-wrap">
          <Reveal as="div">
            <div className="qz-cta-card">
              <div className="qz-cta-inner">
                <div className="qz-section-label">Pick your league</div>
                <h2 className="qz-h2">Two ways to play. One leaderboard mentality.</h2>
                <p className="qz-lede-2">
                  Join an individual league and get matched into a global cohort instantly, or spin up a school league for your class, club, or year group. Same engine, same weekly cycle, same hunger for rank.
                </p>

                <div className="qz-league-grid">
                  <div className="qz-league primary">
                    <div className="tag">Individual league</div>
                    <h3>Jump in solo</h3>
                    <p>Get matched into an open cohort of 50 players. New battle every Monday.</p>
                    <button className="go" onClick={goSignup}>Create an account →</button>
                  </div>
                  <div className="qz-league">
                    <div className="tag">School league</div>
                    <h3>Bring your school</h3>
                    <p>Run a private league for your class, club, or whole year group. Free for educators.</p>
                    <button className="go" onClick={goSignup}>Set up your school →</button>
                  </div>
                </div>

                <form className="qz-form" onSubmit={(e) => { e.preventDefault(); go(); }}>
                  <input type="email" placeholder="you@email.com" />
                  <button
                    type="button"
                    className="qz-btn"
                    onClick={() => navigate("/signup")}
                  >
                    Start Battling
                  </button>
                </form>
                <div className="qz-form-note">Open now · Free during beta</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="qz-footer">
        <div className="qz-wrap qz-footer-inner">
          <div className="qz-logo">
          
            <img
  src="/logo.jpeg"
  alt="Quantis"
  style={{
    height: "40px",
    width: "auto",
    maxWidth: "100%",
    display: "block"
  }}
/>
            <span className="qz-logo-text">Quantis</span>
            <span className="qz-tag">© 2026</span>
          </div>
          <div className="qz-footer-note">Virtual cash. 15,000 stocks. Real ranks. Real literacy.</div>
        </div>
      </footer>
    </div>
  );
}

function Reveal({ children, as: Tag = "div", delay = 0 }) {
  const { ref, shown } = useReveal();
  return (
    <Tag ref={ref} className={`qz-reveal ${shown ? "in" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

function CountStats() {
  const { ref, shown } = useReveal();
  const tickers = useCountUp(15, 1400, shown);
  const markets = useCountUp(120, 1600, shown);
  const cycle = useCountUp(7, 1000, shown);
  return (
    <div ref={ref} className="qz-stats">
      <Stat label="Tickers" value={`${Math.round(tickers)}K`} suf="+" />
      <Stat label="Markets" value={`${Math.round(markets)}`} suf="" />
      <Stat label="Cycle" value={`${Math.round(cycle)}`} suf="days" />
    </div>
  );
}

function AnimatedTile({ k, suffix, v }) {
  const { ref, shown } = useReveal();
  const value = useCountUp(k, 1400, shown);
  const display = k >= 1000 ? Math.round(value).toLocaleString() : Math.round(value).toString();
  return (
    <div ref={ref} className="qz-tile">
      <div className="k">{display}{suffix}</div>
      <div className="v">{v}</div>
    </div>
  );
}

function TiltCard({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--rx", `${-py * 6}deg`);
      el.style.setProperty("--ry", `${px * 8}deg`);
    };
    const onLeave = () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <div ref={ref} className="qz-tilt">{children}</div>;
}

function Stat({ label, value, suf }) {
  return (
    <div>
      <div className="qz-stat-label">{label}</div>
      <div className="qz-stat-row">
        <div className="qz-stat-val">{value}</div>
        <div className="qz-stat-suf">{suf}</div>
      </div>
    </div>
  );
}

function HeroCard() {
  return (
    <div className="qz-hero-card">
      <div className="qz-card-shine" />
      <div className="qz-card-head">
        <span className="qz-meta">Lincoln High · Week 03</span>
        <span className="qz-live"><span className="qz-dot" /> LIVE</span>
      </div>
      <div className="qz-hero-body">
        <div>
          <div className="qz-meta">Your rank</div>
          <div className="qz-rank">#7</div>
          <div className="qz-rank-delta">▲ 4 since yesterday</div>
        </div>
        <div>
          <div className="qz-meta">Weekly return</div>
          <div className="qz-return">+5.74%</div>
          <div className="qz-cash">$105,740 / $100,000</div>
        </div>
      </div>

      <div className="qz-next">
        <div className="qz-next-row">
          <span>Next rank</span>
          <span>@jpark · #6</span>
        </div>
        <div className="qz-bar"><i style={{ width: "64%" }} /></div>
        <div className="qz-next-row" style={{ marginTop: 8 }}>
          <span>0.36% away</span>
          <span>≈ $360</span>
        </div>
      </div>

      <div className="qz-mini-grid">
        <div className="qz-mini">
          <div className="qz-mini-head"><span>#6 <span className="muted">@jpark</span></span></div>
          <div className="qz-mini-val">+6.10%</div>
        </div>
        <div className="qz-mini you">
          <div className="qz-mini-head"><span>#7 <span className="muted">@you</span></span></div>
          <div className="qz-mini-val">+5.74%</div>
        </div>
      </div>
    </div>
  );
}

function StepItem({ step }) {
  return (
    <div className="qz-step">
      <div className="n">{step.n}</div>
      <h3>{step.t}</h3>
      <p>{step.d}</p>
    </div>
  );
}

function SkillCard({ skill }) {
  const ref = useSpotlight();
  return (
    <div ref={ref} className="qz-skill">
      <div className="qz-skill-glow" />
      <div className="qz-skill-k">{skill.k}</div>
      <h3>{skill.t}</h3>
      <p>{skill.d}</p>
    </div>
  );
}

function ConceptCard({ c }) {
  return (
    <div className="qz-concept">
      <div className="qz-concept-inner">
        <div className="qz-concept-face front">
          <div className="qz-concept-sym">{c.f}</div>
          <div className="qz-concept-name">{c.b}</div>
          <div className="qz-concept-hint">hover</div>
        </div>
        <div className="qz-concept-face back">
          <div className="qz-concept-name">{c.b}</div>
          <p>{c.d}</p>
        </div>
      </div>
    </div>
  );
}

function BoardRow({ row, idx }) {
  const up = row.delta > 0;
  const down = row.delta < 0;
  return (
    <div className={`qz-row ${row.you ? "you" : ""}`} style={{ animationDelay: `${idx * 40}ms` }}>
      <div className="qz-rank-cell">#{row.rank}</div>
      <div className="qz-user">
        <div className={`qz-avatar ${row.you ? "you" : ""}`}>{row.name[0]}</div>
        <div className="qz-name-wrap">
          <div className="qz-name">
            <span>{row.name}</span>
            {row.rival && <span className="badge rival">rival</span>}
            {row.you && <span className="badge you">you</span>}
          </div>
          <div className="qz-handle">{row.handle}</div>
        </div>
      </div>
      <div className={`qz-delta ${up ? "qz-up" : down ? "qz-down" : "qz-mut"}`}>
        {row.delta === 0 ? "–" : `${up ? "▲" : "▼"} ${Math.abs(row.delta)}`}
      </div>
      <div className={`qz-pnl ${row.pnl >= 0 ? "qz-up" : "qz-down"}`}>
        {row.pnl >= 0 ? "+" : ""}{row.pnl.toFixed(2)}%
      </div>
    </div>
  );
}

function RivalCard({ you, name, handle, rank, pnl, delta }) {
  return (
    <div className={`qz-rival ${you ? "you" : ""}`}>
      <div className="qz-rival-head">
        <div className="qz-rival-id">
          <div className={`qz-avatar ${you ? "you" : ""}`}>{name[0]}</div>
          <div>
            <div className="nm">{name}</div>
            <div className="hn">{handle}</div>
          </div>
        </div>
        <span className={`qz-rival-tag ${you ? "you" : ""}`}>{you ? "you" : "rival"}</span>
      </div>
      <div className="qz-rival-stats">
        <div>
          <div className="lbl">Rank</div>
          <div className="val">#{rank}</div>
        </div>
        <div>
          <div className="lbl">Return</div>
          <div className={`val mono ${pnl >= 0 ? "qz-up" : "qz-down"}`}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}%</div>
        </div>
        <div>
          <div className="lbl">Δ 24h</div>
          <div className={`val mono ${delta > 0 ? "qz-up" : delta < 0 ? "qz-down" : "qz-mut"}`}>
            {delta === 0 ? "–" : `${delta > 0 ? "▲" : "▼"}${Math.abs(delta)}`}
          </div>
        </div>
      </div>
    </div>
  );
}

function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const node = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShown(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, shown };
}

function useCountUp(target, duration, start) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime = null;
    let frame;
    const tick = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(target * progress);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, start]);

  return value;
}

function useSpotlight() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty("--mx", `${mx}%`);
      el.style.setProperty("--my", `${my}%`);
    };
    const onLeave = () => {
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "50%");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return ref;
}
