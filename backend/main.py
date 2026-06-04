from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from stock_engine import StockEngine
import asyncio
import yfinance as yf
import random

stock_universe = [
    "AAPL","TSLA","MSFT","NVDA","AMZN","GOOGL","META","AMD","NFLX","INTC",
    "PLTR","SOFI","DIS","UBER","SNAP","BABA","SHOP","PYPL","COIN","RIVN"
]

active_universe = random.sample(stock_universe, len(stock_universe))
app = FastAPI()

accounts = {}
engines = {}
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://fine-baths-sink.loca.lt",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/top-movers")
def top_movers():
    movers = []

    for ticker in engines:
        engine = engines[ticker]
        price = engine.display_price or 0
        trend = getattr(engine, "trend", 0)

        movers.append({
            "ticker": ticker,
            "price": price,
            "trend": trend
        })

    movers.sort(key=lambda x: x["trend"], reverse=True)

    return movers[:3]
# active engines
engines = {}
def get_account(user_id="default"):
    if user_id not in accounts:
        accounts[user_id] = {
            "cash": 100000,
            "positions": {},  # ticker -> shares
            "history": []
        }
    return accounts[user_id]
@app.post("/buy/{ticker}")
def buy(ticker: str, qty: int = 1, user_id: str = "default"):
    ticker = ticker.upper()
    account = get_account(user_id)

    engine = engines.get(ticker)
    if not engine:
        return {"error": "engine not started"}

    price = engine.display_price or engine.anchor_price
    if not price:
        return {"error": "no price yet"}

    cost = price * qty

    if account["cash"] < cost:
        return {"error": "insufficient funds"}

    account["cash"] -= cost

    pos = account["positions"].get(ticker, {
        "qty": 0,
        "avg_price": 0
    })

    total_qty = pos["qty"] + qty
    new_avg = ((pos["qty"] * pos["avg_price"]) + (qty * price)) / total_qty

    account["positions"][ticker] = {
        "qty": total_qty,
        "avg_price": new_avg
    }

    return account
@app.post("/sell/{ticker}")
def sell(ticker: str, qty: int = 1, user_id: str = "default"):
    ticker = ticker.upper()
    account = get_account(user_id)

    engine = engines.get(ticker)
    if not engine:
        return {"error": "engine not started"}

    pos = account["positions"].get(ticker)

    if not pos or pos["qty"] < qty:
        return {"error": "not enough shares"}

    price = engine.display_price or engine.anchor_price
    revenue = price * qty

    pos["qty"] -= qty
    account["cash"] += revenue

    if pos["qty"] == 0:
        del account["positions"][ticker]

    return account
@app.get("/portfolio")
@app.get("/portfolio")
def portfolio(user_id: str = "default"):
    account = get_account(user_id)

    total_value = account["cash"]
    positions = []

    total_pnl = 0

    for ticker, pos in account["positions"].items():
        engine = engines.get(ticker)
        price = engine.display_price if engine else 0

        market_value = price * pos["qty"]
        cost_basis = pos["avg_price"] * pos["qty"]
        pnl = market_value - cost_basis

        total_value += market_value
        total_pnl += pnl

        positions.append({
            "ticker": ticker,
            "qty": pos["qty"],
            "avg_price": round(pos["avg_price"], 2),
            "price": price,
            "value": market_value,
            "pnl": round(pnl, 2)
        })

    return {
        "cash": account["cash"],
        "total_value": total_value,
        "total_pnl": round(total_pnl, 2),
        "positions": positions
    }
# =========================================================
# START STOCK ENGINE
# =========================================================
@app.get("/start/{ticker}")
async def start(ticker: str):
    ticker = ticker.upper()

    if ticker not in engines:
        engine = StockEngine(ticker)
        engines[ticker] = engine

        # IMPORTANT: tasks created inside async endpoint (valid event loop)
        asyncio.create_task(engine.anchor_loop())
        asyncio.create_task(engine.simulate_loop())

    return {
        "status": "started",
        "ticker": ticker
    }


