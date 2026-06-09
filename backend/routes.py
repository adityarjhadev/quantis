"""
API Routes for Quantis Dashboard
Connects to db.py data structures
"""

from fastapi import APIRouter, HTTPException
from db import (
    school_data, league_data, learn_data, portfolio_data,
    discover_data, simulation_data, user_data
)
from portfolio_manager import (
    execute_buy, execute_sell, build_portfolio_response,
    get_user_portfolio, fetch_stock_data_full
)

# Import stock_engines from main (will be set after app startup)
stock_engines = None

def set_stock_engines(engines):
    """Set the stock_engines reference from main.py"""
    global stock_engines
    stock_engines = engines

router = APIRouter()

# In-memory dashboard state keyed by user email
dashboard_states: dict = {}

# =========================================================
# DASHBOARD STATE ENDPOINTS
# =========================================================

@router.get("/api/dashboard/state")
def get_dashboard_state(email: str):
    """Get persisted dashboard state for a user, with live portfolio data merged in."""
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    state = dashboard_states.get(email)
    if not state:
        state = {
            "profile": {},
            "league": {},
            "school": {},
            "learn": {},
            "discover": {},
            "portfolio": {},
        }

    portfolio = state.get("portfolio", {})
    for portfolio_id in ("independent", "school", "global"):
        try:
            portfolio[portfolio_id] = build_portfolio_response(email, portfolio_id, stock_engines)
        except Exception:
            portfolio[portfolio_id] = {
                "name": f"{portfolio_id.replace('_', ' ').title()} League",
                "totalValue": 100000,
                "buyingPower": 100000,
                "pnl": 0,
                "pnlPercent": 0,
                "sharpeRatio": 0,
                "volatility": 0,
                "winRate": 0,
                "maxGain": 0,
                "maxLoss": 0,
                "ytdReturn": 0,
                "sortino": 0,
                "roi": 0,
                "marginUsed": 0,
                "cashOnHand": 100000,
                "holdings": 0,
                "diversification": 0,
                "avgTradeDuration": "0 days",
                "holdings_list": [],
            }
    state["portfolio"] = portfolio
    return state

@router.patch("/api/dashboard/state")
def update_dashboard_state(data: dict):
    """Persist dashboard state for a user."""
    email = data.get("email")
    state = data.get("state")
    if not email or not state:
        raise HTTPException(status_code=400, detail="Email and state are required")

    dashboard_states[email] = state
    return state

# =========================================================
# SCHOOL ENDPOINTS
# =========================================================

@router.get("/api/school/lessons")
def get_school_lessons():
    """Get all available lessons"""
    return school_data["lessons"]

@router.get("/api/school/lessons/{lesson_id}")
def get_lesson(lesson_id: int):
    """Get specific lesson"""
    lesson = next((l for l in school_data["lessons"] if l["id"] == lesson_id), None)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@router.patch("/api/school/lessons/{lesson_id}")
def update_lesson(lesson_id: int, data: dict):
    """Update lesson progress/completion"""
    lesson = next((l for l in school_data["lessons"] if l["id"] == lesson_id), None)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Update allowed fields: progress, quiz_score, completed
    if "progress" in data:
        lesson["progress"] = min(100, max(0, data["progress"]))
    if "quiz_score" in data:
        lesson["quiz_score"] = min(100, max(0, data["quiz_score"]))
    if "completed" in data:
        lesson["completed"] = data["completed"]
    
    return lesson

@router.get("/api/school/stats")
def get_school_stats():
    """Get user's school statistics"""
    return school_data["user_stats"]

@router.patch("/api/school/stats")
def update_school_stats(data: dict):
    """Update school statistics"""
    stats = school_data["user_stats"]
    for key in data:
        if key in stats:
            if isinstance(stats[key], dict) and isinstance(data[key], dict):
                stats[key].update(data[key])
            else:
                stats[key] = data[key]
    return stats

# =========================================================
# LEAGUE ENDPOINTS
# =========================================================

@router.get("/api/league/leaderboard")
def get_leaderboard():
    """Get current league leaderboard"""
    return league_data["leaderboard"]

