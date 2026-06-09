"""
Database structures for Quantis dashboard.
All values initialized to 0/empty but easily editable.
"""

# =========================================================
# SCHOOL PAGE DATA
# =========================================================
school_data = {
    "lessons": [
        {
            "id": 1,
            "title": "Risk Management 101",
            "category": "Risk",
            "progress": 0,  # 0-100
            "duration": 0,  # minutes
            "description": "Learn position sizing and risk controls",
            "content": "Basic concepts of portfolio risk",
            "quiz_score": 0,  # 0-100
            "completed": False
        },
        {
            "id": 2,
            "title": "Volatility & Drawdowns",
            "category": "Vol",
            "progress": 0,
            "duration": 0,
            "description": "Understanding market swings",
            "content": "Volatility calculations and recovery periods",
            "quiz_score": 0,
            "completed": False
        },
        {
            "id": 3,
            "title": "Diversification Strategy",
            "category": "Div",
            "progress": 0,
            "duration": 0,
            "description": "Reduce idiosyncratic risk",
            "content": "Portfolio construction across asset classes",
            "quiz_score": 0,
            "completed": False
        },
        {
            "id": 4,
            "title": "Macro Reading & Tape",
            "category": "Macro",
            "progress": 0,
            "duration": 0,
            "description": "Reading market signals",
            "content": "Economic indicators and market flow",
            "quiz_score": 0,
            "completed": False
        },
        {
            "id": 5,
            "title": "Finding Your Edge",
            "category": "Edge",
            "progress": 0,
            "duration": 0,
            "description": "Develop repeatable trading strategy",
            "content": "Backtesting and validation process",
            "quiz_score": 0,
            "completed": False
        }
    ],
    "user_stats": {
        "lessons_completed": 0,
        "total_time_spent": 0,  # minutes
        "average_quiz_score": 0,  # 0-100
        "proficiency_level": 0,  # 0-100
        "skill_breakdown": {
            "Risk": 0,
            "Vol": 0,
            "Div": 0,
            "Macro": 0,
            "Edge": 0
        }
    }
}

# =========================================================
# LEAGUE PAGE DATA
# =========================================================
league_data = {
    "user_leagues": [
        {
            "id": 1,
            "name": "Elite Trading Circle",
            "members": 0,
            "rank": 0,
            "performance": 0,  # %
            "week_change": 0,  # %
            "created_at": "2025-06-01"
        },
        {
            "id": 2,
            "name": "Growth Portfolio Fund",
            "members": 0,
            "rank": 0,
            "performance": 0,
            "week_change": 0,
            "created_at": "2025-05-15"
        }
    ],
    "leaderboard": [
        {
            "rank": i + 1,
            "name": f"Trader {i + 1}",
            "handle": f"@trader{i + 1}",
            "pnl": 0,
            "pnl_percent": 0,
            "delta": 0,
            "you": i == 0,
            "rival": False
        }
        for i in range(15)
    ],
    "league_stats": {
        "total_leagues_joined": 0,
        "average_position": 0,
        "win_rate": 0,  # % of leagues where user is top 3
        "total_members_beaten": 0
    }
}

# =========================================================
# LEARN PAGE DATA
# =========================================================
learn_data = {
    "courses": [
        {
            "id": 1,
            "title": "Foundations of Trading",
            "level": "Beginner",
            "progress": 0,  # 0-100
            "modules_completed": 0,
            "total_modules": 0,
            "description": "Core concepts every trader needs",
            "lessons": 0,
            "estimated_hours": 0
        },
        {
            "id": 2,
            "title": "Technical Analysis Mastery",
            "level": "Intermediate",
            "progress": 0,
            "modules_completed": 0,
            "total_modules": 0,
            "description": "Charts, patterns, indicators",
            "lessons": 0,
            "estimated_hours": 0
        },
        {
            "id": 3,
            "title": "Advanced Portfolio Theory",
            "level": "Advanced",
            "progress": 0,
            "modules_completed": 0,
            "total_modules": 0,
            "description": "Modern portfolio optimization",
            "lessons": 0,
            "estimated_hours": 0
        }
    ],
    "user_learning": {
        "total_hours_spent": 0,
        "courses_completed": 0,
        "certificates_earned": 0,
        "current_level": "Beginner",
        "points": 0,
        "streak_days": 0
    }
}

