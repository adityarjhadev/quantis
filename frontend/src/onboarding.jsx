import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Onboarding.css";

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
  "@adi sold MSFT at -0.8%",
  "@arush sold AMZN at +0.9%",
  "@hunt.h bought GOOGL at open",
  "@sofia bought BRK.B at +0.2%",
  "@eross hit weekly low",
  "@zoe.k bought JPM at -0.3%",
];

const TICKER = [
  { s: "AAPL", p: "+1.24%" }, { s: "NVDA", p: "+3.12%" }, { s: "TSLA", p: "-0.86%" },
  { s: "MSFT", p: "+0.42%" }, { s: "AMZN", p: "+0.91%" }, { s: "META", p: "-1.18%" },
  { s: "GOOGL", p: "+0.55%" }, { s: "BRK.B", p: "+0.21%" }, { s: "JPM", p: "-0.34%" },
  { s: "V", p: "+0.78%" }, { s: "SHOP", p: "+2.41%" }, { s: "BABA", p: "-1.92%" },
  { s: "TSM", p: "+1.65%" }, { s: "ASML", p: "+0.88%" }, { s: "NFLX", p: "+1.04%" },
  { s: "ORCL", p: "+0.60%" }, { s: "XOM", p: "+0.30%" }, { s: "CVX", p: "+0.18%" },
  { s: "IBM", p: "-0.05%" }, { s: "DIS", p: "+1.14%" }, { s: "BIIB", p: "-0.72%" },
  { s: "LULU", p: "+2.05%" },
];

const SKILLS = [
  { k: "Risk", t: "Position sizing under uncertainty", d: "Learn why a 10% bet feels rational until it goes wrong. The leaderboard rewards survival, not heroics." },
  { k: "Vol", t: "Volatility, drawdowns, recovery", d: "Watch how a -8% week needs +8.7% to break even. The engine teaches it; the ranking enforces it." },
  { k: "Div", t: "Diversification across 120 markets", d: "Concentrated bets win weeks. Diversified portfolios win seasons. Both show up on the board." },
  { k: "Mkt", t: "How real markets actually move", d: "Stochastic drift, mean reversion, fat tails. You feel them in your rank before you read about them." },
  { k: "ψ", t: "Behavioural bias under pressure", d: "Loss aversion, FOMO, anchoring. Every Friday you see exactly which one cost you a rank." },
  { k: "$", t: "Compounding & long-horizon thinking", d: "Weekly cycles. Season totals. The kids who win seasons aren't the ones who win every week." },
];

const CONCEPTS = [
  { f: "P/E", b: "Price-to-Earnings", d: "What multiple is the market paying for $1 of earnings—and is it justified or overheated? High = big expectations; low = cheap or struggling." },
  { f: "β", b: "Beta", d: "How wild is this stock vs the market? 1 = market-like, >1 = more volatile, <1 = calmer. Tells you how much it might swing." },
  { f: "σ", b: "Standard deviation", d: "How bumpy is the ride? Higher = bigger swings, lower = smoother returns. Your volatility meter." },
  { f: "α", b: "Alpha", d: "Did you actually beat the market—or just get lucky? Positive = outperformance, negative = underperformance." },
  { f: "DD", b: "Drawdown", d: "How bad did it get at the worst point? Peak → bottom loss during a period. Shows the pain of holding." },
  { f: "SR", b: "Sharpe ratio", d: "How much return per unit of risk? Higher = more efficient. Separates skill from just taking big risks." },
  { f: "DY", b: "Dividend yield", d: "Annual dividends paid relative to stock price. The income generated from holding the stock." },
  { f: "MC", b: "Market cap", d: "Total value of a company's outstanding shares. A measure of its size and weight." },
  { f: "VL", b: "Volume", d: "Total shares traded during a period. Indicates the level of interest and activity in the stock." },
];

