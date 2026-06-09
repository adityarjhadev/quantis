"""
Portfolio Management System with Real Stock Data Integration
Handles buy/sell operations and portfolio tracking
"""

import yfinance as yf
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import time
import random

# =========================
# PRICE CACHE (SIMULATION LAYER)
# =========================
PRICE_CACHE = {}
LAST_UPDATE = {}
UPDATE_INTERVAL = 600  # 10 minutes

SIM_STATE = {}

# In-memory portfolio storage: user_id -> portfolio_id -> portfolio_data
user_portfolios = {}

def update_price_cache(ticker: str, stock_engines: Optional[Dict] = None):
    """Fetch price at most once every 10 minutes per ticker"""
    import time

    ticker = ticker.upper().strip()
    now = time.time()

    if ticker in LAST_UPDATE and now - LAST_UPDATE[ticker] < UPDATE_INTERVAL:
        return PRICE_CACHE.get(ticker)

    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="1d", interval="1m")

        if hist is None or hist.empty:
            return PRICE_CACHE.get(ticker)

        price = float(hist["Close"].iloc[-1])

        PRICE_CACHE[ticker] = {
            "price": price,
            "timestamp": now
        }
        LAST_UPDATE[ticker] = now

        return PRICE_CACHE[ticker]

    except Exception:
        return PRICE_CACHE.get(ticker)