# =========================================================
# PORTFOLIO PAGE DATA
# =========================================================
portfolio_data = {
    "holdings": [
        {
            "ticker": "AAPL",
            "qty": 0,
            "avg_price": 0,
            "current_price": 0,
            "market_value": 0,
            "cost_basis": 0,
            "pnl": 0,
            "pnl_percent": 0,
            "allocation_percent": 0
        }
    ],
    "portfolio_stats": {
        "total_value": 0,
        "cash": 0,
        "total_invested": 0,
        "total_pnl": 0,
        "total_pnl_percent": 0,
        "best_performer": "",
        "worst_performer": "",
        "num_positions": 0,
        "largest_position": 0,
        "diversification_score": 0  # 0-100
    },
    "performance": {
        "daily": 0,
        "weekly": 0,
        "monthly": 0,
        "ytd": 0,
        "all_time": 0
    },
    "allocation": {
        "stocks": 0,
        "cash": 0,
        "bonds": 0,
        "commodities": 0
    },
    "sector_allocation": {
        "Technology": 0,
        "Healthcare": 0,
        "Finance": 0,
        "Energy": 0,
        "Consumer": 0,
        "Industrial": 0,
        "Other": 0
    },
    "performance_history": [
        # {date: "2025-06-05", value: 0, pnl: 0}
    ]
}

# =========================================================
# DISCOVER PAGE DATA
# =========================================================
discover_data = {
    "top_traders": [
        {
            "id": i + 1,
            "name": f"Trader {i + 1}",
            "handle": f"@trader{i + 1}",
            "avatar": chr(65 + (i % 26)),  # A-Z cycling
            "pnl": 0,
            "pnl_percent": 0,
            "win_rate": 0,  # %
            "followers": 0,
            "status": "trading",  # online, trading, offline
            "specialty": ""
        }
        for i in range(20)
    ],
    "trending_strategies": [
        {
            "id": 1,
            "name": "Momentum Swing",
            "author": "Trader 1",
            "success_rate": 0,  # %
            "followers": 0,
            "last_trade": "2025-06-05"
        }
    ],
    "discover_stats": {
        "trending_traders": 0,
        "total_traders": 0,
        "avg_performance": 0
    }
}

# =========================================================
# SIMULATION & STOCK DATA
# =========================================================
simulation_data = {
    "active_stocks": [
        {"ticker": "AAPL", "price": 0, "change_percent": 0, "volume": 0},
        {"ticker": "TSLA", "price": 0, "change_percent": 0, "volume": 0},
        {"ticker": "MSFT", "price": 0, "change_percent": 0, "volume": 0},
        {"ticker": "NVDA", "price": 0, "change_percent": 0, "volume": 0},
        {"ticker": "AMZN", "price": 0, "change_percent": 0, "volume": 0},
    ],
    "market_stats": {
        "overall_market_change": 0,  # %
        "market_volatility": 0,  # 0-100 scale
        "top_gainers": [],
        "top_losers": [],
        "most_active": []
    }
}

# =========================================================
# USER DATA (Global)
# =========================================================
user_data = {
    "user_id": "default",
    "name": "Guest",
    "email": "guest@quantis.com",
    "handle": "@guest",
    "joined_date": "2025-06-01",
    "total_portfolio_value": 0,
    "global_rank": 0,
    "achievements": [],
    "settings": {
        "notifications_enabled": True,
        "theme": "dark",
        "language": "en"
    }
}