const VOICES = [
  { q: "I learned more about how economies work in two leagues than 6 years of school.", n: "Sahil G.", r: "6th Grader · Rank #4/37" },
  { q: "I was never able to memorize how to calculate PnL or DY, but Quantis helped me understand how to use them to MAKE calculated decisions.", n: "Shourya K.", r: "9th Grader · 2x Texas Podium" },
  { q: "I kept coming back for the streaks and challenges but somehow ended up learning real financial analytics.", n: "Arush S.", r: "11th Grade Athlete · District Champion" },
  { q: "Quantis taught me that the stock market is not a game of luck, but a tournament of skill.", n: "Arjun R.", r: "Incoming @UT · Ω League 3rd" },
  { q: "Quantis helped me gain usable understanding of how to grow wealth over weeks, months, and years.", n: "Aditya", r: "8th Grader · Λ League 1st" },
  { q: "Quantis taught me that every single action is connected in business, and understanding why changes the game.", n: "Neer", r: "10th Grader · League Organizer" },
];

const FAQ = [
  { q: "Is it real money?", a: "No. Every player starts with $100,000 in virtual cash. The stakes are your rank, not your wallet — plenty motivating." },
  { q: "Where do prices come from?", a: "Real tickers across 120 markets, driven by a stochastic price engine calibrated to real volatility. It ticks between market hours so there's always something to react to." },
  { q: "How does the rival system work?", a: "Each week you're paired with one player of similar rank. Beat them and you climb; lose and they take your spot." },
  { q: "Is it free for schools?", a: "Yes. School leagues are free for educators during beta. Spin up a private league for your class, club, or year group in minutes." },
  { q: "When does a week reset?", a: "Friday 16:00. Winners are announced, rankings lock, and a fresh battle opens Monday. Season totals carry across weeks." },
  { q: "Do I need finance experience?", a: "No. Most players start cold. The leaderboard surfaces concepts exactly when your portfolio needs them — you learn by losing rank, then by climbing back." },
  { q: "Can I play on my phone?", a: "Yes. Quantis is mobile-first. Most weekly cycles are checked between classes, on the bus, or right before market close." },
  { q: "How big is a league?", a: "50 players per cohort. Small enough to know who you're chasing, large enough that the top spots feel earned." },
];