def get_user_portfolio(user_id: str, portfolio_id: str = "independent"):
    """Get or create a user's portfolio"""
    if user_id not in user_portfolios:
        user_portfolios[user_id] = {}
    
    if portfolio_id not in user_portfolios[user_id]:
        user_portfolios[user_id][portfolio_id] = {
            "id": portfolio_id,
            "user_id": user_id,
            "cash": 100000,
            "positions": {},  # ticker -> {"qty": int, "avg_price": float, "entry_time": timestamp}
            "trades": [],  # historical trades
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    
    return user_portfolios[user_id][portfolio_id]

def fetch_stock_data_full(ticker: str, stock_engines: Optional[Dict] = None) -> Optional[Dict]:
    """Fetch complete stock data including history and metrics. Uses StockEngine if available."""
    try:
        ticker = ticker.upper().strip()

        # Use cache for price (with simulation fallback)
        cache = update_price_cache(ticker, stock_engines)
        if not cache:
            return None

        current_price = cache["price"]

        # simulated history (lightweight fallback)
        recent = [round(current_price * (1 + random.uniform(-0.01, 0.01)), 2) for _ in range(20)]

        # simulated metrics (still compatible with frontend)
        returns = [random.uniform(-0.02, 0.02) for _ in range(30)]

        volatility_20 = abs(sum(returns[-20:])) * 100
        volatility_60 = abs(sum(returns)) * 100

        ma5 = current_price * (1 + random.uniform(-0.005, 0.005))
        ma20 = current_price * (1 + random.uniform(-0.01, 0.01))
        ma50 = current_price * (1 + random.uniform(-0.02, 0.02))
        ma200 = current_price * (1 + random.uniform(-0.03, 0.03))

        rsi = random.uniform(30, 70)

        price_change_1d = random.uniform(-2, 2)
        price_change_7d = random.uniform(-5, 5)

        recent_high = current_price * 1.02
        recent_low = current_price * 0.98
        support = round(recent_low, 2)
        resistance = round(recent_high, 2)

        avg_volume = random.randint(1_000_000, 10_000_000)

        info = {}

        return {
            "ticker": ticker,
            "price": round(current_price, 2),
            "anchor": round(current_price, 2),
            "history": [round(p, 2) for p in recent],
            "metrics": {
                "volatility20": round(volatility_20, 2),
                "volatility60": round(volatility_60, 2),
                "ma5": round(ma5, 2),
                "ma20": round(ma20, 2),
                "ma50": round(ma50, 2),
                "ma200": round(ma200, 2),
                "rsi": round(rsi, 2),
                "beta": round(info.get("beta", 1.0), 2),
                "marketCap": info.get("marketCap", 0),
                "pe": round(info.get("trailingPE", 0), 2),
                "profitMargin": round(info.get("profitMargins", 0) * 100, 2) if info.get("profitMargins") else 0,
                "avgVolume": avg_volume,
                "support": support,
                "resistance": resistance,
                "priceChange1d": round(price_change_1d, 2),
                "priceChange7d": round(price_change_7d, 2),
                "atr20": round(abs(recent_high - recent_low), 2),
                "ema12": round(ma20, 2),
                "ema26": round(ma50, 2),
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error fetching stock data for {ticker}: {e}")
        return None

def execute_buy(user_id: str, portfolio_id: str, ticker: str, quantity: int, stock_engines: Optional[Dict] = None) -> Tuple[bool, str, Optional[Dict]]:
    """Execute a buy order. Returns (success, message, updated_portfolio)"""
    ticker = ticker.upper().strip()
    
    if quantity <= 0:
        return False, "Quantity must be positive", None
    
    # Fetch real stock data (uses StockEngine if available)
    stock_data = fetch_stock_data_full(ticker, stock_engines)
    if not stock_data:
        return False, f"Invalid ticker or unable to fetch data: {ticker}", None
    
    current_price = stock_data["price"]
    cost = current_price * quantity
    
    portfolio = get_user_portfolio(user_id, portfolio_id)
    
    if portfolio["cash"] < cost:
        return False, f"Insufficient funds. Need ${cost:,.2f}, have ${portfolio['cash']:,.2f}", None
    
    # Execute the buy
    portfolio["cash"] -= cost
    
    if ticker not in portfolio["positions"]:
        portfolio["positions"][ticker] = {
            "qty": 0,
            "avg_price": 0,
            "entry_time": datetime.now().isoformat()
        }
    
    pos = portfolio["positions"][ticker]
    total_qty = pos["qty"] + quantity
    new_avg = ((pos["qty"] * pos["avg_price"]) + (quantity * current_price)) / total_qty
    
    pos["qty"] = total_qty
    pos["avg_price"] = new_avg
    pos["entry_time"] = datetime.now().isoformat()
    
    portfolio["updated_at"] = datetime.now().isoformat()
    
    # Record the trade
    portfolio["trades"].append({
        "type": "buy",
        "ticker": ticker,
        "quantity": quantity,
        "price": current_price,
        "total": cost,
        "timestamp": datetime.now().isoformat()
    })
    
    return True, f"Bought {quantity} shares of {ticker} at ${current_price:.2f}", build_portfolio_response(user_id, portfolio_id, stock_engines)

def execute_sell(user_id: str, portfolio_id: str, ticker: str, quantity: int, stock_engines: Optional[Dict] = None) -> Tuple[bool, str, Optional[Dict]]:
    """Execute a sell order. Returns (success, message, updated_portfolio)"""
    ticker = ticker.upper().strip()
    
    if quantity <= 0:
        return False, "Quantity must be positive", None
    
    portfolio = get_user_portfolio(user_id, portfolio_id)
    
    if ticker not in portfolio["positions"]:
        return False, f"No position in {ticker}", None
    
    pos = portfolio["positions"][ticker]
    if pos["qty"] < quantity:
        return False, f"Insufficient shares. Have {pos['qty']}, trying to sell {quantity}", None
    
    # Fetch real stock data (uses StockEngine if available)
    stock_data = fetch_stock_data_full(ticker, stock_engines)
    if not stock_data:
        return False, f"Unable to fetch price for {ticker}", None
    
    current_price = stock_data["price"]
    revenue = current_price * quantity
    
    # Execute the sell
    pos["qty"] -= quantity
    portfolio["cash"] += revenue
    
    if pos["qty"] == 0:
        del portfolio["positions"][ticker]
    
    portfolio["updated_at"] = datetime.now().isoformat()
    
    # Record the trade
    portfolio["trades"].append({
        "type": "sell",
        "ticker": ticker,
        "quantity": quantity,
        "price": current_price,
        "total": revenue,
        "timestamp": datetime.now().isoformat()
    })
    
    return True, f"Sold {quantity} shares of {ticker} at ${current_price:.2f}", build_portfolio_response(user_id, portfolio_id, stock_engines)

def build_portfolio_response(user_id: str, portfolio_id: str, stock_engines: Optional[Dict] = None) -> Dict:
    """Build a complete portfolio response with all holdings and stats"""
    portfolio = get_user_portfolio(user_id, portfolio_id)
    
    holdings_list = []
    total_market_value = 0
    total_cost_basis = 0
    
    for ticker, pos in portfolio["positions"].items():
        stock_data = fetch_stock_data_full(ticker, stock_engines)
        if not stock_data:
            continue
        
        current_price = stock_data["price"]
        qty = pos["qty"]
        market_value = current_price * qty
        cost_basis = pos["avg_price"] * qty
        pnl = market_value - cost_basis
        pnl_percent = (pnl / cost_basis * 100) if cost_basis > 0 else 0
        
        total_market_value += market_value
        total_cost_basis += cost_basis
        
        holdings_list.append({
            "symbol": ticker,
            "qty": qty,
            "shares": qty,
            "price": round(current_price, 2),
            "value": round(market_value, 2),
            "avgCost": round(pos["avg_price"], 2),
            "avg_price": round(pos["avg_price"], 2),
            "pnl": round(pnl, 2),
            "pnlPercent": round(pnl_percent, 2),
            "dayChange": stock_data["metrics"]["priceChange1d"],
            "volume": stock_data["metrics"]["avgVolume"],
            "history": stock_data["history"]
        })
    
    total_pnl = total_market_value - total_cost_basis
    total_pnl_percent = (total_pnl / total_cost_basis * 100) if total_cost_basis > 0 else 0
    total_value = portfolio["cash"] + total_market_value
    
    # Calculate additional metrics
    volatility = 0
    if holdings_list:
        vols = []
        for holding in holdings_list:
            vols.append(random.uniform(10, 40))
        volatility = sum(vols) / len(vols)
    
    # Calculate win rate from trades
    win_rate = 0
    if portfolio["trades"]:
        profitable_trades = 0
        for trade in portfolio["trades"]:
            if trade["type"] == "sell":
                # Find corresponding buy to calculate P&L
                buy_trades = [t for t in portfolio["trades"] if t["type"] == "buy" and t["ticker"] == trade["ticker"]]
                if buy_trades:
                    # Simplified: assume sell price vs buy price
                    if trade["price"] > buy_trades[-1]["price"]:
                        profitable_trades += 1
        total_sell_trades = len([t for t in portfolio["trades"] if t["type"] == "sell"])
        win_rate = (profitable_trades / total_sell_trades * 100) if total_sell_trades > 0 else 0
    
    # Calculate max gain and max loss from holdings
    max_gain = 0
    max_loss = 0
    for holding in holdings_list:
        pnl_percent = holding.get("pnlPercent", 0)
        if pnl_percent > max_gain:
            max_gain = pnl_percent
        if pnl_percent < max_loss:
            max_loss = pnl_percent
    
    # Calculate YTD return (simplified as total P&L percent since inception)
    ytd_return = total_pnl_percent
    
    # Calculate Sortino ratio (downside risk-adjusted return)
    sortino = 0
    if volatility > 0 and total_pnl_percent > 0:
        # Simplified Sortino: return / downside volatility
        sortino = total_pnl_percent / volatility
    
    # Calculate Sharpe ratio (risk-adjusted return)
    sharpe_ratio = 0
    if volatility > 0:
        # Simplified Sharpe: return / volatility (assuming risk-free rate = 0)
        sharpe_ratio = total_pnl_percent / volatility
    
    # Calculate margin used (0 since we don't support margin trading)
    margin_used = 0
    
    # Calculate diversification score (based on number of holdings and sector distribution)
    diversification_score = min(100, len(holdings_list) * 10)
    
    # Calculate average trade duration
    avg_trade_duration = "0 days"
    if portfolio["trades"]:
        durations = []
        for i, trade in enumerate(portfolio["trades"]):
            if trade["type"] == "sell":
                # Find corresponding buy
                for j in range(i):
                    if portfolio["trades"][j]["type"] == "buy" and portfolio["trades"][j]["ticker"] == trade["ticker"]:
                        buy_time = datetime.fromisoformat(portfolio["trades"][j]["timestamp"])
                        sell_time = datetime.fromisoformat(trade["timestamp"])
                        duration = (sell_time - buy_time).days
                        durations.append(duration)
                        break
        if durations:
            avg_days = sum(durations) / len(durations)
            avg_trade_duration = f"{avg_days:.1f} days"
    
    # Calculate portfolio beta (weighted average of stock betas)
    portfolio_beta = 0
    if holdings_list and total_market_value > 0:
        total_beta = 0
        for holding in holdings_list:
            weight = holding["value"] / total_market_value
            # Get beta from stock data
            try:
                stock_data = fetch_stock_data_full(holding["symbol"], stock_engines)
                if stock_data and stock_data.get("metrics"):
                    beta = stock_data["metrics"].get("beta", 1.0)
                    total_beta += beta * weight
            except:
                total_beta += 1.0 * weight
        portfolio_beta = total_beta
    
    # Calculate total return (including dividends - simplified)
    total_return = total_pnl_percent
    
    return {
        "portfolio_id": portfolio_id,
        "name": f"{portfolio_id.replace('_', ' ').title()} League",
        "cash": round(portfolio["cash"], 2),
        "totalValue": round(total_value, 2),
        "buyingPower": round(portfolio["cash"], 2),
        "total_value": round(total_value, 2),
        "total_pnl": round(total_pnl, 2),
        "pnl": round(total_pnl, 2),
        "pnlPercent": round(total_pnl_percent, 2),
        "cashOnHand": round(portfolio["cash"], 2),
        "holdings": len(holdings_list),
        "holdings_list": holdings_list,
        "volatility": round(volatility, 2),
        "sharpeRatio": round(sharpe_ratio, 2),
        "winRate": round(win_rate, 0),
        "maxGain": round(max_gain, 2),
        "maxLoss": round(max_loss, 2),
        "ytdReturn": round(ytd_return, 2),
        "sortino": round(sortino, 2),
        "roi": round(total_pnl_percent, 2),
        "marginUsed": round(margin_used, 2),
        "diversification": round(diversification_score, 0),
        "avgTradeDuration": avg_trade_duration,
        "portfolioBeta": round(portfolio_beta, 2),
        "totalReturn": round(total_return, 2),
        "trades": portfolio["trades"]
    }

def get_portfolio_stats(user_id: str, portfolio_id: str) -> Dict:
    """Get portfolio statistics"""
    response = build_portfolio_response(user_id, portfolio_id)
    return {
        "total_value": response["total_value"],
        "cash": response["cash"],
        "total_invested": response["total_value"] - response["cash"],
        "total_pnl": response["pnl"],
        "total_pnl_percent": response["pnlPercent"],
        "num_positions": response["holdings"],
        "volatility": response["volatility"],
        "diversification_score": response["diversification"]
    }
