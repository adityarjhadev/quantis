import { useEffect, useState } from "react";

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState(null);
  const [movers, setMovers] = useState([]);
  const [stocks, setStocks] = useState(["AAPL", "TSLA", "NVDA", "MSFT"]);

  const fetchAll = async () => {
    const p = await fetch("http://localhost:8000/portfolio");
    const m = await fetch("http://localhost:8000/top-movers");

    setPortfolio(await p.json());
    setMovers(await m.json());
  };

  useEffect(() => {
    fetchAll();
    const i = setInterval(fetchAll, 2000);
    return () => clearInterval(i);
  }, []);

  if (!portfolio) return <div style={{ color: "#e8dcc3" }}>Loading...</div>;

  return (
    <div style={{ background: "#0b0b0c", color: "#e8dcc3", minHeight: "100vh" }}>

      {/* ================= TOP BAR ================= */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        padding: 20,
        borderBottom: "1px solid #222",
        position: "sticky",
        top: 0,
        background: "#0b0b0c"
      }}>

        <div>
          💰 Cash: ${portfolio.cash.toFixed(2)}
        </div>

        <div>
          📊 Portfolio: ${portfolio.total_value.toFixed(2)}
        </div>

        <div>
          📈 PnL: {portfolio.total_pnl.toFixed(2)}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {movers.map((m, i) => (
            <span key={i} style={{
              padding: "4px 10px",
              borderRadius: 8,
              background: m.trend > 0 ? "#1a3" : "#311",
              color: "#fff"
            }}>
              {m.ticker}
            </span>
          ))}
        </div>

      </div>

      {/* ================= MAIN GRID ================= */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 15,
        padding: 20
      }}>

        {stocks.map((s, i) => (
          <StockCard key={i} ticker={s} />
        ))}

      </div>
    </div>
  );
}
function StockCard({ ticker }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`http://localhost:8000/price/${ticker}`);
      setData(await res.json());
    };

    load();
    const i = setInterval(load, 2000);
    return () => clearInterval(i);
  }, [ticker]);

  if (!data) return null;

  return (
    <div style={{
      background: "#151518",
      padding: 15,
      borderRadius: 12,
      transition: "0.3s",
      cursor: "pointer"
    }}>

      <h3>{data.ticker}</h3>
      <h2>${data.price}</h2>

      <p style={{ opacity: 0.7 }}>
        Trend: {data.trend}
      </p>

      <div style={{ display: "flex", gap: 10 }}>
        <button>Buy</button>
        <button>Sell</button>
      </div>
    </div>
  );
}