# =========================================================
# GET LIVE PRICE
# =========================================================
@app.get("/price/{ticker}")
def price(ticker: str):
    ticker = ticker.upper()

    engine = engines.get(ticker)

    if not engine:
        return {"error": "engine not started"}

    return engine.get_price()


# =========================================================
# LIST ACTIVE STOCKS
# =========================================================
@app.get("/engines")
def list_engines():
    return {
        "active": list(engines.keys())
    }


# =========================================================
# SIMULATED STOCK METRICS
# =========================================================
@app.get("/metrics/{ticker}")
def metrics(ticker: str):
    ticker = ticker.upper()
    stock = yf.Ticker(ticker)

    info = stock.info or {}
    history = stock.history(period="1y", interval="1d")

    if history.empty:
        return {"error": "no data available for ticker"}

    if len(history) < 2:
        previous = history.iloc[-1]
    else:
        previous = history.iloc[-2]

    current = history.iloc[-1]
    price = round(float(current["Close"]), 2)
    previous_close = round(float(previous["Close"]), 2)
    change = round(price - previous_close, 2)
    percent_change = round((change / previous_close) * 100, 2) if previous_close else 0.0

    def safe_int(value):
        try:
            return int(value)
        except Exception:
            return None

    def safe_float(value, digits=2):
        try:
            return round(float(value), digits)
        except Exception:
            return None

    def pct_change(period_back):
        if len(history) > period_back:
            past = float(history["Close"].iloc[-1 - period_back])
            return round((price - past) / past * 100, 2) if past else None
        return None

    ma20 = history["Close"].rolling(20).mean().iloc[-1] if len(history) >= 20 else None
    ma50 = history["Close"].rolling(50).mean().iloc[-1] if len(history) >= 50 else None
    ma200 = history["Close"].rolling(200).mean().iloc[-1] if len(history) >= 200 else None

    returns_1m = pct_change(22)
    returns_3m = pct_change(63)
    returns_6m = pct_change(126)
    returns_1y = pct_change(len(history) - 1)

    volatility_20d = None
    volatility_60d = None
    if len(history) >= 20:
        volatility_20d = round(history["Close"].pct_change().rolling(20).std().iloc[-1] * 100, 2)
    if len(history) >= 60:
        volatility_60d = round(history["Close"].pct_change().rolling(60).std().iloc[-1] * 100, 2)

    fifty_two_week_low = info.get("fiftyTwoWeekLow")
    fifty_two_week_high = info.get("fiftyTwoWeekHigh")
    market_cap = info.get("marketCap")
    beta = info.get("beta")
    pe_ratio = info.get("trailingPE") or info.get("forwardPE")
    eps = info.get("trailingEps")
    dividend_yield = info.get("dividendYield")

    closes = history["Close"].tail(20).tolist()

    return {
        "ticker": ticker,
        "company": info.get("shortName", ticker),
        "price": price,
        "previous_close": previous_close,
        "change": change,
        "percent_change": percent_change,
        "open": safe_float(current.get("Open")),
        "high": safe_float(current.get("High")),
        "low": safe_float(current.get("Low")),
        "volume": safe_int(current.get("Volume")),
        "average_volume": safe_int(history["Volume"].tail(30).mean()),
        "market_cap": safe_int(market_cap),
        "beta": safe_float(beta),
        "pe_ratio": safe_float(pe_ratio),
        "eps": safe_float(eps),
        "dividend_yield": safe_float(dividend_yield * 100) if dividend_yield is not None else None,
        "fifty_two_week_low": safe_float(fifty_two_week_low),
        "fifty_two_week_high": safe_float(fifty_two_week_high),
        "moving_averages": {
            "ma20": safe_float(ma20),
            "ma50": safe_float(ma50),
            "ma200": safe_float(ma200),
        },
        "return_1m": returns_1m,
        "return_3m": returns_3m,
        "return_6m": returns_6m,
        "return_1y": returns_1y,
        "volatility_20d": volatility_20d,
        "volatility_60d": volatility_60d,
        "history": closes,
    }