@router.patch("/api/league/leaderboard/{rank}")
def update_leaderboard_entry(rank: int, data: dict):
    """Update a leaderboard entry"""
    entry = next((e for e in league_data["leaderboard"] if e["rank"] == rank), None)
    if not entry:
        raise HTTPException(status_code=404, detail="Leaderboard entry not found")
    
    entry.update(data)
    return entry

@router.get("/api/league/user-leagues")
def get_user_leagues():
    """Get user's league memberships"""
    return league_data["user_leagues"]

@router.get("/api/league/stats")
def get_league_stats():
    """Get overall league statistics"""
    return league_data["league_stats"]

@router.patch("/api/league/stats")
def update_league_stats(data: dict):
    """Update league statistics"""
    stats = league_data["league_stats"]
    stats.update(data)
    return stats

# =========================================================
# LEARN ENDPOINTS
# =========================================================

@router.get("/api/learn/courses")
def get_courses():
    """Get all available courses"""
    return learn_data["courses"]

@router.get("/api/learn/courses/{course_id}")
def get_course(course_id: int):
    """Get specific course"""
    course = next((c for c in learn_data["courses"] if c["id"] == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.patch("/api/learn/courses/{course_id}")
def update_course(course_id: int, data: dict):
    """Update course progress"""
    course = next((c for c in learn_data["courses"] if c["id"] == course_id), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    for key in ["progress", "modules_completed"]:
        if key in data:
            course[key] = data[key]
    
    return course

@router.get("/api/learn/progress")
def get_learning_progress():
    """Get user's learning progress"""
    return learn_data["user_learning"]

@router.patch("/api/learn/progress")
def update_learning_progress(data: dict):
    """Update learning progress"""
    progress = learn_data["user_learning"]
    progress.update(data)
    return progress

# =========================================================
# PORTFOLIO ENDPOINTS
# =========================================================

@router.get("/api/portfolio/holdings")
def get_holdings():
    """Get all portfolio holdings"""
    return portfolio_data["holdings"]

@router.get("/api/portfolio/stats")
def get_portfolio_stats():
    """Get portfolio statistics"""
    return portfolio_data["portfolio_stats"]

@router.patch("/api/portfolio/stats")
def update_portfolio_stats(data: dict):
    """Update portfolio statistics"""
    stats = portfolio_data["portfolio_stats"]
    stats.update(data)
    return stats

@router.get("/api/portfolio/performance")
def get_portfolio_performance():
    """Get portfolio performance across time periods"""
    return portfolio_data["performance"]

@router.patch("/api/portfolio/performance")
def update_portfolio_performance(data: dict):
    """Update performance metrics"""
    perf = portfolio_data["performance"]
    perf.update(data)
    return perf

@router.get("/api/portfolio/allocation")
def get_portfolio_allocation():
    """Get asset allocation breakdown"""
    return {
        "allocation": portfolio_data["allocation"],
        "sector_allocation": portfolio_data["sector_allocation"]
    }

@router.patch("/api/portfolio/allocation")
def update_allocation(data: dict):
    """Update allocation data"""
    if "allocation" in data:
        portfolio_data["allocation"].update(data["allocation"])
    if "sector_allocation" in data:
        portfolio_data["sector_allocation"].update(data["sector_allocation"])
    return {
        "allocation": portfolio_data["allocation"],
        "sector_allocation": portfolio_data["sector_allocation"]
    }

@router.get("/api/portfolio/history")
def get_performance_history():
    """Get performance history (for charts)"""
    return portfolio_data["performance_history"]

@router.post("/api/portfolio/history")
def add_history_entry(entry: dict):
    """Add history entry"""
    portfolio_data["performance_history"].append(entry)
    return portfolio_data["performance_history"]

# =========================================================
# REAL PORTFOLIO TRADING ENDPOINTS
# =========================================================

@router.post("/api/portfolio/{portfolio_id}/trade")
def execute_portfolio_trade(portfolio_id: str, data: dict):
    """Execute a trade (buy or sell) on a portfolio"""
    email = data.get("email", "default")
    ticker = data.get("ticker", "").upper().strip()
    side = data.get("side", "").lower()  # "buy" or "sell"
    quantity = int(data.get("quantity", 0))
    
    if not ticker or not side or quantity <= 0:
        raise HTTPException(status_code=400, detail="Invalid trade parameters")
    
    if side == "buy":
        success, message, response = execute_buy(email, portfolio_id, ticker, quantity, stock_engines)
    elif side == "sell":
        success, message, response = execute_sell(email, portfolio_id, ticker, quantity, stock_engines)
    else:
        raise HTTPException(status_code=400, detail="Side must be 'buy' or 'sell'")
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    # Return wrapped in portfolio structure for frontend
    return {
        "portfolio": {
            portfolio_id: response
        }
    }

@router.get("/api/portfolio/{portfolio_id}")
def get_portfolio_data(portfolio_id: str, email: str = "default"):
    """Get complete portfolio data with all holdings and stats"""
    return build_portfolio_response(email, portfolio_id, stock_engines)

@router.get("/api/stock/{ticker}")
def get_stock_quote(ticker: str):
    """Get real stock data with history and metrics"""
    ticker = ticker.upper().strip()
    
    stock_data = fetch_stock_data_full(ticker, stock_engines)
    if not stock_data:
        raise HTTPException(status_code=404, detail=f"Unable to fetch data for {ticker}")
    
    return stock_data

# =========================================================
# DISCOVER ENDPOINTS
# =========================================================

@router.get("/api/discover/top-traders")
def get_top_traders():
    """Get top traders list"""
    return discover_data["top_traders"]

@router.get("/api/discover/top-traders/{trader_id}")
def get_trader(trader_id: int):
    """Get specific trader profile"""
    trader = next((t for t in discover_data["top_traders"] if t["id"] == trader_id), None)
    if not trader:
        raise HTTPException(status_code=404, detail="Trader not found")
    return trader

@router.patch("/api/discover/top-traders/{trader_id}")
def update_trader(trader_id: int, data: dict):
    """Update trader info"""
    trader = next((t for t in discover_data["top_traders"] if t["id"] == trader_id), None)
    if not trader:
        raise HTTPException(status_code=404, detail="Trader not found")
    
    trader.update(data)
    return trader

@router.get("/api/discover/trending-strategies")
def get_trending_strategies():
    """Get trending strategies"""
    return discover_data["trending_strategies"]

@router.get("/api/discover/stats")
def get_discover_stats():
    """Get discover page statistics"""
    return discover_data["discover_stats"]

# =========================================================
# SIMULATION & MARKET DATA ENDPOINTS
# =========================================================

@router.get("/api/market/stocks")
def get_active_stocks():
    """Get active stock data"""
    return simulation_data["active_stocks"]

@router.get("/api/market/stats")
def get_market_stats():
    """Get overall market statistics"""
    return simulation_data["market_stats"]

@router.patch("/api/market/stats")
def update_market_stats(data: dict):
    """Update market statistics"""
    stats = simulation_data["market_stats"]
    stats.update(data)
    return stats

@router.patch("/api/market/stocks/{ticker}")
def update_stock(ticker: str, data: dict):
    """Update specific stock data"""
    stock = next((s for s in simulation_data["active_stocks"] if s["ticker"] == ticker.upper()), None)
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    
    stock.update(data)
    return stock

# =========================================================
# USER DATA ENDPOINTS
# =========================================================

@router.get("/api/user/profile")
def get_user_profile():
    """Get user profile"""
    return user_data

@router.patch("/api/user/profile")
def update_user_profile(data: dict):
    """Update user profile"""
    for key in data:
        if key in user_data and key != "user_id":
            if isinstance(user_data[key], dict) and isinstance(data[key], dict):
                user_data[key].update(data[key])
            else:
                user_data[key] = data[key]
    return user_data

# =========================================================
# BULK UPDATE ENDPOINTS (for testing/admin)
# =========================================================

@router.post("/api/reset/all")
def reset_all_data():
    """Reset ALL data to defaults (useful for testing)"""
    # This would reset all the dictionaries - implement carefully
    return {"status": "All data reset"}

@router.get("/api/export/all")
def export_all_data():
    """Export all data for backup/analysis"""
    return {
        "school": school_data,
        "league": league_data,
        "learn": learn_data,
        "portfolio": portfolio_data,
        "discover": discover_data,
        "market": simulation_data,
        "user": user_data
    }
