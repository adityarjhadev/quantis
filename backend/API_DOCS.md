# Quantis Backend API Documentation

## Overview
The Quantis backend is built with **FastAPI** and provides comprehensive endpoints for managing all 5 dashboard pages:
1. **School** - Lessons, skill progression, learning stats
2. **League** - Leaderboards, league memberships, competition stats
3. **Learn** - Courses, modules, learning progress
4. **Portfolio** - Holdings, performance, allocations
5. **Discover** - Top traders, strategies, discovery stats

## Architecture

### Files
- **`main.py`** - FastAPI app initialization, stock engine, trading endpoints
- **`db.py`** - Data structures for all dashboard pages (all initialized to 0)
- **`routes.py`** - API endpoints for CRUD operations
- **`stock_engine.py`** - Real-time stock price simulation

## Quick Start

### Start Backend
```bash
cd backend
pip install fastapi uvicorn yfinance pydantic
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
Swagger docs: `http://localhost:8000/docs`

---

## Data Structure (db.py)

All data is initialized to `0` or empty arrays for easy editing.

### School Page
```python
school_data = {
    "lessons": [...],           # Array of lesson objects
    "user_stats": {             # User's learning statistics
        "lessons_completed": 0,
        "total_time_spent": 0,
        "average_quiz_score": 0,
        "proficiency_level": 0,
        "skill_breakdown": {...}
    }
}
```

### League Page
```python
league_data = {
    "user_leagues": [...],      # Leagues user is in
    "leaderboard": [...],       # All ranked users
    "league_stats": {           # Overall stats
        "total_leagues_joined": 0,
        "average_position": 0,
        "win_rate": 0
    }
}
```

### Learn Page
```python
learn_data = {
    "courses": [...],           # Available courses
    "user_learning": {          # User progress
        "total_hours_spent": 0,
        "courses_completed": 0,
        "current_level": "Beginner"
    }
}
```

### Portfolio Page
```python
portfolio_data = {
    "holdings": [...],          # Stock positions
    "portfolio_stats": {        # Overall portfolio metrics
        "total_value": 0,
        "total_pnl": 0,
        "diversification_score": 0
    },
    "performance": {            # Time-period returns
        "daily": 0,
        "weekly": 0,
        "monthly": 0,
        "ytd": 0,
        "all_time": 0
    },
    "allocation": {...},        # Asset class breakdown
    "sector_allocation": {...}, # Sector breakdown
    "performance_history": []   # Historical data for charts
}
```

### Discover Page
```python
discover_data = {
    "top_traders": [...],           # Top trader profiles
    "trending_strategies": [...],   # Popular strategies
    "discover_stats": {             # Page statistics
        "trending_traders": 0,
        "total_traders": 0,
        "avg_performance": 0
    }
}
```

---

## API Endpoints

### SCHOOL ENDPOINTS
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/school/lessons` | Get all lessons |
| GET | `/api/school/lessons/{id}` | Get single lesson |
| PATCH | `/api/school/lessons/{id}` | Update lesson (progress, quiz_score, completed) |
| GET | `/api/school/stats` | Get user's school stats |
| PATCH | `/api/school/stats` | Update school stats |

**Update lesson example:**
```javascript
PATCH /api/school/lessons/1
{
  "progress": 50,
  "quiz_score": 85,
  "completed": false
}
```

### LEAGUE ENDPOINTS
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/league/leaderboard` | Get leaderboard |
| PATCH | `/api/league/leaderboard/{rank}` | Update leaderboard entry |
| GET | `/api/league/user-leagues` | Get user's leagues |
| GET | `/api/league/stats` | Get league stats |
| PATCH | `/api/league/stats` | Update league stats |