function buildEnginePath(w, h, seed = 0) {
  const pts = [];
  let v = 100, momentum = 0, volatility = 0.6;
  for (let i = 0; i < 220; i++) {
    const t = i + seed;
    const noise = Math.sin(t * 0.05) * 1.2 + Math.cos(t * 0.03) * 0.8 + Math.sin(t * 0.15) * 0.5 + Math.cos(t * 0.12) * 0.4 + Math.sin(t * 0.4) * 0.15;
    volatility = Math.max(0.3, Math.min(1.2, volatility + Math.sin(t * 0.02) * 0.02));
    momentum = momentum * 0.85 + noise * 0.15;
    v += momentum * volatility + 0.03;
    pts.push(v);
  }
  const smooth = pts.map((_, i, a) => ((a[i - 1] ?? a[i]) + a[i] * 2 + (a[i + 1] ?? a[i])) / 4);
  const min = Math.min(...smooth), max = Math.max(...smooth), range = max - min || 1;
  return smooth.map((p, i) => `${(i / (smooth.length - 1)) * w},${h - ((p - min) / range) * (h - 20) - 10}`).join(" ");
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [feed, setFeed] = useState([]);
  const [seed, setSeed] = useState(0);
  const [showTransition, setShowTransition] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowTransition(false), 4200);
    return () => clearTimeout(t);
  }, []);

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
    let frame, start;
    const loop = (t) => {
      if (!start) start = t;
      setSeed((t - start) * 0.02);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);


  const W = 460, H = 240;
  const path = buildEnginePath(W, H, seed);
  const go = () => navigate("/signup");

  return (
    <div className="qz">
      {showTransition && (
        <div className="qz-screen-transition" aria-hidden>
          <div className="qz-screen-line" />
        </div>
      )}
      <MoleculeBg />
      <div className="qz-aurora" aria-hidden>
        <span className="qz-aurora-blob a" />
        <span className="qz-aurora-blob b" />
        <span className="qz-aurora-blob c" />
      </div>

      {/* NAV */}
      <nav className="qz-nav">
        <div className="qz-wrap qz-nav-inner">
          <div className="qz-logo" onClick={() => navigate("/")} role="button" tabIndex={0}>
            <span className="qz-logo-mark">
              <img src="/logo.jpeg" alt="Quantis logo" className="qz-logo-img" />
            </span>
            <span className="qz-logo-text">Quantis</span>
            <span className="qz-tag">Gamified literacy</span>
          </div>
          <div className="qz-nav-actions">
            <button className="qz-btn--invert" onClick={() => navigate("/auth")}>
              Sign in <span className="qz-btn-arrow">→</span>
            </button>
            <button className="qz-btn" onClick={() => navigate("/signup")}>
              Sign up <span className="qz-btn-arrow">→</span>
            </button>
          </div>
        </div>
      </nav>

      {/* TICKER */}
      <div className="qz-ticker">
        <div className="qz-ticker-track">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span className="qz-ticker-item" key={i}>
              <span className="qz-ticker-s">{t.s}</span>
              <span className={`qz-ticker-p ${t.p.startsWith("-") ? "qz-down" : ""}`}>{t.p}</span>
              <Sparkline up={!t.p.startsWith("-")} />
            </span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="qz-hero">
        <div className="qz-hero-grid" aria-hidden />
        <div className="qz-wrap qz-hero-inner">
          <div>
            <span className="qz-pill">
              <span className="qz-dot" /> School leagues · Individual leagues · Open now
            </span>
            <h1 className="qz-h1">
              <span className="qz-word d1">Markets,</span>{" "}
              <span className="qz-word d1 accent">taught</span>{" "}
              <span className="qz-word d2">by</span>{" "}
              <span className="qz-word d3 accent">competition.</span>
            </h1>
            <p className="qz-lede">
              Quantis turns financial education into a game of rank. Every week, you and 49 other players are placed against each other in a clash of portfolios. The catch? The only way to climb the leaderboard is to out-invest your rivals — which means you learn by doing, and you remember by competing.
            </p>
            <div className="qz-cta-row">
              <button className="qz-btn qz-btn-lg" onClick={go}>
                Join a league <span className="qz-btn-arrow">→</span>
              </button>
              <a className="qz-btn-ghost" href="#screen">See the battle screen</a>
            </div>
            <CountStats />
          </div>

          <Reveal as="div" delay={120}>
            <TiltCard>
              <HeroCard />
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* LEARN / SKILLS */}
      <section className="qz-section" id="learn">
        <div className="qz-wrap">
          <span className="qz-section-label">00 — Why it works</span>
          <h2 className="qz-h2">
            Financial literacy doesn't stick from a textbook. It sticks from <span className="accent">getting ranked.</span>
          </h2>
          <p className="qz-lede-2">
            Traditional finance education teaches concepts in isolation — diversification on Monday,
            volatility on Wednesday, behavioural bias never. Quantis flips it: you compete first, and
            the concepts arrive exactly when your portfolio needs them.
          </p>
          <div className="qz-skills">
            {SKILLS.map((s, i) => (
              <Reveal as="div" delay={i * 70} key={s.k}>
                <SkillCard skill={s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONCEPTS */}
      <section className="qz-section" id="vocab">
        <div className="qz-wrap">
          <span className="qz-section-label">The vocabulary</span>
          <h2 className="qz-h2">Concepts you'll <span className="accent">absorb without studying.</span></h2>
          <p className="qz-lede-2">
            Hover any card. These are the metrics the leaderboard pushes you to internalise — not
            because we lecture you, but because they predict who climbs and who falls.
          </p>
          <div className="qz-concepts">
            {CONCEPTS.map((c, i) => (
              <Reveal as="div" delay={i * 50} key={c.f}>
                <ConceptCard c={c} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* UNIVERSE */}
      <section className="qz-section" id="universe">
        <div className="qz-wrap qz-market">
          <div>
            <span className="qz-section-label">The universe</span>
            <h2 className="qz-h2">15,000 stocks. 120 markets.</h2>
            <p>
              Build a portfolio from real tickers across NYSE, NASDAQ, LSE, TSE, HKEX, Euronext, ASX
              and 113 more international exchanges. Behind it all runs a quantitative stochastic price
              simulation — calibrated to real volatility — that drives constant action between market hours.
            </p>
            <div className="qz-tiles">
              <div className="qz-tile"><div className="k">15K</div><div className="v">Tickers</div></div>
              <div className="qz-tile"><div className="k">120</div><div className="v">Exchanges</div></div>
              <div className="qz-tile"><div className="k">24/7</div><div className="v">Engine</div></div>
            </div>
          </div>

          <Reveal as="div" delay={120}>
            <div className="qz-engine">
              <div className="qz-engine-head">
                <span className="qz-meta">Stochastic price engine · market open</span>
                <span className="qz-live"><span className="qz-dot" /> LIVE</span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="qzFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d6c6a6" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#d6c6a6" stopOpacity="0" />
                  </linearGradient>
                  <pattern id="qzGrid" width="46" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 46 0 L 0 0 0 40" fill="none" stroke="rgba(214,198,166,0.08)" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width={W} height={H} fill="url(#qzGrid)" />
                <polyline className="qz-engine-fill" points={`0,${H} ${path} ${W},${H}`} fill="url(#qzFill)" stroke="none" />
                <polyline className="qz-engine-line" points={path} fill="none" stroke="#d6c6a6" strokeWidth="2" />
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

      {/* SCREEN — board + feed */}
      <section className="qz-section" id="screen">
        <div className="qz-wrap">
          <span className="qz-section-label">01 — The screen</span>
          <h2 className="qz-h2">One screen. Rank, rival, distance to next.</h2>
          <p className="qz-lede-2">No tabs. No dashboards. Every login answers one question — am I moving up?</p>

          <div className="qz-board">
            <div>
              <div className="qz-board-card">
                <div className="qz-board-head">
                  <span className="qz-meta">Top 15 · Week 03</span>
                  <span className="qz-meta">closes Fri 16:00</span>
                </div>
                <div className="qz-board-list">
                  <div className="qz-board-track">
                    {[...SEED, ...SEED].map((r, i) => (
                      <BoardRow row={r} key={i} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="qz-feed">
              <div className="qz-feed-head">
                <span className="qz-dot" /> League feed · live
              </div>
              <ul>
                {feed.map((item) => (
                  <li key={item.id}>
                    <span className="t">{item.time}</span>
                    <span>{item.line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* MECHANIC — rivals */}
      <section className="qz-section" id="mechanic">
        <div className="qz-wrap">
          <span className="qz-section-label">02 — The mechanic</span>
          <h2 className="qz-h2">One fixed rival. Every week. <span className="accent">Personal.</span></h2>
          <p className="qz-lede-2">
            Every player gets paired with one other player of similar rank. Beat them and you climb.
            Lose and they take your spot.
          </p>

          <div className="qz-rival-grid">
            <Reveal as="div" delay={0}>
              <RivalCard you name="You" handle="@aditya" rank={7} pnl={5.74} delta={4} />
            </Reveal>
            <Reveal as="div" delay={120}>
              <RivalCard name="Jordan Park" handle="@jpark" rank={6} pnl={6.1} delta={-2} />
            </Reveal>
          </div>

          <div className="qz-h2h">
            <div>
              <div className="meta">Head-to-head</div>
              <div className="big qz-down">−0.36% vs @jpark</div>
            </div>
            <div className="meta">Closes Fri 16:00 · Winner takes the rank</div>
          </div>
        </div>
      </section>

      {/* LOOP */}
      <section className="qz-section" id="loop">
        <div className="qz-wrap">
          <span className="qz-section-label">03 — The loop</span>
          <h2 className="qz-h2">A weekly cycle, built to be checked daily.</h2>
          <div className="qz-steps">
            {[
              { n: "01", t: "Same start", d: "Every player gets $100,000 in virtual cash and access to all 15,000 tickers." },
              { n: "02", t: "Constant moves", d: "A stochastic price engine ticks between real market hours. Trade when it makes sense — or hold." },
              { n: "03", t: "Rank shifts", d: "The leaderboard recalculates continuously. Your rival, the top 10, and your distance to next." },
              { n: "04", t: "Week locks", d: "Friday 16:00 the week closes. Winners are announced. Rankings reset. New battle Monday." },
            ].map((s, i) => (
              <Reveal as="div" delay={i * 70} key={s.n}>
                <div className="qz-step">
                  <div className="n">{s.n}</div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* VOICES */}
      <section className="qz-section" id="voices">
        <div className="qz-wrap">
          <span className="qz-section-label">From the board</span>
          <h2 className="qz-h2">What players — and teachers — <span className="accent">actually say.</span></h2>

          <div className="qz-voices">
            <div className="qz-voices-track">
              {[...VOICES, ...VOICES].map((v, i) => (
                <figure className="qz-voice" key={i}>
                  <blockquote>“{v.q}”</blockquote>
                  <figcaption>
                    <span className="nm">{v.n}</span>
                    <span className="rl">{v.r}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="qz-section" id="faq">
        <div className="qz-wrap">
          <div className="qz-faq-top">
            <div>
              <span className="qz-section-label">Questions</span>
              <h2 className="qz-h2">Everything before you join.</h2>
            </div>
            <div className="qz-faq-stats">
              <div><div className="k">50</div><div className="v">per cohort</div></div>
              <div><div className="k">$100K</div><div className="v">virtual capital</div></div>
              <div><div className="k">Fri 16:00</div><div className="v">weekly close</div></div>
              <div><div className="k">Free</div><div className="v">for schools</div></div>
            </div>
          </div>
          <div className="qz-faq qz-faq-dense">
            {FAQ.map((item, i) => (
              <Reveal as="div" delay={i * 40} key={item.q}>
                <FaqItem item={item} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="qz-section" id="join">
        <div className="qz-wrap">
          <div className="qz-cta-card">
            <div className="qz-cta-inner">
              <span className="qz-section-label">Pick your league</span>
              <h2 className="qz-h2">Two ways to play. <span className="accent">One leaderboard mentality.</span></h2>
              <p className="qz-lede-2">
                Join an individual league and get matched into a global cohort instantly, or spin up a
                school league for your class, club, or year group.
              </p>

              <div className="qz-league-grid">
                <div className="qz-league primary">
                  <div className="tag">Individual league</div>
                  <h3>Jump in solo</h3>
                  <p>Get matched into an open cohort of 50 players. New battle every Monday.</p>
                  <button className="go" onClick={go}>Create an account →</button>
                </div>
                <div className="qz-league">
                  <div className="tag">School league</div>
                  <h3>Bring your school</h3>
                  <p>Run a private league for your class, club, or whole year group. Free for educators.</p>
                  <button className="go" onClick={go}>Set up your school →</button>
                </div>
              </div>

              <form className="qz-form" onSubmit={(e) => { e.preventDefault(); go(); }}>
                <input type="email" placeholder="you@email.com" />
                <button className="qz-btn qz-btn-lg" type="submit">Start Battling</button>
              </form>
              <div className="qz-form-note">Open now · Free during beta</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="qz-footer">
        <div className="qz-wrap qz-footer-inner">
          <div className="qz-logo">
            <span className="qz-logo-mark">
              <img src="/logo.jpeg" alt="Quantis logo" className="qz-logo-img" />
            </span>
            <span className="qz-logo-text">Quantis</span>
            <span className="qz-footer-note">© 2026</span>
          </div>
          <div className="qz-footer-note">Founded by Aditya Jha and Neer Luthra.</div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- molecule particle background ---------- */
function MoleculeBg() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf, w, h;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.min(180, Math.floor((window.innerWidth * window.innerHeight) / 12000));
    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 2.0 + 0.9,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      // links
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 220 * 220) {
            const alpha = (1 - d2 / (220 * 220)) * 0.28;
            ctx.strokeStyle = `rgba(214,198,166,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // nodes
      for (const p of pts) {
        ctx.fillStyle = "rgba(214,198,166,0.72)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(214,198,166,0.14)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={ref} className="qz-molecule" aria-hidden />;
}

function Sparkline({ up }) {
  const pts = useRef(Array.from({ length: 12 }, () => 8 + Math.random() * 8)).current;
  const d = pts.map((y, i) => `${i * 4},${y}`).join(" ");
  return (
    <svg className="qz-spark" viewBox="0 0 44 20" preserveAspectRatio="none">
      <polyline points={d} fill="none" stroke={up ? "#d6c6a6" : "#c97a5a"} strokeWidth="1.2" />
    </svg>
  );
}

function Reveal({ children, as: Tag = "div", delay = 50 }) {
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
    <div className="qz-stats" ref={ref}>
      <div>
        <div className="qz-stat-label">Tickers</div>
        <div className="qz-stat-row"><span className="qz-stat-val">{Math.round(tickers)}K</span><span className="qz-stat-suf">real markets</span></div>
      </div>
      <div>
        <div className="qz-stat-label">Exchanges</div>
        <div className="qz-stat-row"><span className="qz-stat-val">{Math.round(markets)}</span><span className="qz-stat-suf">worldwide</span></div>
      </div>
      <div>
        <div className="qz-stat-label">Day cycle</div>
        <div className="qz-stat-row"><span className="qz-stat-val">{Math.round(cycle)}</span><span className="qz-stat-suf">weekly reset</span></div>
      </div>
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
  return <div className="qz-tilt" ref={ref}>{children}</div>;
}

function HeroCard() {
  const path = buildEnginePath(280, 70, 5);
  return (
    <div className="qz-hero-card">
      <div className="qz-card-shine" aria-hidden />
      <div>
        <div className="qz-card-head">
          <span className="qz-meta">Cedar Park High · Week 03</span>
          <span className="qz-live"><span className="qz-dot" /> LIVE</span>
        </div>
        <div className="qz-hero-body">
          <div>
            <div className="qz-meta">Your rank</div>
            <div className="qz-rank">#7</div>
            <span className="qz-rank-delta">▲ 4 since yesterday</span>
          </div>
          <div className="qz-hero-right">
            <div className="qz-meta">Weekly return</div>
            <div className="qz-return">+5.74%</div>
            <div className="qz-cash">$105,740 / $100,000</div>
            
<svg className="qz-hero-spark" viewBox="0 0 280 70" preserveAspectRatio="none">              <defs>
                <linearGradient id="qzHF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d6c6a6" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#d6c6a6" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <polyline points={`0,70 ${path} 280,70`} fill="url(#qzHF)" stroke="none" />
              <polyline points={path} fill="none" stroke="#d6c6a6" strokeWidth="1.6" />
            </svg>
          </div>
        </div>

        <div className="qz-school-sim">
          <div className="qz-meta">Cedar Park High · Market Metrics Overlay</div>
          <div className="qz-school-grid">
            <div className="qz-school-item"><span className="k">P/E Ratio</span><span className="v">18.4</span></div>
            <div className="qz-school-item"><span className="k">Beta</span><span className="v">1.32</span></div>
            <div className="qz-school-item"><span className="k">Std Dev</span><span className="v">12.6%</span></div>
            <div className="qz-school-item"><span className="k">Drawdown</span><span className="v">-8.4%</span></div>
            <div className="qz-school-item"><span className="k">Sharpe</span><span className="v">1.18</span></div>
            <div className="qz-school-item"><span className="k">Alpha</span><span className="v">+2.7%</span></div>
          </div>
        </div>
      </div>

      <div className="qz-next">
        <div className="qz-next-row">
          <span>Next rank</span>
          <span>@jpark · #6</span>
        </div>
        <div className="qz-bar"><i style={{ width: "82%" }} /></div>
        <div className="qz-next-row">
          <span className="qz-up">0.36% away</span>
          <span>≈ $360</span>
        </div>
      </div>

      <div className="qz-mini-grid">
        <div className="qz-mini">
          <div className="qz-mini-head"><span className="muted">#6 @jpark</span></div>
          <div className="qz-mini-val">+6.10%</div>
        </div>
        <div className="qz-mini you">
          <div className="qz-mini-head"><span className="muted">#7 @you</span></div>
          <div className="qz-mini-val">+5.74%</div>
        </div>
      </div>
    </div>
  );
}

function SkillCard({ skill }) {
  const ref = useSpotlight();
  return (
    <div className="qz-skill" ref={ref}>
      <div className="qz-skill-glow" aria-hidden />
      <span className="qz-skill-k">{skill.k}</span>
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
          <div className="qz-concept-hint"></div>
        </div>
        <div className="qz-concept-face back">
          <div className="qz-concept-name">{c.b}</div>
          <p>{c.d}</p>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <button className={`qz-faq-item ${open ? "open" : ""}`} onClick={() => setOpen((o) => !o)}>
      <span className="qz-faq-q">
        {item.q}
        <span className="qz-faq-ic">{open ? "−" : "+"}</span>
      </span>
      <span className="qz-faq-a">{item.a}</span>
    </button>
  );
}

function BoardRow({ row }) {
  const up = row.delta > 0;
  return (
    <div className={`qz-row ${row.you ? "you" : ""}`}>
      <span className="qz-rank-cell">#{row.rank}</span>
      <span className="qz-user">
        <span className={`qz-avatar ${row.you ? "you" : ""}`}>{row.name[0]}</span>
        <span className="qz-name-wrap">
          <span className="qz-name">
            {row.name}
            {row.rival && <span className="badge rival">rival</span>}
            {row.you && <span className="badge you">you</span>}
          </span>
          <span className="qz-handle">{row.handle}</span>
        </span>
      </span>
      <span className={`qz-delta ${up ? "qz-up" : row.delta < 0 ? "qz-down" : "qz-mut"}`}>
        {row.delta === 0 ? "–" : `${up ? "▲" : "▼"} ${Math.abs(row.delta)}`}
      </span>
      <span className={`qz-pnl ${row.pnl >= 0 ? "qz-up" : "qz-down"}`}>
        {row.pnl >= 0 ? "+" : ""}{row.pnl.toFixed(2)}%
      </span>
    </div>
  );
}

function RivalCard({ you, name, handle, rank, pnl, delta }) {
  return (
    <div className={`qz-rival ${you ? "you" : ""}`}>
      <div className="qz-rival-head">
        <div className="qz-rival-id">
          <span className={`qz-avatar ${you ? "you" : ""}`}>{name[0]}</span>
          <div>
            <div className="nm">{name}</div>
            <div className="hn">{handle}</div>
          </div>
        </div>
        <span className={`qz-rival-tag ${you ? "you" : ""}`}>{you ? "you" : "rival"}</span>
      </div>
      <div
        className="qz-rival-grid-metrics"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '10px',
          width: '100%'
        }}
      >
        {/* Four main metric cards */}
        <div className="qz-rival-metric qz-school-item" style={{ width: '100%', minWidth: 0 }}>
          <span className="k qz-school-k">Rank</span>
          <span className="v qz-school-v">#{rank}</span>
        </div>
        <div className="qz-rival-metric qz-school-item" style={{ width: '100%', minWidth: 0 }}>
          <span className="k qz-school-k">Return</span>
          <span className={`v qz-school-v ${pnl >= 0 ? "qz-up" : "qz-down"}`}>
            {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}%
          </span>
        </div>
        <div className="qz-rival-metric qz-school-item" style={{ width: '100%', minWidth: 0 }}>
          <span className="k qz-school-k">Δ 24h</span>
          <span className={`v qz-school-v ${delta > 0 ? "qz-up" : delta < 0 ? "qz-down" : "qz-mut"}`}>
            {delta === 0 ? "–" : `${delta > 0 ? "▲" : "▼"}${Math.abs(delta)}`}
          </span>
        </div>
        <div className="qz-rival-metric qz-school-item" style={{ width: '100%', minWidth: 0 }}>
          <span className="k qz-school-k">Portfolio</span>
          <span className="v qz-school-v">${(100000 * (1 + pnl / 100)).toLocaleString()}</span>
        </div>
        {/* The five metric cards previously inside qz-rival-extra */}
        <div className="qz-rival-metric qz-school-item" style={{ width: '100%', minWidth: 0 }}>
          <span className="k qz-school-k">Win Probability</span>
          <span className="v qz-school-v">{you ? "61%" : "39%"}</span>
        </div>
        <div className="qz-rival-metric qz-school-item" style={{ width: '100%', minWidth: 0 }}>
          <span className="k qz-school-k">Weekly Streak</span>
          <span className="v qz-school-v">{you ? "W3" : "L1"}</span>
        </div>
        <div className="qz-rival-metric qz-school-item" style={{ width: '100%', minWidth: 0 }}>
          <span className="k qz-school-k">Rival Record</span>
          <span className="v qz-school-v">{you ? "8–4" : "7–5"}</span>
        </div>
        <div className="qz-rival-metric qz-school-item qz-school-item-accent" style={{ width: '100%', minWidth: 0 }}>
          <span className="k qz-school-k">Pred. Placement</span>
          <span className="v qz-school-v">{you ? "Λ #11 · L6" : "Η #7 · L4"}</span>
        </div>
        <div className="qz-rival-metric qz-school-item" style={{ width: '100%', minWidth: 0 }}>
          <span className="k qz-school-k">League Pts</span>
          <span className="v qz-school-v">{you ? "184" : "201"}</span>
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
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShown(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, shown };
}

function useCountUp(target, duration, start) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null, frame;
    const tick = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setValue(target * progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
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
      el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);
  return ref;
}