### LEARN ENDPOINTS
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/learn/courses` | Get all courses |
| GET | `/api/learn/courses/{id}` | Get single course |
| PATCH | `/api/learn/courses/{id}` | Update course progress |
| GET | `/api/learn/progress` | Get learning progress |
| PATCH | `/api/learn/progress` | Update learning progress |

### PORTFOLIO ENDPOINTS
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio/holdings` | Get holdings |
| GET | `/api/portfolio/stats` | Get portfolio stats |
| PATCH | `/api/portfolio/stats` | Update stats |
| GET | `/api/portfolio/performance` | Get performance metrics |
| PATCH | `/api/portfolio/performance` | Update performance |
| GET | `/api/portfolio/allocation` | Get asset allocation |
| PATCH | `/api/portfolio/allocation` | Update allocation |
| GET | `/api/portfolio/history` | Get performance history |
| POST | `/api/portfolio/history` | Add history entry |

**Add portfolio history example:**
```javascript
POST /api/portfolio/history
{
  "date": "2025-06-05",
  "value": 105000,
  "pnl": 5000
}
```

### DISCOVER ENDPOINTS
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/discover/top-traders` | Get top traders |
| GET | `/api/discover/top-traders/{id}` | Get trader profile |
| PATCH | `/api/discover/top-traders/{id}` | Update trader info |
| GET | `/api/discover/trending-strategies` | Get strategies |
| GET | `/api/discover/stats` | Get discover stats |

### MARKET DATA ENDPOINTS
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/market/stocks` | Get active stocks |
| GET | `/api/market/stats` | Get market stats |
| PATCH | `/api/market/stats` | Update market stats |
| PATCH | `/api/market/stocks/{ticker}` | Update stock data |

### USER ENDPOINTS
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PATCH | `/api/user/profile` | Update profile |

### BULK ENDPOINTS
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reset/all` | Reset all data |
| GET | `/api/export/all` | Export all data |

---

## Example Usage in Frontend (React)

### Fetch School Lessons
```javascript
const [lessons, setLessons] = useState([]);

useEffect(() => {
  fetch('http://localhost:8000/api/school/lessons')
    .then(res => res.json())
    .then(data => setLessons(data));
}, []);
```

### Update Lesson Progress
```javascript
const updateLesson = async (lessonId, progress) => {
  const res = await fetch(`http://localhost:8000/api/school/lessons/${lessonId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ progress })
  });
  return res.json();
};
```

### Get Portfolio Stats
```javascript
const [stats, setStats] = useState(null);

useEffect(() => {
  fetch('http://localhost:8000/api/portfolio/stats')
    .then(res => res.json())
    .then(data => setStats(data));
}, []);
```

---

## Editing Data

To edit initial values:

1. Open `backend/db.py`
2. Find the section you want to edit (e.g., `school_data`, `portfolio_data`)
3. Update values directly in the Python dict
4. Save and restart the server: `uvicorn main:app --reload`

### Example: Change initial portfolio value
```python
# In db.py, find:
portfolio_data = {
    "holdings": [...],
    "portfolio_stats": {
        "total_value": 0,  # <- Change this to 100000
        ...
    }
}

# To:
portfolio_data = {
    "holdings": [...],
    "portfolio_stats": {
        "total_value": 100000,  # <- Now starts at $100k
        ...
    }
}
```

---

## Integration with Frontend

The frontend (React) should call these endpoints to:
1. **Load page data** on mount
2. **Update data** when user actions occur
3. **Display stats** from the API
4. **Persist changes** across refreshes (data stored in memory but can add database)

Example React hook:
```javascript
const useSchoolData = () => {
  const [lessons, setLessons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/school/lessons').then(r => r.json()),
      fetch('/api/school/stats').then(r => r.json())
    ]).then(([lessons, stats]) => {
      setLessons(lessons);
      setStats(stats);
      setLoading(false);
    });
  }, []);

  return { lessons, stats, loading };
};
```

---

## Next Steps

1. **Connect Frontend** - Add fetch calls to React components
2. **Add Database** - Replace in-memory dicts with PostgreSQL/MongoDB
3. **Add Authentication** - Use JWT tokens (already have in server.js)
4. **Add Calculations** - Create utility functions for PnL, allocations, etc.
5. **Add Simulations** - Connect stock_engine.py to real-time updates
6. **Add WebSockets** - For live leaderboard updates

---

## Environment Variables
None required yet (all hardcoded). Consider adding:
- `DATABASE_URL`
- `API_PORT`
- `CORS_ORIGINS`

Create a `.env` file if needed.
